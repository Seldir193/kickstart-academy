"use client";

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

export default function AdminBookingsTable({ bookings }: { bookings: Booking[] }) {
  // lokale, editierbare Kopie der Liste
  const [rows, setRows] = useState<Booking[]>(bookings);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [err, setErr] = useState<string>("");

  // wenn Server neue props liefert (SSR-Refresh), Liste übernehmen
  useEffect(() => setRows(bookings), [bookings]);

  async function reloadList() {
    try {
      const r = await fetch("/api/admin/bookings/list", { cache: "no-store" });
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error || `Reload failed (${r.status})`);
      setRows(d.bookings || []);
    } catch (e: any) {
      setErr(e.message || "Reload failed");
    }
  }

  async function confirmBooking(id: string) {
    setErr("");
    setLoadingId(id);
    try {
      const r = await fetch(`/api/admin/bookings/${id}/confirm`, { method: "POST" });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.ok) throw new Error(d?.error || `Confirm failed (${r.status})`);

      // Optimistic Update (sofort anzeigen) …
      setRows(prev =>
        prev.map(b =>
          b._id === id
            ? { ...b, status: "confirmed", confirmationCode: d.booking?.confirmationCode ?? b.confirmationCode }
            : b
        )
      );

      // … und optional echte Liste nachladen
      await reloadList();
    } catch (e: any) {
      setErr(e.message || "Fehler beim Bestätigen");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <main className="container">
      <h1>Bookings (latest)</h1>
      {err && <p className="error">{err}</p>}

      <div className="grid">
        {rows.map((b) => (
          <article key={b._id} className="card">
            <header className="card-head">
              <h3 className="card-title">
                {b.firstName} {b.lastName}
              </h3>
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
                disabled={loadingId === b._id || b.status === "confirmed"}
                onClick={() => confirmBooking(b._id)}
              >
                {b.status === "confirmed"
                  ? "Bestätigt"
                  : loadingId === b._id
                  ? "Bitte warten…"
                  : "Bestätigen"}
              </button>
            </div>

            <small>Created: {new Date(b.createdAt).toLocaleString()}</small>
          </article>
        ))}
      </div>
    </main>
  );
}
