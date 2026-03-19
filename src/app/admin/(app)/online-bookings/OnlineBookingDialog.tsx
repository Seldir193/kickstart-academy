"use client";

import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { Booking } from "./types";

type Status = "pending" | "processing" | "confirmed" | "cancelled" | "deleted";

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

function fallbackCampRange(booking: Booking) {
  const from = safeText((booking as any)?.meta?.holidayFrom);
  const to = safeText((booking as any)?.meta?.holidayTo);

  if (!from && !to) return "—";

  const a = formatDateOnlyDe(from || null);
  const b = formatDateOnlyDe(to || null);

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

function goalkeeperLabel(value: unknown) {
  const raw = safeText(value).toLowerCase();
  if (!raw || raw === "-" || raw === "—") return "Nein";
  if (raw === "nein" || raw === "false" || raw === "0") return "Nein";
  if (raw === "ja" || raw === "ja (+40€)" || raw === "true" || raw === "1") {
    return "Ja (+40€)";
  }
  return safeText(value);
}

function formatDateDe(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function formatDateOnlyDe(value?: string | null) {
  if (!value) return "—";
  const isoGuess = /T|\d{2}:\d{2}/.test(value) ? value : `${value}T00:00:00`;
  const d = new Date(isoGuess);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(d);
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
    { value: "Anmeldung Ferienprogramm" },
    row(
      "Ferien",
      pickValue(map["ferien"], (booking as any)?.meta?.holidayLabel),
    ),
    row("Zeitraum", pickValue(map["zeitraum"], fallbackCampRange(booking))),
    row(
      "T-Shirt-Größe (Kind)",
      pickValue(
        map["t-shirt-größe (kind)"],
        (booking as any)?.meta?.mainTShirtSize,
      ),
    ),
    row(
      "Torwartschule (Kind)",
      goalkeeperLabel(
        pickValue(
          map["torwartschule (kind)"],
          (booking as any)?.meta?.mainGoalkeeperSchool === true ? "Ja" : "Nein",
        ),
      ),
    ),
    row("Geschwisterkind", hasSibling ? "Ja" : "Nein"),
    row("Kind", buildKindLine(map, booking)),
    row(
      "Geburtstag",
      pickValue(
        map["geburtstag"],
        formatDateOnlyDe((booking as any)?.meta?.childBirthDate),
      ),
    ),
    row("Kontakt", map["kontakt"]),
    row("Adresse", map["adresse"]),
    row("Telefon", map["telefon"]),
    row(
      "Gutschein",
      pickValue(map["gutschein"], (booking as any)?.meta?.voucher),
    ),
    row("Quelle", pickValue(map["quelle"], (booking as any)?.meta?.source)),
  ];

  if (!hasSibling) return rows;

  return [
    ...rows,
    { value: "Geschwister dazu buchen" },
    row(
      "Geschlecht (Geschwister)",
      pickValue(
        map["geschlecht (geschwister)"],
        (booking as any)?.meta?.siblingGender,
      ),
    ),
    row(
      "Geburtstag (Geschwister)",
      pickValue(
        map["geburtstag (geschwister)"],
        formatDateOnlyDe((booking as any)?.meta?.siblingBirthDate),
      ),
    ),
    row(
      "Vorname (Geschwister)",
      pickValue(
        map["vorname (geschwister)"],
        (booking as any)?.meta?.siblingFirstName,
      ),
    ),
    row(
      "Nachname (Geschwister)",
      pickValue(
        map["nachname (geschwister)"],
        (booking as any)?.meta?.siblingLastName,
      ),
    ),
    row(
      "T-Shirt-Größe (Geschwister)",
      pickValue(
        map["t-shirt-größe (geschwister)"],
        (booking as any)?.meta?.siblingTShirtSize,
      ),
    ),
    row(
      "Torwartschule (Geschwister)",
      goalkeeperLabel(
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
  map: Record<string, string>,
  booking: Booking,
): MessageRow[] {
  return [
    { value: "Anmeldung Ferienprogramm" },
    row(
      "Ferien",
      pickValue(map["ferien"], (booking as any)?.meta?.holidayLabel),
    ),
    row("Zeitraum", pickValue(map["zeitraum"], fallbackCampRange(booking))),
    row("Kind", map["kind"]),
    row("Geburtstag", map["geburtstag"]),
    row("Kontakt", map["kontakt"]),
    row("Adresse", map["adresse"]),
    row("Telefon", map["telefon"]),
    row(
      "Gutschein",
      pickValue(map["gutschein"], (booking as any)?.meta?.voucher),
    ),
    row("Quelle", pickValue(map["quelle"], (booking as any)?.meta?.source)),
  ];
}

function buildFallbackRows(lines: string[]): MessageRow[] {
  return lines
    .filter((line) => !/^programm\s*:/i.test(line))
    .map((line) => {
      const { label, value } = splitLabelValue(line);
      return label ? { label, value: value || "—" } : { value: line };
    });
}

function buildHolidayRows(booking: Booking): MessageRow[] {
  const lines = messageToLines(booking.message);
  const map = toLabelMap(lines);
  const kind = detectHolidayKind(booking);

  if (kind === "camp") return buildCampRows(map, booking);
  if (kind === "powertraining") return buildPowerRows(map, booking);
  return buildFallbackRows(lines);
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

  const messageRows = useMemo(() => buildHolidayRows(booking), [booking]);

  async function run(action: string, fn: () => Promise<string>) {
    if (busy) return;

    try {
      setBusy(action);
      const text = await fn();
      notify(text);
      if (action === "delete") onClose();
    } catch (e: any) {
      notify(e?.message || "Aktion fehlgeschlagen");
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
      <div className="ks-modal-root ks-modal-root--top">
        <div className="ks-backdrop" onClick={onClose} />
        <div
          className="ks-panel ks-panel--md card"
          role="dialog"
          aria-modal="true"
          aria-label="Online booking details"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="dialog-head">
            <div className="dialog-head__left">
              <h2 className="text-xl font-bold">
                {booking.firstName} {booking.lastName}
              </h2>

              <span
                className={`badge ${
                  s === "cancelled" || s === "deleted" ? "badge-muted" : ""
                }`}
              >
                {asStatus(booking.status)}
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
                  {booking.paymentStatus}
                </span>
              ) : null}
            </div>

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

          <div className="flex flex-wrap gap-2 justify-end mb-3">
            {canShowProcessing ? (
              <button
                type="button"
                className="btn"
                aria-disabled={busy ? true : undefined}
                onClick={() =>
                  run("processing", () => onSetStatus("processing"))
                }
              >
                {busy === "processing" ? "Bitte warten…" : "In Bearbeitung"}
              </button>
            ) : null}

            {canShowConfirm ? (
              <button
                type="button"
                className="btn"
                aria-disabled={busy ? true : undefined}
                onClick={() => run("confirm", () => onConfirm())}
              >
                {busy === "confirm" ? "Bitte warten…" : "Bestätigen"}
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
                  {busy === "resend" ? "Bitte warten…" : "Erneut senden"}
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
                    ? "Bitte warten…"
                    : "Bestätigten Termin absagen"}
                </button>
              </>
            ) : null}

            {canShowCancel ? (
              <button
                type="button"
                className="btn"
                aria-disabled={busy ? true : undefined}
                onClick={() => run("cancelled", () => onSetStatus("cancelled"))}
              >
                {busy === "cancelled" ? "Bitte warten…" : "Absagen"}
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
                  ? "Bitte warten…"
                  : "Zahlung freigeben"}
              </button>
            ) : null}

            {s !== "deleted" ? (
              <button
                type="button"
                className="btn btn--danger"
                aria-disabled={busy ? true : undefined}
                onClick={() => run("delete", () => onDelete())}
              >
                {busy === "delete" ? "Bitte warten…" : "Löschen"}
              </button>
            ) : null}
          </div>

          <div className="form-columns mb-3">
            <fieldset className="card">
              <legend className="font-bold">Buchung</legend>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <label className="lbl">Programm</label>
                  <div>{stripProgramTitle(booking.offerTitle)}</div>
                </div>

                <div className="col-span-2">
                  <label className="lbl">Standort</label>
                  <div>{booking.venue || "—"}</div>
                </div>

                <div>
                  <label className="lbl">Name</label>
                  <div>
                    {booking.firstName} {booking.lastName}
                  </div>
                </div>

                <div>
                  <label className="lbl">E-Mail</label>
                  <div>{booking.email || "—"}</div>
                </div>

                <div>
                  <label className="lbl">Alter</label>
                  <div>{booking.age ?? "—"}</div>
                </div>

                <div>
                  <label className="lbl">Termin / Startdatum</label>
                  <div>{formatDateOnlyDe(booking.date)}</div>
                </div>

                <div>
                  <label className="lbl">Erstellt</label>
                  <div>{formatDateDe(booking.createdAt)}</div>
                </div>

                <div>
                  <label className="lbl">Zahlung freigegeben am</label>
                  <div>
                    {booking.meta?.paymentApprovedAt
                      ? formatDateDe(booking.meta.paymentApprovedAt)
                      : "—"}
                  </div>
                </div>

                <div>
                  <label className="lbl">Bestätigungscode</label>
                  <div>{booking.confirmationCode || "—"}</div>
                </div>

                {showInvoiceDetails ? (
                  <>
                    <div>
                      <label className="lbl">Rechnungsnummer</label>
                      <div>
                        {booking.invoiceNumber || booking.invoiceNo || "—"}
                      </div>
                    </div>

                    <div>
                      <label className="lbl">Rechnungsdatum</label>
                      <div>{formatDateOnlyDe(booking.invoiceDate)}</div>
                    </div>
                  </>
                ) : null}
              </div>
            </fieldset>

            <fieldset className="card">
              <legend className="font-bold">Nachricht</legend>

              {messageRows.length ? (
                <ul className="card-list">
                  {messageRows.map((row, i) => (
                    <li key={i}>
                      {row.label ? (
                        <>
                          <strong>{row.label}:</strong> {row.value || "—"}
                        </>
                      ) : (
                        row.value
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div>—</div>
              )}
            </fieldset>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
