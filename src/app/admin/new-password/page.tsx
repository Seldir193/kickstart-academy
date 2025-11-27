'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function NewPasswordPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const tokenParam = sp.get('token') || '';   // kommt i.d.R. per E-Mail-Link
  const emailParam = sp.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const canSubmit =
    password.length >= 6 && confirm.length >= 6 && password === confirm;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setFormError('');
    setLoading(true);

    try {
      const r = await fetch('/api/admin/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          token: tokenParam || undefined,
          email: emailParam || undefined,
          password,
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || data?.ok === false) {
        throw new Error(data?.error || 'Passwort konnte nicht geändert werden');
      }
      // Erfolgreich -> zurück zum Login, E-Mail ggf. vorfüllen
      const next = emailParam ? `/admin/login?email=${encodeURIComponent(emailParam)}` : '/admin/login';
      router.replace(next);
    } catch (err: any) {
      setFormError(err?.message || 'Passwort konnte nicht geändert werden');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="contact-form">
        <h2>Neues Passwort setzen</h2>
        <p>Bitte neues Passwort eingeben und bestätigen.</p>

        {formError && <div className="error" style={{ marginTop: 8 }}>{formError}</div>}

        <form className="form" onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="pw">Neues Passwort</label>
            <input
              id="pw"
              name="pw"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort (min. 6 Zeichen)"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="pw2">Neues Passwort bestätigen</label>
            <input
              id="pw2"
              name="pw2"
              type="password"
              className="input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Passwort wiederholen"
              autoComplete="new-password"
              required
            />
            {password && confirm && password !== confirm && (
              <div className="error">Passwörter stimmen nicht überein.</div>
            )}
          </div>

          <div className="actions">
            <button type="button" className="btn" onClick={() => router.push('/admin/login')}>
              Abbrechen
            </button>
            <button type="submit" className="btn" disabled={!canSubmit || loading}>
              {loading ? 'Speichern…' : 'Passwort ändern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
