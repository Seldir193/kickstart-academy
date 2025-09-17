// app/admin/customers/dialogs/BookOfferDialog.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { Customer } from '../types';

type OfferLite = {
  _id: string;
  title?: string;
  type?: string;
  price?: number | null; // monthly price if available
};

type Props = {
  customer: Customer;
  offer: OfferLite | null;
  onClose: () => void;
  onChanged: (freshCustomer: Customer) => void;
};


  

type CreatedBookingResponse = {
  ok?: boolean;
  booking?: { _id: string; confirmationCode?: string };
  error?: string;          // <— hinzugefügt
  message?: string;        // <— optional, falls Backend "message" nutzt
};

function fmtEUR(n: number) {
  try {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n);
  } catch {
    return `${n.toFixed(2)} €`;
  }
}

/** pro-rata calculation (first month from chosen start date) */
function prorateForStart(dateISO: string, monthlyPrice: number | null | undefined) {
  if (!dateISO || typeof monthlyPrice !== 'number' || !isFinite(monthlyPrice)) {
    return { daysInMonth: null, daysRemaining: null, factor: null, firstMonthPrice: null, monthlyPrice: monthlyPrice ?? null };
  }
  const d = new Date(`${dateISO}T00:00:00`);
  if (isNaN(d.getTime())) {
    return { daysInMonth: null, daysRemaining: null, factor: null, firstMonthPrice: null, monthlyPrice: monthlyPrice ?? null };
  }
  const y = d.getFullYear();
  const m = d.getMonth(); // 0..11
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const startDay = d.getDate();
  const daysRemaining = daysInMonth - startDay + 1; // include start day
  const factor = Math.max(0, Math.min(1, daysRemaining / daysInMonth));
  const firstMonthPrice = Math.round(monthlyPrice * factor * 100) / 100;
  return { daysInMonth, daysRemaining, factor, firstMonthPrice, monthlyPrice };
}

export default function BookOfferDialog({ customer, offer, onClose, onChanged }: Props) {
  const [dateISO, setDateISO] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    // default to today
    setDateISO(new Date().toISOString().slice(0, 10));
    setErr(null);
  }, [offer?._id, customer?._id]);

  const pro = useMemo(() => prorateForStart(dateISO, offer?.price ?? null), [dateISO, offer?.price]);

  const disabled = !offer?._id || !dateISO || saving;

  async function submit() {
    if (!offer?._id || !customer?._id || !dateISO) return;
    setSaving(true);
    setErr(null);

    try {
      // 1) create booking (immer über unsere /api-Proxy-Route; JWT wird automatisch mitgesendet)
      const createRes = await fetch(
        `/api/admin/customers/${encodeURIComponent(customer._id)}/bookings`,
        {
          method: 'POST',
          credentials: 'include', // 🔐 HttpOnly-Cookie mitsenden
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ offerId: offer._id, date: dateISO }),
        }
      );
      const createData = (await createRes.json().catch(() => ({}))) as CreatedBookingResponse;
      if (!createRes.ok || !createData?.ok || !createData.booking?._id) {
        throw new Error(createData?.['error'] || `Create booking failed (${createRes.status})`);
      }
      const bookingId = createData.booking._id;

      // 2) send participation confirmation email (idempotent; 409 ist ok)
      const mailRes = await fetch(
        `/api/admin/customers/${encodeURIComponent(customer._id)}/bookings/${encodeURIComponent(bookingId)}/email/confirmation`,
        {
          method: 'POST',
          credentials: 'include', // 🔐
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      if (!mailRes.ok && mailRes.status !== 409) {
        // nur warnen – kein harter Abbruch
        console.warn('confirmation email failed', mailRes.status, await mailRes.text().catch(() => ''));
      }

      // 3) refresh customer (so UI zeigt neue aktive Buchung)
      const freshRes = await fetch(`/api/admin/customers/${encodeURIComponent(customer._id)}`, {
        credentials: 'include', // 🔐
        cache: 'no-store',
      });
      const fresh = freshRes.ok ? await freshRes.json() : null;
      if (fresh) onChanged(fresh);

      onClose();
    } catch (e: any) {
      setErr(e?.message || 'Booking failed');
    } finally {
      setSaving(false);
    }
  }

  const todayISO = new Date().toISOString().slice(0, 10);

  return (
    <div className="ks-modal-root ks-modal-root--top">
      <div className="ks-backdrop" onClick={onClose} />
      <div className="ks-panel card ks-panel--md" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-subhead">
          <h3 className="text-lg font-bold">Confirm booking</h3>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>

        {err && <div className="mb-2 text-red-600">{err}</div>}

        <div className="space-y-2">
          <div className="text-sm">
            <div><strong>Offer:</strong> {offer?.title || '—'}</div>
            <div><strong>Type:</strong> {offer?.type || '—'}</div>
          </div>

          <div>
            <label className="lbl">Start date <span className="text-red-600">*</span></label>
            <input
              className="input"
              type="date"
              value={dateISO}
              onChange={(e) => setDateISO(e.target.value)}
              min={todayISO}
              required
            />
          </div>

        {typeof offer?.price === 'number' && pro.firstMonthPrice != null && (
            <div className="rounded bg-gray-50 p-2 text-sm">
              <div><strong>Price overview</strong></div>
              <div>Monthly price: {fmtEUR(offer.price!)}</div>
              <div>
                First month (prorated from {dateISO}): <strong>{fmtEUR(pro.firstMonthPrice!)}</strong>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-3">
          <button className="btn" onClick={onClose}>Close</button>
          <button className="btn btn-primary" disabled={disabled} onClick={submit}>
            {saving ? 'Booking…' : 'Confirm booking'}
          </button>
        </div>
      </div>
    </div>
  );
}
