// app/admin/customers/dialogs/StornoDialog.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Customer, BookingRef } from '../types';
import { GROUPED_COURSE_OPTIONS, courseValueFromBooking } from 'src/app/lib/courseOptions';

type Props = { customer: Customer; onClose: () => void; onChanged: (freshCustomer: Customer) => void; };

function rawType(b?: Partial<BookingRef> | null) { return (b?.type || (b as any)?.offerType || '').trim(); }
function labelFor(b: any) {
  const parts = [
    b.offerTitle || '—',
    rawType(b) || '—',
    b.status === 'cancelled' ? 'Cancelled' : (b.status || 'Active'),
    b.date ? `since ${String(b.date).slice(0,10)}` : undefined
  ].filter(Boolean);
  return parts.join(' — ');
}

export default function StornoDialog({ customer, onClose, onChanged }: Props) {
  // Offers laden
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string|null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true); setErr(null);
        const r = await fetch(`/api/admin/offers?limit=500`, {
          method: 'GET',
          credentials: 'include', // 🔐 JWT-Cookie mitsenden
          cache: 'no-store',
        });
        const data = r.ok ? await r.json() : [];
        const list = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
        setOffers(list);
      } catch (e:any) {
        setErr(e?.message || 'Load failed');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const offersById = useMemo(() => {
    const m = new Map<string, any>();
    for (const o of offers) if (o?._id) m.set(String(o._id), o);
    return m;
  }, [offers]);

  // grouped Courses selection
  const [courseValue, setCourseValue] = useState<string>(''); // '' = All
  const allBookings = useMemo(() => customer.bookings || [], [customer.bookings]);
  const filtered = useMemo(() => {
    if (!courseValue) return allBookings;
    return allBookings.filter(b => courseValueFromBooking(b, offersById) === courseValue);
  }, [allBookings, offersById, courseValue]);

  // Fixed-overlay dropdown
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ left: number; top: number; width: number }>({ left: 0, top: 0, width: 0 });
  const [selectedId, setSelectedId] = useState<string>('');
  const selected = useMemo(() => filtered.find(b => String(b._id) === selectedId) || null, [filtered, selectedId]);

  useEffect(() => {
    setCourseValue(''); setSelectedId(''); setErr(null);
  }, [customer?._id]);

  useEffect(() => {
    if (!filtered.length) { setSelectedId(''); return; }
    if (!filtered.some(b => String(b._id) === selectedId)) {
      const firstActive = filtered.find(b => b.status !== 'cancelled');
      setSelectedId(String((firstActive || filtered[0])._id));
    }
  }, [filtered, selectedId]);

  function computeMenuPos() {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setMenuPos({ left: Math.round(r.left), top: Math.round(r.bottom + 4), width: Math.round(r.width) });
  }
  function openMenu() { if (!filtered.length) return; computeMenuPos(); setMenuOpen(true); }

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current && (t === triggerRef.current || triggerRef.current.contains(t))) return;
      if (menuRef.current   && (t === menuRef.current   || menuRef.current.contains(t)))   return;
      setMenuOpen(false);
    };
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
  const [note, setNote] = useState<string>(''); // optional
  const [saving, setSaving] = useState(false);
  const disabled = saving || !selected || isCancelled;

  async function submit() {
    if (!customer._id || !selected?._id) return;
    setSaving(true); setErr(null);
    try {
      // 1) Storno-Status setzen
      const r1 = await fetch(
        `/api/admin/customers/${encodeURIComponent(customer._id)}/bookings/${encodeURIComponent(selected._id)}/storno`,
        {
          method: 'POST',
          credentials: 'include', // 🔐
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          body: JSON.stringify({ note }),
        }
      );
      if (!r1.ok && r1.status !== 409) {
        throw new Error(`Storno status failed (${r1.status}) ${await r1.text().catch(()=> '')}`);
      }

      // 2) Storno-Mail (PDF serverseitig erzeugt)
      const r2 = await fetch(
        `/api/admin/customers/${encodeURIComponent(customer._id)}/bookings/${encodeURIComponent(selected._id)}/email/storno`,
        {
          method: 'POST',
          credentials: 'include', // 🔐
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          body: JSON.stringify({ currency: 'EUR', note }),
        }
      );
      if (!r2.ok) {
        throw new Error(`Storno mail failed (${r2.status}) ${await r2.text().catch(()=> '')}`);
      }

      // 3) Customer neu laden
      const r3 = await fetch(`/api/admin/customers/${encodeURIComponent(customer._id)}`, {
        method: 'GET',
        credentials: 'include', // 🔐
        cache: 'no-store',
      });
      const fresh = r3.ok ? await r3.json() : null;
      if (fresh) onChanged(fresh);
      onClose();
    } catch (e:any) {
      setErr(e?.message || 'Storno failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="ks-modal-root ks-modal-root--top">
      <div className="ks-backdrop" onClick={onClose} />
      <div className="ks-panel card ks-panel--md" onClick={(e)=> e.stopPropagation()}>
        <div className="dialog-subhead">
          <h3 className="text-lg font-bold">Storno</h3>
          <button className="btn" onClick={onClose}>✕</button>
        </div>

        {err && <div className="mb-2 text-red-600">{err}</div>}
        {loading && <div className="mb-2 text-gray-600">Loading…</div>}

        {/* Courses (grouped) */}
        <div className="grid gap-2 mb-2">
          <div>
            <label className="lbl">Courses</label>
            <select className="input" value={courseValue} onChange={(e)=> setCourseValue(e.target.value)}>
              <option value="">All courses</option>
              {GROUPED_COURSE_OPTIONS.map(g => (
                <optgroup key={g.label} label={g.label}>
                  {g.items.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        {/* Booking trigger (fixed overlay) */}
        <div className="grid gap-2 mb-2">
          <div>
            <label className="lbl">Booking</label>
            <button
              ref={triggerRef}
              type="button"
              className="input"
              onClick={() => (menuOpen ? setMenuOpen(false) : openMenu())}
              disabled={!filtered.length}
              aria-haspopup="listbox"
              aria-expanded={menuOpen}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span style={{ opacity: isCancelled ? 0.6 : 1 }}>
                {selected ? labelFor(selected) : (filtered.length ? 'Select…' : 'No bookings')}
              </span>
              <span aria-hidden>▾</span>
            </button>
          </div>
        </div>

        {menuOpen && filtered.length > 0 && (
          <div
            ref={menuRef}
            role="listbox"
            style={{
              position: 'fixed',
              left: menuPos.left,
              top: menuPos.top,
              width: menuPos.width,
              maxHeight: 44*5,
              overflowY: 'auto',
              zIndex: 10000,
              background: '#fff',
              border: '1px solid rgba(0,0,0,.12)',
              boxShadow: '0 8px 24px rgba(0,0,0,.12)',
              borderRadius: 6,
              touchAction: 'pan-y'
            }}
            onWheel={(e) => e.stopPropagation()}
            onScroll={(e) => e.stopPropagation()}
          >
            {filtered.map((b: any) => {
              const cancelled = b.status === 'cancelled';
              const active = selectedId === String(b._id);
              return (
                <div
                  key={b._id || `${b.offerId}-${b.createdAt}`}
                  role="option"
                  aria-selected={active}
                  aria-disabled={cancelled}
                  onClick={() => { if (cancelled) return; setSelectedId(String(b._id)); setMenuOpen(false); }}
                  style={{
                    display: 'block',
                    padding: '8px 12px',
                    background: active ? 'rgba(0,0,0,.04)' : 'transparent',
                    opacity: cancelled ? 0.6 : 1,
                    cursor: cancelled ? 'not-allowed' : 'pointer'
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

        {/* Optional note */}
        <div className="grid gap-2">
          <div>
            <label className="lbl">Note (optional)</label>
            <textarea
              className="input"
              rows={3}
              value={note}
              onChange={(e)=> setNote(e.target.value)}
              placeholder="e.g., partial refund, goodwill"
              disabled={!selected || isCancelled}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-3">
          <button className="btn" onClick={onClose}>Close</button>
          <button className="btn" disabled={disabled} onClick={submit}>
            {saving ? 'Processing…' : 'Confirm storno'}
          </button>
        </div>
      </div>
    </div>
  );
}



























