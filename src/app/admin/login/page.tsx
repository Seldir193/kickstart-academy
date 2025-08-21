

















'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AdminLoginPage() {
  const sp = useSearchParams();
  const next = sp.get('next') ?? '/admin/bookings';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setLoading(true);

    const r = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    if (r.ok) {
      window.location.assign(next);
      return;
    }

    const d = await r.json().catch(() => ({}));
    setErr(d?.error || 'Login fehlgeschlagen');
    setLoading(false);
  }

  return (
    <div className="container">
      <div className="contact-form">
        <h2>Anbieter-Login</h2>
        <p>Bitte E-Mail und Passwort eingeben. Nur für interne Nutzung.</p>

        {err && <div className="error" style={{ marginTop: 8 }}>{err}</div>}

        <form className="form" onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">E-Mail *</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Passwort *</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Anmelden…' : 'Anmelden'}
          </button>
        </form>
      </div>
    </div>
  );
}
