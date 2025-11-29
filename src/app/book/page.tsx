'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';

/* ===== Types ===== */
type Offer = {
  _id: string;
  title?: string;
  type?: string;
  sub_type?: string;
  location?: string;
  price?: number;
  days?: string[];
  timeFrom?: string;
  timeTo?: string;
  ageFrom?: number;
  ageTo?: number;
  info?: string;
  category?: string;

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
  email?: string;
  contactEmail?: string;

  holidayWeekLabel?: string;
  dateFrom?: string;
  dateTo?: string;
};

type Gender = 'weiblich' | 'männlich' | '';

type FormState = {
  offerId: string;
  childFirst: string;
  childLast: string;
  childGender: Gender;
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
  date: string;
  message: string;

  // Camp-spezifisch Hauptkind
  tshirtSize: string;
  goalkeeper: 'yes' | 'no' | '';

  // Geschwister
  siblingEnabled: boolean;
  siblingFirst: string;
  siblingLast: string;
  siblingGender: Gender;
  siblingBirthDay: string;
  siblingBirthMonth: string;
  siblingBirthYear: string;
  siblingTshirtSize: string;
  siblingGoalkeeper: 'yes' | 'no' | '';
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

  tshirtSize: '',
  goalkeeper: '',
  siblingEnabled: false,
  siblingFirst: '',
  siblingLast: '',
  siblingGender: '',
  siblingBirthDay: '',
  siblingBirthMonth: '',
  siblingBirthYear: '',
  siblingTshirtSize: '',
  siblingGoalkeeper: '',
};

/* ===== Utils ===== */
const DAY_ALIASES: Record<string, string> = {
  m: 'Mo',
  mo: 'Mo',
  montag: 'Mo',
  monday: 'Mo',
  mon: 'Mo',
  di: 'Di',
  dienstag: 'Di',
  tuesday: 'Di',
  tue: 'Di',
  mi: 'Mi',
  mittwoch: 'Mi',
  wednesday: 'Mi',
  wed: 'Mi',
  do: 'Do',
  donnerstag: 'Do',
  thursday: 'Do',
  thu: 'Do',
  fr: 'Fr',
  freitag: 'Fr',
  friday: 'Fr',
  fri: 'Fr',
  sa: 'Sa',
  samstag: 'Sa',
  saturday: 'Sa',
  sat: 'Sa',
  so: 'So',
  sonntag: 'So',
  sunday: 'So',
};
const DAY_LONG: Record<string, string> = {
  Mo: 'Montag',
  Di: 'Dienstag',
  Mi: 'Mittwoch',
  Do: 'Donnerstag',
  Fr: 'Freitag',
  Sa: 'Samstag',
  So: 'Sonntag',
};

const normDay = (v?: string) =>
  v ? DAY_ALIASES[String(v).trim().toLowerCase()] || v : '';

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;

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

/* Datum-Helper */
function parseISODate(v?: string) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}
function formatDE(d: Date) {
  return d.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
function buildRangeText(
  offerFrom?: string,
  offerTo?: string,
  urlFrom?: string,
  urlTo?: string,
) {
  const from = parseISODate(offerFrom || urlFrom || '');
  const to = parseISODate(offerTo || urlTo || '');
  if (!from && !to) return '';
  if (from && to) return `${formatDE(from)} – ${formatDE(to)}`;
  if (from) return formatDE(from);
  return formatDE(to!);
}

/* Coach-Helper */
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
function normalizeCoachSrc(src?: string) {
  if (!src) return '';
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith('/api/uploads/coach/')) return src;
  if (/^\/?uploads\/coach\//i.test(src))
    return src.startsWith('/') ? `/api${src}` : `/api/${src}`;
  if (/^[\w.\-]+\.(png|jpe?g|webp|gif)$/i.test(src))
    return `/api/uploads/coach/${src}`;
  return src;
}
function getCoachAvatar(o?: Offer) {
  const direct =
    o?.coachImage ||
    o?.coachPhoto ||
    o?.coachAvatar ||
    o?.coachPic ||
    o?.coachImg;
  return normalizeCoachSrc(direct);
}
function deriveCoach(o?: Offer) {
  const full =
    o?.coachName ||
    o?.coach ||
    [o?.coachFirst, o?.coachLast].filter(Boolean).join(' ');
  const { first, last } = splitName(full);
  const email =
    o?.coachEmail ||
    o?.contactEmail ||
    o?.email ||
    extractEmail(o?.info) ||
    '';
  const avatar = getCoachAvatar(o);
  return { first, last, email, avatar };
}

/* Kategorie-Helper */
function normCategory(o?: Offer | null) {
  return (o?.category || '').replace(/\s+/g, '').toLowerCase();
}
function isWeeklyCourse(o?: Offer | null) {
  const cat = normCategory(o);
  return cat === 'weekly' || cat === 'weeklycourses';
}
function isHolidayProgram(o?: Offer | null) {
  const cat = normCategory(o);
  return cat === 'holiday' || cat === 'holidayprograms';
}
function isIndividualCourse(o?: Offer | null) {
  const cat = normCategory(o);
  return cat === 'individual' || cat === 'individualcourses';
}
function isNonTrialProgram(o?: Offer | null) {
  const t = (o?.type || '').toLowerCase();
  const c = (o?.category || '').toLowerCase();
  const isRentACoach = t.startsWith('rentacoach') || c === 'rentacoach';
  const isClubProgram = t.startsWith('clubprogram') || c === 'clubprograms';
  const isCoachEducation =
    t.startsWith('coacheducation') || c === 'coacheducation';
  return isRentACoach || isClubProgram || isCoachEducation;
}
function isPowertraining(o?: Offer | null) {
  const cat = normCategory(o);
  const st = (o?.sub_type || '').toLowerCase();
  return cat === 'holiday' && st === 'powertraining';
}

/* ===== Meta-Typ für Powertraining (aus ptmeta-Param) ===== */
type PtMetaItem = {
  id?: string;
  day?: string;
  dateFrom?: string;
  dateTo?: string;
  timeFrom?: string;
  timeTo?: string;
  price?: number;
};

/* T-Shirt Optionen */
const TSHIRT_OPTIONS: string[] = [
  'Spielertrikot XXS (116)',
  'Spielertrikot XS (128)',
  'Spielertrikot S (140)',
  'Spielertrikot M (152)',
  'Spielertrikot L (164)',
  'Spielertrikot XL (174)',
  'Herren S',
  'Torwarttrikot XS (128)',
  'Torwarttrikot M (152)',
  'Torwarttrikot L (164)',
  'Torwarttrikot XL (174)',
];

/* ===== Page Component ===== */
export default function BookPage() {
  const params = useSearchParams();

  const [form, setForm] = useState<FormState>(initialForm);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [offerLoading, setOfferLoading] = useState(true);
  const [offerError, setOfferError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>(
    'idle',
  );

  const isEmbed = useMemo(() => params.get('embed') === '1', [params]);

  // Zusatzinfos aus dem 1. Dialog
  const selectedDaysParam = params.get('days') || '';
  const holidayLabelParam = params.get('holidayLabel') || '';
  const holidayFromParam = params.get('holidayFrom') || '';
  const holidayToParam = params.get('holidayTo') || '';
  const ptMetaRaw = params.get('ptmeta') || '';

  const selectedDays = useMemo(
    () =>
      selectedDaysParam
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    [selectedDaysParam],
  );

  const ptMeta: PtMetaItem[] = useMemo(() => {
    if (!ptMetaRaw) return [];
    try {
      const parsed = JSON.parse(ptMetaRaw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((x: any) => ({
        id: x.id ? String(x.id) : undefined,
        day: typeof x.day === 'string' ? x.day : '',
        dateFrom: typeof x.dateFrom === 'string' ? x.dateFrom : '',
        dateTo: typeof x.dateTo === 'string' ? x.dateTo : '',
        timeFrom: typeof x.timeFrom === 'string' ? x.timeFrom : '',
        timeTo: typeof x.timeTo === 'string' ? x.timeTo : '',
        price:
          typeof x.price === 'number'
            ? x.price
            : typeof x.price === 'string'
            ? Number(x.price)
            : undefined,
      }));
    } catch {
      return [];
    }
  }, [ptMetaRaw]);

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

    return () => {
      cancelled = true;
    };
  }, [params]);

  const nonTrial = useMemo(() => isNonTrialProgram(offer), [offer]);
  const weekly = useMemo(() => isWeeklyCourse(offer), [offer]);
  const holiday = useMemo(() => isHolidayProgram(offer), [offer]);
  const powertraining = useMemo(() => isPowertraining(offer), [offer]);

  const isCampBooking = useMemo(
    () => holiday && !powertraining,
    [holiday, powertraining],
  );

  const showWishDate = weekly;

  const productName = offer?.title || offer?.type || 'Programm';

  const selectedDayNames = useMemo(
    () =>
      selectedDays.map((d) => {
        const code = normDay(d);
        const short = code || d;
        const long = DAY_LONG[short] || short;
        return long + 's';
      }),
    [selectedDays],
  );

  const holidayTitle = useMemo(() => {
    return (offer?.holidayWeekLabel || holidayLabelParam || '').trim();
  }, [offer, holidayLabelParam]);

  const holidayRangeStr = useMemo(
    () =>
      buildRangeText(
        offer?.dateFrom,
        offer?.dateTo,
        holidayFromParam,
        holidayToParam,
      ),
    [offer, holidayFromParam, holidayToParam],
  );

  // Header-Zeilen unter der Überschrift
  const sessionLines: string[] = useMemo(() => {
    const lines: string[] = [];

    const price =
      typeof offer?.price === 'number'
        ? `${offer.price.toFixed(2)}€`
        : '';
    const timeLineOffer =
      offer?.timeFrom && offer?.timeTo
        ? `${offer.timeFrom} – ${offer.timeTo}`
        : '';

    if (holiday) {
      const range = holidayRangeStr ? `(${holidayRangeStr})` : '';

      const isCampLikeHoliday = holiday && !powertraining;

      let holidayDays: string[] = [];
      if (!isCampLikeHoliday) {
        if (selectedDayNames.length) {
          holidayDays = selectedDayNames;
        } else if (offer?.days?.[0]) {
          const code = normDay(offer.days[0]);
          const long = code ? DAY_LONG[code] || code : '';
          if (long) holidayDays = [long + 's'];
        }
      }

      if (powertraining && ptMeta.length) {
        ptMeta.forEach((m) => {
          const code = normDay(m.day);
          const long = code ? DAY_LONG[code] || code : '';
          const dayLabel = long ? `${long}s` : '';

          const rangeStr =
            m.dateFrom || m.dateTo
              ? buildRangeText(m.dateFrom, m.dateTo, '', '')
              : holidayRangeStr;
          const rangeInline = rangeStr ? `(${rangeStr})` : '';

          const timeLine =
            m.timeFrom && m.timeTo
              ? `${m.timeFrom} – ${m.timeTo}`
              : timeLineOffer;

          const priceLine =
            typeof m.price === 'number' && Number.isFinite(m.price)
              ? `${m.price.toFixed(2)}€`
              : price;

          const parts: string[] = [];
          if (rangeInline) parts.push(rangeInline);
          if (dayLabel) parts.push(dayLabel);
          if (timeLine) parts.push(timeLine);
          if (priceLine) parts.push(priceLine);
          if (parts.length) {
            lines.push(`Anmeldung | ${parts.join(' · ')}`);
          }
        });
        return lines;
      }

      const parts: string[] = [];
      if (range) parts.push(range);
      if (holidayDays.length) parts.push(holidayDays.join(', '));
      if (timeLineOffer) parts.push(timeLineOffer);
      if (price) parts.push(price);
      if (parts.length) {
        lines.push(`Anmeldung | ${parts.join(' · ')}`);
      }
      return lines;
    }

    const dayCode = normDay(offer?.days?.[0]);
    const dayLong = dayCode ? DAY_LONG[dayCode] || dayCode : '';
    const label = dayLong ? `Anmeldung | ${dayLong}:` : 'Anmeldung';
    const parts: string[] = [];
    if (timeLineOffer) parts.push(timeLineOffer);
    if (price) parts.push(price ? `${price}/Monat` : '');
    lines.push([label, ...parts.filter(Boolean)].join(' · '));
    return lines;
  }, [
    offer,
    holiday,
    powertraining,
    holidayRangeStr,
    selectedDayNames,
    ptMeta,
  ]);

  const heading = weekly
    ? 'Kostenfreies Schnuppertraining anfragen'
    : holiday
    ? 'Anmeldung'
    : 'Anfrage senden';

  // --- Form-Handling -------------------------------------------------------
  const onChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const { name, type } = e.target as HTMLInputElement;
    const value =
      type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
    setForm((prev) => ({ ...prev, [name]: value as any }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    const nonTrialLocal = isNonTrialProgram(offer);
    const weeklyLocal = isWeeklyCourse(offer);
    const campLocal = isHolidayProgram(offer) && !isPowertraining(offer);

    if (!form.offerId) e.offerId = 'Offer fehlt.';
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) {
      e.email = 'Ungültige E-Mail';
    }

    if (!nonTrialLocal) {
      const ageYears = calcAge(
        form.birthYear,
        form.birthMonth,
        form.birthDay,
      );
      if (ageYears == null) {
        e.birthYear = e.birthMonth = e.birthDay =
          'Bitte vollständiges Geburtsdatum wählen';
      } else if (ageYears < 5 || ageYears > 19) {
        e.birthYear = e.birthMonth = e.birthDay =
          'Alter muss zwischen 5 und 19 liegen';
      }

      if (!form.childFirst.trim()) e.childFirst = 'Pflichtfeld';
      if (!form.childLast.trim()) e.childLast = 'Pflichtfeld';
    }

    if (weeklyLocal) {
      if (!form.date) e.date = 'Bitte Datum wählen';
      else if (today && form.date < today)
        e.date = 'Datum darf nicht in der Vergangenheit liegen';
    }

    if (!form.accept)
      e.accept = 'Bitte AGB/Widerruf bestätigen';

    if (campLocal) {
      if (!form.tshirtSize) {
        e.tshirtSize = 'Bitte T-Shirt-Größe wählen';
      }
      if (form.siblingEnabled) {
        if (!form.siblingFirst.trim()) {
          e.siblingFirst = 'Pflichtfeld';
        }
        if (!form.siblingLast.trim()) {
          e.siblingLast = 'Pflichtfeld';
        }
        if (!form.siblingTshirtSize) {
          e.siblingTshirtSize = 'Bitte T-Shirt-Größe wählen';
        }
      }
    }

    return e;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();

    const nonTrialLocal = isNonTrialProgram(offer);
    const weeklyLocal = isWeeklyCourse(offer);
    const holidayLocal = isHolidayProgram(offer);
    const powertrainingLocal = isPowertraining(offer);

    const campLocal = holidayLocal && !powertrainingLocal;

    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    const ageYears = nonTrialLocal
      ? 18
      : calcAge(form.birthYear, form.birthMonth, form.birthDay);

    const birth = [form.birthDay, form.birthMonth, form.birthYear]
      .filter(Boolean)
      .join('.');

    const siblingBirth = [
      form.siblingBirthDay,
      form.siblingBirthMonth,
      form.siblingBirthYear,
    ]
      .filter(Boolean)
      .join('.');

    const firstName = nonTrialLocal
      ? form.parentFirst || form.childFirst || 'Interessent'
      : form.childFirst;

    const lastName = nonTrialLocal
      ? form.parentLast || form.childLast || ''
      : form.childLast;

    const sendAutoDate = !weeklyLocal;
    const dateToSend = sendAutoDate
      ? today || null
      : form.date || null;

    const extraHeader = weeklyLocal
      ? 'Anmeldung Schnuppertraining'
      : holidayLocal
      ? 'Anmeldung Ferienprogramm'
      : 'Anfrage';

    const holidayInfo = holidayLocal
      ? [
          `Ferien: ${holidayTitle || '-'}`,
          holidayRangeStr
            ? `Zeitraum: ${holidayRangeStr}`
            : null,
          selectedDayNames.length
            ? `Ausgewählte Tage: ${selectedDayNames.join(', ')}`
            : null,
        ]
          .filter(Boolean)
          .join('\n')
      : '';

    const siblingDiscount =
      campLocal && form.siblingEnabled ? 14 : 0;

    const goalkeeperCount =
      (form.goalkeeper === 'yes' ? 1 : 0) +
      (campLocal &&
      form.siblingEnabled &&
      form.siblingGoalkeeper === 'yes'
        ? 1
        : 0);

    const campOptionsInfo = campLocal
      ? [
          `T-Shirt-Größe (Kind): ${form.tshirtSize || '-'}`,
          `Torwartschule (Kind): ${
            form.goalkeeper === 'yes' ? 'Ja (+40€)' : 'Nein'
          }`,
          form.siblingEnabled
            ? [
                `Geschwisterkind: ${form.siblingFirst} ${form.siblingLast}`,
                `Geschlecht: ${form.siblingGender || '-'}`,
                `Geburtstag: ${siblingBirth || '-'}`,
                `T-Shirt: ${form.siblingTshirtSize || '-'}`,
                `Torwartschule: ${
                  form.siblingGoalkeeper === 'yes'
                    ? 'Ja (+40€)'
                    : 'Nein'
                } (Geschwisterrabatt: 14€)`,
              ].join('\n')
            : null,
        ]
          .filter(Boolean)
          .join('\n')
      : '';

    const extra =
      `${extraHeader}\n` +
      `Programm: ${productName}\n` +
      (holidayInfo ? holidayInfo + '\n' : '') +
      (campOptionsInfo ? `Camp-Optionen:\n${campOptionsInfo}\n` : '') +
      `Kind: ${form.childFirst} ${form.childLast} (${form.childGender || '-'}), Geburtstag: ${birth || '-'}\n` +
      `Kontakt: ${form.salutation || ''} ${form.parentFirst} ${form.parentLast}\n` +
      `Adresse: ${form.street} ${form.houseNo}, ${form.zip} ${form.city}\n` +
      `Telefon: ${form.phone}${
        form.phone2 ? ' / ' + form.phone2 : ''
      }\n` +
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
          message: [form.message, extra]
            .filter(Boolean)
            .join('\n\n'),

          // ---- alles hier landet im Backend in body.meta ----
          isCampBooking: campLocal,
          tshirtSize: form.tshirtSize || null,
          goalkeeper: form.goalkeeper,
          siblingEnabled: form.siblingEnabled,
          siblingFirst: form.siblingFirst || null,
          siblingLast: form.siblingLast || null,
          siblingGender: form.siblingGender || null,
          siblingBirthDay: form.siblingBirthDay || null,
          siblingBirthMonth: form.siblingBirthMonth || null,
          siblingBirthYear: form.siblingBirthYear || null,
          siblingTshirtSize: form.siblingTshirtSize || null,
          siblingGoalkeeper: form.siblingGoalkeeper,
          siblingDiscount,
          goalkeeperCount,
        }),
      });

      let payload: any = null;
      try {
        payload = await res.clone().json();
      } catch {}

      if (!res.ok) {
        if (payload?.errors)
          setErrors((prev) => ({
            ...prev,
            ...payload.errors,
          }));
        setStatus('error');
        return;
      }

      setStatus('success');
      setForm((prev) => ({
        ...initialForm,
        offerId: prev.offerId,
      }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setStatus('error');
    }
  };

  // options DOB
  const range = (a: number, b: number) =>
    Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const DAY_OPTS = range(1, 31).map((n) =>
    String(n).padStart(2, '0'),
  );
  const MONTH_OPTS = range(1, 12).map((n) =>
    String(n).padStart(2, '0'),
  );
  const YEAR_OPTS = range(1980, 2025)
    .reverse()
    .map(String);

  const coach = deriveCoach(offer || undefined);

  const submitLabel =
    status === 'sending'
      ? 'Senden…'
      : holiday
      ? 'Kostenpflichtig Buchen'
      : 'Anfragen';

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

      <section
        className={`book-embed ${isEmbed ? 'is-embed' : ''}`}
      >
        <div className="book-grid book-grid--single">
          <div className="book-main">
            <form
              className="book-form"
              onSubmit={onSubmit}
              noValidate
            >
              {/* ===== Sticky Header (GRAU) ===== */}
              <div className="book-sticky">
                <div className="book-sub">
                  <div className="book-sub__left">
                    {/* Zurück-Button */}
                    <button
                      type="button"
                      className="book-back"
                      onClick={() =>
                        window.parent?.postMessage(
                          { type: 'KS_BOOKING_BACK' },
                          '*',
                        )
                      }
                      aria-label="Zurück"
                      title="Zurück"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        aria-hidden="true"
                      >
                        <path
                          d="M15 18l-6-6 6-6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>

                    <div className="book-sub__titles">
                      <h2 className="book-h1">{heading}</h2>

                      {holiday ? (
                        <>
                          {holidayTitle && (
                            <div className="book-product">
                              {holidayTitle}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="book-product">
                          {productName}
                        </div>
                      )}

                      {sessionLines.map((line, idx) => (
                        <div
                          key={idx}
                          className="book-meta"
                        >
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>

                  {showWishDate && (
                    <div className="book-sub__right">
                      <label htmlFor="wish-date">
                        Wunschtermin*
                      </label>
                      <input
                        id="wish-date"
                        type="date"
                        name="date"
                        min={today || undefined}
                        value={form.date}
                        onChange={onChange}
                        required
                      />
                      {errors.date && (
                        <span className="error error--small">
                          {errors.date}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <input
                type="hidden"
                name="offerId"
                value={form.offerId}
              />

              {(coach.first ||
                coach.last ||
                coach.avatar ||
                offer?.info) && (
                <div className="book-contact card">
                  <h3>Ansprechpartner</h3>
                  <div className="contact-coach">
                    {coach.avatar ? (
                      <img
                        className="contact-coach__avatar"
                        src={coach.avatar}
                        alt={`${coach.first} ${coach.last}`.trim()}
                      />
                    ) : null}
                    <div className="contact-coach__stack">
                      <div className="contact-coach__name">
                        <span className="contact-coach__first">
                          {coach.first}
                        </span>
                        {coach.last ? (
                          <span className="contact-coach__last">
                            {coach.last}
                          </span>
                        ) : null}
                      </div>
                      {coach.email ? (
                        <a
                          className="contact-coach__mail"
                          href={`mailto:${coach.email}`}
                        >
                          {coach.email}
                        </a>
                      ) : (
                        <span className="contact-coach__mail contact-coach__mail--empty">
                          —
                        </span>
                      )}
                    </div>
                  </div>
                  {offer?.info ? (
                    <p className="muted coach-info-text">
                      {offer.info}
                    </p>
                  ) : null}
                </div>
              )}

              {!nonTrial && (
                <fieldset className="card">
                  <legend>1. Angaben zum Kind</legend>

                  <div className="field-row">
                    <label className="radio">
                      <input
                        type="radio"
                        name="childGender"
                        value="weiblich"
                        checked={
                          form.childGender === 'weiblich'
                        }
                        onChange={onChange}
                      />
                      weiblich
                    </label>
                    <label className="radio">
                      <input
                        type="radio"
                        name="childGender"
                        value="männlich"
                        checked={
                          form.childGender === 'männlich'
                        }
                        onChange={onChange}
                      />
                      männlich
                    </label>
                  </div>

                  <div className="field-grid">
                    <div className="field">
                      <label>Geburtstag</label>
                      <div className="dob">
                        <select
                          name="birthDay"
                          value={form.birthDay}
                          onChange={onChange}
                        >
                          <option value="">TT</option>
                          {DAY_OPTS.map((d) => (
                            <option
                              key={d}
                              value={d}
                            >
                              {d}
                            </option>
                          ))}
                        </select>

                        <select
                          name="birthMonth"
                          value={form.birthMonth}
                          onChange={onChange}
                        >
                          <option value="">MM</option>
                          {MONTH_OPTS.map((m) => (
                            <option
                              key={m}
                              value={m}
                            >
                              {m}
                            </option>
                          ))}
                        </select>

                        <select
                          name="birthYear"
                          value={form.birthYear}
                          onChange={onChange}
                        >
                          <option value="">JJJJ</option>
                          {YEAR_OPTS.map((y) => (
                            <option
                              key={y}
                              value={y}
                            >
                              {y}
                            </option>
                          ))}
                        </select>
                      </div>
                      {(errors.birthDay ||
                        errors.birthMonth ||
                        errors.birthYear) && (
                        <span className="error">
                          Bitte gültiges Geburtsdatum
                          wählen
                        </span>
                      )}
                    </div>

                    <div className="field">
                      <label>Vorname (Kind)*</label>
                      <input
                        name="childFirst"
                        value={form.childFirst}
                        onChange={onChange}
                      />
                      {errors.childFirst && (
                        <span className="error">
                          {errors.childFirst}
                        </span>
                      )}
                    </div>

                    <div className="field">
                      <label>Nachname (Kind)*</label>
                      <input
                        name="childLast"
                        value={form.childLast}
                        onChange={onChange}
                      />
                      {errors.childLast && (
                        <span className="error">
                          {errors.childLast}
                        </span>
                      )}
                    </div>
                  </div>
                </fieldset>
              )}


              {/* ===== Camp-spezifische Optionen (T-Shirt, Torwartschule, Geschwister) ===== */}
              {isCampBooking && (
                <fieldset className="card camp-options">
                  <legend>Camp-Optionen</legend>

                  {/* T-Shirt-Größe Hauptkind */}
                  <div className="field">
                    <label>T-Shirt-Größe*</label>
                    <select
                      name="tshirtSize"
                      value={form.tshirtSize}
                      onChange={onChange}
                    >
                      <option value="">
                        Bitte einen Eintrag auswählen
                      </option>
                      {TSHIRT_OPTIONS.map((opt) => (
                        <option
                          key={opt}
                          value={opt}
                        >
                          {opt}
                        </option>
                      ))}
                    </select>
                    {errors.tshirtSize && (
                      <span className="error">
                        {errors.tshirtSize}
                      </span>
                    )}
                  </div>

                  {/* Torwartschule Hauptkind */}
                  <div className="field">
                    <label>Torwartschule? (+40€)*</label>
                    <div className="camp-toggle-row">
                      <button
                        type="button"
                        className={`camp-toggle-btn ${
                          form.goalkeeper === 'no'
                            ? 'is-active'
                            : ''
                        }`}
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            goalkeeper: 'no',
                          }))
                        }
                      >
                        Nein
                      </button>
                      <button
                        type="button"
                        className={`camp-toggle-btn ${
                          form.goalkeeper === 'yes'
                            ? 'is-active'
                            : ''
                        }`}
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            goalkeeper: 'yes',
                          }))
                        }
                      >
                        Ja
                      </button>
                    </div>
                  </div>

                  <hr className="camp-divider" />

                  {/* Geschwisterkind */}
                  <div className="sibling-header">
                    <h3>Geschwister dazu buchen</h3>
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        name="siblingEnabled"
                        checked={form.siblingEnabled}
                        onChange={onChange}
                      />
                      <span>Ja (14 Euro Rabatt erhalten)</span>
                    </label>
                  </div>

                  {form.siblingEnabled && (
                    <div className="sibling-fields">
                      {/* Geschlecht + Geburtstag Geschwister */}
                      <div className="field-row">
                        <label className="radio">
                          <input
                            type="radio"
                            name="siblingGender"
                            value="weiblich"
                            checked={
                              form.siblingGender === 'weiblich'
                            }
                            onChange={onChange}
                          />
                          weiblich
                        </label>
                        <label className="radio">
                          <input
                            type="radio"
                            name="siblingGender"
                            value="männlich"
                            checked={
                              form.siblingGender === 'männlich'
                            }
                            onChange={onChange}
                          />
                          männlich
                        </label>
                      </div>

                      <div className="field">
                        <label>Geburtstag</label>
                        <div className="dob">
                          <select
                            name="siblingBirthDay"
                            value={form.siblingBirthDay}
                            onChange={onChange}
                          >
                            <option value="">TT</option>
                            {DAY_OPTS.map((d) => (
                              <option
                                key={d}
                                value={d}
                              >
                                {d}
                              </option>
                            ))}
                          </select>

                          <select
                            name="siblingBirthMonth"
                            value={form.siblingBirthMonth}
                            onChange={onChange}
                          >
                            <option value="">MM</option>
                            {MONTH_OPTS.map((m) => (
                              <option
                                key={m}
                                value={m}
                              >
                                {m}
                              </option>
                            ))}
                          </select>

                          <select
                            name="siblingBirthYear"
                            value={form.siblingBirthYear}
                            onChange={onChange}
                          >
                            <option value="">JJJJ</option>
                            {YEAR_OPTS.map((y) => (
                              <option
                                key={y}
                                value={y}
                              >
                                {y}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Name Geschwister */}
                      <div className="field-grid">
                        <div className="field">
                          <label>Vorname (Kind)*</label>
                          <input
                            name="siblingFirst"
                            value={form.siblingFirst}
                            onChange={onChange}
                          />
                          {errors.siblingFirst && (
                            <span className="error">
                              {errors.siblingFirst}
                            </span>
                          )}
                        </div>
                        <div className="field">
                          <label>Nachname (Kind)*</label>
                          <input
                            name="siblingLast"
                            value={form.siblingLast}
                            onChange={onChange}
                          />
                          {errors.siblingLast && (
                            <span className="error">
                              {errors.siblingLast}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* T-Shirt + Torwartschule Geschwister */}
                      <div className="field">
                        <label>T-Shirt-Größe (Geschwister)*</label>
                        <select
                          name="siblingTshirtSize"
                          value={form.siblingTshirtSize}
                          onChange={onChange}
                        >
                          <option value="">
                            Bitte einen Eintrag auswählen
                          </option>
                          {TSHIRT_OPTIONS.map((opt) => (
                            <option
                              key={opt}
                              value={opt}
                            >
                              {opt}
                            </option>
                          ))}
                        </select>
                        {errors.siblingTshirtSize && (
                          <span className="error">
                            {errors.siblingTshirtSize}
                          </span>
                        )}
                      </div>

                      <div className="field">
                        <label>
                          Torwartschule (Geschwister)? (+40€)
                        </label>
                        <div className="camp-toggle-row">
                          <button
                            type="button"
                            className={`camp-toggle-btn ${
                              form.siblingGoalkeeper === 'no'
                                ? 'is-active'
                                : ''
                            }`}
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                siblingGoalkeeper: 'no',
                              }))
                            }
                          >
                            Nein
                          </button>
                          <button
                            type="button"
                            className={`camp-toggle-btn ${
                              form.siblingGoalkeeper === 'yes'
                                ? 'is-active'
                                : ''
                            }`}
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                siblingGoalkeeper: 'yes',
                              }))
                            }
                          >
                            Ja
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </fieldset>
              )}

              <fieldset className="card card--muted">
                <legend>2. Rechnung &amp; Kontakt</legend>

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
                    <input
                      name="parentFirst"
                      value={form.parentFirst}
                      onChange={onChange}
                    />
                  </div>
                  <div className="field">
                    <label>Ihr Nachname</label>
                    <input
                      name="parentLast"
                      value={form.parentLast}
                      onChange={onChange}
                    />
                  </div>
                  <div className="field">
                    <label>Straße</label>
                    <input
                      name="street"
                      value={form.street}
                      onChange={onChange}
                    />
                  </div>
                  <div className="field">
                    <label>Hausnr.</label>
                    <input
                      name="houseNo"
                      value={form.houseNo}
                      onChange={onChange}
                    />
                  </div>
                  <div className="field">
                    <label>PLZ</label>
                    <input
                      name="zip"
                      value={form.zip}
                      onChange={onChange}
                    />
                  </div>
                  <div className="field">
                    <label>Ort</label>
                    <input
                      name="city"
                      value={form.city}
                      onChange={onChange}
                    />
                  </div>
                  <div className="field">
                    <label>Telefon</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={onChange}
                    />
                  </div>
                  <div className="field">
                    <label>Telefon 2</label>
                    <input
                      name="phone2"
                      value={form.phone2}
                      onChange={onChange}
                    />
                  </div>
                  <div className="field">
                    <label>E-Mail*</label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={onChange}
                    />
                    {errors.email && (
                      <span className="error">
                        {errors.email}
                      </span>
                    )}
                  </div>
                </div>

                <div className="field-grid">
                  <div className="field">
                    <label>Gutschein / Firmencode</label>
                    <input
                      name="voucher"
                      value={form.voucher}
                      onChange={onChange}
                    />
                  </div>
                  <div className="field">
                    <label>
                      Wie sind Sie auf uns aufmerksam
                      geworden?
                    </label>
                    <select
                      name="source"
                      value={form.source}
                      onChange={onChange}
                    >
                      <option value="">
                        Bitte wählen
                      </option>
                      <option>Google</option>
                      <option>Social Media</option>
                      <option>Freunde / Familie</option>
                      <option>Plakat / Flyer</option>
                      <option>Sonstiges</option>
                    </select>
                  </div>
                </div>
              </fieldset>

              {/* Hinweis + AGB über dem Button */}
              {isCampBooking && (
                <p className="camp-hint">
                  Wenn ihr Kind ein Wochenkurs belegt, gibt es 14€ Rabatt.
                </p>
              )}
              <div className="field-row agb-row">
                <label className="checkbox">
                  <input
                    type="checkbox"
                    name="accept"
                    checked={form.accept}
                    onChange={onChange}
                  />
                  <span>
                    Hiermit nehme ich die AGB und das
                    Widerrufsrecht zur Kenntnis
                  </span>
                </label>
                {errors.accept && (
                  <span className="error">
                    {errors.accept}
                  </span>
                )}
              </div>

              <div className="book-actions">
                <button
                  className="btn btn-primary"
                  disabled={
                    status === 'sending' ||
                    !!offerError ||
                    !offer
                  }
                >
                  {submitLabel}
                </button>
                {status === 'success' && (
                  <span className="ok">Anfrage gesendet!</span>
                )}
                {status === 'error' && (
                  <span className="error">
                    Etwas ist schiefgelaufen.
                  </span>
                )}
                {errors.offerId && (
                  <span className="error">
                    {errors.offerId}
                  </span>
                )}
              </div>

              {!offerLoading && offerError && (
                <p className="error error--top">
                  {offerError}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>
    </>
  );
}










