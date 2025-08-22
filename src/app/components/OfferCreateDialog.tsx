'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

/* ===== Shared types/consts (export for reuse on the page) ===== */
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
};

/* ===== Utilities ===== */
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

/* ===== Component ===== */
export default function OfferCreateDialog({
  open,
  presetType,
  onClose,
  onCreate,
}: {
  open: boolean;
  presetType?: OfferType;
  onClose: () => void;
  onCreate: (payload: CreateOfferPayload) => Promise<void> | void;
}) {
  const [form, setForm] = useState<CreateOfferPayload>({
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
  });

  const panelRef = useRef<HTMLDivElement | null>(null);
  useOnClickOutside(panelRef, onClose);

  useEffect(() => {
    if (open) setForm((f) => ({ ...f, type: presetType ?? f.type }));
  }, [open, presetType]);

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
    return (
      !!form.type &&
      form.location.trim().length > 0 &&
      form.price !== '' &&
      Number(form.price) >= 0 &&
      form.timeFrom &&
      form.timeTo &&
      (form.ageFrom === '' ||
        form.ageTo === '' ||
        Number(form.ageFrom) <= Number(form.ageTo))
    );
  }, [form]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    await onCreate({
      ...form,
      price: Number(form.price),
      ageFrom: form.ageFrom === '' ? '' : Number(form.ageFrom),
      ageTo: form.ageTo === '' ? '' : Number(form.ageTo),
    });
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
          aria-label="Create offer dialog"
        >
          <button type="button" onClick={onClose} className="modal__close" aria-label="Close">✕</button>
          <h2 className="modal__title">Create offer</h2>

          <form onSubmit={handleSubmit} className="form">
            {/* Type */}
            <div className="form__group">
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
                Create offer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
