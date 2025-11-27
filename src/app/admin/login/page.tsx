// app/admin/login/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function isValidEmail(s: string) {
  return /^\S+@\S+\.\S+$/.test(s);
}

export default function AdminLoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get('next') ?? '/admin/bookings';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [formError, setFormError] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    const e = sp.get('email') || '';
    if (e) setEmail(e);
  }, [sp]);

  function validate(fields?: { email?: string; password?: string }) {
    const e: { email?: string; password?: string } = {};
    const em = fields?.email ?? email;
    const pw = fields?.password ?? password;

    if (!isValidEmail(em)) e.email = '*Please fill out the email field';
    if (pw.length < 6) e.password = 'Min. 6 characters';
    return e;
  }

  function handleBlur(field: 'email' | 'password') {
    const e = validate({ [field]: field === 'email' ? email : password });
    setErrors((prev) => ({ ...prev, [field]: e[field] }));
  }

  function handleChange(field: 'email' | 'password', value: string) {
    if (field === 'email') setEmail(value);
    else setPassword(value);

    setErrors((prev) => {
      const next = { ...prev };
      if (field === 'email') {
        next.email = isValidEmail(value) ? undefined : 'Invalid email';
      } else {
        next.password = value.length >= 6 ? undefined : 'Min. 6 characters';
      }
      return next;
    });
  }

  // ✅ Avatar, User-ID & Name im LocalStorage cachen
  async function seedAvatarCacheFromLogin(loginData: any) {
    try {
      // 1) Erst aus der Login-Response lesen
      let userId: string | null =
        loginData?.user?.id || loginData?.user?._id || loginData?.user?.providerId || null;
      let avatarUrl: string | null = loginData?.user?.avatarUrl ?? null;
      let fullName: string | null = loginData?.user?.fullName ?? null;

      // 2) Falls etwas fehlt → Profil abrufen (einmal)
      if (!userId || !avatarUrl || !fullName) {
        const pr = await fetch('/api/admin/auth/profile', {
          credentials: 'include',
          cache: 'no-store',
        });
        const pd = await pr.json().catch(() => ({}));
        if (pr.ok && (pd?.ok ?? pr.ok)) {
          userId   = userId   ?? pd?.user?.id ?? pd?.user?._id ?? pd?.user?.providerId ?? null;
          avatarUrl = avatarUrl ?? pd?.user?.avatarUrl ?? null;
          fullName  = fullName  ?? pd?.user?.fullName  ?? null;
        }
      }

      // 3) In den Cache schreiben (oder löschen)
      if (userId) {
        localStorage.setItem('ks_user_id', String(userId));
        // 🔑 wichtig für vorhandene Frontend-Logik (z.B. Teilbeträge, alte Routen):
        localStorage.setItem('providerId', String(userId));
      } else {
        localStorage.removeItem('ks_user_id');
        localStorage.removeItem('providerId');
      }

      if (avatarUrl) localStorage.setItem('ks_avatar_url', avatarUrl);
      else localStorage.removeItem('ks_avatar_url');

      if (fullName) localStorage.setItem('ks_full_name', fullName);
      else localStorage.removeItem('ks_full_name');
    } catch {
      // silent fail
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setFormError('');
    const eObj = validate();
    setErrors(eObj);
    if (Object.keys(eObj).length) return;

    setLoading(true);

    try {
      // 🔧 Für ENV-Admin-Logins: providerId (Owner-ObjectId) mitsenden, wenn vorhanden.
      // Quelle: zuerst URL (?providerId=...), dann localStorage.
      const pidFromQuery = sp.get('providerId') || '';
      const pidFromLS = (typeof window !== 'undefined' && localStorage.getItem('providerId')) || '';
      const devProviderId = (pidFromQuery || pidFromLS).trim();

      const payload: any = { email, password };
      if (/^[a-f0-9]{24}$/i.test(devProviderId)) {
        payload.providerId = devProviderId;
      }

      const r = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
        cache: 'no-store',
      });

      if (r.ok) {
        // 💾 Login-Response lesen (kann avatarUrl enthalten) und Cache setzen,
        // danach sofort zum Ziel navigieren
        const data = await r.json().catch(() => ({}));
        await seedAvatarCacheFromLogin(data);

        // Falls Login-Response schon eine id hat, zusätzlich „providerId“ sichern
        const uid = data?.user?.id || data?.user?._id || data?.user?.providerId;
        if (uid) localStorage.setItem('providerId', String(uid));

        window.location.assign(next);
        return;
      }

      // Fehlertext robust auslesen
      const t = await r.text();
      let d: any;
      try {
        d = JSON.parse(t);
      } catch {
        d = { error: t || 'Login failed' };
      }
      setFormError(d?.error || 'Login failed');
    } catch {
      setFormError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="contact-form">
        <h2>Provider Login</h2>
        <p>Please enter your email and password (internal use only).</p>

        {formError && <div className="error" style={{ marginTop: 8 }}>{formError}</div>}

        <form className="form" onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="email"></label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="admin@example.com"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
            />
            <span className="error-slot" aria-live="polite">
              {errors.email ? <span className="error">{errors.email}</span> : null}
            </span>
          </div>

          <div className="field">
            <label htmlFor="password"></label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              placeholder="Password"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
            />
            <span className="error-slot" aria-live="polite">
              {errors.password ? <span className="error">{errors.password}</span> : null}
            </span>
          </div>

          <div className="actions" style={{ justifyContent: 'flex-start' }}>
            <a href="/admin/password-reset" className="nav-link">Passwort vergessen?</a>
          </div>

          <div className="actions">
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Signing in…' : 'Login'}
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => router.push('/admin/signup')}
              disabled={loading}
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



