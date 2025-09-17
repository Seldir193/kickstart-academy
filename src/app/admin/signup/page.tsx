'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type Form = { fullName: string; email: string; password: string; confirm: string };

function isValidEmail(s: string) {
  return /^\S+@\S+\.\S+$/.test(s);
}

export default function AdminSignupPage() {
  const router = useRouter();
  const params = useSearchParams();

  const [form, setForm] = useState<Form>({ fullName: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [formError, setFormError] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle');

  useEffect(() => {
    const email = params.get('email') || '';
    if (email) setForm(f => ({ ...f, email }));
  }, [params]);

  function validateAll(f: Form) {
    const e: Partial<Record<keyof Form, string>> = {};
    if (!f.fullName.trim()) e.fullName = 'Please fill in this field';
    if (!isValidEmail(f.email)) e.email = '*Please fill out the email field';
    if (f.password.length < 6) e.password = 'Min. 6 characters';
    if (f.confirm.length < 6) e.confirm = 'Min. 6 characters';
    else if (f.password !== f.confirm) e.confirm = 'Passwords do not match';
    return e;
  }

  function setField<K extends keyof Form>(key: K, value: Form[K]) {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      setErrors(validateAll(next));
      return next;
    });
  }

  function handleBlur<K extends keyof Form>(key: K) {
    const e = validateAll(form);
    setErrors(prev => ({ ...prev, [key]: e[key] }));
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (status === 'sending') return;

    setFormError('');
    const e = validateAll(form);
    setErrors(e);
    if (Object.keys(e).length) return;

    setStatus('sending');
    try {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      };

      const r = await fetch('/api/admin/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include', // JWT-Cookie mitnehmen (schadet nicht)
        cache: 'no-store',
      });

      const d = await r.json().catch(() => ({} as any));
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.debug('signup response', r.status, d);
      }

      // Erfolg flexibler erkennen (200/201 + ok/user)
      const success = r.ok && (d?.ok === true || d?.user || r.status === 201);
      if (!success) {
        if (d?.errors && typeof d.errors === 'object') {
          setErrors(prev => ({ ...prev, ...d.errors }));
          setFormError('Please fix the errors above.');
        } else {
          const msg =
            d?.error ||
            d?.message ||
            (typeof d?.raw === 'string' ? d.raw.slice(0, 200) : '') ||
            `Registration failed (${r.status}). Please try again.`;
          setFormError(msg);
        }
        setStatus('idle');
        return;
      }

      setStatus('done');
      router.replace(`/admin/login?email=${encodeURIComponent(payload.email)}`);
    } catch (err: any) {
      setFormError('Network error. Please try again.');
      setStatus('idle');
    }
  }

  const disabled = status === 'sending';

  return (
    <section aria-busy={disabled}>
      <h1>Provider Sign-up</h1>
      <p>Create your provider access. After registration you’ll be redirected to the login page.</p>

      {formError && (
        <div role="alert" className="form-error" style={{ marginBottom: 12 }} aria-live="polite">
          {formError}
        </div>
      )}

      <form className="form" onSubmit={onSubmit} noValidate>
        <fieldset disabled={disabled} style={{ border: 0, padding: 0, margin: 0 }}>
          <div className="grid">
            <div className="field">
              <label htmlFor="fullName">Name</label>
              <input
                id="fullName"
                name="fullName"
                value={form.fullName}
                onChange={(e) => setField('fullName', e.target.value)}
                onBlur={() => handleBlur('fullName')}
                autoComplete="name"
                placeholder="Name"
                required
                aria-invalid={Boolean(errors.fullName)}
              />
              <span className="error-slot" aria-live="polite">
                {errors.fullName ? <span className="error">{errors.fullName}</span> : null}
              </span>
            </div>

            <div className="field">
              <label htmlFor="email">E-Mail</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                autoComplete="email"
                placeholder="admin@example.com"
                required
                aria-invalid={Boolean(errors.email)}
              />
              <span className="error-slot" aria-live="polite">
                {errors.email ? <span className="error">{errors.email}</span> : null}
              </span>
            </div>

            <div className="field">
              <label htmlFor="password">Passwort</label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={(e) => setField('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                minLength={6}
                autoComplete="new-password"
                placeholder="Password"
                required
                aria-invalid={Boolean(errors.password)}
              />
              <span className="error-slot" aria-live="polite">
                {errors.password ? <span className="error">{errors.password}</span> : null}
              </span>
            </div>

            <div className="field">
              <label htmlFor="confirm">Passwort bestätigen</label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                value={form.confirm}
                onChange={(e) => setField('confirm', e.target.value)}
                onBlur={() => handleBlur('confirm')}
                minLength={6}
                autoComplete="new-password"
                placeholder="Confirm password"
                required
                aria-invalid={Boolean(errors.confirm)}
              />
              <span className="error-slot" aria-live="polite">
                {errors.confirm ? <span className="error">{errors.confirm}</span> : null}
              </span>
            </div>
          </div>

          <div className="actions">
            <button className="btn btn-primary" disabled={disabled} aria-busy={disabled}>
              {disabled ? 'Creating…' : 'Create account'}
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => router.push('/admin/login')}
              disabled={disabled}
            >
              I already have an account
            </button>
          </div>
        </fieldset>
      </form>
    </section>
  );
}








