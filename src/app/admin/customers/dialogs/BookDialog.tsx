// app/admin/customers/dialogs/BookDialog.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { Customer, Offer } from '../types';
import { GROUPED_COURSE_OPTIONS, offerMatchesCourse } from 'src/app/lib/courseOptions';

type Props = {
  customerId: string;
  onClose: () => void;
  onBooked: (freshCustomer: Customer) => void;
};




// Weekly = echte Weekly-Kurse ODER (Foerdertraining/Kindergarten) ohne ClubPrograms/RentACoach
function isWeeklyOffer(o?: Offer | null) {
  if (!o) return false;

  // 1) echte Weekly
  if (o.category === 'Weekly') return true;

  // 2) explizit NICHT Weekly
  if (o.category === 'ClubPrograms' || o.category === 'RentACoach') return false;

  // 3) Fallback: alte Datensätze ohne category
  return o.type === 'Foerdertraining' || o.type === 'Kindergarten';
}



function isNum(v: any): v is number { return typeof v === 'number' && isFinite(v); }
function fmtEUR(n: number) { try { return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n); } catch { return `${n.toFixed(2)} €`; } }
function fmtDE(dateISO: string) {
  if (!dateISO) return '—';
  try { const [y,m,d] = dateISO.split('-').map(Number); return `${String(d).padStart(2,'0')}.${String(m).padStart(2,'0')}.${y}`; }
  catch { return dateISO; }
}
/** Pro-rata for first month starting at dateISO */
function prorateForStart(dateISO: string, monthlyPrice?: number | null) {
  if (!dateISO || !isNum(monthlyPrice)) return null;
  const d = new Date(`${dateISO}T00:00:00`);
  if (isNaN(d.getTime())) return null;
  const y = d.getFullYear(), m = d.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const startDay = d.getDate();
  const daysRemaining = Math.max(0, daysInMonth - startDay + 1);
  const factor = Math.max(0, Math.min(1, daysRemaining / daysInMonth));
  const firstMonthPrice = Math.round(monthlyPrice * factor * 100) / 100;
  return { daysInMonth, daysRemaining, factor, firstMonthPrice, monthlyPrice };
}

export default function BookDialog({ customerId, onClose, onBooked }: Props) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // grouped course selection (matches TrainingCard)
  const [courseValue, setCourseValue] = useState<string>(''); // '' = All courses
  const [selectedOfferId, setSelectedOfferId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoadingOffers(true); setErr(null);
        const res = await fetch(`/api/admin/offers?limit=500`, {
          cache: 'no-store',
          credentials: 'include', // 🔐 JWT-Cookie mitsenden
        });
        if (!res.ok) throw new Error(`Failed to load offers (${res.status})`);
        const data = await res.json();
        const list = Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : []);
        setOffers(list as any);
      } catch (e: any) {
        setErr(e?.message || 'Failed to load offers');
      } finally {
        setLoadingOffers(false);
      }

     
    })();
  },  []);



  const filteredOffers = useMemo(
    () => offers.filter(o => offerMatchesCourse(courseValue, o)),
    [offers, courseValue]
  );

  useEffect(() => {
    if (!filteredOffers.length) { setSelectedOfferId(''); return; }
    const still = filteredOffers.some(o => o._id === selectedOfferId);
    setSelectedOfferId(still ? selectedOfferId : filteredOffers[0]._id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredOffers.map(o => o._id).join('|')]);

  const selectedOffer = useMemo(
    () => filteredOffers.find(o => o._id === selectedOfferId) || null,
    [filteredOffers, selectedOfferId]
  );

  const isWeekly = useMemo(() => isWeeklyOffer(selectedOffer), [selectedOffer]);

const pro = useMemo(() => {
  if (!isWeekly) return null;
  return isNum(selectedOffer?.price)
    ? prorateForStart(selectedDate, selectedOffer!.price)
    : null;
}, [isWeekly, selectedDate, selectedOffer?.price]);



  //const pro = useMemo(
    //() => prorateForStart(selectedDate, isNum(selectedOffer?.price) ? selectedOffer!.price : null),
    //[selectedDate, selectedOffer?.price]
  //);

  async function submit() {
    if (!customerId || !selectedOfferId || !selectedDate) return;
    setSaving(true); setErr(null);
    try {
      // 1) Create booking
      const res = await fetch(`/api/admin/customers/${encodeURIComponent(customerId)}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',   // 🔐
        cache: 'no-store',
        body: JSON.stringify({ offerId: selectedOfferId, date: selectedDate }),
      });
      if (!res.ok) throw new Error(`Create booking failed (${res.status})`);
      const payload = await res.json();
      const newBooking = payload?.booking;

      // 2) Confirmation email (PDF attached server-side)
      if (newBooking?._id) {
        const r2 = await fetch(
          `/api/admin/customers/${encodeURIComponent(customerId)}/bookings/${encodeURIComponent(newBooking._id)}/email/confirmation`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',   // 🔐
            cache: 'no-store',
          }
        );
        if (!r2.ok && r2.status !== 409) {
          console.warn('confirmation email failed', r2.status, await r2.text().catch(()=> ''));
        }
      }

      // 3) Refresh customer
      const r3 = await fetch(`/api/admin/customers/${encodeURIComponent(customerId)}`, {
        cache: 'no-store',
        credentials: 'include',   // 🔐
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

        {/* Courses (grouped, like /trainings) */}
        <div className="grid gap-2 mb-2">
          <div>
            <label className="lbl">Courses</label>
            <select className="input" value={courseValue} onChange={(e)=> setCourseValue(e.target.value)}>
              <option value="">All courses</option>
              {GROUPED_COURSE_OPTIONS.map(g => (
                <optgroup key={g.label} label={g.label}>
                  {g.items.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        {/* Offer */}
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
                  isNum(o.price) ? fmtEUR(o.price) : undefined,
                ].filter(Boolean);
                return <option key={o._id} value={o._id}>{parts.join(' — ')}</option>;
              })}
            </select>
            {!filteredOffers.length && <div className="text-gray-600 mt-1">No offers in this selection.</div>}
          </div>
        </div>

        {/* Date */}
        <div className="grid gap-2">
          <div>
            <label className="lbl">Start date</label>
            <input className="input" type="date" value={selectedDate} onChange={(e)=> setSelectedDate(e.target.value)} />
          </div>
        </div>

      




        {/* Price box */}
{isNum(selectedOffer?.price) && (
  isWeekly ? (
    <div className="mt-3 p-3 rounded bg-gray-50 border">
      <div className="font-semibold mb-1">Price overview</div>
      <ul className="list-disc ml-5">
        <li>Monthly price: <b>{fmtEUR(selectedOffer!.price!)}</b></li>
        {pro ? (
          <li>
            First month (pro-rata from <b>{fmtDE(selectedDate)}</b>):{" "}
            <b>{fmtEUR(pro.firstMonthPrice)}</b>{" "}
            <span className="text-gray-600">
              ({pro.daysRemaining}/{pro.daysInMonth} days)
            </span>
          </li>
        ) : (
          <li className="text-gray-600">Select a valid date to see pro-rata.</li>
        )}
      </ul>
    </div>
  ) : (
    <div className="mt-3">
      <div>
        Price: <b>{fmtEUR(selectedOffer!.price!)}</b>
      </div>
    </div>
  )
)}



        <div className="flex justify-end gap-2 mt-3">
          <button className="btn" onClick={onClose}>Close</button>
          <button className="btn btn-primary" disabled={saving || !selectedOfferId || !selectedDate} onClick={submit}>
            {saving ? 'Booking…' : 'Confirm booking'}
          </button>
        </div>
      </div>
    </div>
  );
}
