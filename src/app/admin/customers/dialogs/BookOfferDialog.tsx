





















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

type CreatedBookingResponse = { ok: boolean; booking?: { _id: string } };

async function tryPost(urls: string[], body: any, withProviderHeader = false) {
  const pid = typeof window !== 'undefined' ? (localStorage.getItem('providerId') || '') : '';
  for (const url of urls) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(withProviderHeader && pid ? { 'x-provider-id': pid } : {}),
      },
      cache: 'no-store',
      body: JSON.stringify(body || {}),
    });
    if (res.ok) return { ok: true, url, status: res.status, res };
    if (res.status !== 404) {
      const t = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} at ${url}${t ? ` – ${t}` : ''}`);
    }
  }
  return { ok: false, url: urls[urls.length - 1], status: 404, res: null as any };
}

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
      // 1) create booking (admin proxy first, fallback to backend)
      const create = await tryPost(
        [
          `/api/admin/customers/${encodeURIComponent(customer._id)}/bookings`,
          `http://127.0.0.1:5000/api/customers/${encodeURIComponent(customer._id)}/bookings`,
        ],
        { offerId: offer._id, date: dateISO },
        /* withProviderHeader */ true
      );
      if (!create.ok || !create.res) throw new Error('Failed to create booking.');
      const data = (await create.res.json()) as CreatedBookingResponse;
      const bookingId = data?.booking?._id;
      if (!bookingId) throw new Error('Booking id not returned.');

      // 2) send participation confirmation email (idempotent; 409 is fine)
      const mail = await tryPost(
        [
          `/api/admin/customers/${encodeURIComponent(customer._id)}/bookings/${encodeURIComponent(bookingId)}/email/confirmation`,
          `http://127.0.0.1:5000/api/customers/${encodeURIComponent(customer._id)}/bookings/${encodeURIComponent(bookingId)}/email/confirmation`,
        ],
        {},
        /* withProviderHeader */ true
      );
      if (!mail.ok && mail.status !== 409) {
        throw new Error('Failed to send participation confirmation.');
      }

      // 3) refresh customer (so UI shows the new active booking)
      const pid = localStorage.getItem('providerId') || '';
      const r2 = await fetch(`/api/admin/customers/${encodeURIComponent(customer._id)}`, {
        cache: 'no-store',
        headers: { ...(pid ? { 'x-provider-id': pid } : {}) },
      });
      const fresh = r2.ok ? await r2.json() : null;
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

          {!!offer?.price && pro.firstMonthPrice != null && (
            <div className="rounded bg-gray-50 p-2 text-sm">
              <div><strong>Price overview</strong></div>
              <div>Monthly price: {fmtEUR(offer.price)}</div>
              <div>First month (prorated from {dateISO}): <strong>{fmtEUR(pro.firstMonthPrice)}</strong></div>
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
