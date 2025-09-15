// src/app/components/places/PlaceDialog.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Place } from '@/types/place';

// Falls MapPreview im selben Ordner liegt, passt der relative Import so.
// Wenn dein Pfad anders ist, bitte anpassen (z. B. '@/app/components/places/MapPreview').
const MapPreview = dynamic(() => import('./MapPreview'), { ssr: false });

function clsx(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(' ');
}

type PlaceForm = {
  _id?: string;
  name: string;
  address: string;
  zip: string;
  city: string;
  lat?: number | null;
  lng?: number | null;
};

export default function PlaceDialog({
  open,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean;
  initial?: Place | undefined;
  onClose: () => void;
  onSaved: () => void;
}) {
  const blank: PlaceForm = {
    _id: undefined,
    name: '',
    address: '',
    zip: '',
    city: '',
    lat: undefined,
    lng: undefined,
  };

  const [form, setForm] = useState<PlaceForm>(blank);

  // address check state
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);

  // save state
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    // map initial Place -> PlaceForm
    const f: PlaceForm = initial
      ? {
          _id: initial._id || undefined,
          name: initial.name || '',
          address: initial.address || '',
          zip: initial.zip || '',
          city: initial.city || '',
          lat: typeof initial.lat === 'number' ? initial.lat : initial.lat ?? undefined,
          lng: typeof initial.lng === 'number' ? initial.lng : initial.lng ?? undefined,
        }
      : { ...blank };

    setForm(f);
    setChecking(false);
    setCheckError(null);
    setSaving(false);
    setSaveError(null);
  }, [open, initial]);

  const canSave = useMemo(() => {
    return (
      form.name.trim().length > 0 &&
      form.address.trim().length > 0 &&
      form.zip.trim().length > 0 &&
      form.city.trim().length > 0 &&
      !saving
    );
  }, [form, saving]);

  async function handleCheckAddress() {
    setChecking(true);
    setCheckError(null);
    try {
      const q = `${form.address}, ${form.zip} ${form.city}`;
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
        q
      )}&limit=1&addressdetails=0`;
      const r = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
      });
      const j = await r.json();
      const hit = Array.isArray(j) && j[0];
      if (hit && hit.lat && hit.lon) {
        setForm((f) => ({ ...f, lat: Number(hit.lat), lng: Number(hit.lon) }));
      } else {
        setCheckError('Address not found. Please refine.');
      }
    } catch (e: any) {
      setCheckError(e?.message || 'Address check failed');
    } finally {
      setChecking(false);
    }
  }

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    setSaveError(null);

    try {
      const payload = {
        name: form.name.trim(),
        address: form.address.trim(),
        zip: form.zip.trim(),
        city: form.city.trim(),
        // Nur echte Zahlen übertragen – sonst weglassen (Backend setzt nichts)
        ...(typeof form.lat === 'number' ? { lat: form.lat } : {}),
        ...(typeof form.lng === 'number' ? { lng: form.lng } : {}),
      };

      let resp: Response;
      if (form._id) {
        resp = await fetch(`/api/admin/places/${encodeURIComponent(form._id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          cache: 'no-store',
        });
      } else {
        resp = await fetch(`/api/admin/places`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          cache: 'no-store',
        });
      }

      if (!resp.ok) {
        const t = await resp.text().catch(() => '');
        let j: any = null;
        try {
          j = t ? JSON.parse(t) : null;
        } catch {
          /* ignore */
        }
        const msg =
          j?.error ||
          (resp.status === 409
            ? 'Place already exists (same name/ZIP/city).'
            : `Save failed (${resp.status})`);
        throw new Error(msg);
      }

      onSaved();
    } catch (e: any) {
      setSaveError(e?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="modal">
      <div className="modal__overlay" />
      <div className="modal__wrap">
        <div
          className="modal__panel"
          role="dialog"
          aria-modal="true"
          aria-label={form._id ? 'Edit place' : 'Create place'}
        >
          <button type="button" className="modal__close" aria-label="Close" onClick={onClose}>
            ✕
          </button>
          <h2 className="modal__title">{form._id ? 'Edit place' : 'Create place'}</h2>

          <div className="form-columns">
            {/* Left: form */}
            <div className="card">
              <div className="field">
                <label className="lbl">Club / Place name</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g., SV Example"
                />
              </div>

              <div className="field">
                <label className="lbl">Address</label>
                <input
                  className="input"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="Street and number"
                />
              </div>

              <div className="form-columns" style={{ gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                <div className="field">
                  <label className="lbl">ZIP</label>
                  <input
                    className="input"
                    value={form.zip}
                    onChange={(e) => setForm((f) => ({ ...f, zip: e.target.value }))}
                    placeholder="e.g., 47167"
                  />
                </div>
                <div className="field">
                  <label className="lbl">City</label>
                  <input
                    className="input"
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                    placeholder="e.g., Duisburg"
                  />
                </div>
              </div>

              <div className="form__actions">
                <button className="btn" onClick={onClose} disabled={saving || checking}>
                  Close
                </button>

                <button
                  className={clsx('btn', (checking || saving) && 'btn-disabled')}
                  onClick={handleCheckAddress}
                  disabled={checking || saving}
                >
                  {checking ? 'Checking…' : 'Check address'}
                </button>

                <button
                  className={clsx('btn btn-primary', (!canSave || saving) && 'btn-disabled')}
                  onClick={handleSave}
                  disabled={!canSave || saving}
                >
                  {form._id ? (saving ? 'Saving…' : 'Save changes') : saving ? 'Saving…' : 'Save place'}
                </button>
              </div>

              {/* Inline errors */}
              {checkError ? (
                <p className="error" style={{ marginTop: 8 }}>
                  {checkError}
                </p>
              ) : null}
              {saveError ? (
                <p className="error" style={{ marginTop: 8 }}>
                  {saveError}
                </p>
              ) : null}
            </div>

            {/* Right: map */}
            <div className="card">
              <MapPreview
                lat={typeof form.lat === 'number' ? form.lat : undefined}
                lng={typeof form.lng === 'number' ? form.lng : undefined}
                address={`${form.address}, ${form.zip} ${form.city}`}
              />
              {/* Optional: kleine Anzeige der Koordinaten */}
              {(typeof form.lat === 'number' || typeof form.lng === 'number') && (
                <div className="text-sm text-gray-700" style={{ marginTop: 8 }}>
                  {typeof form.lat === 'number' ? `lat: ${form.lat.toFixed(6)}` : null}{' '}
                  {typeof form.lng === 'number' ? `lng: ${form.lng.toFixed(6)}` : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}













