'use client';

import { useEffect, useState } from 'react';

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
};

export default function AdminBookingsPage() {
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_URL;
    fetch(`${api}/api/bookings`)
      .then(async (r) => {
        if (!r.ok) throw new Error('Failed to fetch bookings');
        const data = await r.json();
        setItems(data.bookings || []);
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

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
            </ul>
            <small>Created: {new Date(b.createdAt).toLocaleString()}</small>
          </article>
        ))}
      </div>
    </main>
  );
}
