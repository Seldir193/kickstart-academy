// app/admin/customers/dialogs/BookDialog.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { Customer, Offer } from '../types';

type Props = {
  customerId: string;
  onClose: () => void;
  onBooked: (freshCustomer: Customer) => void;
};

function uniq<T>(arr: T[]) { return Array.from(new Set(arr)); }
function isNum(v: any): v is number { return typeof v === 'number' && isFinite(v); }
function fmtEUR(n: number) { try { return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n); } catch { return `${n.toFixed(2)} €`; } }
function fmtDE(dateISO: string) {
  if (!dateISO) return '—';
  try {
    const [y,m,d] = dateISO.split('-').map(Number);
    return `${String(d).padStart(2,'0')}.${String(m).padStart(2,'0')}.${y}`;
  } catch { return dateISO; }
}

/** Pro-rata for first month starting at dateISO */
function prorateForStart(dateISO: string, monthlyPrice?: number | null) {
  if (!dateISO || !isNum(monthlyPrice)) return null;
  const d = new Date(`${dateISO}T00:00:00`);
  if (isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = d.getMonth(); // 0..11
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const startDay = d.getDate();
  const daysRemaining = Math.max(0, daysInMonth - startDay + 1); // incl. start day
  const factor = Math.max(0, Math.min(1, daysRemaining / daysInMonth));
  const firstMonthPrice = Math.round(monthlyPrice * factor * 100) / 100;
  return { daysInMonth, daysRemaining, factor, firstMonthPrice, monthlyPrice };
}

export default function BookDialog({ customerId, onClose, onBooked }: Props) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [category, setCategory] = useState<string>('all');
  const [selectedOfferId, setSelectedOfferId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  const [saving, setSaving] = useState(false);

  // Load all offers (provider-scoped)
  useEffect(() => {
    (async () => {
      try {
        setLoadingOffers(true);
        setErr(null);
        const pid = (typeof window !== 'undefined' && localStorage.getItem('providerId')) || '';
        const res = await fetch(`/api/admin/offers?limit=500`, {
          cache: 'no-store',
          headers: { ...(pid ? { 'x-provider-id': pid } : {}) },
        });
        if (!res.ok) throw new Error(`Failed to load offers (${res.status})`);
        const data = await res.json();
        const list = Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : []);
        setOffers(list);
      } catch (e: any) {
        setErr(e?.message || 'Failed to load offers');
      } finally {
        setLoadingOffers(false);
      }
    })();
  }, []);

  // Category list from offers
  const categories = useMemo(() => {
    const types = offers.map(o => (o.type || '').trim()).filter(Boolean);
    return ['all', ...uniq(types)];
  }, [offers]);

  // Offers filtered by selected category
  const filteredOffers = useMemo(() => {
    if (category === 'all') return offers;
    return offers.filter(o => (o.type || '').trim() === category);
  }, [offers, category]);

  // Selected offer object
  const selectedOffer = useMemo(
    () => filteredOffers.find(o => o._id === selectedOfferId) || offers.find(o => o._id === selectedOfferId) || null,
    [filteredOffers, offers, selectedOfferId]
  );

  // Keep a valid selection whenever offers/filter change
  useEffect(() => {
    if (!filteredOffers.length) {
      setSelectedOfferId('');
      return;
    }
    const stillValid = filteredOffers.some(o => o._id === selectedOfferId);
    setSelectedOfferId(stillValid ? selectedOfferId : filteredOffers[0]._id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredOffers.map(o => o._id).join('|')]);

  // Pro-rata calculation (updates when date or offer changes)
  const pro = useMemo(() => prorateForStart(selectedDate, isNum(selectedOffer?.price) ? selectedOffer!.price : null), [selectedDate, selectedOffer?.price]);


     





async function submit() {
  if (!customerId || !selectedOfferId || !selectedDate) return;
  setSaving(true); setErr(null);

  try {
    const pid = (typeof window !== 'undefined' && localStorage.getItem('providerId')) || '';

    // 1) Create booking
    const res = await fetch(`/api/admin/customers/${encodeURIComponent(customerId)}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(pid ? { 'x-provider-id': pid } : {}),
      },
      cache: 'no-store',
      body: JSON.stringify({ offerId: selectedOfferId, date: selectedDate }),
    });
    if (!res.ok) throw new Error(`Create booking failed (${res.status})`);
    const payload = await res.json();
    const newBooking = payload?.booking;

    // 2) Send participation confirmation (server attaches PDF)
    if (newBooking?._id) {
      const r2 = await fetch(
        `/api/admin/customers/${encodeURIComponent(customerId)}/bookings/${encodeURIComponent(newBooking._id)}/email/confirmation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(pid ? { 'x-provider-id': pid } : {}), // ← WICHTIG hinzugefügt
          },
        }
      );
      if (!r2.ok && r2.status !== 409) {
        const t = await r2.text().catch(() => '');
        console.warn('confirmation email failed', r2.status, t);
      }
    }

    // 3) Refresh customer
    const r3 = await fetch(`/api/admin/customers/${encodeURIComponent(customerId)}`, {
      cache: 'no-store',
      headers: { ...(pid ? { 'x-provider-id': pid } : {}) },
    });
    const fresh = r3.ok ? await r3.json() : null;
    if (fresh) onBooked(fresh);
    onClose();
  } catch (e: any) {
    setErr(e?.message || 'Booking failed');
  } finally {
    setSaving(false);
  }
}












  return (
    <div className="ks-modal-root ks-modal-root--top">
      <div className="ks-backdrop" onClick={onClose} />
      <div className="ks-panel card ks-panel--md" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-subhead">
          <h3 className="text-lg font-bold">Book offer</h3>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>

        {err && <div className="mb-2 text-red-600">{err}</div>}
        {loadingOffers && <div className="mb-2 text-gray-600">Loading offers…</div>}

        {/* Category dropdown */}
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

        {/* Offer dropdown (ALL in category) */}
        <div className="grid gap-2 mb-2">
          <div>
            <label className="lbl">Offer</label>
            <select
              className="input"
              value={selectedOfferId}
              onChange={(e)=> setSelectedOfferId(e.target.value)}
              disabled={!filteredOffers.length}
            >
              {filteredOffers.map(o => {
                const parts = [
                  o.title || '—',
                  [o.type, o.location].filter(Boolean).join(' • ') || undefined,
                  isNum(o.price) ? fmtEUR(o.price) : undefined,
                ].filter(Boolean);
                return (
                  <option key={o._id} value={o._id}>
                    {parts.join(' — ')}
                  </option>
                );
              })}
            </select>
            {!filteredOffers.length && (
              <div className="text-gray-600 mt-1">No offers in this category.</div>
            )}
          </div>
        </div>

        {/* Date */}
        <div className="grid gap-2">
          <div>
            <label className="lbl">Start date</label>
            <input
              className="input"
              type="date"
              value={selectedDate}
              onChange={(e)=> setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        {/* Dynamic price section */}
        {isNum(selectedOffer?.price) && (
          <div className="mt-3 p-3 rounded bg-gray-50 border">
            <div className="font-semibold mb-1">Price overview</div>
            <ul className="list-disc ml-5">
              <li>Monthly price: <b>{fmtEUR(selectedOffer!.price!)}</b></li>
              {pro ? (
                <li>
                  First month (pro-rata from <b>{fmtDE(selectedDate)}</b>):{' '}
                  <b>{fmtEUR(pro.firstMonthPrice)}</b>{' '}
                  <span className="text-gray-600">
                    ({pro.daysRemaining}/{pro.daysInMonth} days)
                  </span>
                </li>
              ) : (
                <li className="text-gray-600">Select a valid date to see pro-rata.</li>
              )}
            </ul>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-3">
          <button className="btn" onClick={onClose}>Close</button>
          <button
            className="btn btn-primary"
            disabled={saving || !selectedOfferId || !selectedDate}
            onClick={submit}
          >
            {saving ? 'Booking…' : 'Confirm booking'}
          </button>
        </div>
      </div>
    </div>
  );
}


  











