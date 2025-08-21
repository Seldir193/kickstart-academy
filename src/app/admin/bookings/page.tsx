'use client';

import { useEffect, useState } from "react";

type Booking = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  date: string;
  level: string;
  message?: string;
  createdAt: string;
  status?: "pending" | "processing" | "confirmed" | "cancelled" | "deleted";
  confirmationCode?: string;
};

export default function AdminBookingsPage() {
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const r = await fetch(`/api/admin/bookings`, { cache: "no-store" });
      if (r.status === 401) {
        // kein useRouter nötig
        window.location.assign(`/admin/login?next=${encodeURIComponent("/admin/bookings")}`);
        return;
      }
      if (!r.ok) throw new Error(`Failed to fetch bookings (${r.status})`);
      const data = await r.json();
      setItems(data.bookings || []);
    } catch (e: any) {
      setErr(e.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function confirmBooking(id: string) {
    if (busyId) return;
    setBusyId(id);
    setErr("");

    // optimistic: sofort als confirmed markieren
    setItems(prev =>
      prev.map(b => b._id === id ? { ...b, status: "confirmed" } : b)
    );

    try {
      const r = await fetch(`/api/admin/bookings/${id}/confirm`, { method: "POST" });
      if (r.status === 401) {
        window.location.assign(`/admin/login?next=${encodeURIComponent("/admin/bookings")}`);
        return;
      }
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data?.ok) {
        throw new Error(data?.error || `Confirm failed (${r.status})`);
      }
      // Antwort zurück in die Liste mergen (z. B. confirmationCode)
      const updated = data.booking as Booking;
      setItems(prev => prev.map(b => (b._id === id ? { ...b, ...updated } : b)));
    } catch (e: any) {
      // rollback falls nötig
      await load();
      alert(`Fehler: ${e.message || e}`);
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <main className="container"><p>Loading…</p></main>;
  if (err) return <main className="container"><p className="error">{err}</p></main>;

  return (
    <main className="container">
      <h1>Bookings (latest)</h1>
      <div className="grid">
        {items.map(b => (
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
              {b.status && <li><strong>Status:</strong> {b.status}</li>}
              {b.confirmationCode && <li><strong>Code:</strong> {b.confirmationCode}</li>}
            </ul>
            <div className="actions">
              <button
                disabled={b.status === "confirmed" || busyId === b._id}
                onClick={() => confirmBooking(b._id)}
              >
                {busyId === b._id ? "Bitte warten…" : (b.status === "confirmed" ? "Bestätigt" : "Bestätigen")}
              </button>
            </div>
            <small>Created: {new Date(b.createdAt).toLocaleString()}</small>
          </article>
        ))}
      </div>
    </main>
  );
}













