'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Place } from '@/types/place';

export type OfferType =
  | 'Camp'
  | 'Foerdertraining'
  | 'Kindergarten'
  | 'PersonalTraining'
  | 'AthleticTraining';

type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
const DAYS: { key: DayKey; label: string }[] = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
];

export type CategoryKey =
  | 'Holiday'
  | 'Weekly'
  | 'Individual'
  | 'ClubPrograms'
  | 'RentACoach';

type CourseOption = {
  label: string;
  value: string;
  type: OfferType;
  category: CategoryKey;
  sub_type?: string;
};

const COURSES: CourseOption[] = [
  { label: 'Camps (Indoor/Outdoor)', value: 'camp', type: 'Camp', category: 'Holiday' },
  {
    label: 'Power Training',
    value: 'powertraining',
    type: 'AthleticTraining',
    category: 'Holiday',
    sub_type: 'Powertraining',
  },

  { label: 'Foerdertraining', value: 'foerdertraining', type: 'Foerdertraining', category: 'Weekly' },
  { label: 'Soccer Kindergarten', value: 'kindergarten', type: 'Kindergarten', category: 'Weekly' },
  {
    label: 'Goalkeeper Training',
    value: 'torwarttraining',
    type: 'Foerdertraining',
    category: 'Weekly',
    sub_type: 'Torwarttraining',
  },
  {
    label: 'Development Training · Athletik',
    value: 'foerder_athletik',
    type: 'Foerdertraining',
    category: 'Weekly',
    sub_type: 'Foerdertraining_Athletik',
  },

  { label: '1:1 Training', value: 'personal', type: 'PersonalTraining', category: 'Individual' },
  {
    label: '1:1 Training Athletik',
    value: 'personal_athletik',
    type: 'PersonalTraining',
    category: 'Individual',
    sub_type: 'Einzeltraining_Athletik',
  },
  {
    label: '1:1 Training Torwart',
    value: 'personal_torwart',
    type: 'PersonalTraining',
    category: 'Individual',
    sub_type: 'Einzeltraining_Torwart',
  },

  {
    label: 'Training Camps',
    value: 'club_program',
    type: 'Camp',
    category: 'ClubPrograms',
    sub_type: 'ClubProgram_Generic',
  },
  {
    label: 'Coach Education',
    value: 'coach_education',
    type: 'Foerdertraining',
    category: 'ClubPrograms',
    sub_type: 'CoachEducation',
  },

  {
    label: 'Rent-a-Coach',
    value: 'rent_a_coach',
    type: 'Foerdertraining',
    category: 'RentACoach',
    sub_type: 'RentACoach_Generic',
  },
];

const CATEGORY_LABEL: Record<CategoryKey, string> = {
  Holiday: 'Holiday',
  Weekly: 'Weekly',
  Individual: 'Individual',
  ClubPrograms: 'ClubPrograms',
  RentACoach: 'RentACoach',
};

/** Vordefinierte Ferienwochen (für Dropdown) */
const HOLIDAY_WEEK_PRESETS = [
  'Osterferien',
  'Pfingstferien',
  'Sommerferien',
  'Herbstferien',
  'Weihnachtsferien',
] as const;

export type CreateOfferPayload = {
  type: OfferType | '';
  category?: CategoryKey | '';
  sub_type?: string;

  // Place linkage
  placeId?: string;
  location: string;

  price: number | '';
  days: DayKey[];
  timeFrom: string;
  timeTo: string;
  ageFrom: number | '';
  ageTo: number | '';
  info: string;
  onlineActive: boolean;

  coachName: string;
  coachEmail: string;
  coachImage: string;

  // Ferienwochen-Infos (für Camps + Powertraining)
  holidayWeekLabel?: string; // z.B. "Osterferien"
  dateFrom?: string;         // yyyy-mm-dd
  dateTo?: string;           // yyyy-mm-dd
};

function clsx(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(' ');
}

type AnyRef<T extends HTMLElement> = React.RefObject<T> | React.MutableRefObject<T | null>;

function useOnClickOutside<T extends HTMLElement>(ref: AnyRef<T>, handler: () => void) {
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) handler();
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [ref, handler]);
}

const normalizeCoachSrc = (src: string) => {
  if (!src) return '';
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith('/api/uploads/coach/')) return src;
  if (/^\/?uploads\/coach\//i.test(src)) {
    return src.startsWith('/') ? `/api${src}` : `/api/${src}`;
  }
  if (/^[\w.\-]+\.(png|jpe?g|webp|gif)$/i.test(src)) return `/api/uploads/coach/${src}`;
  return src;
};

export default function OfferCreateDialog({
  open,
  mode = 'create',
  initial,
  onClose,
  onCreate,
  onSave,
}: {
  open: boolean;
  mode?: 'create' | 'edit';
  initial?: (Partial<CreateOfferPayload> & { _id?: string }) | null;
  onClose: () => void;
  onCreate?: (payload: CreateOfferPayload) => Promise<void> | void;
  onSave?: (id: string, payload: CreateOfferPayload) => Promise<void> | void;
}) {
  const blank: CreateOfferPayload = {
    type: '',
    category: '',
    sub_type: '',
    placeId: '',
    location: '',
    price: '',
    days: [],
    timeFrom: '',
    timeTo: '',
    ageFrom: '',
    ageTo: '',
    info: '',
    onlineActive: true,
    coachName: '',
    coachEmail: '',
    coachImage: '',
    holidayWeekLabel: '',
    dateFrom: '',
    dateTo: '',
  };

  const computeInitial = (): CreateOfferPayload => {
    const base = { ...blank };
    if (initial) {
      return {
        type: (initial.type as OfferType) ?? '',
        category: (initial.category as CategoryKey) ?? '',
        sub_type: initial.sub_type ?? '',
        placeId: initial.placeId ?? '',
        location: initial.location ?? '',
        price: (initial.price as number) ?? '',
        days: (initial.days as DayKey[]) ?? [],
        timeFrom: initial.timeFrom ?? '',
        timeTo: initial.timeTo ?? '',
        ageFrom:
          initial.ageFrom === undefined || initial.ageFrom === null ? '' : Number(initial.ageFrom),
        ageTo:
          initial.ageTo === undefined || initial.ageTo === null ? '' : Number(initial.ageTo),
        info: initial.info ?? '',
        onlineActive:
          typeof initial.onlineActive === 'boolean' ? initial.onlineActive : true,
        coachName: initial.coachName ?? '',
        coachEmail: initial.coachEmail ?? '',
        coachImage: initial.coachImage ?? '',
        holidayWeekLabel: initial.holidayWeekLabel ?? '',
        dateFrom: initial.dateFrom ?? '',
        dateTo: initial.dateTo ?? '',
      };
    }
    return base;
  };

  const [form, setForm] = useState<CreateOfferPayload>(computeInitial);

  const [categoryUI, setCategoryUI] = useState<CategoryKey | ''>('');
  const [courseUI, setCourseUI] = useState<string>('');

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [courseOpen, setCourseOpen] = useState(false);
  const [placeOpen, setPlaceOpen] = useState(false);

  // Ferienwoche: Preset + Custom
  const [holidayPreset, setHolidayPreset] = useState<string>(''); // "Osterferien" oder "__custom__"
  const [holidayCustom, setHolidayCustom] = useState<string>(''); // wenn "__custom__"

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const [places, setPlaces] = useState<Place[]>([]);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const categoryDropdownRef = useRef<HTMLDivElement | null>(null);
  const courseDropdownRef = useRef<HTMLDivElement | null>(null);
  const placeDropdownRef = useRef<HTMLDivElement | null>(null);

  useOnClickOutside(panelRef, onClose);
  useOnClickOutside(categoryDropdownRef, () => setCategoryOpen(false));
  useOnClickOutside(courseDropdownRef, () => setCourseOpen(false));
  useOnClickOutside(placeDropdownRef, () => setPlaceOpen(false));

  const selectedPlace = useMemo(
    () => places.find((p) => p._id === form.placeId) || null,
    [places, form.placeId],
  );

  // load places once
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const r = await fetch('/api/admin/places?page=1&pageSize=500', {
          cache: 'no-store',
          signal: ctrl.signal,
        });
        const j = await r.json().catch(() => ({}));
        const arr: Place[] = Array.isArray(j?.items) ? j.items : [];
        setPlaces(arr);
      } catch {
        setPlaces([]);
      }
    })();
    return () => ctrl.abort();
  }, []);

  // when dialog opens, seed values
  useEffect(() => {
    if (open) {
      const init = computeInitial();
      setForm(init);
      setPreviewUrl(normalizeCoachSrc(init.coachImage));

      if (init.category) setCategoryUI(init.category as CategoryKey);
      else setCategoryUI('');

      if (init.type) {
        const found = COURSES.find(
          (c) =>
            c.type === init.type &&
            (init.sub_type ? c.sub_type === init.sub_type : true) &&
            (init.category ? c.category === init.category : true),
        );
        if (found) setCourseUI(found.value);
        else setCourseUI('');
      } else {
        setCourseUI('');
      }

      // Ferienwoche: Preset vs Custom vorbereiten
      if (init.holidayWeekLabel) {
        const presetHit = HOLIDAY_WEEK_PRESETS.find((p) => p === init.holidayWeekLabel);
        if (presetHit) {
          setHolidayPreset(presetHit);
          setHolidayCustom('');
        } else {
          setHolidayPreset('__custom__');
          setHolidayCustom(init.holidayWeekLabel);
        }
      } else {
        setHolidayPreset('');
        setHolidayCustom('');
      }

      setUploading(false);
      setUploadError(null);
      setCategoryOpen(false);
      setCourseOpen(false);
      setPlaceOpen(false);
    } else {
      setForm({ ...blank });
      setPreviewUrl('');
      setCategoryUI('');
      setCourseUI('');
      setHolidayPreset('');
      setHolidayCustom('');
      setUploading(false);
      setUploadError(null);
      setCategoryOpen(false);
      setCourseOpen(false);
      setPlaceOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, JSON.stringify(initial)]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const toggleDay = (k: DayKey) =>
    setForm((f) => ({
      ...f,
      days: f.days.includes(k) ? f.days.filter((d) => d !== k) : [...f.days, k],
    }));

  const canSubmit = useMemo(() => {
    const basicOk =
      !!form.type &&
      !!form.placeId &&
      form.location.trim().length > 0 &&
      form.price !== '' &&
      Number(form.price) >= 0 &&
      form.timeFrom &&
      form.timeTo &&
      (form.ageFrom === '' ||
        form.ageTo === '' ||
        Number(form.ageFrom) <= Number(form.ageTo));
    return basicOk && !uploading;
  }, [form, uploading]);

  function handleCategoryChange(next: CategoryKey | '') {
    setCategoryUI(next);
    setCourseUI('');
    setForm((f) => ({
      ...f,
      category: next,
      sub_type: '',
    }));
  }

  function handleCourseChange(value: string) {
    setCourseUI(value);
    const def = COURSES.find((c) => c.value === value);
    if (!def) return;
    const cat = (categoryUI || def.category) as CategoryKey;
    setCategoryUI(cat);
    setForm((f) => ({
      ...f,
      type: def.type,
      category: cat,
      sub_type: def.sub_type || '',
    }));
  }

  function onPlaceChange(placeId: string) {
    const p = places.find((x) => x._id === placeId);
    setForm((f) => ({
      ...f,
      placeId,
      location: p?.city ? p.city : '',
    }));
  }

  // Ferienwoche: Preset-Change
  function handleHolidayPresetChange(next: string) {
    setHolidayPreset(next);

    // Preset gewählt → direkt in holidayWeekLabel übernehmen
    if (next && next !== '__custom__') {
      setForm((f) => ({
        ...f,
        holidayWeekLabel: next,
      }));
      setHolidayCustom('');
    }

    // "Andere Ferienwoche…" → Feld leeren, wartet auf Custom-Input
    if (next === '__custom__') {
      setForm((f) => ({
        ...f,
        holidayWeekLabel: '',
      }));
    }

    // nichts ausgewählt
    if (!next) {
      setForm((f) => ({
        ...f,
        holidayWeekLabel: '',
      }));
      setHolidayCustom('');
    }
  }

  async function handleCoachFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file, file.name);
      fd.append('filename', file.name);
      const res = await fetch('/api/uploads/coach', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || `Upload failed (${res.status})`);
      const url: string = data.url || '';
      setForm((f) => ({ ...f, coachImage: url }));
      setPreviewUrl(url);
    } catch (err: any) {
      setUploadError(err?.message || 'Upload error');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    // Finaler Ferienwochen-Name:
    const finalHolidayName =
      holidayPreset === '__custom__'
        ? (holidayCustom || '').trim()
        : (holidayPreset || form.holidayWeekLabel || '').trim();

    const payload: CreateOfferPayload = {
      ...form,
      price: Number(form.price),
      ageFrom: form.ageFrom === '' ? '' : Number(form.ageFrom),
      ageTo: form.ageTo === '' ? '' : Number(form.ageTo),
      holidayWeekLabel: finalHolidayName || '',
      dateFrom: form.dateFrom || '',
      dateTo: form.dateTo || '',
    };

    if (mode === 'edit' && initial?._id && onSave) {
      await onSave(initial._id, payload);
    } else if (mode === 'create' && onCreate) {
      await onCreate(payload);
    }
  }

  const visibleCourses = COURSES.filter((c) => !categoryUI || c.category === categoryUI);

  if (!open) return null;

  const categoryOrder: CategoryKey[] = [
    'Holiday',
    'Weekly',
    'Individual',
    'ClubPrograms',
    'RentACoach',
  ];

  const selectedCourse = courseUI
    ? COURSES.find((c) => c.value === courseUI) || null
    : null;

  // Helper: ist Holiday-Camp? ist Holiday-Powertraining?
  const isHolidayCamp =
    form.category === 'Holiday' && form.type === 'Camp';
  const isHolidayPower =
    form.category === 'Holiday' && form.sub_type === 'Powertraining';
  const isHolidayOffer = form.category === 'Holiday';

  return (
    <div className="modal">
      <div className="modal__overlay" />
      <div className="modal__wrap">
        <div
          ref={panelRef}
          className="modal__panel"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={onClose}
            className="modal__close"
            aria-label="Close"
          >
            ✕
          </button>
          <h2 className="modal__title">
            {mode === 'edit' ? 'Edit offer' : 'Create offer'}
          </h2>

          <form onSubmit={handleSubmit} className="form">
            {/* Category & Course */}
            <div className="grid grid--2">
              {/* Category – ks-selectbox */}
              <div className="form__group">
                <label className="label">Category</label>
                <div
                  ref={categoryDropdownRef}
                  className={clsx(
                    'ks-selectbox',
                    categoryOpen && 'ks-selectbox--open',
                  )}
                >
                  <button
                    type="button"
                    className="ks-selectbox__trigger"
                    onClick={() => setCategoryOpen((o) => !o)}
                    aria-haspopup="listbox"
                    aria-expanded={categoryOpen}
                  >
                    <span className="ks-selectbox__label">
                      {categoryUI
                        ? CATEGORY_LABEL[categoryUI]
                        : '— Select category —'}
                    </span>
                    <span className="ks-selectbox__chevron" aria-hidden="true" />
                  </button>

                  {categoryOpen && (
                    <div className="ks-selectbox__panel" role="listbox">
                      <button
                        type="button"
                        className={clsx(
                          'ks-selectbox__option',
                          !categoryUI && 'ks-selectbox__option--active',
                        )}
                        onClick={() => {
                          handleCategoryChange('');
                          setCategoryOpen(false);
                        }}
                      >
                        — All categories —
                      </button>

                      {categoryOrder.map((k) => (
                        <button
                          key={k}
                          type="button"
                          className={clsx(
                            'ks-selectbox__option',
                            categoryUI === k && 'ks-selectbox__option--active',
                          )}
                          onClick={() => {
                            handleCategoryChange(k);
                            setCategoryOpen(false);
                          }}
                        >
                          {CATEGORY_LABEL[k]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Course – ks-selectbox mit Gruppen */}
              <div className="form__group">
                <label className="label">Course</label>
                <div
                  ref={courseDropdownRef}
                  className={clsx(
                    'ks-selectbox',
                    courseOpen && 'ks-selectbox--open',
                  )}
                >
                  <button
                    type="button"
                    className="ks-selectbox__trigger"
                    onClick={() => setCourseOpen((o) => !o)}
                    aria-haspopup="listbox"
                    aria-expanded={courseOpen}
                  >
                    <span className="ks-selectbox__label">
                      {selectedCourse
                        ? selectedCourse.label
                        : '— Select course —'}
                    </span>
                    <span className="ks-selectbox__chevron" aria-hidden="true" />
                  </button>

                  {courseOpen && (
                    <div className="ks-selectbox__panel" role="listbox">
                      <button
                        type="button"
                        className={clsx(
                          'ks-selectbox__option',
                          !courseUI && 'ks-selectbox__option--active',
                        )}
                        onClick={() => {
                          handleCourseChange('');
                          setCourseOpen(false);
                        }}
                      >
                        — No course selected —
                      </button>

                      {categoryOrder.map((cat) => {
                        const groupCourses = visibleCourses.filter(
                          (c) => c.category === cat,
                        );
                        if (!groupCourses.length) return null;

                        return (
                          <div
                            key={cat}
                            className="ks-selectbox__group"
                          >
                            <div className="ks-selectbox__group-label">
                              {CATEGORY_LABEL[cat]}
                            </div>
                            {groupCourses.map((c) => (
                              <button
                                key={c.value}
                                type="button"
                                className={clsx(
                                  'ks-selectbox__option',
                                  courseUI === c.value &&
                                    'ks-selectbox__option--active',
                                )}
                                onClick={() => {
                                  handleCourseChange(c.value);
                                  setCourseOpen(false);
                                }}
                              >
                                {c.label}
                              </button>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <p className="help" style={{ marginTop: -6 }}>
              Selecting a course fills <code>type</code> automatically;{' '}
              <code>sub_type</code> is optional.
            </p>

            {/* Place + Price */}
            <div className="grid grid--2">
              {/* Place */}
              <div className="form__group">
                <label className="label">Place</label>

                <div
                  ref={placeDropdownRef}
                  className={clsx('ks-selectbox', placeOpen && 'ks-selectbox--open')}
                >
                  <button
                    type="button"
                    className="ks-selectbox__trigger"
                    onClick={() => setPlaceOpen((o) => !o)}
                    aria-haspopup="listbox"
                    aria-expanded={placeOpen}
                  >
                    <span className="ks-selectbox__label">
                      {selectedPlace
                        ? `${selectedPlace.name} • ${selectedPlace.city}`
                        : '— Select place —'}
                    </span>
                    <span className="ks-selectbox__chevron" aria-hidden="true" />
                  </button>

                  {placeOpen && (
                    <div className="ks-selectbox__panel" role="listbox">
                      <button
                        type="button"
                        className={clsx(
                          'ks-selectbox__option',
                          !form.placeId && 'ks-selectbox__option--active',
                        )}
                        onClick={() => {
                          onPlaceChange('');
                          setPlaceOpen(false);
                        }}
                      >
                        — Select place —
                      </button>

                      {places.map((p) => (
                        <button
                          key={p._id}
                          type="button"
                          className={clsx(
                            'ks-selectbox__option',
                            form.placeId === p._id && 'ks-selectbox__option--active',
                          )}
                          onClick={() => {
                            onPlaceChange(p._id);
                            setPlaceOpen(false);
                          }}
                        >
                          {p.name} • {p.city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="form__group">
                <label className="label">Price (€)</label>
                <input
                  type="number"
                  className="input"
                  min={0}
                  step="0.01"
                  placeholder="z. B. 129"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      price:
                        e.target.value === '' ? '' : Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>

            {/* Ferienwoche + Datum nur für Holiday (Camp + Powertraining) */}
            {isHolidayOffer && (
              <>
                <div className="form__group">
                  <label className="label">Ferienwoche</label>
                  <div className="grid grid--2">
                    <select
                      className="input"
                      value={holidayPreset}
                      onChange={(e) => handleHolidayPresetChange(e.target.value)}
                    >
                      <option value="">— Bitte wählen —</option>
                      {HOLIDAY_WEEK_PRESETS.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                      <option value="__custom__">Andere Ferienwoche…</option>
                    </select>

                    {/* Freitext nur, wenn "__custom__" */}
                    {holidayPreset === '__custom__' && (
                      <input
                        className="input"
                        placeholder="z. B. Osterferien Intensivcamp"
                        value={holidayCustom}
                        onChange={(e) => {
                          const val = e.target.value;
                          setHolidayCustom(val);
                          setForm((f) => ({
                            ...f,
                            holidayWeekLabel: val,
                          }));
                        }}
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid--2">
                  <div className="form__group">
                    <label className="label">Ferien: Von</label>
                    <input
                      type="date"
                      className="input"
                      value={form.dateFrom || ''}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          dateFrom: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="form__group">
                    <label className="label">Ferien: Bis</label>
                    <input
                      type="date"
                      className="input"
                      value={form.dateTo || ''}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          dateTo: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </>
            )}

            {/* Days */}
            <div className="form__group form__group--stack">
              <label className="label">
                Day(s){' '}
                {isHolidayCamp && '– Camp-Tage innerhalb der Ferien'}
                {isHolidayPower && '– Powertraining-Tage innerhalb der Ferien'}
              </label>
              <div className="chip-row">
                {DAYS.map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => toggleDay(d.key)}
                    className={clsx(
                      'chip',
                      form.days.includes(d.key) && 'chip--active',
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time */}
            <div className="grid grid--2">
              <div className="form__group">
                <label className="label">Time from</label>
                <input
                  type="time"
                  className="input"
                  value={form.timeFrom}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, timeFrom: e.target.value }))
                  }
                />
              </div>
              <div className="form__group">
                <label className="label">Time to</label>
                <input
                  type="time"
                  className="input"
                  value={form.timeTo}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, timeTo: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Age range */}
            <div className="grid grid--2">
              <div className="form__group">
                <label className="label">Age from</label>
                <input
                  type="number"
                  className="input"
                  placeholder="e.g., 6"
                  min={0}
                  value={form.ageFrom}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      ageFrom:
                        e.target.value === ''
                          ? ''
                          : Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="form__group">
                <label className="label">Age to</label>
                <input
                  type="number"
                  className="input"
                  placeholder="e.g., 14"
                  min={0}
                  value={form.ageTo}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      ageTo:
                        e.target.value === ''
                          ? ''
                          : Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>

            {/* Info */}
            <div className="form__group">
              <label className="label">Info text</label>
              <textarea
                className="input input--textarea"
                placeholder="Additional information…"
                value={form.info}
                onChange={(e) =>
                  setForm((f) => ({ ...f, info: e.target.value }))
                }
              />
            </div>

            {/* Coach */}
            <div className="grid grid--2">
              <div className="form__group">
                <label className="label">Coach name</label>
                <input
                  className="input"
                  placeholder="e.g., Noah Example"
                  value={form.coachName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, coachName: e.target.value }))
                  }
                />
              </div>
              <div className="form__group">
                <label className="label">Coach E-Mail</label>
                <input
                  className="input"
                  type="email"
                  placeholder="coach@example.com"
                  value={form.coachEmail}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, coachEmail: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="form__group">
              <label className="label">Coach image</label>
              <div className="upload-row">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoachFileChange}
                />
                {uploading && <span className="uploading">Uploading…</span>}
                {uploadError && <span className="error">{uploadError}</span>}
              </div>
              {previewUrl ? (
                <div className="preview">
                  <img src={previewUrl} alt="Coach preview" />
                </div>
              ) : null}
              <input
                type="hidden"
                value={form.coachImage}
                onChange={() => {}}
              />
            </div>

            {/* Online toggle */}
            <div className="form__group form__group--inline">
              <label className="label">Online active</label>
              <button
                type="button"
                className={clsx(
                  'switch',
                  form.onlineActive && 'switch--on',
                )}
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    onlineActive: !f.onlineActive,
                  }))
                }
                aria-pressed={form.onlineActive}
              >
                <span className="switch__thumb" />
              </button>
            </div>

            {/* Actions */}
            <div className="form__actions">
              <button type="button" className="btn" onClick={onClose}>
                Close
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className={clsx(
                  'btn ',
                  !canSubmit && 'btn--disabled',
                )}
              >
                {mode === 'edit' ? 'Save changes' : 'Create offer'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .upload-row {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .uploading {
          color: #0ea5e9;
          font-weight: 600;
        }
        .error {
          color: #b91c1c;
        }
        .preview {
          margin-top: 8px;
        }
        .preview img {
          width: 88px;
          height: 88px;
          object-fit: cover;
          border-radius: 999px;
          border: 1px solid #e5e7eb;
        }
      `}</style>
    </div>
  );
}
