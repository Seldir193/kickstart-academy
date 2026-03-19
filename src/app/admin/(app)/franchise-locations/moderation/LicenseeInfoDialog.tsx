// src/app/admin/franchise-locations/moderation/LicenseeInfoDialog.tsx
"use client";

import React, { useMemo } from "react";
import type { FranchiseLocation } from "../types";

type Props = {
  open: boolean;
  item: FranchiseLocation | null;
  onClose: () => void;
};

function clean(v: any) {
  return String(v ?? "").trim();
}

function val(v: any) {
  const s = clean(v);
  return s ? s : "—";
}

function owner_label(it: FranchiseLocation) {
  const name =
    `${clean(it.licenseeFirstName)} ${clean(it.licenseeLastName)}`.trim();
  return (
    name ||
    val(it.ownerName) ||
    val(it.ownerEmail) ||
    val(it.ownerId || it.owner)
  );
}

function fmt_date(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function StatusBadge({ status }: { status: string }) {
  const s = clean(status).toLowerCase();
  const cls =
    s === "approved"
      ? "is-approved"
      : s === "pending"
        ? "is-pending"
        : s === "rejected"
          ? "is-rejected"
          : "is-neutral";

  return <span className={`fl-info__badge ${cls}`}>{val(status)}</span>;
}

function Row({
  label,
  value,
  mono,
  multiline,
}: {
  label: string;
  value: any;
  mono?: boolean;
  multiline?: boolean;
}) {
  const text = val(value);
  return (
    <div className={`fl-info__row ${multiline ? "is-multiline" : ""}`}>
      <div className="fl-info__label">{label}</div>
      <div className={`fl-info__value ${mono ? "is-mono" : ""}`}>{text}</div>
    </div>
  );
}

export default function LicenseeInfoDialog({ open, item, onClose }: Props) {
  const it = item;

  const sections = useMemo(() => {
    if (!it) return null;

    const status = clean(it.status);
    const rejected = status.toLowerCase() === "rejected";

    return {
      header: {
        title: `Lizenznehmer: ${owner_label(it)}`,
        status,
        updated: fmt_date(it.updatedAt),
      },
      location: {
        firstName: it.licenseeFirstName,
        lastName: it.licenseeLastName,
        country: it.country,
        city: it.city,
        state: it.state,
        zip: it.zip,
        address: it.address,
      },
      contact: {
        website: it.website,
        emailPublic: it.emailPublic,
        phonePublic: it.phonePublic,
      },
      meta: {
        status,
        updated: fmt_date(it.updatedAt),
      },
      reject: rejected ? { reason: it.rejectionReason } : null,
    };
  }, [it]);

  if (!open || !it || !sections) return null;

  return (
    <div className="modal fl-info" role="dialog" aria-modal="true">
      <div className="modal__overlay" onClick={onClose} />

      <div className="modal__panel modal__panel--md">
        <div className="card fl-info__card">
          <div className="fl-info__head">
            <div className="fl-info__head-left">
              <div className="fl-info__title">{sections.header.title}</div>
              <div className="fl-info__subtitle">
                Nur Ansicht – Superadmin kann hier nichts ändern
              </div>
            </div>

            <div className="fl-info__head-right">
              <StatusBadge status={sections.header.status} />

              <div className="dialog-head__actions">
                <button
                  type="button"
                  className="modal__close"
                  aria-label="Close"
                  onClick={onClose}
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

          <div className="fl-info__body">
            <div className="fl-info__grid">
              <section className="fl-info__section">
                <div className="fl-info__section-title">Standortdaten</div>
                <div className="fl-info__list">
                  <Row label="Vorname" value={sections.location.firstName} />
                  <Row label="Nachname" value={sections.location.lastName} />
                  <Row label="Country" value={sections.location.country} />
                  <Row label="City" value={sections.location.city} />
                  <Row label="State/Region" value={sections.location.state} />
                  <Row label="ZIP" value={sections.location.zip} mono />
                  <Row
                    label="Address"
                    value={sections.location.address}
                    multiline
                  />
                </div>
              </section>

              <section className="fl-info__section">
                <div className="fl-info__section-title">Kontakt</div>
                <div className="fl-info__list">
                  <Row label="Website" value={sections.contact.website} />
                  <Row
                    label="Public Email"
                    value={sections.contact.emailPublic}
                    mono
                  />
                  <Row
                    label="Public Phone"
                    value={sections.contact.phonePublic}
                    mono
                  />
                </div>
              </section>

              <section className="fl-info__section">
                <div className="fl-info__section-title">Status</div>
                <div className="fl-info__list">
                  <Row label="Status" value={sections.meta.status} />
                  <Row label="Updated" value={sections.meta.updated} mono />
                </div>
              </section>

              {sections.reject ? (
                <section className="fl-info__section fl-info__section--danger">
                  <div className="fl-info__section-title">Reject Grund</div>
                  <div className="fl-info__list">
                    <Row
                      label="Begründung"
                      value={sections.reject.reason}
                      multiline
                    />
                  </div>
                </section>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
