"use client";

import React, { useMemo } from "react";
import type { FranchiseLocation } from "../types";
import { useTranslation } from "react-i18next";
import { formatDateTime } from "../utils/dateFormat";

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
  const { t, i18n } = useTranslation();
  const it = item;

  const sections = useMemo(() => {
    if (!it) return null;

    const status = clean(it.status);
    const rejected = status.toLowerCase() === "rejected";

    return {
      header: {
        title: t("common.admin.franchiseLocations.infoDialog.title", {
          name: owner_label(it),
        }),
        status,
        updated: formatDateTime(it.updatedAt, i18n.language),
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
        updated: formatDateTime(it.updatedAt, i18n.language),
      },
      reject: rejected ? { reason: it.rejectionReason } : null,
    };
  }, [i18n.language, it, t]);

  if (!open || !it || !sections) return null;

  return (
    <div className="dialog-backdrop fl-info" role="dialog" aria-modal="true">
      <button
        type="button"
        className="dialog-backdrop-hit fl-info__backdrop-hit"
        aria-label={t("common.admin.franchiseLocations.infoDialog.close")}
        onClick={onClose}
      />

      <div className="dialog fl-info__dialog">
        <div className="dialog-head fl-info__head">
          <div className="fl-info__head-left">
            <div className="dialog-title fl-info__title">
              {sections.header.title}
            </div>
            <div className="dialog-subtitle fl-info__subtitle">
              {t("common.admin.franchiseLocations.infoDialog.subtitle")}
            </div>
          </div>

          <div className="fl-info__head-right">
            <div className="dialog-head__actions">
              <button
                type="button"
                className="dialog-close modal__close"
                aria-label={t(
                  "common.admin.franchiseLocations.infoDialog.close",
                )}
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
                <div className="dialog-section__title">
                  {t(
                    "common.admin.franchiseLocations.infoDialog.sections.location",
                  )}
                </div>
              </div>

              <div className="dialog-section__body fl-info__list">
                <Row
                  label={t(
                    "common.admin.franchiseLocations.infoDialog.fields.firstName",
                  )}
                  value={sections.location.firstName}
                />
                <Row
                  label={t(
                    "common.admin.franchiseLocations.infoDialog.fields.lastName",
                  )}
                  value={sections.location.lastName}
                />
                <Row
                  label={t(
                    "common.admin.franchiseLocations.infoDialog.fields.country",
                  )}
                  value={sections.location.country}
                />
                <Row
                  label={t(
                    "common.admin.franchiseLocations.infoDialog.fields.city",
                  )}
                  value={sections.location.city}
                />
                <Row
                  label={t(
                    "common.admin.franchiseLocations.infoDialog.fields.state",
                  )}
                  value={sections.location.state}
                />
                <Row
                  label={t(
                    "common.admin.franchiseLocations.infoDialog.fields.zip",
                  )}
                  value={sections.location.zip}
                  mono
                />
                <Row
                  label={t(
                    "common.admin.franchiseLocations.infoDialog.fields.address",
                  )}
                  value={sections.location.address}
                  multiline
                />
              </div>
            </section>

            <section className="dialog-section fl-info__section">
              <div className="dialog-section__head">
                <div className="dialog-section__title">
                  {t(
                    "common.admin.franchiseLocations.infoDialog.sections.contact",
                  )}
                </div>
              </div>

              <div className="dialog-section__body fl-info__list">
                <Row
                  label={t(
                    "common.admin.franchiseLocations.infoDialog.fields.website",
                  )}
                  value={sections.contact.website}
                />
                <Row
                  label={t(
                    "common.admin.franchiseLocations.infoDialog.fields.publicEmail",
                  )}
                  value={sections.contact.emailPublic}
                  mono
                />
                <Row
                  label={t(
                    "common.admin.franchiseLocations.infoDialog.fields.publicPhone",
                  )}
                  value={sections.contact.phonePublic}
                  mono
                />
              </div>
            </section>

            <section className="dialog-section fl-info__section fl-info__section--status">
              <div className="dialog-section__head">
                <div className="dialog-section__title">
                  {t(
                    "common.admin.franchiseLocations.infoDialog.sections.status",
                  )}
                </div>
              </div>

              <div className="dialog-section__body fl-info__list">
                <div className="fl-info__status-row">
                  <div className="dialog-label">
                    {t(
                      "common.admin.franchiseLocations.infoDialog.fields.status",
                    )}
                  </div>
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

                <Row
                  label={t(
                    "common.admin.franchiseLocations.infoDialog.fields.updated",
                  )}
                  value={sections.meta.updated}
                  mono
                />
              </div>
            </section>
            {sections.reject ? (
              <section className="dialog-section fl-info__section fl-info__section--danger">
                <div className="dialog-section__head">
                  <div className="dialog-section__title">
                    {t(
                      "common.admin.franchiseLocations.infoDialog.sections.rejection",
                    )}
                  </div>
                </div>

                <div className="dialog-section__body fl-info__list">
                  <Row
                    label={t(
                      "common.admin.franchiseLocations.infoDialog.fields.reason",
                    )}
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
