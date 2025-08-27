








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
    setErrors(prev => ({ ...prev, [field]: e[field] }));
  }

  function handleChange(field: 'email' | 'password', value: string) {
    if (field === 'email') setEmail(value); else setPassword(value);

    setErrors(prev => {
      const next = { ...prev };
      if (field === 'email') {
        next.email = isValidEmail(value) ? undefined : 'Invalid email';
      } else {
        next.password = value.length >= 6 ? undefined : 'Min. 6 characters';
      }
      return next;
    });
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
      const r = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
        cache: 'no-store',
      });
      if (r.ok) {
        window.location.assign(next);
        return;
      }
      const d = await r.json().catch(() => ({}));
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
            {/* reservierter Platz für die Fehlermeldung */}
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

          <div className="actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Signing in…' : 'Login'}
            </button>
            <button
              type="button"
              className="btn btn-primary"
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
