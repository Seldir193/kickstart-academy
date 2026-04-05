"use client";

import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { Booking, Status } from "./types";

import { useTranslation } from "react-i18next";

type Props = {
  booking: Booking;
  onClose: () => void;
  onConfirm: () => Promise<string>;
  onResend: () => Promise<string>;
  onSetStatus: (s: Status) => Promise<string>;
  onDelete: () => Promise<string>;
  onCancelConfirmed: () => Promise<string>;
  onApprovePayment: () => Promise<string>;
  notify: (text: string) => void;
  onUpdateBooking: (patch: Partial<Booking>) => void;
};

type MessageRow = {
  label?: string;
  value: string;
};

function ModalPortal({ children }: { children: React.ReactNode }) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}

function stripProgramTitle(raw?: string) {
  const text = safeText(raw);
  if (!text) return "—";
  const left = text.split("•")[0]?.trim();
  return left || text;
}

function fallbackCampRange(booking: Booking, lang?: string) {
  const from = safeText((booking as any)?.meta?.holidayFrom);
  const to = safeText((booking as any)?.meta?.holidayTo);

  if (!from && !to) return "—";

  const a = formatDateOnly(from || null, lang);
  const b = formatDateOnly(to || null, lang);

  if (a !== "—" && b !== "—") return `${a} – ${b}`;
  return a !== "—" ? a : b;
}

function safeText(v: unknown) {
  return String(v ?? "").trim();
}

function hasRealValue(v: unknown) {
  const t = safeText(v);
  return t !== "" && t !== "-" && t !== "—";
}

function pickValue(...values: unknown[]) {
  for (const value of values) {
    if (hasRealValue(value)) return safeText(value);
  }
  return "—";
}

function goalkeeperLabel(t: (key: string) => string, value: unknown) {
  const raw = safeText(value).toLowerCase();
  if (!raw || raw === "-" || raw === "—") {
    return t("common.admin.onlineBookings.dialog.goalkeeper.no");
  }
  if (raw === "nein" || raw === "false" || raw === "0") {
    return t("common.admin.onlineBookings.dialog.goalkeeper.no");
  }
  if (raw === "ja" || raw === "ja (+40€)" || raw === "true" || raw === "1") {
    return t("common.admin.onlineBookings.dialog.goalkeeper.yesExtra");
  }
  return safeText(value);
}

function renderStatus(t: (key: string) => string, status?: Booking["status"]) {
  const value = asStatus(status);

  if (value === "pending") {
    return t("common.admin.onlineBookings.status.pending");
  }
  if (value === "processing") {
    return t("common.admin.onlineBookings.status.processing");
  }
  if (value === "confirmed") {
    return t("common.admin.onlineBookings.status.confirmed");
  }
  if (value === "cancelled") {
    return t("common.admin.onlineBookings.status.cancelled");
  }
  if (value === "deleted") {
    return t("common.admin.onlineBookings.status.deleted");
  }
  return value;
}

function renderPaymentStatus(
  t: (key: string) => string,
  status?: Booking["paymentStatus"],
) {
  if (status === "open") {
    return t("common.admin.onlineBookings.payment.open");
  }
  if (status === "paid") {
    return t("common.admin.onlineBookings.payment.paid");
  }
  if (status === "returned") {
    return t("common.admin.onlineBookings.payment.returned");
  }
  return status ?? "—";
}

function dateLocale(lang?: string) {
  if (lang === "tr") return "tr-TR";
  if (lang === "en") return "en-US";
  return "de-DE";
}

function formatDate(value: string | undefined, lang?: string) {
  if (!value) return "—";
  const s = String(value);
  const d = new Date(s.length === 10 ? `${s}T00:00:00` : s);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat(dateLocale(lang), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function formatDateOnly(value?: string | null, lang?: string) {
  if (!value) return "—";
  const s = String(value);
  const d = new Date(s.length === 10 ? `${s}T00:00:00` : s);
  if (Number.isNaN(d.getTime())) return value;

  return new Intl.DateTimeFormat(dateLocale(lang), {
    dateStyle: "medium",
  }).format(d);
}

function asStatus(s?: Booking["status"]): Status {
  return (s ?? "pending") as Status;
}

function messageToLines(msg?: string): string[] {
  if (!msg) return [];
  let t = msg.trim();

  t = t
    .replace(/\s*,\s*Programm:/gi, "\nProgramm:")
    .replace(/\s*,\s*Ferien:/gi, "\nFerien:")
    .replace(/\s*,\s*Zeitraum:/gi, "\nZeitraum:")
    .replace(/\s*,\s*Ausgewählte Tage:/gi, "\nAusgewählte Tage:")
    .replace(/\s*,\s*T-Shirt-Größe \(Kind\):/gi, "\nT-Shirt-Größe (Kind):")
    .replace(/\s*,\s*Torwartschule \(Kind\):/gi, "\nTorwartschule (Kind):")
    .replace(/\s*,\s*Geschwisterkind:/gi, "\nGeschwisterkind:")
    .replace(
      /\s*,\s*Geschlecht \(Geschwister\):/gi,
      "\nGeschlecht (Geschwister):",
    )
    .replace(
      /\s*,\s*Geburtstag \(Geschwister\):/gi,
      "\nGeburtstag (Geschwister):",
    )
    .replace(/\s*,\s*Vorname \(Geschwister\):/gi, "\nVorname (Geschwister):")
    .replace(/\s*,\s*Nachname \(Geschwister\):/gi, "\nNachname (Geschwister):")
    .replace(
      /\s*,\s*T-Shirt-Größe \(Geschwister\):/gi,
      "\nT-Shirt-Größe (Geschwister):",
    )
    .replace(
      /\s*,\s*Torwartschule \(Geschwister\):/gi,
      "\nTorwartschule (Geschwister):",
    )
    .replace(/\s*,\s*Geschwister Name:/gi, "\nGeschwister Name:")
    .replace(/\s*,\s*Kind:/gi, "\nKind:")
    .replace(/\s*,\s*Geburtstag:/gi, "\nGeburtstag:")
    .replace(/\s*,\s*Kontakt:/gi, "\nKontakt:")
    .replace(/\s*,\s*Adresse:/gi, "\nAdresse:")
    .replace(/\s*,\s*Telefon:/gi, "\nTelefon:")
    .replace(/\s*,\s*Gutschein:/gi, "\nGutschein:")
    .replace(/\s*,\s*Quelle:/gi, "\nQuelle:");

  return t
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function splitLabelValue(line: string): { label?: string; value: string } {
  const i = line.indexOf(":");
  if (i === -1) return { value: line };
  const label = line.slice(0, i).trim();
  const value = line.slice(i + 1).trim();
  return { label, value };
}

function toLabelMap(lines: string[]) {
  return lines.reduce<Record<string, string>>((acc, line) => {
    const { label, value } = splitLabelValue(line);
    if (label) acc[label.toLowerCase()] = value || "—";
    return acc;
  }, {});
}

function detectHolidayKind(booking: Booking) {
  const haystack = [
    safeText(booking.offerType),
    safeText(booking.offerTitle),
    safeText((booking as any)?.message),
    safeText((booking as any)?.meta?.holidayType),
  ]
    .join(" ")
    .toLowerCase();

  if (haystack.includes("powertraining")) return "powertraining";
  if (haystack.includes("camp")) return "camp";
  return "holiday";
}

function row(label: string, value?: string): MessageRow {
  return { label, value: safeText(value) || "—" };
}

function buildKindLine(map: Record<string, string>, booking: Booking) {
  const raw = safeText(map["kind"]);
  const first = safeText(booking.firstName);
  const last = safeText(booking.lastName);
  const metaGender = safeText((booking as any)?.meta?.childGender);
  const fallbackName = [first, last].filter(Boolean).join(" ").trim() || "-";
  const fallbackGender = metaGender || "";

  if (!raw) {
    return fallbackGender
      ? `${fallbackName} (${fallbackGender})`
      : fallbackName;
  }

  const match = raw.match(/^(.*)\((.*)\)$/);
  if (!match) return raw;

  const rawName = safeText(match[1]);
  const rawGender = safeText(match[2]);
  const finalName = rawName || fallbackName;
  const finalGender = pickValue(rawGender, fallbackGender);

  if (!hasRealValue(finalGender)) return finalName;
  return `${finalName} (${finalGender})`;
}

function buildCampRows(
  t: (key: string) => string,
  lang: string,
  map: Record<string, string>,
  booking: Booking,
): MessageRow[] {
  const hasSibling =
    safeText(map["geschwisterkind"]).toLowerCase() === "ja" ||
    hasRealValue((booking as any)?.meta?.siblingGender) ||
    hasRealValue((booking as any)?.meta?.siblingBirthDate) ||
    hasRealValue((booking as any)?.meta?.siblingFirstName) ||
    hasRealValue((booking as any)?.meta?.siblingLastName) ||
    hasRealValue((booking as any)?.meta?.siblingTShirtSize) ||
    (booking as any)?.meta?.siblingGoalkeeperSchool === true;

  const rows: MessageRow[] = [
    {
      value: t(
        "common.admin.onlineBookings.dialog.message.holidayProgramRegistration",
      ),
    },
    row(
      t("common.admin.onlineBookings.dialog.message.holiday"),
      pickValue(map["ferien"], (booking as any)?.meta?.holidayLabel),
    ),
    row(
      t("common.admin.onlineBookings.dialog.message.period"),
      pickValue(map["zeitraum"], fallbackCampRange(booking, lang)),
    ),
    row(
      t("common.admin.onlineBookings.dialog.message.tShirtSizeChild"),
      pickValue(
        map["t-shirt-größe (kind)"],
        (booking as any)?.meta?.mainTShirtSize,
      ),
    ),
    row(
      t("common.admin.onlineBookings.dialog.message.goalkeeperSchoolChild"),
      goalkeeperLabel(
        t,
        pickValue(
          map["torwartschule (kind)"],
          (booking as any)?.meta?.mainGoalkeeperSchool === true ? "Ja" : "Nein",
        ),
      ),
    ),

    row(
      t("common.admin.onlineBookings.dialog.message.siblingBooking"),
      hasSibling
        ? t("common.admin.onlineBookings.dialog.yes")
        : t("common.admin.onlineBookings.dialog.no"),
    ),

    row(
      t("common.admin.onlineBookings.dialog.message.child"),
      buildKindLine(map, booking),
    ),
    row(
      t("common.admin.onlineBookings.dialog.message.birthDate"),
      pickValue(
        map["geburtstag"],
        formatDateOnly((booking as any)?.meta?.childBirthDate, lang),
      ),
    ),

    row(
      t("common.admin.onlineBookings.dialog.message.contact"),
      map["kontakt"],
    ),
    row(
      t("common.admin.onlineBookings.dialog.message.address"),
      map["adresse"],
    ),
    row(t("common.admin.onlineBookings.dialog.message.phone"), map["telefon"]),
    row(
      t("common.admin.onlineBookings.dialog.message.voucher"),
      pickValue(map["gutschein"], (booking as any)?.meta?.voucher),
    ),
    row(
      t("common.admin.onlineBookings.dialog.message.source"),
      pickValue(map["quelle"], (booking as any)?.meta?.source),
    ),
  ];

  if (!hasSibling) return rows;

  return [
    ...rows,

    {
      value: t("common.admin.onlineBookings.dialog.message.addSiblingBooking"),
    },
    row(
      t("common.admin.onlineBookings.dialog.message.genderSibling"),
      pickValue(
        map["geschlecht (geschwister)"],
        (booking as any)?.meta?.siblingGender,
      ),
    ),
    row(
      t("common.admin.onlineBookings.dialog.message.birthDateSibling"),
      pickValue(
        map["geburtstag (geschwister)"],
        formatDateOnly((booking as any)?.meta?.siblingBirthDate, lang),
      ),
    ),
    row(
      t("common.admin.onlineBookings.dialog.message.firstNameSibling"),
      pickValue(
        map["vorname (geschwister)"],
        (booking as any)?.meta?.siblingFirstName,
      ),
    ),
    row(
      t("common.admin.onlineBookings.dialog.message.lastNameSibling"),
      pickValue(
        map["nachname (geschwister)"],
        (booking as any)?.meta?.siblingLastName,
      ),
    ),
    row(
      t("common.admin.onlineBookings.dialog.message.tShirtSizeSibling"),
      pickValue(
        map["t-shirt-größe (geschwister)"],
        (booking as any)?.meta?.siblingTShirtSize,
      ),
    ),
    row(
      t("common.admin.onlineBookings.dialog.message.goalkeeperSchoolSibling"),
      goalkeeperLabel(
        t,
        pickValue(
          map["torwartschule (geschwister)"],
          (booking as any)?.meta?.siblingGoalkeeperSchool === true
            ? "Ja"
            : "Nein",
        ),
      ),
    ),
  ];
}

function buildPowerRows(
  t: (key: string) => string,
  lang: string,
  map: Record<string, string>,
  booking: Booking,
): MessageRow[] {
  return [
    {
      value: t(
        "common.admin.onlineBookings.dialog.message.holidayProgramRegistration",
      ),
    },
    row(
      t("common.admin.onlineBookings.dialog.message.holiday"),
      pickValue(map["ferien"], (booking as any)?.meta?.holidayLabel),
    ),
    row(
      t("common.admin.onlineBookings.dialog.message.period"),
      pickValue(map["zeitraum"], fallbackCampRange(booking, lang)),
    ),
    row(t("common.admin.onlineBookings.dialog.message.child"), map["kind"]),
    row(
      t("common.admin.onlineBookings.dialog.message.birthDate"),
      pickValue(
        map["geburtstag"],
        formatDateOnly((booking as any)?.meta?.childBirthDate, lang),
      ),
    ),
    row(
      t("common.admin.onlineBookings.dialog.message.contact"),
      map["kontakt"],
    ),
    row(
      t("common.admin.onlineBookings.dialog.message.address"),
      map["adresse"],
    ),
    row(t("common.admin.onlineBookings.dialog.message.phone"), map["telefon"]),
    row(
      t("common.admin.onlineBookings.dialog.message.voucher"),
      pickValue(map["gutschein"], (booking as any)?.meta?.voucher),
    ),
    row(
      t("common.admin.onlineBookings.dialog.message.source"),
      pickValue(map["quelle"], (booking as any)?.meta?.source),
    ),
  ];
}

function fallbackLabel(t: (key: string) => string, label?: string) {
  const key = safeText(label).toLowerCase();

  if (key === "kind") {
    return t("common.admin.onlineBookings.dialog.message.child");
  }
  if (key === "geburtstag") {
    return t("common.admin.onlineBookings.dialog.message.birthDate");
  }
  if (key === "kontakt") {
    return t("common.admin.onlineBookings.dialog.message.contact");
  }
  if (key === "adresse") {
    return t("common.admin.onlineBookings.dialog.message.address");
  }
  if (key === "telefon") {
    return t("common.admin.onlineBookings.dialog.message.phone");
  }
  if (key === "gutschein") {
    return t("common.admin.onlineBookings.dialog.message.voucher");
  }
  if (key === "quelle") {
    return t("common.admin.onlineBookings.dialog.message.source");
  }
  if (key === "ferien") {
    return t("common.admin.onlineBookings.dialog.message.holiday");
  }
  if (key === "zeitraum") {
    return t("common.admin.onlineBookings.dialog.message.period");
  }

  return label;
}

function buildFallbackRows(
  t: (key: string) => string,
  lines: string[],
): MessageRow[] {
  return lines
    .filter((line) => !/^programm\s*:/i.test(line))
    .map((line) => {
      const { label, value } = splitLabelValue(line);
      return label
        ? { label: fallbackLabel(t, label), value: value || "—" }
        : { value: line };
    });
}

function buildHolidayRows(
  t: (key: string) => string,
  lang: string,
  booking: Booking,
): MessageRow[] {
  const lines = messageToLines(booking.message);
  const map = toLabelMap(lines);
  const kind = detectHolidayKind(booking);

  if (kind === "camp") return buildCampRows(t, lang, map, booking);
  if (kind === "powertraining") return buildPowerRows(t, lang, map, booking);
  return buildFallbackRows(t, lines);
}

export default function OnlineBookingDialog({
  booking,
  onClose,
  onConfirm,
  onResend,
  onSetStatus,
  onDelete,
  onCancelConfirmed,
  onApprovePayment,
  notify,
  onUpdateBooking,
}: Props) {
  const { t, i18n } = useTranslation();
  const [busy, setBusy] = useState("");

  const s = booking.status ?? "pending";
  const showInvoiceDetails = booking.paymentStatus === "paid";

  const canShowProcessing = false;
  const canShowConfirm =
    s !== "confirmed" && s !== "cancelled" && s !== "deleted";
  const canShowCancel =
    s !== "cancelled" && s !== "deleted" && s !== "confirmed";
  const canShowPaymentApprove =
    s !== "cancelled" && s !== "deleted" && booking.paymentStatus !== "paid";

  const messageRows = useMemo(
    () => buildHolidayRows(t, i18n.language, booking),
    [t, i18n.language, booking],
  );

  async function run(action: string, fn: () => Promise<string>) {
    if (busy) return;

    try {
      setBusy(action);
      const text = await fn();
      notify(text);
      if (action === "delete") onClose();
    } catch (e: any) {
      notify(
        e?.message ||
          t("common.admin.onlineBookings.dialog.error.actionFailed"),
      );
    } finally {
      setBusy("");
    }
  }

  async function approvePayment() {
    const text = await onApprovePayment();

    onUpdateBooking({
      meta: {
        ...booking.meta,
        paymentApprovalRequired: false,
        paymentApprovedAt: new Date().toISOString(),
      },
    });

    return text;
  }

  return (
    <ModalPortal>
      <div
        className="dialog-backdrop online-booking-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={t("common.admin.onlineBookings.dialog.ariaLabel")}
      >
        <button
          type="button"
          className="dialog-backdrop-hit"
          aria-label={t("common.admin.onlineBookings.dialog.close")}
          onClick={onClose}
        />

        <div className="dialog online-booking-dialog__dialog">
          <div className="dialog-head online-booking-dialog__head">
            <div className="online-booking-dialog__head-main">
              <div className="online-booking-dialog__title-row">
                <h2 className="dialog-title online-booking-dialog__title">
                  {booking.firstName} {booking.lastName}
                </h2>

                <span
                  className={`badge ${
                    s === "cancelled" || s === "deleted" ? "badge-muted" : ""
                  }`}
                >
                  {renderStatus(t, booking.status)}
                </span>

                {booking.paymentStatus ? (
                  <span
                    className={`badge ${
                      booking.paymentStatus === "paid"
                        ? "badge-success"
                        : booking.paymentStatus === "returned"
                          ? "badge-danger"
                          : ""
                    }`}
                  >
                    {renderPaymentStatus(t, booking.paymentStatus)}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="dialog-head__actions">
              <button
                type="button"
                className="dialog-close"
                aria-label={t("common.admin.onlineBookings.dialog.close")}
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

          <div className="dialog-body online-booking-dialog__body">
            <div className="online-booking-dialog__grid">
              <section className="dialog-section online-booking-dialog__section">
                <div className="dialog-section__head">
                  <h3 className="dialog-section__title online-booking-dialog__section-title">
                    {t("common.admin.onlineBookings.dialog.section.booking")}
                  </h3>
                </div>

                <div className="dialog-section__body">
                  <div className="online-booking-dialog__details">
                    <div className="online-booking-dialog__row online-booking-dialog__row--full">
                      <div className="dialog-label">
                        {t("common.admin.onlineBookings.dialog.field.program")}
                      </div>
                      <div className="dialog-value">
                        {stripProgramTitle(booking.offerTitle)}
                      </div>
                    </div>

                    <div className="online-booking-dialog__row online-booking-dialog__row--full">
                      <div className="dialog-label">
                        {t("common.admin.onlineBookings.dialog.field.venue")}
                      </div>
                      <div className="dialog-value">{booking.venue || "—"}</div>
                    </div>

                    <div className="online-booking-dialog__row">
                      <div className="dialog-label">
                        {t("common.admin.onlineBookings.dialog.field.name")}
                      </div>
                      <div className="dialog-value">
                        {booking.firstName} {booking.lastName}
                      </div>
                    </div>

                    <div className="online-booking-dialog__row">
                      <div className="dialog-label">
                        {t("common.admin.onlineBookings.dialog.field.email")}
                      </div>
                      <div className="dialog-value">{booking.email || "—"}</div>
                    </div>

                    <div className="online-booking-dialog__row">
                      <div className="dialog-label">
                        {t("common.admin.onlineBookings.dialog.field.age")}
                      </div>
                      <div className="dialog-value">{booking.age ?? "—"}</div>
                    </div>

                    <div className="online-booking-dialog__row">
                      <div className="dialog-label">
                        {t(
                          "common.admin.onlineBookings.dialog.field.dateStart",
                        )}
                      </div>
                      <div className="dialog-value">
                        {formatDateOnly(booking.date, i18n.language)}
                      </div>
                    </div>

                    <div className="online-booking-dialog__row">
                      <div className="dialog-label">
                        {t("common.admin.onlineBookings.dialog.field.created")}
                      </div>
                      <div className="dialog-value">
                        {formatDate(booking.createdAt, i18n.language)}
                      </div>
                    </div>

                    <div className="online-booking-dialog__row">
                      <div className="dialog-label">
                        {t(
                          "common.admin.onlineBookings.dialog.field.paymentApprovedAt",
                        )}
                      </div>
                      <div className="dialog-value">
                        {booking.meta?.paymentApprovedAt
                          ? formatDate(
                              booking.meta.paymentApprovedAt,
                              i18n.language,
                            )
                          : "—"}
                      </div>
                    </div>

                    <div className="online-booking-dialog__row">
                      <div className="dialog-label">
                        {t(
                          "common.admin.onlineBookings.dialog.field.confirmationCode",
                        )}
                      </div>
                      <div className="dialog-value">
                        {booking.confirmationCode || "—"}
                      </div>
                    </div>

                    {showInvoiceDetails ? (
                      <>
                        <div className="online-booking-dialog__row">
                          <div className="dialog-label">
                            {t(
                              "common.admin.onlineBookings.dialog.field.invoiceNumber",
                            )}
                          </div>
                          <div className="dialog-value">
                            {booking.invoiceNumber || booking.invoiceNo || "—"}
                          </div>
                        </div>

                        <div className="online-booking-dialog__row">
                          <div className="dialog-label">
                            {t(
                              "common.admin.onlineBookings.dialog.field.invoiceDate",
                            )}
                          </div>
                          <div className="dialog-value">
                            {formatDateOnly(booking.invoiceDate, i18n.language)}
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              </section>

              <section className="dialog-section online-booking-dialog__section">
                <div className="dialog-section__head">
                  <h3 className="dialog-section__title online-booking-dialog__section-title">
                    {t("common.admin.onlineBookings.dialog.section.message")}
                  </h3>
                </div>

                <div className="dialog-section__body">
                  {messageRows.length ? (
                    <div className="online-booking-dialog__message-list">
                      {messageRows.map((row, i) => {
                        if (!row.label) {
                          return (
                            <div
                              key={i}
                              className="online-booking-dialog__message-line"
                            >
                              <div className="dialog-value">{row.value}</div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={i}
                            className="online-booking-dialog__message-row"
                          >
                            <div className="dialog-label">{row.label}</div>
                            <div className="dialog-value">
                              {row.value || "—"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="dialog-value">—</div>
                  )}
                </div>
              </section>
            </div>

            <div className="online-booking-dialog__actions">
              {canShowProcessing ? (
                <button
                  type="button"
                  className="btn"
                  aria-disabled={busy ? true : undefined}
                  onClick={() =>
                    run("processing", () => onSetStatus("processing"))
                  }
                >
                  {busy === "processing"
                    ? t("common.admin.onlineBookings.dialog.action.pleaseWait")
                    : t("common.admin.onlineBookings.dialog.action.processing")}
                </button>
              ) : null}

              {canShowConfirm ? (
                <button
                  type="button"
                  className="btn"
                  aria-disabled={busy ? true : undefined}
                  onClick={() => run("confirm", () => onConfirm())}
                >
                  {busy === "confirm"
                    ? t("common.admin.onlineBookings.dialog.action.pleaseWait")
                    : t("common.admin.onlineBookings.dialog.action.confirm")}
                </button>
              ) : null}

              {s === "confirmed" ? (
                <>
                  <button
                    type="button"
                    className="btn"
                    aria-disabled={busy ? true : undefined}
                    onClick={() => run("resend", () => onResend())}
                  >
                    {busy === "resend"
                      ? t(
                          "common.admin.onlineBookings.dialog.action.pleaseWait",
                        )
                      : t("common.admin.onlineBookings.dialog.action.resend")}
                  </button>

                  <button
                    type="button"
                    className="btn btn--danger"
                    aria-disabled={busy ? true : undefined}
                    onClick={() =>
                      run("cancelConfirmed", () => onCancelConfirmed())
                    }
                  >
                    {busy === "cancelConfirmed"
                      ? t(
                          "common.admin.onlineBookings.dialog.action.pleaseWait",
                        )
                      : t(
                          "common.admin.onlineBookings.dialog.action.cancelConfirmedBooking",
                        )}
                  </button>
                </>
              ) : null}

              {canShowCancel ? (
                <button
                  type="button"
                  className="btn"
                  aria-disabled={busy ? true : undefined}
                  onClick={() =>
                    run("cancelled", () => onSetStatus("cancelled"))
                  }
                >
                  {busy === "cancelled"
                    ? t("common.admin.onlineBookings.dialog.action.pleaseWait")
                    : t("common.admin.onlineBookings.dialog.action.cancel")}
                </button>
              ) : null}

              {canShowPaymentApprove ? (
                <button
                  type="button"
                  className="btn btn--success"
                  aria-disabled={busy ? true : undefined}
                  onClick={() => run("approvePayment", () => approvePayment())}
                >
                  {busy === "approvePayment"
                    ? t("common.admin.onlineBookings.dialog.action.pleaseWait")
                    : t(
                        "common.admin.onlineBookings.dialog.action.approvePayment",
                      )}
                </button>
              ) : null}

              {s !== "deleted" ? (
                <button
                  type="button"
                  className="btn btn--danger"
                  aria-disabled={busy ? true : undefined}
                  onClick={() => run("delete", () => onDelete())}
                >
                  {busy === "delete"
                    ? t("common.admin.onlineBookings.dialog.action.pleaseWait")
                    : t("common.admin.onlineBookings.dialog.action.delete")}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
