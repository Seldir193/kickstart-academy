
// app/admin/customers/dialogs/CancelDialog.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Customer, BookingRef } from '../types';

type Props = {
  customer: Customer;
  onClose: () => void;
  onChanged: (freshCustomer: Customer) => void;
};

/* ---------- helpers ---------- */
function todayISO() { return new Date().toISOString().slice(0, 10); }
function rawType(b?: Partial<BookingRef> | null) {
  return (b?.type || (b as any)?.offerType || '').trim();
}
function norm(s: string) {
  return (s || '')
    .replace(/[Ää]/g, 'ae')
    .replace(/[Öö]/g, 'oe')
    .replace(/[Üü]/g, 'ue')
    .replace(/ß/g, 'ss')
    .toLowerCase();
}
// combine type + title so we can match even if type is inconsistent/missing
function textFor(b: any) {
  return norm([rawType(b), b?.offerTitle].filter(Boolean).join(' '));
}

// recurring buckets (Kindergarten | Förder/Foerdertraining | Athletik/Athletic*)
function matchesRecurring(b: any): boolean {
  const t = textFor(b);
  if (!t) return false;
  if (t.includes('kindergarten')) return true;
  if (t.includes('foerder') || t.includes('forder')) return true; // „Förder…“/„Foerder…“
  if (t.includes('athletik') || t.includes('athletic')) return true; // de & en
  return false;
}
function matchesCategory(b: any, category: string): boolean {
  if (category === 'all') return matchesRecurring(b);
  const t = textFor(b);
  if (category === 'Kindergarten')    return t.includes('kindergarten');
  if (category === 'Foerdertraining') return t.includes('foerder') || t.includes('forder');
  if (category === 'Athletiktraining')return t.includes('athletik') || t.includes('athletic');
  return false;
}
function labelFor(b: any) {
  const parts = [
    b.offerTitle || '—',
    rawType(b) || '—',
    b.status === 'cancelled' ? 'Cancelled' : (b.status || 'Active'),
    b.date ? `since ${String(b.date).slice(0,10)}` : undefined,
  ].filter(Boolean);
  return parts.join(' — ');
}

export default function CancelDialog({ customer, onClose, onChanged }: Props) {
  /* categories */
  const categories = ['all', 'Kindergarten', 'Foerdertraining', 'Athletiktraining'];
  const [category, setCategory] = useState<string>('all');

  /* dropdown (fixed overlay) */
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ left: number; top: number; width: number }>({ left: 0, top: 0, width: 0 });
  const [selectedId, setSelectedId] = useState<string>('');

  /* form */
  const [cancelDate, setCancelDate] = useState<string>(todayISO());
  const [reason, setReason] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  /* source + filtering */
  const recurringBookings = useMemo(
    () => (customer.bookings || []).filter(matchesRecurring),
    [customer.bookings]
  );
  const filteredBookings = useMemo(
    () => recurringBookings.filter(b => matchesCategory(b, category)),
    [recurringBookings, category]
  );
  const selected = useMemo(
    () => filteredBookings.find((b: any) => b._id === selectedId) || null,
    [filteredBookings, selectedId]
  );

  /* effects */
  useEffect(() => {
    setCategory('all');
    setCancelDate(todayISO());
    setReason('');
    setErr(null);
  }, [customer?._id]);

  useEffect(() => {
    if (!filteredBookings.length) { setSelectedId(''); return; }
    const firstActive = filteredBookings.find((b: any) => b.status !== 'cancelled');
    const firstAny = filteredBookings[0];
    const newSel = (firstActive || firstAny)?._id || '';
    setSelectedId(prev => (filteredBookings.some(b => b._id === prev) ? prev : newSel));
  }, [filteredBookings.map(b => b._id).join('|')]);

  function computeMenuPos() {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setMenuPos({ left: Math.round(r.left), top: Math.round(r.bottom + 4), width: Math.round(r.width) });
  }
  function openMenu() {
    if (!filteredBookings.length) return;
    computeMenuPos();
    setMenuOpen(true);
  }

  useEffect(() => {
    if (!menuOpen) return;
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (triggerRef.current && (t === triggerRef.current || triggerRef.current.contains(t))) return;
      if (menuRef.current && (t === menuRef.current || menuRef.current.contains(t))) return;
      setMenuOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onResize = () => computeMenuPos();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [menuOpen]);

  const isCancelled = selected?.status === 'cancelled';
  const disabled = saving || !selected || !cancelDate || isCancelled;

  async function submit() {
    if (!customer._id || !selected?._id || !cancelDate) return;
    setSaving(true); setErr(null);
    try {
      const pid = (typeof window !== 'undefined' && localStorage.getItem('providerId')) || '';
      const r = await fetch(
        `/api/admin/customers/${encodeURIComponent(customer._id)}/bookings/${encodeURIComponent(selected._id)}/cancel`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(pid ? { 'x-provider-id': pid } : {}),
          },
          cache: 'no-store',
          body: JSON.stringify({ date: cancelDate, reason }),
        }
      );
      if (!r.ok) {
        const t = await r.text().catch(() => '');
        throw new Error(`Cancel failed (${r.status}) ${t}`);
      }
      const r2 = await fetch(`/api/admin/customers/${encodeURIComponent(customer._id)}`, {
        cache: 'no-store',
        headers: { ...(pid ? { 'x-provider-id': pid } : {}) },
      });
      const fresh = r2.ok ? await r2.json() : null;
      if (fresh) onChanged(fresh);
      onClose();
    } catch (e: any) {
      setErr(e?.message || 'Cancel failed');
    } finally {
      setSaving(false);
    }
  }

  /* render */
  return (
    <div className="ks-modal-root ks-modal-root--top">
      <div className="ks-backdrop" onClick={onClose} />
      <div className="ks-panel card ks-panel--md" onClick={(e)=> e.stopPropagation()}>
        <div className="dialog-subhead">
          <h3 className="text-lg font-bold">Confirm cancellation</h3>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>

        {err && <div className="mb-2 text-red-600">{err}</div>}

        {/* Category */}
        <div className="grid gap-2 mb-2">
          <div>
            <label className="lbl">Category</label>
            <select className="input" value={category} onChange={(e)=> setCategory(e.target.value)}>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === 'all' ? 'All' : cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Booking trigger */}
        <div className="grid gap-2 mb-2">
          <div>
            <label className="lbl">Booking</label>
            <button
              ref={triggerRef}
              type="button"
              className="input"
              onClick={() => (menuOpen ? setMenuOpen(false) : openMenu())}
              disabled={!filteredBookings.length}
              aria-haspopup="listbox"
              aria-expanded={menuOpen}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span style={{ opacity: isCancelled ? 0.6 : 1 }}>
                {selected ? labelFor(selected) : (filteredBookings.length ? 'Select…' : 'No recurring bookings')}
              </span>
              <span aria-hidden>▾</span>
            </button>
          </div>
        </div>

        {/* Fixed overlay menu */}
        {menuOpen && filteredBookings.length > 0 && (
          <div
            ref={menuRef}
            role="listbox"
            style={{
              position: 'fixed',
              left: menuPos.left,
              top: menuPos.top,
              width: menuPos.width,
              maxHeight: 44 * 5,
              overflowY: 'auto',
              zIndex: 10000,
              background: '#fff',
              border: '1px solid rgba(0,0,0,.12)',
              boxShadow: '0 8px 24px rgba(0,0,0,.12)',
              borderRadius: 6,
              touchAction: 'pan-y',
            }}
            onWheel={(e) => e.stopPropagation()}
            onScroll={(e) => e.stopPropagation()}
          >
            {filteredBookings.map((b: any) => {
              const cancelled = b.status === 'cancelled';
              const active = selectedId === b._id;
              return (
                <div
                  key={b._id || `${b.offerId}-${b.createdAt}`}
                  role="option"
                  aria-selected={active}
                  aria-disabled={cancelled}
                  onClick={() => {
                    if (cancelled) return;
                    setSelectedId(b._id);
                    setMenuOpen(false);
                  }}
                  style={{
                    display: 'block',
                    padding: '8px 12px',
                    background: active ? 'rgba(0,0,0,.04)' : 'transparent',
                    opacity: cancelled ? 0.6 : 1,
                    cursor: cancelled ? 'not-allowed' : 'pointer',
                  }}
                >
                  <div style={{ fontWeight: 600, whiteSpace: 'normal' }}>{b.offerTitle || '—'}</div>
                  <div style={{ fontSize: 12, color: '#666', whiteSpace: 'normal' }}>
                    {(rawType(b) || '—')} · {cancelled ? 'Cancelled' : (b.status || 'Active')}
                    {b.date ? ` · since ${String(b.date).slice(0,10)}` : ''}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Form */}
        <div className="grid gap-2">
          <div>
            <label className="lbl">Effective date (required)</label>
            <input
              className="input"
              type="date"
              value={cancelDate}
              min={todayISO()}
              onChange={(e)=> setCancelDate(e.target.value)}
              disabled={!selected || isCancelled}
            />
          </div>
          <div>
            <label className="lbl">Reason (optional)</label>
            <textarea
              className="input"
              rows={3}
              value={reason}
              onChange={(e)=> setReason(e.target.value)}
              placeholder="e.g., moved away, club change"
              disabled={!selected || isCancelled}
            />
          </div>
          {selected && isCancelled && (
            <div className="text-gray-600">This booking is already cancelled.</div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-3">
          <button className="btn" onClick={onClose}>Close</button>
          <button className="btn btn-primary" disabled={disabled} onClick={submit}>
            {saving ? 'Cancelling…' : 'Confirm cancellation'}
          </button>
        </div>
      </div>
    </div>
  );
}










