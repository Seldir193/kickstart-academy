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
    () => (isEdit ? "Edit location" : "Add location"),
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
      setErr("First name and last name are required.");
      return;
    }

    if (!payload.country || !payload.city) {
      setErr("Country and city are required.");
      return;
    }

    try {
      setBusy(true);
      await onSave(payload);
      onClose();
    } catch (e: any) {
      setErr(e?.message || "Saving failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;

    try {
      setBusy(true);
      await onDelete();
      onClose();
    } catch (e: any) {
      setErr(e?.message || "Deleting failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="dialog-backdrop fl-dialog" role="dialog" aria-modal="true">
      <button
        type="button"
        className="dialog-backdrop-hit fl-dialog__backdrop-hit"
        aria-label="Close"
        onClick={onClose}
      />

      <div className="dialog fl-dialog__dialog">
        <div className="dialog-head fl-dialog__head">
          <div className="fl-dialog__head-left">
            <div className="dialog-title fl-dialog__title">{title}</div>

            <div className="dialog-subtitle fl-dialog__subtitle">
              New or updated locations become visible only after superadmin
              approval.
            </div>

            <div className="fl-dialog__title-actions">
              <span className="dialog-status dialog-status--neutral">
                {isEdit ? "Edit" : "New"}
              </span>
            </div>
          </div>

          <div className="fl-dialog__head-right">
            <div className="dialog-head__actions">
              <button
                type="button"
                className="dialog-close modal__close"
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
        </div>

        <div className="dialog-body fl-dialog__body">
          {err ? <div className="error fl-dialog__error">{err}</div> : null}

          <div className="fl-dialog__grid">
            <div className="field">
              <label className="dialog-label">First name *</label>
              <input
                className="input"
                value={form.licenseeFirstName}
                onChange={(e) =>
                  setForm({ ...form, licenseeFirstName: e.target.value })
                }
              />
            </div>

            <div className="field">
              <label className="dialog-label">Last name *</label>
              <input
                className="input"
                value={form.licenseeLastName}
                onChange={(e) =>
                  setForm({ ...form, licenseeLastName: e.target.value })
                }
              />
            </div>

            <div className="field">
              <label className="dialog-label">Country *</label>
              <input
                className="input"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              />
            </div>

            <div className="field">
              <label className="dialog-label">City *</label>
              <input
                className="input"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>

            <div className="field">
              <label className="dialog-label">State/Region</label>
              <input
                className="input"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </div>

            <div className="field">
              <label className="dialog-label">ZIP</label>
              <input
                className="input"
                value={form.zip}
                onChange={(e) => setForm({ ...form, zip: e.target.value })}
              />
            </div>

            <div className="field field--full">
              <label className="dialog-label">Address</label>
              <input
                className="input"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            <div className="field">
              <label className="dialog-label">Website</label>
              <input
                className="input"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
            </div>

            <div className="field">
              <label className="dialog-label">Public email</label>
              <input
                className="input"
                value={form.emailPublic}
                onChange={(e) =>
                  setForm({ ...form, emailPublic: e.target.value })
                }
              />
            </div>

            <div className="field">
              <label className="dialog-label">Public phone</label>
              <input
                className="input"
                value={form.phonePublic}
                onChange={(e) =>
                  setForm({ ...form, phonePublic: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        <div className="dialog-footer fl-dialog__footer">
          <div className="fl-dialog__footer-left">
            {onDelete && isEdit ? (
              <button
                className="btn btn--danger"
                onClick={handleDelete}
                disabled={busy}
                type="button"
              >
                Delete
              </button>
            ) : (
              <span />
            )}
          </div>

          <div className="fl-dialog__footer-right">
            <button
              className="btn"
              onClick={submit}
              disabled={busy}
              type="button"
            >
              {busy ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
