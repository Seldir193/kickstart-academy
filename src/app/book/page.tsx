'use client';

import { useState } from 'react';

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  age: string;
  date: string;
  level: 'U8' | 'U10' | 'U12' | 'U14' | 'U16' | 'U18';
  message: string;
};

const initial: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  age: '',
  date: '',
  level: 'U10',
  message: '',
};

export default function BookPage() {
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle'|'sending'|'success'|'error'>('idle');

  const onChange = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email';
    const ageNum = Number(form.age);
    if (!ageNum || ageNum < 5 || ageNum > 19) e.age = 'Age 5–19';
    if (!form.date) e.date = 'Pick a date';
    return e;
  };


  const onSubmit = async (ev: React.FormEvent) => {
  ev.preventDefault();
  const e = validate();
  setErrors(e);
  if (Object.keys(e).length) return;

  try {
    setStatus('sending');

    // HIER kommt die API-URL rein
   

   const api = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

 
  const res = await fetch(`${api}/api/bookings`, {
    method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(form),
});

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data?.errors) setErrors(data.errors);
      setStatus('error');
      return;
    }

    setStatus('success');
    setForm(initial);
  } catch {
    setStatus('error');
  }
};


  return (
    <section>
      <h1>Book a Training</h1>
      <p>Reserve your spot — no account required.</p>

      <form className="form" onSubmit={onSubmit} noValidate>
        <div className="grid">
          <div className="field">
            <label>First Name</label>
            <input name="firstName" value={form.firstName} onChange={onChange} />
            {errors.firstName && <span className="error">{errors.firstName}</span>}
          </div>

          <div className="field">
            <label>Last Name</label>
            <input name="lastName" value={form.lastName} onChange={onChange} />
            {errors.lastName && <span className="error">{errors.lastName}</span>}
          </div>

          <div className="field">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={onChange} />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="field">
            <label>Age</label>
            <input name="age" type="number" min={5} max={19} value={form.age} onChange={onChange} />
            {errors.age && <span className="error">{errors.age}</span>}
          </div>

          <div className="field">
            <label>Date</label>
            <input name="date" type="date" value={form.date} onChange={onChange} />
            {errors.date && <span className="error">{errors.date}</span>}
          </div>

          <div className="field">
            <label>Level</label>
            <select name="level" value={form.level} onChange={onChange}>
              <option>U8</option><option>U10</option><option>U12</option>
              <option>U14</option><option>U16</option><option>U18</option>
            </select>
          </div>

          <div className="field field--full">
            <label>Message (optional)</label>
            <textarea name="message" rows={4} value={form.message} onChange={onChange} />
          </div>
        </div>

        <div className="actions">
          <button className="btn btn-primary" disabled={status==='sending'}>Send Booking</button>
          {status==='success' && <span className="ok">Booking sent!</span>}
          {status==='error' && <span className="error">Something went wrong.</span>}
        </div>
      </form>
    </section>
  );
}
