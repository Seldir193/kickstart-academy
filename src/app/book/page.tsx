'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';

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

  const [form, setForm] = useState<FormState>(initialForm);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [offerLoading, setOfferLoading] = useState(true);
  const [offerError, setOfferError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const isEmbed = useMemo(() => params.get('embed') === '1', [params]);
  


const [today, setToday] = useState<string>('');
useEffect(() => {
  setToday(new Date().toISOString().split('T')[0]);
}, []);
  

  useEffect(() => {
    if (status === 'success') {
      const t = setTimeout(() => setStatus('idle'), 5000);
      return () => clearTimeout(t);
    }
  }, [status]);

  // Offer laden
  useEffect(() => {
    const readOfferId = () => {
      const id = params?.get('offerId') || params?.get('id') || '';
      if (id) return id;
      if (typeof window !== 'undefined') {
        const q = new URLSearchParams(window.location.search);
        return q.get('offerId') || q.get('id') || '';
      }
      return '';
    };

    const id = readOfferId();
    setForm((f) => ({ ...f, offerId: id }));

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
        const res = await fetch(`/api/offers/${id}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Offer = await res.json();
        if (!cancelled) setOffer(data);
      } catch {
        if (!cancelled) {
          setOffer(null);
          setOfferError('Offer not found or API unreachable.');
        }
      } finally {
        if (!cancelled) setOfferLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [params]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
      const res = await fetch(`/api/public/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerId: form.offerId,
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
        if (data?.errors) {
          setErrors(data.errors);
          if (data?.code === 'DUPLICATE') {
            setErrors((prev) => ({
              ...prev,
              firstName: prev.firstName || 'A booking with this first/last name already exists for this offer.',
              lastName: prev.lastName || 'Please use different names or contact us.',
            }));
          }
        }
        setStatus('error');
        return;
      }

      setStatus('success');
      setForm((prev) => ({ ...initialForm, offerId: prev.offerId }));
    } catch {
      setStatus('error');
    }
  };

  const offerLine =
    (offer?.title || `${offer?.type ?? ''} • ${offer?.location ?? ''}`).trim() || 'Selected offer';

  return (
    <>
      {/* Verhindert Header-/Footer-Flash vor dem ersten Paint */}
      <Script
        id="embed-mode-class"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
  (function(d){
    try {
      var isEmbed = location.search.indexOf('embed=1') > -1;
      if (!isEmbed) return;
      function apply(){ d.body && d.body.classList.add('embed-mode'); }
      if (d.body) apply(); else d.addEventListener('DOMContentLoaded', apply);
    } catch(e){}
  })(document);
`


        }}
      />

      <section className={`book-embed ${isEmbed ? 'is-embed' : ''}`}>
        {/* zentrierter, einspaltiger Wrapper im Embed */}
        <div className="book-grid book-grid--single">
          <div className="book-main">
            <form className="book-form" onSubmit={onSubmit} noValidate>
              <input type="hidden" name="offerId" value={form.offerId} />

              {/* Selected offer – inline im Formular, über den Feldern */}
              <div className="book-offer book-offer--inline field--full">
                <h3 className="book-offer__title">Selected offer</h3>

                {offerLoading && <p>Loading offer…</p>}
                {!offerLoading && offerError && (
                  <>
                    <p className="error">{offerError}</p>
                    <div className="book-offer__actions">
                      <a className="btn btn-primary" href="/trainings">Back to trainings</a>
                    </div>
                  </>
                )}

                {!offerLoading && !offerError && offer && (
                  <>
                    <div className="book-offer__line">{offerLine}</div>
                    <div className="book-offer__meta">
                      {typeof offer.price === 'number' ? `${offer.price} €` : null}
                      {offer.timeFrom && offer.timeTo ? ` • ${offer.timeFrom} – ${offer.timeTo}` : null}
                      {offer.ageFrom != null && offer.ageTo != null ? ` • Ages ${offer.ageFrom}–${offer.ageTo}` : null}
                    </div>
                    {offer.info ? <p className="book-offer__info">{offer.info}</p> : null}
                  </>
                )}
              </div>

              {/* Felder */}
              <div className="book-form__grid">
                <div className="field">
                  <label htmlFor="firstName">First Name</label>
                  <input id="firstName" name="firstName" value={form.firstName} onChange={onChange} />
                  {errors.firstName && <span className="error">{errors.firstName}</span>}
                </div>

                <div className="field">
                  <label htmlFor="lastName">Last Name</label>
                  <input id="lastName" name="lastName" value={form.lastName} onChange={onChange} />
                  {errors.lastName && <span className="error">{errors.lastName}</span>}
                </div>

                <div className="field">
                  <label htmlFor="email">Email</label>
                  <input id="email" name="email" type="email" value={form.email} onChange={onChange} />
                  {errors.email && <span className="error">{errors.email}</span>}
                </div>

                <div className="field">
                  <label htmlFor="age">Age</label>
                  <input id="age" name="age" type="number" min={5} max={19} value={form.age} onChange={onChange} />
                  {errors.age && <span className="error">{errors.age}</span>}
                </div>

                <div className="field">
                  <label htmlFor="date">Date</label>
                  
                  <input id="date" name="date" type="date" min={today || undefined} value={form.date} onChange={onChange} />

                  {errors.date && <span className="error">{errors.date}</span>}
                </div>

                <div className="field">
                  <label htmlFor="level">Level</label>
                  <select id="level" name="level" value={form.level} onChange={onChange}>
                    <option>U8</option>
                    <option>U10</option>
                    <option>U12</option>
                    <option>U14</option>
                    <option>U16</option>
                    <option>U18</option>
                  </select>
                </div>

                <div className="field field--full">
                  <label htmlFor="message">Message (optional)</label>
                  <textarea id="message" name="message" rows={4} value={form.message} onChange={onChange} />
                </div>
              </div>

              {errors.offerId && <p className="error">{errors.offerId}</p>}

              {/* 20px Abstand zum Button-Block wird im SCSS geregelt */}
              <div className="book-actions">
                <button className="btn btn-primary" disabled={status === 'sending' || !!offerError || !offer}>
                  {status === 'sending' ? 'Sending…' : 'Complete booking'}
                </button>
                {status === 'success' && <span className="ok">Booking sent!</span>}
                {status === 'error' && <span className="error">Something went wrong.</span>}
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
