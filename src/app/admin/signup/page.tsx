'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type Form = {
  fullName: string;
  email: string;
  password: string;
  confirm: string;
};

function isValidEmail(s: string) {
  return /^\S+@\S+\.\S+$/.test(s);
}

export default function AdminSignupPage() {
  const router = useRouter();
  const params = useSearchParams();

  const [form, setForm] = useState<Form>({
    fullName: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle');

  useEffect(() => {
    const email = params.get('email') || '';
    if (email) setForm((f) => ({ ...f, email }));
  }, [params]);

  function validate(fields?: Partial<Form>) {
    const e: Partial<Record<keyof Form, string>> = {};
    const fullName = fields?.fullName ?? form.fullName;
    const email    = fields?.email    ?? form.email;
    const password = fields?.password ?? form.password;
    const confirm  = fields?.confirm  ?? form.confirm;

    if (!fullName.trim()) e.fullName = 'Please fill in this field';
    if (!isValidEmail(email)) e.email = '*Please fill out the email field';

    if (password.length < 6) e.password = 'Min. 6 characters';
    if (confirm.length < 6) e.confirm = 'Min. 6 characters';
    else if (password !== confirm) e.confirm = 'Passwords do not match';

    return e;
  }

  function setField<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((f) => ({ ...f, [key]: value }));

    setErrors((prev) => {
      const next = { ...prev };
      const singleErr = validate({ [key]: value } as Partial<Form>);
      next[key] = (singleErr as any)[key];

      if (key === 'password') {
        // confirm-Abgleich neu bewerten
        const cf = validate({ confirm: form.confirm, password: value });
        next.confirm = cf.confirm;
      }
      return next;
    });
  }

  function handleBlur<K extends keyof Form>(key: K) {
    const e = validate({ [key]: form[key] } as Partial<Form>);
    setErrors((prev) => ({ ...prev, [key]: (e as any)[key] }));
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;






    // in onSubmit() statt setTimeout:
setStatus('sending');
try {
  const r = await fetch('/api/admin/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: form.fullName,
      email: form.email,
      password: form.password,
    }),
    credentials: 'include',
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d?.ok) {
    // Feldfehler vom Backend anzeigen
    if (d?.errors) setErrors((prev) => ({ ...prev, ...d.errors }));
    else alert(d?.error || 'Signup failed'); // oder eigenes Fehlerfeld
    setStatus('idle');
    return;
  }
  // Erfolgreich → zur Login-Seite, E-Mail vorbefüllen
  router.replace(`/admin/login?email=${encodeURIComponent(form.email)}`);
} catch {
  // Netzwerkfehler behandeln
  setStatus('idle');
}








  }

  return (
    <section>
      <h1>Provider Sign-up</h1>
      <p>Create your provider access. After registration you will be redirected to the login page.</p>

      <form className="form" onSubmit={onSubmit} noValidate>
        <div className="grid">
          <div className="field">
            <label htmlFor="fullName"></label>
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
            <label htmlFor="email"></label>
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
            <label htmlFor="password"></label>
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
            <label htmlFor="confirm"></label>
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
          <button className="btn btn-primary" disabled={status === 'sending'}>
            {status === 'sending' ? 'Creating…' : 'Create account'}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => router.push('/admin/login')}
            disabled={status === 'sending'}
          >
            I already have an account
          </button>
        </div>
      </form>
    </section>
  );
}






















