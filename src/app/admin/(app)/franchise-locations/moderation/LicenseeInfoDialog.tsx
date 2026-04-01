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

function status_class(status: string) {
  const s = clean(status).toLowerCase();
  if (s === "approved") return "dialog-status--success";
  if (s === "pending") return "dialog-status--warning";
  if (s === "rejected") return "dialog-status--danger";
  return "dialog-status--neutral";
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
      <div className="dialog-label">{label}</div>
      <div className={`dialog-value ${mono ? "is-mono" : ""}`}>{text}</div>
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
        title: `Licensee: ${owner_label(it)}`,
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
    <div className="dialog-backdrop fl-info" role="dialog" aria-modal="true">
      <button
        type="button"
        className="dialog-backdrop-hit fl-info__backdrop-hit"
        aria-label="Close"
        onClick={onClose}
      />

      <div className="dialog fl-info__dialog">
        <div className="dialog-head fl-info__head">
          <div className="fl-info__head-left">
            <div className="dialog-title fl-info__title">
              {sections.header.title}
            </div>
            <div className="dialog-subtitle fl-info__subtitle">
              View only — superadmin cannot edit anything here.
            </div>
          </div>

          <div className="fl-info__head-right">
            <div className="dialog-head__actions">
              <button
                type="button"
                className="dialog-close modal__close"
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

        <div className="dialog-body fl-info__body">
          <div className="fl-info__grid">
            <section className="dialog-section fl-info__section">
              <div className="dialog-section__head">
                <div className="dialog-section__title">Location details</div>
              </div>

              <div className="dialog-section__body fl-info__list">
                <Row label="First name" value={sections.location.firstName} />
                <Row label="Last name" value={sections.location.lastName} />
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

            <section className="dialog-section fl-info__section">
              <div className="dialog-section__head">
                <div className="dialog-section__title">Contact</div>
              </div>

              <div className="dialog-section__body fl-info__list">
                <Row label="Website" value={sections.contact.website} />
                <Row
                  label="Public email"
                  value={sections.contact.emailPublic}
                  mono
                />
                <Row
                  label="Public phone"
                  value={sections.contact.phonePublic}
                  mono
                />
              </div>
            </section>

            <section className="dialog-section fl-info__section fl-info__section--status">
              <div className="dialog-section__head">
                <div className="dialog-section__title">Status</div>
              </div>

              <div className="dialog-section__body fl-info__list">
                <div className="fl-info__status-row">
                  <div className="dialog-label">Status</div>
                  <div className="dialog-value">
                    <span
                      className={`dialog-status ${status_class(
                        sections.meta.status,
                      )}`}
                    >
                      {val(sections.meta.status)}
                    </span>
                  </div>
                </div>

                <Row label="Updated" value={sections.meta.updated} mono />
              </div>
            </section>
            {sections.reject ? (
              <section className="dialog-section fl-info__section fl-info__section--danger">
                <div className="dialog-section__head">
                  <div className="dialog-section__title">Rejection reason</div>
                </div>

                <div className="dialog-section__body fl-info__list">
                  <Row
                    label="Reason"
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
  );
}
