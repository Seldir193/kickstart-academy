// app/admin/customers/dialogs/CancelDialog.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Customer, BookingRef } from '../types';
import { GROUPED_COURSE_OPTIONS, courseValueFromBooking } from 'src/app/lib/courseOptions';

type Props = { customer: Customer; onClose: () => void; onChanged: (freshCustomer: Customer) => void; };

function todayISO() { return new Date().toISOString().slice(0, 10); }
function rawType(b?: Partial<BookingRef> | null) { return (b?.type || (b as any)?.offerType || '').trim(); }
function norm(s: string) { return (s || '').replace(/[Ää]/g,'ae').replace(/[Öö]/g,'oe').replace(/[Üü]/g,'ue').replace(/ß/g,'ss').toLowerCase(); }
function textFor(b: any) { return norm([rawType(b), b?.offerTitle].filter(Boolean).join(' ')); }
function labelFor(b: any) {
  const parts = [
    b.offerTitle || '—',
    rawType(b) || '—',
    b.status === 'cancelled' ? 'Cancelled' : (b.status || 'Active'),
    b.date ? `since ${String(b.date).slice(0,10)}` : undefined
  ].filter(Boolean);
  return parts.join(' — ');
}

/** Frontend-Spiegel der Serverlogik: welche Buchungen sind kündbar? */
function isBookingCancellable(booking: any, offersById: Map<string, any>) {
  const off = booking?.offerId ? offersById.get(String(booking.offerId)) : null;

  const t  = (off?.type || booking?.type || '').toString();
  const st = (off?.sub_type || booking?.offerType || '').toString().toLowerCase();
  const cat = (off?.category || '').toString();

  if (st === 'powertraining') return false;
  if (t === 'Camp' || t === 'PersonalTraining') return false;

  if (t === 'Foerdertraining' || t === 'Kindergarten') return true;
  if (cat === 'Weekly') return true;

  return false;
}

export default function CancelDialog({ customer, onClose, onChanged }: Props) {
  const [offers, setOffers] = useState<any[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoadingOffers(true); setErr(null);
        const res = await fetch(`/api/admin/offers?limit=500`, {
          cache: 'no-store',
          credentials: 'include',
        });
        const data = res.ok ? await res.json() : [];
        const list = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
        setOffers(list);
      } catch (e: any) {
        setErr(e?.message || 'Failed to load offers');
      } finally {
        setLoadingOffers(false);
      }
    })();
  }, []);

  const offersById = useMemo(() => {
    const m = new Map<string, any>();
    for (const o of offers) if (o?._id) m.set(String(o._id), o);
    return m;
  }, [offers]);

  const [courseValue, setCourseValue] = useState<string>('');

  const filteredBookings = useMemo(() => {
    const src = (customer.bookings || []).filter((b: any) => isBookingCancellable(b, offersById));
    if (!courseValue) return src;
    return src.filter(b => courseValueFromBooking(b, offersById) === courseValue);
  }, [customer.bookings, offersById, courseValue]);

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ left: number; top: number; width: number }>({ left: 0, top: 0, width: 0 });

  const [selectedId, setSelectedId] = useState<string>('');
  const selected = useMemo(() => filteredBookings.find((b: any) => b._id === selectedId) || null, [filteredBookings, selectedId]);

  useEffect(() => { setCourseValue(''); setSelectedId(''); setErr(null); }, [customer?._id]);
  useEffect(() => {
    if (!filteredBookings.length) { setSelectedId(''); return; }
    const firstActive = filteredBookings.find((b: any) => b.status !== 'cancelled');
    const firstAny = filteredBookings[0];
    const newSel = (firstActive || firstAny)?._id || '';
    if (!filteredBookings.some(b => b._id === selectedId)) setSelectedId(newSel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredBookings.map(b => b._id).join('|')]);

  function computeMenuPos() {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setMenuPos({ left: Math.round(r.left), top: Math.round(r.bottom + 4), width: Math.round(r.width) });
  }
  function openMenu() { if (!filteredBookings.length) return; computeMenuPos(); setMenuOpen(true); }

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

  const selectedIsCancelled = selected?.status === 'cancelled';

  // 🔹 Eingangsdatum (vom …) – Standard heute
  const [cancelDate, setCancelDate] = useState<string>(todayISO());

  // 🔹 Enddatum (zum …) – neu
  const [endDate, setEndDate] = useState<string>('');

  const [reason, setReason] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const endBeforeStart = Boolean(endDate && cancelDate && endDate < cancelDate);
  const disabled = saving || !selected || !cancelDate || !endDate || selectedIsCancelled || endBeforeStart;

  async function submit() {
    if (!customer._id || !selected?._id || !cancelDate || !endDate) return;
    setSaving(true); setErr(null);
    try {
      const r = await fetch(
        `/api/admin/customers/${encodeURIComponent(customer._id)}/bookings/${encodeURIComponent(selected._id)}/cancel`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          body: JSON.stringify({ 
            date: cancelDate,     // Eingangsdatum (vom …)
            endDate,              // Beendigungsdatum (zum …)  ← WICHTIG
            reason
          })
        }
      );
      if (!r.ok) {
        const t = await r.text().catch(()=> '');
        throw new Error(`Cancel failed (${r.status}) ${t}`);
      }
      const r2 = await fetch(`/api/admin/customers/${encodeURIComponent(customer._id)}`, {
        cache: 'no-store',
        credentials: 'include',
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

  return (
    <div className="ks-modal-root ks-modal-root--top">
      <div className="ks-backdrop" onClick={onClose} />
      <div className="ks-panel card ks-panel--md" onClick={(e)=> e.stopPropagation()}>
        <div className="dialog-subhead">
          <h3 className="text-lg font-bold">Confirm cancellation</h3>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>

        {err && <div className="mb-2 text-red-600">{err}</div>}
        {loadingOffers && <div className="mb-2 text-gray-600">Loading courses…</div>}

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
            {!filteredBookings.length && (
              <div className="text-sm text-gray-600 mt-1">
                No cancellable bookings for this filter. Powertraining and certain one-off programs are not cancellable.
              </div>
            )}
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
              <span style={{ opacity: selectedIsCancelled ? 0.6 : 1 }}>
                {selected ? labelFor(selected) : (filteredBookings.length ? 'Select…' : 'No bookings')}
              </span>
              <span aria-hidden>▾</span>
            </button>
          </div>
        </div>

        {menuOpen && filteredBookings.length > 0 && (
          <div
            ref={menuRef}
            role="listbox"
            style={{ position: 'fixed', left: menuPos.left, top: menuPos.top, width: menuPos.width, maxHeight: 44*5, overflowY: 'auto', zIndex: 10000, background: '#fff', border: '1px solid rgba(0,0,0,.12)', boxShadow: '0 8px 24px rgba(0,0,0,.12)', borderRadius: 6, touchAction: 'pan-y' }}
            onWheel={(e) => e.stopPropagation()}
            onScroll={(e) => e.stopPropagation()}
          >
            {filteredBookings.map((b: any) => {
              const cancelled = b.status === 'cancelled';
              const active = selectedId === String(b._id);
              return (
                <div
                  key={b._id || `${b.offerId}-${b.createdAt}`}
                  role="option"
                  aria-selected={active}
                  aria-disabled={cancelled}
                  onClick={() => { if (cancelled) return; setSelectedId(String(b._id)); setMenuOpen(false); }}
                  style={{ display: 'block', padding: '8px 12px', background: active ? 'rgba(0,0,0,.04)' : 'transparent', opacity: cancelled ? 0.6 : 1, cursor: cancelled ? 'not-allowed' : 'pointer' }}
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
            <label className="lbl">Receipt date (vom) — required</label>
            <input
              className="input"
              type="date"
              value={cancelDate}
              min={todayISO()}
              onChange={(e)=> setCancelDate(e.target.value)}
              disabled={!selected || selectedIsCancelled}
            />
          </div>
          <div>
            <label className="lbl">End date (zum) — required</label>
            <input
              className="input"
              type="date"
              value={endDate}
              min={cancelDate || todayISO()}
              onChange={(e)=> setEndDate(e.target.value)}
              disabled={!selected || selectedIsCancelled}
            />
            {endBeforeStart && (
              <div className="text-sm text-red-600 mt-1">
                End date must be on or after the receipt date.
              </div>
            )}
          </div>
          <div>
            <label className="lbl">Reason (optional)</label>
            <textarea
              className="input"
              rows={3}
              value={reason}
              onChange={(e)=> setReason(e.target.value)}
              placeholder="e.g., moved away, club change"
              disabled={!selected || selectedIsCancelled}
            />
          </div>
          {selected && selectedIsCancelled && <div className="text-gray-600">This booking is already cancelled.</div>}
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










