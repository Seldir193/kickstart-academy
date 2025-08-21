'use client';

import { useEffect, useMemo, useState } from 'react';

/** ===== Typen ===== */
type Status = 'pending' | 'processing' | 'confirmed' | 'cancelled' | 'deleted';

type Booking = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  date: string;        // yyyy-mm-dd
  level: string;       // U8/U10/...
  message?: string;
  createdAt: string;   // ISO
  status?: Status;     // optional im Backend, deshalb coalescen
  confirmationCode?: string;
};

const STATUSES: Status[] = ['pending', 'processing', 'confirmed', 'cancelled', 'deleted'];
const asStatus = (s?: Booking['status']): Status => (s ?? 'pending') as Status;

/** ===== Page ===== */
export default function AdminBookingsPage() {
  const [all, setAll] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [active, setActive] = useState<Status>('pending');
  const [busyId, setBusyId] = useState<string>('');

  async function load() {
    setLoading(true);
    setErr('');
    try {
      const r = await fetch(`/api/admin/bookings`, { cache: 'no-store' });
      if (!r.ok) throw new Error(`Failed to fetch bookings (${r.status})`);
      const data = await r.json();
      setAll(data.bookings || []);
    } catch (e: any) {
      setErr(e?.message || 'Load failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const counts = useMemo<Record<Status, number>>(() => {
    const map: Record<Status, number> = {
      pending: 0, processing: 0, confirmed: 0, cancelled: 0, deleted: 0,
    };
    for (const b of all) map[asStatus(b.status)] += 1;
    return map;
  }, [all]);

  const items = useMemo(
    () => all.filter(b => asStatus(b.status) === active),
    [all, active]
  );

  /** ===== Actions ===== */
  async function confirmBooking(id: string, opts?: { resend?: boolean }) {
    setBusyId(id);
    try {
      const url = `/api/admin/bookings/${id}/confirm${opts?.resend ? '?resend=1' : ''}`;
      const r = await fetch(url, { method: 'POST' });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.ok) throw new Error(d.error || r.statusText);
      if (opts?.resend) alert('Bestätigung erneut gesendet.');
      await load();
    } catch (e: any) {
      alert(`Fehler beim Bestätigen: ${e?.message || e}`);
    } finally {
      setBusyId('');
    }
  }

  async function resendBooking(id: string) {
    // Variante A: eigener Proxy /resend-confirmation
    // const r = await fetch(`/api/admin/bookings/${id}/resend-confirmation`, { method: 'POST' });
    // Variante B (direkt confirm?resend=1) – nutzen wir hier:
    return confirmBooking(id, { resend: true });
  }

  async function setStatus(id: string, status: Status) {
    setBusyId(id);
    try {
      const r = await fetch(`/api/admin/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.ok) throw new Error(d.error || r.statusText);
      await load();
    } catch (e: any) {
      alert(`Status-Update fehlgeschlagen: ${e?.message || e}`);
    } finally {
      setBusyId('');
    }
  }

  async function deleteBooking(id: string) {
    if (!confirm('Wirklich löschen (soft delete)?')) return;
    setBusyId(id);
    try {
      const r = await fetch(`/api/admin/bookings/${id}`, { method: 'DELETE' });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.ok) throw new Error(d.error || r.statusText);
      await load();
    } catch (e: any) {
      alert(`Löschen fehlgeschlagen: ${e?.message || e}`);
    } finally {
      setBusyId('');
    }
  }

  /** ===== Render ===== */
  if (loading) return <main className="container"><p>Loading…</p></main>;
  if (err)      return <main className="container"><p className="error">{err}</p></main>;

  return (
    <main className="container">
      <h1>Bookings</h1>

      {/* Tabs */}
      <div className="actions" style={{ margin: '8px 0 16px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {STATUSES.map(s => (
          <button
            key={s}
            className={`btn ${active === s ? 'btn-primary' : ''}`}
            onClick={() => setActive(s)}
            style={{ textTransform: 'capitalize' }}
          >
            {s} ({counts[s] || 0})
          </button>
        ))}
      </div>

      {/* List */}
      <div className="grid">
        {items.map(b => {
          const s = asStatus(b.status);
          const isBusy = busyId === b._id;
          return (
            <article key={b._id} className="card">
              <header className="card-head">
                <h3 className="card-title">{b.firstName} {b.lastName}</h3>
                <span className="badge">{b.level}</span>
              </header>

              <ul className="card-list">
                <li><strong>Date:</strong> {b.date}</li>
                <li><strong>Age:</strong> {b.age}</li>
                <li><strong>Email:</strong> {b.email}</li>
                {b.message && <li><strong>Msg:</strong> {b.message}</li>}
                <li><strong>Status:</strong> {s}</li>
                {b.confirmationCode && <li><strong>Code:</strong> {b.confirmationCode}</li>}
              </ul>

              <div className="actions" style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {s === 'pending' && (
                  <button className="btn" disabled={isBusy} onClick={() => setStatus(b._id, 'processing')}>
                    In Bearbeitung
                  </button>
                )}

                {s !== 'confirmed' && s !== 'cancelled' && s !== 'deleted' && (
                  <button className="btn btn-primary" disabled={isBusy} onClick={() => confirmBooking(b._id)}>
                    Bestätigen
                  </button>
                )}

                {s !== 'cancelled' && s !== 'deleted' && (
                  <button className="btn" disabled={isBusy} onClick={() => setStatus(b._id, 'cancelled')}>
                    Absagen
                  </button>
                )}

                {s === 'confirmed' && (
                  <button className="btn" disabled={isBusy} onClick={() => resendBooking(b._id)}>
                    Erneut senden
                  </button>
                )}

                {s !== 'deleted' && (
                  <button className="btn" disabled={isBusy} onClick={() => deleteBooking(b._id)}>
                    Löschen
                  </button>
                )}
              </div>

              <small>Created: {new Date(b.createdAt).toLocaleString('de-DE')}</small>
            </article>
          );
        })}
      </div>
    </main>
  );
}
