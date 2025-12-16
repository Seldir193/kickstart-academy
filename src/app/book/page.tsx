
'use client';

import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';

import {
  initialForm,
  type FormState,
  type Offer,
  type PtMetaItem,
} from './bookTypes';
import {
  calcAge,
  deriveCoach,
  buildRangeText,
  isNonTrialProgram,
  isWeeklyCourse,
  isHolidayProgram,
  isPowertraining,
  normDay,
  DAY_LONG,
} from './bookUtils';

import { ChildSection } from './components/ChildSection';
import { CampOptionsSection } from './components/CampOptionsSection';
import { BillingSection } from './components/BillingSection';
import { AgbRow } from './components/AgbRow';
import { BookActions } from './components/BookActions';

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

  const isEmbed = useMemo(() => params.get('embed') === '1', [params]);

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

  // 🔹 URL-basierte Camp-Erkennung – schon da, bevor das Offer geladen ist
  const urlCamp = useMemo(
    () =>
      (holidayLabelParam !== '' ||
        holidayFromParam !== '' ||
        holidayToParam !== '') &&
      ptMetaRaw === '',
    [holidayLabelParam, holidayFromParam, holidayToParam, ptMetaRaw],
  );

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

  // Volle Formular-Höhe (scrollHeight) an WordPress melden
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isEmbed) return;

    const sendHeight = () => {
      try {
        const formEl = document.querySelector(
          '.book-form',
        ) as HTMLElement | null;

        let contentHeight = 0;

        if (formEl) {
          contentHeight = Math.max(formEl.scrollHeight, formEl.offsetHeight);
        }

        if (!contentHeight || contentHeight < 300) {
          const body = document.body;
          const html = document.documentElement;
          contentHeight = Math.max(
            body.scrollHeight,
            body.offsetHeight,
            html.clientHeight,
            html.scrollHeight,
            html.offsetHeight,
          );
        }

        const height = contentHeight + 16;

        console.log('BOOK sendHeight (form.scrollHeight):', {
          contentHeight,
          height,
        });

        window.parent?.postMessage(
          {
            type: 'KS_BOOKING_HEIGHT',
            height,
          },
          '*',
        );
      } catch (err) {
        console.warn('BOOK sendHeight error', err);
      }
    };

    requestAnimationFrame(() => {
      sendHeight();
    });

    window.addEventListener('resize', sendHeight);

    let ro: ResizeObserver | null = null;
    if ('ResizeObserver' in window) {
      const formEl = document.querySelector(
        '.book-form',
      ) as HTMLElement | null;
      if (formEl) {
        ro = new ResizeObserver(() => {
          sendHeight();
        });
        ro.observe(formEl);
      }
    }

    return () => {
      window.removeEventListener('resize', sendHeight);
      if (ro) ro.disconnect();
    };
  }, [isEmbed]);

  const nonTrial = useMemo(() => isNonTrialProgram(offer), [offer]);
  const weekly = useMemo(() => isWeeklyCourse(offer), [offer]);
  const holiday = useMemo(() => isHolidayProgram(offer), [offer]);
  const powertraining = useMemo(() => isPowertraining(offer), [offer]);

  // 🔹 Camp-Erkennung: entweder echte Offer-Infos ODER URL-basierte Heuristik
  const isCampBooking = useMemo(
    () => urlCamp || (holiday && !powertraining),
    [urlCamp, holiday, powertraining],
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

  const holidayTitle = useMemo(
    () => (offer?.holidayWeekLabel || holidayLabelParam || '').trim(),
    [offer, holidayLabelParam],
  );

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

  const sessionLines: string[] = useMemo(() => {
    const lines: string[] = [];

    const price =
      typeof offer?.price === 'number' ? `${offer.price.toFixed(2)}€` : '';
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
  }, [offer, holiday, powertraining, holidayRangeStr, selectedDayNames, ptMeta]);

  const heading = weekly
    ? 'Kostenfreies Schnuppertraining anfragen'
    : holiday
    ? 'Anmeldung'
    : 'Anfrage senden';

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

    // 🔹 Camp-Logik: Offer-Infos ODER URL-basierte Heuristik
    const campLocal =
      (isHolidayProgram(offer) && !isPowertraining(offer)) || urlCamp;

    if (!form.offerId) e.offerId = 'Offer fehlt.';
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) {
      e.email = 'Ungültige E-Mail';
    }

    if (!nonTrialLocal) {
      const ageYears = calcAge(form.birthYear, form.birthMonth, form.birthDay);
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

    if (!form.accept) e.accept = 'Bitte AGB/Widerruf bestätigen';

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

    // 🔹 auch hier: Camp-Logik inkl. URL-Heuristik
    const campLocal = (holidayLocal && !powertrainingLocal) || urlCamp;

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
    const dateToSend = sendAutoDate ? today || null : form.date || null;

    const extraHeader = weeklyLocal
      ? 'Anmeldung Schnuppertraining'
      : holidayLocal
      ? 'Anmeldung Ferienprogramm'
      : 'Anfrage';

    const holidayInfo = holidayLocal
      ? [
          `Ferien: ${holidayTitle || '-'}`,
          holidayRangeStr ? `Zeitraum: ${holidayRangeStr}` : null,
          selectedDayNames.length
            ? `Ausgewählte Tage: ${selectedDayNames.join(', ')}`
            : null,
        ]
          .filter(Boolean)
          .join('\n')
      : '';

    const siblingDiscount = campLocal && form.siblingEnabled ? 14 : 0;

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
                  form.siblingGoalkeeper === 'yes' ? 'Ja (+40€)' : 'Nein'
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

  const range = (a: number, b: number) =>
    Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const DAY_OPTS = range(1, 31).map((n) => String(n).padStart(2, '0'));
  const MONTH_OPTS = range(1, 12).map((n) => String(n).padStart(2, '0'));
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

  const handleCaretClick = (e: React.MouseEvent<HTMLElement>) => {
    const wrapper = e.currentTarget.parentElement;
    if (!wrapper) return;
    wrapper.classList.toggle('is-open');
  };

  const handleCaretBlur = (e: React.FocusEvent<HTMLElement>) => {
    const wrapper = e.currentTarget.parentElement;
    if (!wrapper) return;
    wrapper.classList.remove('is-open');
  };

  const isSubmitDisabled = status === 'sending' || !!offerError || !offer;

  return (
    <>
      <Script
        id="embed-mode-class"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
(function(d){
  try {
    var isEmbed = location.search.indexOf('embed=1') > -1;
    if (!isEmbed) return;

    function apply() {
      if (!d.body) return;
      d.body.classList.add('embed-mode');
      d.body.style.margin = '0';
      d.body.style.padding = '0';
      d.body.style.background = 'transparent';
    }

    if (d.body) apply();
    else d.addEventListener('DOMContentLoaded', apply);
  } catch (e) {}
})(document);
`,
        }}
      />

      <section className={`book-embed ${isEmbed ? 'is-embed' : ''}`}>
        <div className="book-grid book-grid--single">
          <div className="book-main">
            <form className="book-form" onSubmit={onSubmit} noValidate>
              {/* Sticky Header */}
              <div className="book-sticky">
                <div className="book-sub">
                  <div className="book-sub__left">
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
                        <div className="book-product">{productName}</div>
                      )}

                      {sessionLines.map((line, idx) => (
                        <div key={idx} className="book-meta">
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>

                  {showWishDate && (
                    <div className="book-sub__right">
                      <label htmlFor="wish-date">Wunschtermin*</label>
                      <div className="book-select book-select--caret">
                        <input
                          id="wish-date"
                          type="date"
                          name="date"
                          min={today || undefined}
                          value={form.date}
                          onChange={onChange}
                          className="book-select__native"
                          onClick={handleCaretClick}
                          onBlur={handleCaretBlur}
                          required
                        />
                        <span
                          className="book-select__icon"
                          aria-hidden="true"
                        >
                          <img src="/icons/select-caret.svg" alt="" />
                        </span>
                      </div>
                      {errors.date && (
                        <span className="error error--small">
                          {errors.date}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <input type="hidden" name="offerId" value={form.offerId} />

              {(coach.first || coach.last || coach.avatar || offer?.info) && (
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
                    <p className="muted coach-info-text">{offer.info}</p>
                  ) : null}
                </div>
              )}

              {!nonTrial && (
                <ChildSection
                  form={form}
                  errors={errors}
                  DAY_OPTS={DAY_OPTS}
                  MONTH_OPTS={MONTH_OPTS}
                  YEAR_OPTS={YEAR_OPTS}
                  onChange={onChange}
                />
              )}

              {isCampBooking && (
                <CampOptionsSection
                  form={form}
                  errors={errors}
                  DAY_OPTS={DAY_OPTS}
                  MONTH_OPTS={MONTH_OPTS}
                  YEAR_OPTS={YEAR_OPTS}
                  onChange={onChange}
                  setForm={setForm}
                  handleCaretClick={handleCaretClick}
                  handleCaretBlur={handleCaretBlur}
                />
              )}

              <BillingSection
                form={form}
                errors={errors}
                onChange={onChange}
                handleCaretClick={handleCaretClick}
                handleCaretBlur={handleCaretBlur}
              />

              <AgbRow
                form={form}
                errors={errors}
                isCampBooking={!!isCampBooking}
                onChange={onChange}
              />

              <BookActions
                status={status}
                submitLabel={submitLabel}
                isSubmitDisabled={isSubmitDisabled}
                errors={errors}
                offerError={offerError}
                offerLoading={offerLoading}
              />
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

























