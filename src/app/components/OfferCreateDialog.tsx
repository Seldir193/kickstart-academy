
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

export type OfferType =
  | 'Camp'
  | 'Foerdertraining'
  | 'Kindergarten'
  | 'PersonalTraining'
  | 'AthleticTraining';

export const OFFER_TYPES: OfferType[] = [
  'Camp',
  'Foerdertraining',
  'Kindergarten',
  'PersonalTraining',
  'AthleticTraining',
];

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

export type CreateOfferPayload = {
  type: OfferType | '';
  location: string;
  price: number | '';
  days: DayKey[];
  timeFrom: string;
  timeTo: string;
  ageFrom: number | '';
  ageTo: number | '';
  info: string;
  onlineActive: boolean;

  // NEU: Coach-Felder (werden im Frontend/WordPress angezeigt)
  coachName: string;
  coachEmail: string;
  coachImage: string; // Dateiname oder /api/uploads/coach/...
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

// Hilfsfunktion: Normalisiert was wir speichern (Dateiname vs. API-URL)
const normalizeCoachSrc = (src: string) => {
  if (!src) return '';
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith('/api/uploads/coach/')) return src;
  if (/^\/?uploads\/coach\//i.test(src)) return src.startsWith('/') ? `/api${src}` : `/api/${src}`;
  if (/^[\w.\-]+\.(png|jpe?g|webp|gif)$/i.test(src)) return `/api/uploads/coach/${src}`;
  return src;
};

/** VOLLSTÄNDIGER Dialog (Create/Edit) mit Upload */
export default function OfferCreateDialog({
  open,
  mode = 'create',
  presetType,
  initial, // wenn bearbeiten
  onClose,
  onCreate,
  onSave,
}: {
  open: boolean;
  mode?: 'create' | 'edit';
  presetType?: OfferType;
  initial?: (Partial<CreateOfferPayload> & { _id?: string }) | null;
  onClose: () => void;
  onCreate?: (payload: CreateOfferPayload) => Promise<void> | void;
  onSave?: (id: string, payload: CreateOfferPayload) => Promise<void> | void;
}) {
  const blank: CreateOfferPayload = {
    type: '',
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
    coachImage: '', // <- wichtig!
  };

  const computeInitial = (): CreateOfferPayload => {
    const base = { ...blank };
    if (initial) {
      return {
        type: (initial.type as OfferType) ?? (presetType ?? ''),
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
        coachImage: initial.coachImage ?? '', // kommt vom Server, bleibt erhalten
      };
    }
    if (presetType) base.type = presetType;
    return base;
  };

  const [form, setForm] = useState<CreateOfferPayload>(computeInitial);

  // Upload-Status
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(''); // zeigt live die hochgeladene Datei

  const panelRef = useRef<HTMLDivElement | null>(null);
  useOnClickOutside(panelRef, onClose);

  // beim Öffnen (re)befüllen
  useEffect(() => {
    if (open) {
      const init = computeInitial();
      setForm(init);
      setPreviewUrl(normalizeCoachSrc(init.coachImage));
      setUploading(false);
      setUploadError(null);
    } else {
      // reset auf close
      setForm({ ...blank, type: presetType ?? '' });
      setPreviewUrl('');
      setUploading(false);
      setUploadError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, JSON.stringify(initial), presetType]);

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
    return basicOk && !uploading; // blocken während Upload
  }, [form, uploading]);

  // ====== Upload-Handler ======
  async function handleCoachFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file, file.name);
      // optional: eigener dateiname
      fd.append('filename', file.name);

      const res = await fetch('/api/uploads/coach', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `Upload failed (${res.status})`);
      }

      // Merken, damit es nach Close/Reopen bleibt:
      // Wir speichern die "API-URL" (funktioniert überall)
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
      // coachImage ist bereits eine persistente URL (z.B. /api/uploads/coach/xyz.png)
    };

    if (mode === 'edit' && initial?._id && onSave) {
      await onSave(initial._id, payload);
    } else if (mode === 'create' && onCreate) {
      await onCreate(payload);
    }
  }

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
            {/* Type */}
            <div className="form__group  form__group--stack" >
              <label className="label">All types</label>
              <div className="chip-row">
                {OFFER_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: t }))}
                    className={clsx('chip', form.type === t && 'chip--active')}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <p className="help">Pick one type.</p>
            </div>

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

            {/* COACH: Name / Email / Bild */}
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
              {/* Speichere intern die URL/den Dateinamen */}
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




















































