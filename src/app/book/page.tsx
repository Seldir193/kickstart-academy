












'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

type Offer = {
  _id: string;
  title?: string;
  type?: string;
  location?: string;
  price?: number;
  days?: string[];
  timeFrom?: string;
  timeTo?: string;
  ageFrom?: number;
  ageTo?: number;
  info?: string;
};

type FormState = {
  offerId: string;
  firstName: string;
  lastName: string;
  email: string;
  age: string;
  date: string;
  level: 'U8' | 'U10' | 'U12' | 'U14' | 'U16' | 'U18';
  message: string;
};

const initialForm: FormState = {
  offerId: '',
  firstName: '',
  lastName: '',
  email: '',
  age: '',
  date: '',
  level: 'U10',
  message: '',
};

export default function BookPage() {
  const params = useSearchParams();
  const router = useRouter();

  const [form, setForm] = useState<FormState>(initialForm);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [offerLoading, setOfferLoading] = useState(true);
  const [offerError, setOfferError] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle'|'sending'|'success'|'error'>('idle');

  const api = useMemo(() => process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000', []);












useEffect(() => {
  // robustly read offerId from URL (supports ?offerId=... or ?id=...)
  const readOfferId = () => {
    // 1) try Next hook
    const fromHook =
      (params && (params.get('offerId') || params.get('id'))) || '';

    if (fromHook) return fromHook;

    // 2) fallback to direct window parse (SSR-safe guard)
    if (typeof window !== 'undefined') {
      const q = new URLSearchParams(window.location.search);
      return q.get('offerId') || q.get('id') || '';
    }
    return '';
  };

  const id = readOfferId();

  setForm(f => ({ ...f, offerId: id }));

  if (!id) {
    setOffer(null);
    setOfferError('Missing offerId in URL.');
    setOfferLoading(false);
    return;
  }

  let cancelled = false;
  (async () => {
    try {
      setOfferLoading(true);
      setOfferError(null);

      // preferred detail endpoint: GET /api/offers/:id
      const res = await fetch(`${api}/api/offers/${id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Offer = await res.json();

      if (!cancelled) setOffer(data);
    } catch (e) {
      if (!cancelled) {
        setOffer(null);
        setOfferError('Offer not found or API unreachable.');
      }
    } finally {
      if (!cancelled) setOfferLoading(false);
    }
  })();

  return () => { cancelled = true; };
}, [params, api]);











  const onChange = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.offerId) e.offerId = 'Missing offer.';
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

      const res = await fetch(`${api}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerId: form.offerId,           // <-- important
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          age: Number(form.age),
          date: form.date,
          level: form.level,
          message: form.message,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data?.errors) setErrors(data.errors);
        setStatus('error');
        return;
      }

      setStatus('success');
      // Optional: redirect or reset form
      setForm(prev => ({ ...initialForm, offerId: prev.offerId }));
    } catch {
      setStatus('error');
    }
  };










  

  return (
    <section>
      <h1>Book a Training</h1>
      <p>Reserve your spot — no account required.</p>

      {/* Selected Offer Panel */}
      <div className="card" style={{ marginTop: 12 }}>
        <h3 className="card-title" style={{ marginTop: 0 }}>Selected offer</h3>

        {offerLoading && <p>Loading offer…</p>}
        {!offerLoading && offerError && (
          <>
            <p className="error">{offerError}</p>
            <div className="card-actions">
              <a className="btn btn-primary" href="/trainings">Back to trainings</a>
            </div>
          </>
        )}

        {!offerLoading && !offerError && offer && (
          <>
            <div className="offer-meta">
              {(offer.title || `${offer.type ?? ''} • ${offer.location ?? ''}`).trim()}
            </div>
            <div className="offer-info">
              {typeof offer.price === 'number' ? `${offer.price} €` : null}
              {offer.timeFrom && offer.timeTo ? ` • ${offer.timeFrom} – ${offer.timeTo}` : null}
              {offer.ageFrom != null && offer.ageTo != null ? ` • Ages ${offer.ageFrom}–${offer.ageTo}` : null}
            </div>
            {offer.info ? <p style={{ marginTop: 8 }}>{offer.info}</p> : null}
          </>
        )}
      </div>

      {/* Booking Form */}
      <form className="form" onSubmit={onSubmit} noValidate style={{ marginTop: 16 }}>
        {/* keep offerId as hidden to submit as well */}
        <input type="hidden" name="offerId" value={form.offerId} />

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

        {errors.offerId && <p className="error">{errors.offerId}</p>}

        <div className="actions">
          <button className="btn btn-primary" disabled={status==='sending' || !!offerError || !offer}>
            Complete booking
          </button>
          {status==='success' && <span className="ok">Booking sent!</span>}
          {status==='error' && <span className="error">Something went wrong.</span>}
        </div>
      </form>
    </section>
  );
}
