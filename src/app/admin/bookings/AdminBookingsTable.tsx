'use client';

import { useEffect, useState } from 'react';

type Status = 'pending' | 'processing' | 'confirmed' | 'cancelled' | 'deleted';

type Booking = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  date: string;        // 'yyyy-mm-dd'
  level: string;
  message?: string;
  createdAt: string;
  status?: Status;
  confirmationCode?: string;

  // optionale Felder, nur Anzeige
  priceAtBooking?: number | null;
  invoiceNumber?: string | null;
  invoiceNo?: string | null;
  invoiceDate?: string | null;
};

export default function AdminBookingsTable({ bookings }: { bookings: Booking[] }) {
  // lokale, editierbare Kopie der Liste
  const [rows, setRows] = useState<Booking[]>(bookings);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [err, setErr] = useState<string>('');
  const [viewing, setViewing] = useState<Booking | null>(null); // ← Read-only Dialog

  // wenn Server neue props liefert (SSR-Refresh), Liste übernehmen
  useEffect(() => setRows(bookings), [bookings]);

  async function reloadList() {
    try {
      setErr('');
      const r = await fetch('/api/admin/bookings', {
        method: 'GET',
        credentials: 'include',   // 🔐 JWT-Cookie mitsenden
        cache: 'no-store',
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d?.error || `Reload failed (${r.status})`);

      // erwartete Form: { bookings: [...] }
      const next: Booking[] =
        Array.isArray(d) ? d :
        Array.isArray(d.bookings) ? d.bookings :
        Array.isArray(d.items) ? d.items :
        [];
      setRows(next);
    } catch (e: any) {
      setErr(e?.message || 'Reload failed');
    }
  }

  async function confirmBooking(id: string) {
    setErr('');
    setLoadingId(id);
    try {
      const r = await fetch(`/api/admin/bookings/${id}/confirm`, {
        method: 'POST',
        credentials: 'include',   // 🔐
        cache: 'no-store',
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d?.ok) throw new Error(d?.error || r.statusText);

      // Optimistic Update
      setRows(prev =>
        prev.map(b =>
          b._id === id
            ? { ...b, status: 'confirmed', confirmationCode: d.booking?.confirmationCode ?? b.confirmationCode }
            : b
        )
      );

      // echte Liste nachladen
      await reloadList();
    } catch (e: any) {
      setErr(e?.message || 'Fehler beim Bestätigen');
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <main className="container p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-3">Bookings (latest)</h1>
      {err && <div className="card text-red-700 mb-3">{err}</div>}

      <div className="grid">
        {rows.map((b) => (
          <article
            key={b._id}
            className="card cursor-pointer"
            onClick={() => setViewing(b)} // ← öffnet Read-only Dialog
          >
            <header className="card-head">
              <h3 className="card-title">
                {b.firstName} {b.lastName}
              </h3>
              <span className="badge">{b.level}</span>
            </header>

            <ul className="card-list">
              <li><strong>Date:</strong> {formatDateDE(b.date) || b.date}</li>
              <li><strong>Age:</strong> {b.age}</li>
              <li><strong>Email:</strong> {b.email}</li>
              {b.message && <li><strong>Msg:</strong> {b.message}</li>}
              {b.status && <li><strong>Status:</strong> {pillLabel(b.status)}</li>}
              {b.confirmationCode && <li><strong>Code:</strong> {b.confirmationCode}</li>}
            </ul>

            <div className="actions">
              <button
                disabled={loadingId === b._id || b.status === 'confirmed'}
                onClick={(e) => { e.stopPropagation(); confirmBooking(b._id); }} // ← verhindert Dialog-Open
              >
                {b.status === 'confirmed'
                  ? 'Bestätigt'
                  : loadingId === b._id
                  ? 'Bitte warten…'
                  : 'Bestätigen'}
              </button>
            </div>

            <small>Created: {new Date(b.createdAt).toLocaleString('de-DE')}</small>
          </article>
        ))}
        {!rows.length && (
          <div className="card">Keine Buchungen gefunden.</div>
        )}
      </div>

      {/* Read-only Dialog */}
      {viewing && (
        <BookingViewDialog booking={viewing} onClose={() => setViewing(null)} />
      )}
    </main>
  );
}

/* ========================= Helpers ========================= */

function formatDateDE(isoLike?: string) {
  if (!isoLike) return '';
  const d = new Date(isoLike.length === 10 ? `${isoLike}T00:00:00` : isoLike);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('de-DE', { day:'2-digit', month:'2-digit', year:'numeric' }).format(d);
}

function pillLabel(s: Status) {
  return s[0].toUpperCase() + s.slice(1);
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-3 py-2 border-b border-gray-100">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="col-span-2 text-sm text-gray-900">{children || '—'}</div>
    </div>
  );
}

/* ===================== Read-only Modal ===================== */

function BookingViewDialog({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 flex items-start justify-center p-4 md:p-8">
        <div className="card w-full max-w-2xl relative">
          <button
            className="absolute top-3 right-3 btn"
            onClick={onClose}
            aria-label="Close"
          >
            Close
          </button>

          <h2 className="text-xl font-bold mb-1">
            Booking – {[booking.firstName, booking.lastName].filter(Boolean).join(' ')}
          </h2>
          <p className="text-sm text-gray-500 mb-4">{booking._id}</p>

          <div className="divide-y divide-gray-100">
            <Row label="Status">{booking.status ? pillLabel(booking.status) : '—'}</Row>
            <Row label="Date">{formatDateDE(booking.date) || booking.date || '—'}</Row>
            <Row label="Level">{booking.level || '—'}</Row>
            <Row label="Age">{Number.isFinite(booking.age) ? booking.age : '—'}</Row>
            <Row label="Email">{booking.email || '—'}</Row>
            <Row label="Message">{booking.message || '—'}</Row>

            <Row label="Invoice No.">{booking.invoiceNumber || booking.invoiceNo || '—'}</Row>
            <Row label="Invoice Date">{booking.invoiceDate ? formatDateDE(booking.invoiceDate) : '—'}</Row>
            <Row label="Price at Booking">
              {typeof booking.priceAtBooking === 'number' ? `${booking.priceAtBooking.toFixed(2)} €` : '—'}
            </Row>

            <Row label="Confirmation Code">{booking.confirmationCode || '—'}</Row>
            <Row label="Created">{booking.createdAt ? new Date(booking.createdAt).toLocaleString('de-DE') : '—'}</Row>
          </div>
        </div>
      </div>
    </div>
  );
}



