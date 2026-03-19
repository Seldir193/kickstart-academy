// src/app/admin/franchise-locations/FranchiseLocationDialog.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { FranchiseLocation, LocationPayload } from "./types";

type Props = {
  open: boolean;
  initial?: Partial<FranchiseLocation> | null;
  onClose: () => void;
  onSave: (payload: LocationPayload) => Promise<void>;
  onDelete?: (() => Promise<void> | void) | undefined;
};

function pickStr(v: any) {
  return String(v ?? "").trim();
}

function buildForm(initial?: Partial<FranchiseLocation> | null) {
  return {
    licenseeFirstName: pickStr(initial?.licenseeFirstName) || "",
    licenseeLastName: pickStr(initial?.licenseeLastName) || "",
    country: pickStr(initial?.country) || "",
    city: pickStr(initial?.city) || "",
    state: pickStr(initial?.state) || "",
    address: pickStr(initial?.address) || "",
    zip: pickStr(initial?.zip) || "",
    website: pickStr(initial?.website) || "",
    emailPublic: pickStr(initial?.emailPublic) || "",
    phonePublic: pickStr(initial?.phonePublic) || "",
  };
}

export default function FranchiseLocationDialog({
  open,
  initial,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const isEdit = Boolean(initial?.id);
  const title = useMemo(
    () => (isEdit ? "Standort bearbeiten" : "Standort hinzufügen"),
    [isEdit],
  );

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState(() => buildForm(initial));

  useEffect(() => {
    if (!open) return;
    setErr(null);
    setBusy(false);
    setForm(buildForm(initial));
  }, [open, initial?.id]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  async function submit() {
    setErr(null);

    const payload: LocationPayload = {
      licenseeFirstName: pickStr(form.licenseeFirstName),
      licenseeLastName: pickStr(form.licenseeLastName),
      country: pickStr(form.country),
      city: pickStr(form.city),
      state: pickStr(form.state),
      address: pickStr(form.address),
      zip: pickStr(form.zip),
      website: pickStr(form.website),
      emailPublic: pickStr(form.emailPublic),
      phonePublic: pickStr(form.phonePublic),
    };

    if (!payload.licenseeFirstName || !payload.licenseeLastName) {
      setErr("Vorname und Nachname sind Pflichtfelder.");
      return;
    }
    if (!payload.country || !payload.city) {
      setErr("Country und City sind Pflichtfelder.");
      return;
    }

    try {
      setBusy(true);
      await onSave(payload);
      onClose();
    } catch (e: any) {
      setErr(e?.message || "Speichern fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;
    const ok = confirm("Standort wirklich löschen?");
    if (!ok) return;

    try {
      setBusy(true);
      await onDelete();
      onClose();
    } catch (e: any) {
      setErr(e?.message || "Löschen fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ks-modal-root">
      <div className="ks-backdrop" onClick={onClose} />
      <div
        className="ks-panel card ks-panel--md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-head">
          <div className="dialog-head__left">
            <h2 className="text-xl font-bold">{title}</h2>
            <span className="badge">{isEdit ? "Edit" : "New"}</span>
          </div>

          <div className="dialog-head__actions">
            <button
              type="button"
              className="modal__close"
              aria-label="Close"
              onClick={onClose}
              disabled={busy}
            >
              <img
                src="/icons/close.svg"
                alt=""
                aria-hidden="true"
                className="icon-img"
              />
            </button>
          </div>
        </div>

        <div className="fl-dialog__hint">
          Neue/Geänderte Standorte sind erst sichtbar, wenn Superadmin freigibt.
        </div>

        {err ? <div className="mb-2 text-red-600">{err}</div> : null}

        <div className="fl-dialog__grid">
          <div className="field">
            <label className="lbl">Vorname *</label>
            <input
              className="input"
              value={form.licenseeFirstName}
              onChange={(e) =>
                setForm({ ...form, licenseeFirstName: e.target.value })
              }
            />
          </div>

          <div className="field">
            <label className="lbl">Nachname *</label>
            <input
              className="input"
              value={form.licenseeLastName}
              onChange={(e) =>
                setForm({ ...form, licenseeLastName: e.target.value })
              }
            />
          </div>

          <div className="field">
            <label className="lbl">Country *</label>
            <input
              className="input"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            />
          </div>

          <div className="field">
            <label className="lbl">City *</label>
            <input
              className="input"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </div>

          <div className="field">
            <label className="lbl">State/Region</label>
            <input
              className="input"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
            />
          </div>

          <div className="field">
            <label className="lbl">ZIP</label>
            <input
              className="input"
              value={form.zip}
              onChange={(e) => setForm({ ...form, zip: e.target.value })}
            />
          </div>

          <div className="field field--full">
            <label className="lbl">Address</label>
            <input
              className="input"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <div className="field">
            <label className="lbl">Website</label>
            <input
              className="input"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
            />
          </div>

          <div className="field">
            <label className="lbl">Public Email</label>
            <input
              className="input"
              value={form.emailPublic}
              onChange={(e) =>
                setForm({ ...form, emailPublic: e.target.value })
              }
            />
          </div>

          <div className="field">
            <label className="lbl">Public Phone</label>
            <input
              className="input"
              value={form.phonePublic}
              onChange={(e) =>
                setForm({ ...form, phonePublic: e.target.value })
              }
            />
          </div>
        </div>

        <div className="fl-dialog__footer">
          {onDelete && isEdit ? (
            <button
              className="btn btn--danger"
              onClick={handleDelete}
              disabled={busy}
              type="button"
            >
              Löschen
            </button>
          ) : (
            <span />
          )}

          <div className="fl-dialog__footer-right">
            <button
              className="btn"
              onClick={onClose}
              disabled={busy}
              type="button"
            >
              Abbrechen
            </button>
            <button
              className="btn"
              onClick={submit}
              disabled={busy}
              type="button"
            >
              {busy ? "Speichern…" : "Speichern"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
