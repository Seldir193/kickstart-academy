'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';

/* ===== Types ===== */
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
  category?: string;
  // Coach (optional; dynamisch aus eurer API)
  coachName?: string;
  coachFirst?: string;
  coachLast?: string;
  coach?: string;
  coachImage?: string;
  coachPhoto?: string;
  coachAvatar?: string;
  coachPic?: string;
  coachImg?: string;
  coachEmail?: string;
  email?: string; // fallback
  contactEmail?: string; // fallback
};

type FormState = {
  offerId: string;
  childFirst: string;
  childLast: string;
  childGender: 'weiblich' | 'männlich' | '';
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  salutation: 'Frau' | 'Herr' | '';
  parentFirst: string;
  parentLast: string;
  street: string;
  houseNo: string;
  zip: string;
  city: string;
  phone: string;
  phone2: string;
  email: string;
  voucher: string;
  source: string;
  accept: boolean;
  level: 'U8' | 'U10' | 'U12' | 'U14' | 'U16' | 'U18';
  date: string; // Wunschtermin (nur noch bei Weekly)
  message: string;
};

const initialForm: FormState = {
  offerId: '',
  childFirst: '',
  childLast: '',
  childGender: '',
  birthDay: '',
  birthMonth: '',
  birthYear: '',
  salutation: '',
  parentFirst: '',
  parentLast: '',
  street: '',
  houseNo: '',
  zip: '',
  city: '',
  phone: '',
  phone2: '',
  email: '',
  voucher: '',
  source: '',
  accept: false,
  level: 'U10',
  date: '',
  message: '',
};

/* ===== Utils ===== */
const DAY_ALIASES: Record<string, string> = {
  m: 'Mo', mo: 'Mo', montag: 'Mo', monday: 'Mo', mon: 'Mo',
  di: 'Di', dienstag: 'Di', tuesday: 'Di', tue: 'Di',
  mi: 'Mi', mittwoch: 'Mi', wednesday: 'Mi', wed: 'Mi',
  do: 'Do', donnerstag: 'Do', thursday: 'Do', thu: 'Do',
  fr: 'Fr', freitag: 'Fr', friday: 'Fr', fri: 'Fr',
  sa: 'Sa', samstag: 'Sa', saturday: 'Sa', sat: 'Sa',
  so: 'So', sonntag: 'So', sunday: 'So', sun: 'So',
};
const DAY_LONG: Record<string, string> = {
  Mo: 'Montag', Di: 'Dienstag', Mi: 'Mittwoch', Do: 'Donnerstag', Fr: 'Freitag', Sa: 'Samstag', So: 'Sonntag',
};
const normDay = (v?: string) => (v ? (DAY_ALIASES[String(v).trim().toLowerCase()] || v) : '');

/* Altersberechnung */
function calcAge(y?: string, m?: string, d?: string): number | null {
  const yy = parseInt(String(y || ''), 10);
  const mm = parseInt(String(m || ''), 10);
  const dd = parseInt(String(d || ''), 10);
  if (!yy || !mm || !dd) return null;
  const birth = new Date(yy, mm - 1, dd);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - yy;
  const mdiff = today.getMonth() - (mm - 1);
  if (mdiff < 0 || (mdiff === 0 && today.getDate() < dd)) age--;
  return age;
}

/* Coach-Helper */
const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;

function extractEmail(s?: string) {
  const m = String(s || '').match(EMAIL_RE);
  return m ? m[0] : '';
}
function splitName(s?: string) {
  const t = String(s || '').trim();
  if (!t) return { first: '—', last: '' };
  const parts = t.split(/\s+/);
  return { first: parts[0], last: parts.slice(1).join(' ') };
}
function normalizeCoachSrc(src?: string){
  if (!src) return '';
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith('/api/uploads/coach/')) return src;
  if (/^\/?uploads\/coach\//i.test(src)) return src.startsWith('/') ? `/api${src}` : `/api/${src}`;
  if (/^[\w.\-]+\.(png|jpe?g|webp|gif)$/i.test(src)) return `/api/uploads/coach/${src}`;
  return src;
}
function getCoachAvatar(o?: Offer){
  const direct =
    o?.coachImage || o?.coachPhoto || o?.coachAvatar || o?.coachPic || o?.coachImg;
  return normalizeCoachSrc(direct);
}

function deriveCoach(o?: Offer) {
  const full = o?.coachName || o?.coach || [o?.coachFirst, o?.coachLast].filter(Boolean).join(' ');
  const { first, last } = splitName(full);
  const email = o?.coachEmail || o?.contactEmail || o?.email || extractEmail(o?.info) || '';
  const avatar = getCoachAvatar(o);
  return { first, last, email, avatar };
}

/* Programme, die KEIN Schnuppertraining sind (Club Programs) */
function isNonTrialProgram(o?: Offer | null) {
  const t = (o?.type || '').toLowerCase();
  const c = (o?.category || '').toLowerCase();

  const isRentACoach =
    t.startsWith('rentacoach') || c === 'rentacoach';
  const isClubProgram =
    t.startsWith('clubprogram') || c === 'clubprograms';
  const isCoachEducation =
    t.startsWith('coacheducation') || c === 'coacheducation';

  return isRentACoach || isClubProgram || isCoachEducation;
}

/* Neue Kategorisierungs-Helper */
function normCategory(o?: Offer | null) {
  return (o?.category || '').replace(/\s+/g, '').toLowerCase();
}

function isWeeklyCourse(o?: Offer | null) {
  const cat = normCategory(o);
  return cat === 'weekly' || cat === 'weeklycourses';
}

function isHolidayProgram(o?: Offer | null) {
  const cat = normCategory(o);
  // Holiday Programs: Camps + Power Training
  return cat === 'holiday' || cat === 'holidayprograms';
}

function isIndividualCourse(o?: Offer | null) {
  const cat = normCategory(o);
  return cat === 'individual' || cat === 'individualcourses';
}

/* ===== Page Component ===== */
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

  const nonTrial = useMemo(() => isNonTrialProgram(offer), [offer]);
  const isWeekly = useMemo(() => isWeeklyCourse(offer), [offer]);
  const isHoliday = useMemo(() => isHolidayProgram(offer), [offer]);
  const isIndividual = useMemo(() => isIndividualCourse(offer), [offer]);

  const showWishDate = isWeekly; // Wunschtermin nur bei Weekly Courses

  // labels
  const productName = offer?.title || offer?.type || 'Programm';
  const dayCode = normDay(offer?.days?.[0]);
  const dayLong = dayCode ? (DAY_LONG[dayCode] || dayCode) : '';
  const timeLine = offer?.timeFrom && offer?.timeTo ? `${offer.timeFrom} – ${offer.timeTo}` : '';
  const priceLine = typeof offer?.price === 'number' ? `${offer!.price.toFixed(2)}€/Monat` : '';
  const sessionLine = [dayLong ? `Anmeldung | ${dayLong}:` : 'Anmeldung', timeLine || undefined, priceLine || undefined]
    .filter(Boolean)
    .join(' ');

  // Überschrift abhängig von Kategorie
  const heading = isWeekly
    ? 'Kostenfreies Schnuppertraining anfragen'
    : isHoliday
      ? 'Anmeldung'
      : 'Anfrage senden'; // Individual + Club + Rest

  // handlers
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, type } = e.target as HTMLInputElement;
    const value = type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm((prev) => ({ ...prev, [name]: value as any }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    const isNonTrial = isNonTrialProgram(offer);
    const weekly = isWeeklyCourse(offer);

    if (!form.offerId) e.offerId = 'Offer fehlt.';
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) {
      e.email = 'Ungültige E-Mail';
    }

    // Kind + Geburtsdatum: bei allen außer Club Programs (Non-Trial)
    if (!isNonTrial) {
      const ageYears = calcAge(form.birthYear, form.birthMonth, form.birthDay);
      if (ageYears == null) {
        e.birthYear = e.birthMonth = e.birthDay = 'Bitte vollständiges Geburtsdatum wählen';
      } else if (ageYears < 5 || ageYears > 19) {
        e.birthYear = e.birthMonth = e.birthDay = 'Alter muss zwischen 5 und 19 liegen';
      }

      if (!form.childFirst.trim()) e.childFirst = 'Pflichtfeld';
      if (!form.childLast.trim()) e.childLast = 'Pflichtfeld';
    }

    // Wunschtermin nur bei Weekly-Kursen prüfen
    if (weekly) {
      if (!form.date) e.date = 'Bitte Datum wählen';
      else if (today && form.date < today) e.date = 'Datum darf nicht in der Vergangenheit liegen';
    }

    if (!form.accept) e.accept = 'Bitte AGB/Widerruf bestätigen';

    return e;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();

    const isNonTrial = isNonTrialProgram(offer);
    const weekly = isWeeklyCourse(offer);
    const holiday = isHolidayProgram(offer);
    const individual = isIndividualCourse(offer);

    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    // Alter berechnen oder Default setzen
    const ageYears = isNonTrial
      ? 18 // Default-Alter für RentACoach / ClubProgram / CoachEducation
      : calcAge(form.birthYear, form.birthMonth, form.birthDay);

    const birth = [form.birthDay, form.birthMonth, form.birthYear]
      .filter(Boolean)
      .join('.');

    // Namen: bei den drei Non-Trial-Programmen Elternnamen verwenden
    const firstName = isNonTrial
      ? (form.parentFirst || form.childFirst || 'Interessent')
      : form.childFirst;

    const lastName = isNonTrial
      ? (form.parentLast || form.childLast || '')
      : form.childLast;

    // Datum:
    // - Weekly: echtes Wunschdatum
    // - Holiday + Individual + Club Programs: automatisch heute
    const sendAutoDate = !weekly; // alles außer Weekly
    const dateToSend = sendAutoDate
      ? (today || null)
      : (form.date || null);

  

      const extraHeader = weekly
      ? 'Anmeldung schnuppertraining'
      : holiday
        ? 'Anmeldung'
        : 'Anfrage';

    const extra =
      `${extraHeader}\n` +
      `Programm: ${productName}\n` +
      `Kind: ${form.childFirst} ${form.childLast} (${form.childGender || '-'}), Geburtstag: ${birth || '-'}\n` +
      `Kontakt: ${form.salutation || ''} ${form.parentFirst} ${form.parentLast}\n` +
      `Adresse: ${form.street} ${form.houseNo}, ${form.zip} ${form.city}\n` +
      `Telefon: ${form.phone}${form.phone2 ? ' / ' + form.phone2 : ''}\n` +
      `Gutschein: ${form.voucher || '-'}\n` +
      `Quelle: ${form.source || '-'}`;



    try {
      setStatus('sending');
      const res = await fetch(`/api/public/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerId: form.offerId,
          firstName,
          lastName,
          email: form.email,
          age: ageYears,
          date: dateToSend,
          level: form.level,
          message: [form.message, extra].filter(Boolean).join('\n\n'),
        }),
      });

      let payload: any = null;
      try { payload = await res.clone().json(); } catch {}

      if (!res.ok) {
        if (payload?.errors) setErrors((prev) => ({ ...prev, ...payload.errors }));
        setStatus('error');
        return;
      }

      setStatus('success');
      setForm((prev) => ({ ...initialForm, offerId: prev.offerId }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setStatus('error');
    }
  };

  // options DOB
  const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const DAY_OPTS = range(1, 31).map((n) => String(n).padStart(2, '0'));
  const MONTH_OPTS = range(1, 12).map((n) => String(n).padStart(2, '0'));
  const YEAR_OPTS = range(1980, 2025).reverse().map(String);

  const coach = deriveCoach(offer || undefined);

  const submitLabel = status === 'sending'
    ? 'Senden…'
    : (isHoliday ? 'Kostenpflichtig Buchen' : 'Anfragen');

  return (
    <>
      {/* Body class für Embed-Modus */}
      <Script
        id="embed-mode-class"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
(function(d){
  try{
    var isEmbed = location.search.indexOf('embed=1') > -1;
    if(!isEmbed) return;
    function apply(){ d.body && d.body.classList.add('embed-mode'); }
    if(d.body) apply(); else d.addEventListener('DOMContentLoaded', apply);
  }catch(e){}
})(document);
`,
        }}
      />

      <section className={`book-embed ${isEmbed ? 'is-embed' : ''}`}>
        <div className="book-grid book-grid--single">
          <div className="book-main">
            <form className="book-form" onSubmit={onSubmit} noValidate>
              {/* ===== Sticky Header (GRAU) ===== */}
              <div className="book-sticky">
                <div className="book-sub">
                  <div className="book-sub__left">
                    {/* Zurück-Button (sendet Message an parent) */}
                    <button
                      type="button"
                      className="book-back"
                      onClick={() => window.parent?.postMessage({ type: 'KS_BOOKING_BACK' }, '*')}
                      aria-label="Zurück"
                      title="Zurück"
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                        <path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>

                    <div className="book-sub__titles">
                      <h2 className="book-h1">
                        {heading}
                      </h2>
                      <div className="book-product">{productName}</div>
                      <div className="book-meta">{sessionLine}</div>
                    </div>
                  </div>

                  {/* Wunschtermin nur bei Weekly-Kursen */}
                  {showWishDate && (
                    <div className="book-sub__right">
                      <label htmlFor="wish-date">Wunschtermin*</label>
                      <input
                        id="wish-date"
                        type="date"
                        name="date"
                        min={today || undefined}
                        value={form.date}
                        onChange={onChange}
                        required
                      />
                      {errors.date && <span className="error error--small">{errors.date}</span>}
                    </div>
                  )}
                </div>
              </div>

              <input type="hidden" name="offerId" value={form.offerId} />

              {/* Ansprechpartner – Coach-Block (WEISS) */}
              {(coach.first || coach.last || coach.avatar || offer?.info) && (
                <div className="book-contact card">
                  <h3>Ansprechpartner</h3>
                  <div className="contact-coach">
                    {coach.avatar ? (
                      <img className="contact-coach__avatar" src={coach.avatar} alt={`${coach.first} ${coach.last}`.trim()} />
                    ) : null}
                    <div className="contact-coach__stack">
                      <div className="contact-coach__name">
                        <span className="contact-coach__first">{coach.first}</span>
                        {coach.last ? <span className="contact-coach__last">{coach.last}</span> : null}
                      </div>
                      {coach.email ? (
                        <a className="contact-coach__mail" href={`mailto:${coach.email}`}>{coach.email}</a>
                      ) : (
                        <span className="contact-coach__mail contact-coach__mail--empty">—</span>
                      )}
                    </div>
                  </div>
                  {offer?.info ? <p className="muted" style={{ marginTop: 8 }}>{offer.info}</p> : null}
                </div>
              )}

              {/* 1. Angaben zum Kind (WEISS) – nur bei normalen Kursen (nicht Club Programs) */}
              {!nonTrial && (
                <fieldset className="card">
                  <legend>1. Angaben zum Kind</legend>

                  <div className="field-row">
                    <label className="radio">
                      <input
                        type="radio"
                        name="childGender"
                        value="weiblich"
                        checked={form.childGender === 'weiblich'}
                        onChange={onChange}
                      />
                      weiblich
                    </label>
                    <label className="radio">
                      <input
                        type="radio"
                        name="childGender"
                        value="männlich"
                        checked={form.childGender === 'männlich'}
                        onChange={onChange}
                      />
                      männlich
                    </label>
                  </div>

                  <div className="field-grid">
                    <div className="field">
                      <label>Geburtstag</label>
                      <div className="dob">
                        <select name="birthDay" value={form.birthDay} onChange={onChange}>
                          <option value="">TT</option>
                          {DAY_OPTS.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>

                        <select name="birthMonth" value={form.birthMonth} onChange={onChange}>
                          <option value="">MM</option>
                          {MONTH_OPTS.map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>

                        <select name="birthYear" value={form.birthYear} onChange={onChange}>
                          <option value="">JJJJ</option>
                          {YEAR_OPTS.map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                      {(errors.birthDay || errors.birthMonth || errors.birthYear) && (
                        <span className="error">Bitte gültiges Geburtsdatum wählen</span>
                      )}
                    </div>

                    <div className="field">
                      <label>Vorname (Kind)*</label>
                      <input name="childFirst" value={form.childFirst} onChange={onChange} />
                      {errors.childFirst && <span className="error">{errors.childFirst}</span>}
                    </div>

                    <div className="field">
                      <label>Nachname (Kind)*</label>
                      <input name="childLast" value={form.childLast} onChange={onChange} />
                      {errors.childLast && <span className="error">{errors.childLast}</span>}
                    </div>
                  </div>
                </fieldset>
              )}

              {/* 2. Rechnung & Kontakt (GRAU) */}
              <fieldset className="card card--muted">
                <legend>2. Rechnung & Kontakt</legend>

                <div className="field-row">
                  <label className="radio">
                    <input
                      type="radio"
                      name="salutation"
                      value="Frau"
                      checked={form.salutation === 'Frau'}
                      onChange={onChange}
                    />
                    Frau
                  </label>
                  <label className="radio">
                    <input
                      type="radio"
                      name="salutation"
                      value="Herr"
                      checked={form.salutation === 'Herr'}
                      onChange={onChange}
                    />
                    Herr
                  </label>
                </div>

                <div className="field-grid">
                  <div className="field">
                    <label>Ihr Vorname</label>
                    <input name="parentFirst" value={form.parentFirst} onChange={onChange} />
                  </div>
                  <div className="field">
                    <label>Ihr Nachname</label>
                    <input name="parentLast" value={form.parentLast} onChange={onChange} />
                  </div>
                  <div className="field">
                    <label>Straße</label>
                    <input name="street" value={form.street} onChange={onChange} />
                  </div>
                  <div className="field">
                    <label>Hausnr.</label>
                    <input name="houseNo" value={form.houseNo} onChange={onChange} />
                  </div>
                  <div className="field">
                    <label>PLZ</label>
                    <input name="zip" value={form.zip} onChange={onChange} />
                  </div>
                  <div className="field">
                    <label>Ort</label>
                    <input name="city" value={form.city} onChange={onChange} />
                  </div>
                  <div className="field">
                    <label>Telefon</label>
                    <input name="phone" value={form.phone} onChange={onChange} />
                  </div>
                  <div className="field">
                    <label>Telefon 2</label>
                    <input name="phone2" value={form.phone2} onChange={onChange} />
                  </div>
                  <div className="field">
                    <label>E-Mail*</label>
                    <input name="email" type="email" value={form.email} onChange={onChange} />
                    {errors.email && <span className="error">{errors.email}</span>}
                  </div>
                </div>

                <div className="field-grid">
                  <div className="field">
                    <label>Gutschein / Firmencode</label>
                    <input name="voucher" value={form.voucher} onChange={onChange} />
                  </div>
                  <div className="field">
                    <label>Wie sind Sie auf uns aufmerksam geworden?</label>
                    <select name="source" value={form.source} onChange={onChange}>
                      <option value="">Bitte wählen</option>
                      <option>Google</option>
                      <option>Social Media</option>
                      <option>Freunde / Familie</option>
                      <option>Plakat / Flyer</option>
                      <option>Sonstiges</option>
                    </select>
                  </div>
                </div>

                <div className="field-row">
                  <label className="checkbox">
                    <input type="checkbox" name="accept" checked={form.accept} onChange={onChange} />
                    <span>Hiermit nehme ich die AGB und das Widerrufsrecht zur Kenntnis</span>
                  </label>
                  {errors.accept && <span className="error">{errors.accept}</span>}
                </div>
              </fieldset>

              {/* Button */}
              <div className="book-actions">
                <button className="btn" disabled={status === 'sending' || !!offerError || !offer}>
                  {submitLabel}
                </button>
                {status === 'success' && <span className="ok">Anfrage gesendet!</span>}
                {status === 'error' && <span className="error">Etwas ist schiefgelaufen.</span>}
                {errors.offerId && <span className="error">{errors.offerId}</span>}
              </div>

              {!offerLoading && offerError && (
                <p className="error" style={{ marginTop: 12 }}>{offerError}</p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* ===== Minimal-Styles (scoped) ===== */}
      <style jsx global>{`
        /* Gesamt-Dialog-Hintergrund: WEISS */
        .book-embed.is-embed { background: #fff; }

        .book-grid--single { max-width: 720px; margin: 0 auto; padding: 12px; }
        .book-main { position: relative; }

        /* Sticky Header: GRAU */
        .book-sticky {
          position: sticky;
          top: 0;
          background: #f8fafc;
          z-index: 5;
          padding: 12px 0 10px;
          border-bottom: 1px solid #e5e7eb;
        }
        .book-sub {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 12px;
          align-items: end;
        }
        .book-sub__left { display:flex; gap:10px; align-items:flex-start; }
        .book-sub__titles { display:grid; gap:4px; }
        .book-back{
          position:relative;
          top:0;
          left:0;
          display:inline-flex; align-items:center; justify-content:center;
          width:36px; height:36px; border-radius:999px;
          border:1px solid #e5e7eb; background:#fff; cursor:pointer;
        }
        .book-back:hover{ background:#fafafa; }

        .book-sub__right label {
          display: block;
          font-size: 12px;
          color: #475569;
          margin-bottom: 4px;
        }
        .book-sub__right input[type="date"] {
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 8px 10px;
          min-width: 190px;
          background: #fff;
        }

        .book-h1 { margin: 0 0 4px; font-size: 20px; font-weight: 800; }
        .book-product { font-weight: 700; }
        .book-meta { color: #475569; font-size: 14px; }
        .error--small { display: block; font-size: 12px; margin-top: 4px; }

        /* Karten/Blöcke */
        .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; margin: 12px 0; background: #fff; }
        fieldset.card { border: 1px solid #e5e7eb; }
        fieldset.card legend { padding: 0 6px; font-weight: 700; }
        /* GRAU nur bei Rechnung & Kontakt */
        .card--muted { background: #f8fafc; }

        .field-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px 14px;
        }
        .field-row { display: flex; flex-wrap: wrap; gap: 10px 16px; align-items: center; }
        .field { display: grid; gap: 6px; }
        .field input, .field select, .field textarea {
          border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px 12px; background: #fff;
        }
        .dob { display: grid; grid-template-columns: 80px 80px 1fr; gap: 8px; }
        .radio, .checkbox { display: flex; align-items: center; gap: 8px; }
        .muted { color: #64748b; }

        .book-actions { display: flex; align-items: center; gap: 12px; margin-top: 12px; }
        .btn.btn-primary {
          background: #0ea5e9; color: #fff; border: none; border-radius: 10px; padding: 10px 16px; font-weight: 700;
          cursor: pointer; transition: transform .08s ease, box-shadow .12s ease, background-color .12s ease;
        }
        .btn.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(14,165,233,.25); background: #0c96d2; }

        .error { color: #b91c1c; font-size: 13px; }
        .ok { color: #065f46; font-weight: 600; }

        /* Ansprechpartner (Coach) – Bild, Name, Mail in einer Zeile */
        .contact-coach{ display:flex; align-items:center; gap:12px; }
        .contact-coach__avatar{
          width:50px; height:50px; border-radius:999px; object-fit:cover;
          background:#f1f5f9; border:1px solid #eaeaea;
        }
        .contact-coach__stack{ display:grid; gap:2px; }
        .contact-coach__name{ display:flex; gap:8px; line-height:1.05; }
        .contact-coach__first{ font-weight:700; }
        .contact-coach__last{ color:#475569; font-size:13px; }
        .contact-coach__mail{ color:#0ea5e9; text-decoration:none; font-size:14px; }
        .contact-coach__mail:hover{ text-decoration:underline; }
        .contact-coach__mail--empty{ color:#94a3b8; }

        @media (max-width: 560px) {
          .book-sub { grid-template-columns: 1fr; }
          .field-grid { grid-template-columns: 1fr; }
          .dob { grid-template-columns: 1fr 1fr 1fr; }
        }
      `}</style>
    </>
  );
}












