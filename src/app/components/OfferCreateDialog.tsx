'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

/* ===== Backend-basics (bleiben gleich) ===== */
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

/* ===== Neue Klassifikation ===== */
export type CategoryKey = 'Holiday' | 'Weekly' | 'Individual' | 'ClubPrograms' | 'RentACoach';

type CourseOption = {
  label: string;
  value: string;           // Schlüssel für die Course-Select
  type: OfferType;         // verpflichtend fürs Backend
  category: CategoryKey;   // zu welcher Spalte gehört der Kurs
  sub_type?: string;       // optionaler Feintyp (ASCII, ohne Umlaute)
};

/** Alle Kurse – enthält sowohl frühere „Base Types“ als auch neue Sub-Varianten */
const COURSES: CourseOption[] = [
  // Holiday
  { label: 'Camps (Indoor/Outdoor)', value: 'camp', type: 'Camp', category: 'Holiday' },
  { label: 'Power Training', value: 'powertraining', type: 'AthleticTraining', category: 'Holiday', sub_type: 'Powertraining' },

  // Weekly
  { label: 'Foerdertraining', value: 'foerdertraining', type: 'Foerdertraining', category: 'Weekly' },
  { label: 'Soccer Kindergarten', value: 'kindergarten', type: 'Kindergarten', category: 'Weekly' },
  { label: 'Goalkeeper Training', value: 'torwarttraining', type: 'Foerdertraining', category: 'Weekly', sub_type: 'Torwarttraining' },
  { label: 'Development Training · Athletik', value: 'foerder_athletik', type: 'Foerdertraining', category: 'Weekly', sub_type: 'Foerdertraining_Athletik' },

  // Individual
  { label: '1:1 Training', value: 'personal', type: 'PersonalTraining', category: 'Individual' },
  { label: '1:1 Training Athletik', value: 'personal_athletik', type: 'PersonalTraining', category: 'Individual', sub_type: 'Einzeltraining_Athletik' },
  { label: '1:1 Training Torwart', value: 'personal_torwart', type: 'PersonalTraining', category: 'Individual', sub_type: 'Einzeltraining_Torwart' },

  // Club programs
  { label: 'Training Camps', value: 'club_program', type: 'Camp', category: 'ClubPrograms', sub_type: 'ClubProgram_Generic' },
  { label: 'Coach Education', value: 'coach_education', type: 'Foerdertraining', category: 'ClubPrograms', sub_type: 'CoachEducation' },

  // Rent-a-Coach (eigene Kategorie)
  { label: 'Rent-a-Coach', value: 'rent_a_coach', type: 'Foerdertraining', category: 'RentACoach', sub_type: 'RentACoach_Generic' },
];

const CATEGORY_LABEL: Record<CategoryKey, string> = {
  Holiday: 'Holiday',
  Weekly: 'Weekly',
  Individual: 'Individual',
  ClubPrograms: 'ClubPrograms',
  RentACoach: 'RentACoach',
};

export type CreateOfferPayload = {
  // vom Dialog gesetzt (aus Course ableitbar)
  type: OfferType | '';
  category?: CategoryKey | '';
  sub_type?: string;

  // rest wie gehabt
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
};

function clsx(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(' ');
}
type AnyRef<T extends HTMLElement> =
  React.RefObject<T> | React.MutableRefObject<T | null>;

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

// Bild-URL normalisieren
const normalizeCoachSrc = (src: string) => {
  if (!src) return '';
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith('/api/uploads/coach/')) return src;
  if (/^\/?uploads\/coach\//i.test(src)) return src.startsWith('/') ? `/api${src}` : `/api/${src}`;
  if (/^[\w.\-]+\.(png|jpe?g|webp|gif)$/i.test(src)) return `/api/uploads/coach/${src}`;
  return src;
};

/** =========== Dialog =========== */
export default function OfferCreateDialog({
  open,
  mode = 'create',
  // presetType entfernt: Auswahl läuft über Course
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
  };

  const computeInitial = (): CreateOfferPayload => {
    const base = { ...blank };
    if (initial) {
      return {
        type: (initial.type as OfferType) ?? '',
        category: (initial.category as CategoryKey) ?? '',
        sub_type: initial.sub_type ?? '',
        location: initial.location ?? '',
        price: (initial.price as number) ?? '',
        days: (initial.days as DayKey[]) ?? [],
        timeFrom: initial.timeFrom ?? '',
        timeTo: initial.timeTo ?? '',
        ageFrom:
          initial.ageFrom === undefined || initial.ageFrom === null
            ? ''
            : Number(initial.ageFrom),
        ageTo:
          initial.ageTo === undefined || initial.ageTo === null
            ? ''
            : Number(initial.ageTo),
        info: initial.info ?? '',
        onlineActive:
          typeof initial.onlineActive === 'boolean' ? initial.onlineActive : true,

        coachName: initial.coachName ?? '',
        coachEmail: initial.coachEmail ?? '',
        coachImage: initial.coachImage ?? '',
      };
    }
    return base;
  };

  const [form, setForm] = useState<CreateOfferPayload>(computeInitial);

  // Ausgewählte Category/Course (nur UI-Status)
  const [categoryUI, setCategoryUI] = useState<CategoryKey | ''>('');
  const [courseUI, setCourseUI] = useState<string>(''); // value aus COURSES

  // Upload-Status
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const panelRef = useRef<HTMLDivElement | null>(null);
  useOnClickOutside(panelRef, onClose);

  // beim Öffnen (re)befüllen
  useEffect(() => {
    if (open) {
      const init = computeInitial();
      setForm(init);
      setPreviewUrl(normalizeCoachSrc(init.coachImage));

      // UI selects vorbelegen, falls aus initial vorhanden
      if (init.category) setCategoryUI(init.category as CategoryKey);
      if (init.type) {
        const found = COURSES.find(c =>
          c.type === init.type &&
          (init.sub_type ? c.sub_type === init.sub_type : true) &&
          (init.category ? c.category === init.category : true)
        );
        if (found) setCourseUI(found.value);
      } else {
        setCourseUI('');
      }

      setUploading(false);
      setUploadError(null);
    } else {
      // reset auf close
      setForm({ ...blank });
      setPreviewUrl('');
      setCategoryUI('');
      setCourseUI('');
      setUploading(false);
      setUploadError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, JSON.stringify(initial)]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const toggleDay = (k: DayKey) =>
    setForm((f) => ({
      ...f,
      days: f.days.includes(k) ? f.days.filter((d) => d !== k) : [...f.days, k],
    }));

  const canSubmit = useMemo(() => {
    const basicOk = !!form.type &&
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

  // ===== Auswahl-Handler =====
  function handleCategoryChange(next: CategoryKey | '') {
    setCategoryUI(next);
    setCourseUI('');
    // Category in Payload mitschreiben, sub_type zurücksetzen
    setForm(f => ({ ...f, category: next, sub_type: '' }));
  }

  function handleCourseChange(value: string) {
    setCourseUI(value);
    const def = COURSES.find(c => c.value === value);
    if (!def) return;
    // falls Category leer, aus Course ableiten
    const cat = (categoryUI || def.category) as CategoryKey;
    setCategoryUI(cat);

    setForm(f => ({
      ...f,
      type: def.type,
      category: cat,
      sub_type: def.sub_type || '',
    }));
  }

  // ===== Upload =====
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

    const payload: CreateOfferPayload = {
      ...form,
      price: Number(form.price),
      ageFrom: form.ageFrom === '' ? '' : Number(form.ageFrom),
      ageTo: form.ageTo === '' ? '' : Number(form.ageTo),
    };

    if (mode === 'edit' && initial?._id && onSave) {
      await onSave(initial._id, payload);
    } else if (mode === 'create' && onCreate) {
      await onCreate(payload);
    }
  }

  // Helper: Kurse nach Category filtern (UI)
  const visibleCourses = COURSES.filter(c => !categoryUI || c.category === categoryUI);

  if (!open) return null;

  return (
    <div className="modal">
      <div className="modal__overlay" />
      <div className="modal__wrap">
        <div
          ref={panelRef}
          className="modal__panel"
          role="dialog"
          aria-modal="true"
          aria-label={mode === 'edit' ? 'Edit offer dialog' : 'Create offer dialog'}
        >
          <button type="button" onClick={onClose} className="modal__close" aria-label="Close">✕</button>
          <h2 className="modal__title">{mode === 'edit' ? 'Edit offer' : 'Create offer'}</h2>

          <form onSubmit={handleSubmit} className="form">
            {/* ===== Category & Course (NEU) ===== */}
            <div className="grid grid--2">
              <div className="form__group">
                <label className="label">Category</label>
                <select
                  className="input"
                  value={categoryUI}
                  onChange={(e) => handleCategoryChange((e.target.value || '') as CategoryKey | '')}
                >
                  <option value="">— Select category —</option>
                  {(['Holiday','Weekly','Individual','ClubPrograms','RentACoach'] as CategoryKey[]).map(k => (
                    <option key={k} value={k}>{CATEGORY_LABEL[k]}</option>
                  ))}
                </select>
              </div>

              <div className="form__group">
                <label className="label">Course</label>
                <select
                  className="input"
                  value={courseUI}
                  onChange={(e) => handleCourseChange(e.target.value)}
                >
                  <option value="">— Select course —</option>
                  {visibleCourses.map(c => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="help" style={{marginTop: -6}}>Die Kurswahl füllt <code>type</code> automatisch; optional wird <code>sub_type</code> gesetzt.</p>

            {/* Location + Price */}
            <div className="grid grid--2">
              <div className="form__group">
                <label className="label">Location</label>
                <input
                  className="input"
                  placeholder="e.g., Duisburg"
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                />
              </div>
              <div className="form__group">
                <label className="label">Price (€)</label>
                <input
                  type="number"
                  className="input"
                  placeholder="e.g., 49"
                  min={0}
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      price: e.target.value === '' ? '' : Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>

            {/* Days */}
            <div className="form__group">
              <label className="label">Day(s)</label>
              <div className="chip-row">
                {DAYS.map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => toggleDay(d.key)}
                    className={clsx('chip', form.days.includes(d.key) && 'chip--active')}
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
                  onChange={(e) => setForm((f) => ({ ...f, timeFrom: e.target.value }))}
                />
              </div>
              <div className="form__group">
                <label className="label">Time to</label>
                <input
                  type="time"
                  className="input"
                  value={form.timeTo}
                  onChange={(e) => setForm((f) => ({ ...f, timeTo: e.target.value }))}
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
                      ageFrom: e.target.value === '' ? '' : Number(e.target.value),
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
                      ageTo: e.target.value === '' ? '' : Number(e.target.value),
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
                onChange={(e) => setForm((f) => ({ ...f, info: e.target.value }))}
              />
            </div>

            {/* Coach */}
            <div className="grid grid--2">
              <div className="form__group">
                <label className="label">Coach name</label>
                <input
                  className="input"
                  placeholder="z. B. Noah Example"
                  value={form.coachName}
                  onChange={(e) => setForm((f) => ({ ...f, coachName: e.target.value }))}
                />
              </div>
              <div className="form__group">
                <label className="label">Coach E-Mail</label>
                <input
                  className="input"
                  type="email"
                  placeholder="coach@example.com"
                  value={form.coachEmail}
                  onChange={(e) => setForm((f) => ({ ...f, coachEmail: e.target.value }))}
                />
              </div>
            </div>

            <div className="form__group">
              <label className="label">Coach Bild</label>
              <div className="upload-row">
                <input type="file" accept="image/*" onChange={handleCoachFileChange} />
                {uploading && <span className="uploading">Uploading…</span>}
                {uploadError && <span className="error">{uploadError}</span>}
              </div>
              {previewUrl ? (
                <div className="preview">
                  <img src={previewUrl} alt="Coach preview" />
                </div>
              ) : null}
              <input type="hidden" value={form.coachImage} onChange={() => {}}/>
            </div>

            {/* Online toggle */}
            <div className="form__group form__group--inline">
              <label className="label">Online active</label>
              <button
                type="button"
                className={clsx('switch', form.onlineActive && 'switch--on')}
                onClick={() => setForm((f) => ({ ...f, onlineActive: !f.onlineActive }))}
                aria-pressed={form.onlineActive}
              >
                <span className="switch__thumb" />
              </button>
            </div>

            {/* Actions */}
            <div className="form__actions">
              <button type="button" className="btn" onClick={onClose}>Close</button>
              <button
                type="submit"
                disabled={!canSubmit}
                className={clsx('btn btn--primary', !canSubmit && 'btn--disabled')}
              >
                {mode === 'edit' ? 'Save changes' : 'Create offer'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .upload-row { display:flex; gap:12px; align-items:center; }
        .uploading { color:#0ea5e9; font-weight:600; }
        .error { color:#b91c1c; }
        .preview { margin-top:8px; }
        .preview img { width:88px; height:88px; object-fit:cover; border-radius:999px; border:1px solid #e5e7eb; }
      `}</style>
    </div>
  );
}

