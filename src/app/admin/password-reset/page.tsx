// app/admin/password-reset/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function isValidEmail(s: string) {
  return /^\S+@\S+\.\S+$/.test(s);
}

export default function PasswordResetPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setError('');
    const em = email.trim();
    if (!isValidEmail(em)) {
      setError('Bitte gültige E-Mail eingeben');
      return;
    }

    setLoading(true);
    try {
      const r = await fetch('/api/admin/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: em }),
        cache: 'no-store',
      });

      const data = await r.json().catch(() => ({}));

      if (!r.ok || data?.ok === false) {
        throw new Error(data?.error || 'E-Mail konnte nicht gesendet werden');
      }

      // Optionaler Dev-Schnellpfad: Weiterleiten, wenn die API direkt einen Token liefert
      const token: string | undefined = data?.token || data?.devToken;
      if (token) {
        router.push(`/admin/new-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(em)}`);
        return;
      }

      // Standard: Erfolgsmeldung anzeigen
      setSent(true);
    } catch (err: any) {
      setError(err?.message || 'E-Mail konnte nicht gesendet werden');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="contact-form">
        <h2>Passwort zurücksetzen</h2>

        {!sent ? (
          <>
            <p>Gib deine E-Mail ein, wir senden dir einen Link zum Zurücksetzen.</p>

            {error && <div className="error mt-3" aria-live="polite">{error}</div>}

            <form className="form" onSubmit={onSubmit} noValidate>
              <div className="field">
                <label htmlFor="email">E-Mail</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="beispielname@email.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="actions">
                <button
                  type="button"
                  className="btn"
                  onClick={() => router.push('/admin/login')}
                  disabled={loading}
                >
                  Zurück zum Login
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Senden…' : 'E-Mail senden'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <p className="ok mt-3">
              Wenn ein Konto mit <strong>{email.trim()}</strong> existiert, haben wir dir einen Link geschickt.
              Bitte prüfe dein Postfach (und den Spam-Ordner).
            </p>
            <div className="actions">
              <button className="btn" onClick={() => router.push('/admin/login')}>
                Zurück zum Login
              </button>
              <button className="btn-primary" onClick={() => setSent(false)}>
                Nochmal senden
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
