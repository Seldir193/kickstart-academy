"use client";

import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { setSubscriptionEligible, weeklyApproveBooking } from "./api";

type Status = "pending" | "processing" | "confirmed" | "cancelled" | "deleted";

type BookingDetail = {
  child?: {
    firstName?: string;
    lastName?: string;
    gender?: string;
    birthDate?: string | null;
  } | null;
  parent?: {
    salutation?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  } | null;
  contact?: string;
  address?: string;
} | null;

export type Booking = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  date: string;
  level: string;
  message?: string;
  createdAt: string;
  status?: Status;
  confirmationCode?: string;
  source?: string;
  offerTitle?: string;
  offerType?: string;
  venue?: string;
  paymentStatus?: "open" | "paid" | "returned";
  paidAt?: string | null;
  returnedAt?: string | null;
  invoiceNumber?: string;
  invoiceNo?: string;
  invoiceDate?: string | null;
  detail?: BookingDetail;
  meta?: {
    subscriptionEligible?: boolean;
    subscriptionEligibleAt?: string | null;
    paymentApprovalRequired?: boolean;
    paymentApprovedAt?: string | null;
    paymentApprovalReason?: string;
    paymentApprovedEmailSentAt?: string | null;
  };
};

type Props = {
  booking: Booking;
  onClose: () => void;
  onConfirm: () => Promise<string>;
  onResend: () => Promise<string>;
  onSetStatus: (s: Status) => Promise<string>;
  onDelete: () => Promise<string>;
  onCancelConfirmed: () => Promise<string>;
  notify: (text: string) => void;
  onUpdateBooking: (patch: Partial<Booking>) => void;
};

function ModalPortal({ children }: { children: React.ReactNode }) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}

function safeText(v: unknown) {
  return String(v ?? "").trim();
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
    .replace(/\s*,\s*Geburtstag:/gi, "\nGeburtstag:")
    .replace(/\s*,\s*Kontakt:/gi, "\nKontakt:")
    .replace(/\s*,\s*Adresse:/gi, "\nAdresse:")
    .replace(/\s*,\s*Telefon:/gi, "\nTelefon:")
    .replace(/\s*,\s*Gutschein:/gi, "\nGutschein:")
    .replace(/\s*,\s*Quelle:/gi, "\nQuelle:")
    .replace(/\s*,\s*Kind:/gi, "\nKind:");

  t = t.replace(/^\s*Anmeldung\b/i, "Anmeldung");

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

function extractProgramName(msg?: string): string {
  if (!msg) return "";
  const m = msg.match(/Programm:\s*(.+)/i);
  return m ? m[1].trim() : "";
}

function extractAddress(msg?: string) {
  const lines = messageToLines(msg);
  for (const ln of lines) {
    const { label, value } = splitLabelValue(ln);
    if (!label) continue;
    if (label.toLowerCase().includes("adresse")) return value;
  }
  return "";
}

function inferProgram(booking: Booking) {
  const raw =
    safeText(booking.offerTitle) ||
    extractProgramName(booking.message) ||
    safeText(booking.offerType) ||
    safeText(booking.level);

  if (!raw) return "—";
  const left = raw.split("•")[0]?.trim();
  return left || raw;
}

function inferVenue(booking: Booking) {
  const directVenue = safeText(booking.venue);
  if (directVenue) return directVenue;

  const program = extractProgramName(booking.message);
  if (program && /•/.test(program)) {
    const parts = program.split("•");
    const tail = safeText(parts.slice(1).join("•"));
    if (tail) return tail;
  }

  const address = extractAddress(booking.message);
  return address || "—";
}

function inferBookingType(booking: Booking) {
  const program = inferProgram(booking).toLowerCase();
  const offerType = safeText(booking.offerType).toLowerCase();
  const offerTitle = safeText(booking.offerTitle).toLowerCase();
  const venue = safeText(booking.venue).toLowerCase();
  const joined = `${program} ${offerType} ${offerTitle} ${venue}`.trim();

  if (booking.meta?.subscriptionEligible) return "Weekly";

  if (
    /foerdertraining|kindergarten|torwarttraining|foerdertraining_athletik/.test(
      joined,
    )
  ) {
    return "Weekly";
  }

  if (
    /personaltraining|personal training|einzeltraining|1:1|1to1|individual|coach education|coacheducation|rent-a-coach|rentacoach|clubprogram|club program/.test(
      joined,
    )
  ) {
    return "One-Time";
  }

  if (booking.meta?.paymentApprovalRequired) return "One-Time";

  return booking.source === "admin_booking" ? "Intern" : "Online";
}

function childLine(detail: BookingDetail, booking: Booking) {
  const first = safeText(detail?.child?.firstName || booking.firstName);
  const last = safeText(detail?.child?.lastName || booking.lastName);
  const gender = safeText(detail?.child?.gender);
  const name = [first, last].filter(Boolean).join(" ").trim();
  if (!name) return "";
  return gender ? `${name} (${gender})` : name;
}

function adminMessageLines(booking: Booking, detail: BookingDetail) {
  const lines: string[] = [];
  const program = inferProgram(booking);
  const child = childLine(detail, booking);
  const birthDate = formatDateOnlyDe(detail?.child?.birthDate || null);
  const contact = safeText(detail?.contact);
  const address = safeText(detail?.address) || inferVenue(booking);
  const phone = safeText(detail?.parent?.phone);

  lines.push(`Anmeldung ${program}`);
  if (child) lines.push(`Kind: ${child}`);
  if (birthDate !== "—") lines.push(`Geburtstag: ${birthDate}`);
  if (contact) lines.push(`Kontakt: ${contact}`);
  if (address && address !== "—") lines.push(`Adresse: ${address}`);
  if (phone) lines.push(`Telefon: ${phone}`);
  return lines;
}

export default function BookingDialog({
  booking,
  onClose,
  onConfirm,
  onResend,
  onSetStatus,
  onDelete,
  onCancelConfirmed,
  notify,
  onUpdateBooking,
}: Props) {
  const [busy, setBusy] = useState("");

  const s = booking.status ?? "pending";
  const isAdminBooking = booking.source === "admin_booking";
  const programText = useMemo(() => inferProgram(booking), [booking]);
  const venueText = useMemo(() => inferVenue(booking), [booking]);
  const bookingType = useMemo(() => inferBookingType(booking), [booking]);
  const isWeeklyType = bookingType === "Weekly";
  const isOneTimeType = bookingType === "One-Time";
  const isWishDate = /schnuppertraining/i.test(booking.message || "");
  const showInvoiceDetails = booking.paymentStatus === "paid";

  const canShowProcessing = s === "pending" && !isAdminBooking;
  const canShowConfirm =
    s !== "confirmed" && s !== "cancelled" && s !== "deleted";
  const canShowCancel =
    s !== "cancelled" && s !== "deleted" && s !== "confirmed";

  const canShowSubscriptionApprove =
    isWeeklyType &&
    s !== "cancelled" &&
    s !== "deleted" &&
    booking.paymentStatus !== "paid";

  const canShowPaymentApprove =
    isOneTimeType &&
    s !== "cancelled" &&
    s !== "deleted" &&
    booking.paymentStatus !== "paid";

  const messageLines = useMemo(() => {
    if (isAdminBooking) {
      return adminMessageLines(booking, booking.detail || null);
    }

    const lines = messageToLines(booking.message);
    return lines.filter((ln) => {
      const { label } = splitLabelValue(ln);
      if (!label) return true;
      return !label.toLowerCase().includes("programm");
    });
  }, [booking, isAdminBooking]);

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

  async function setSubscriptionEligibleValue(eligible: boolean) {
    if (eligible) {
      const data = await weeklyApproveBooking(booking._id);

      onUpdateBooking({
        meta: {
          ...booking.meta,
          subscriptionEligible: true,
          subscriptionEligibleAt:
            data?.subscriptionEligibleAt || new Date().toISOString(),
        },
      });

      return "Für Abo freigegeben (E-Mail gesendet)";
    }

    const data = await setSubscriptionEligible({
      id: booking._id,
      eligible: false,
    });

    onUpdateBooking({
      meta: {
        ...booking.meta,
        subscriptionEligible: false,
        subscriptionEligibleAt: data?.subscriptionEligibleAt || null,
      },
    });

    return "Abo-Freigabe entfernt";
  }

  async function approvePayment() {
    const res = await fetch(
      `/api/admin/bookings/${booking._id}/approve-payment`,
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      },
    );

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.error || data?.message || "Aktion fehlgeschlagen");
    }

    onUpdateBooking({
      meta: {
        ...booking.meta,
        paymentApprovalRequired: false,
        paymentApprovedAt: data?.paymentApprovedAt || new Date().toISOString(),
        paymentApprovedEmailSentAt: data?.paymentApprovedEmailSentAt || null,
      },
    });

    return "Zahlung freigegeben (E-Mail gesendet)";
  }

  return (
    <ModalPortal>
      <div
        className="dialog-backdrop booking-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Booking details"
      >
        <button
          type="button"
          className="dialog-backdrop-hit"
          aria-label="Close"
          onClick={onClose}
        />

        <div className="dialog booking-dialog__dialog">
          <div className="dialog-head booking-dialog__head">
            <div className="booking-dialog__head-main">
              <div className="booking-dialog__title-row">
                <h2 className="dialog-title booking-dialog__title">
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
            </div>

            <div className="dialog-head__actions">
              <button
                type="button"
                className="dialog-close"
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

          <div className="dialog-body booking-dialog__body">
            <div className="booking-dialog__actions">
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
                  onClick={() =>
                    run("cancelled", () => onSetStatus("cancelled"))
                  }
                >
                  {busy === "cancelled" ? "Bitte warten…" : "Absagen"}
                </button>
              ) : null}

              {canShowSubscriptionApprove ? (
                <button
                  type="button"
                  className="btn"
                  aria-disabled={busy ? true : undefined}
                  onClick={() =>
                    run("eligible", () =>
                      setSubscriptionEligibleValue(
                        !(booking.meta?.subscriptionEligible === true),
                      ),
                    )
                  }
                >
                  {busy === "eligible"
                    ? "Bitte warten…"
                    : booking.meta?.subscriptionEligible
                      ? "Abo-Freigabe entfernen"
                      : "Für Abo freigeben"}
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

            <div className="booking-dialog__grid">
              <section className="dialog-section booking-dialog__section">
                <div className="dialog-section__head">
                  <h3 className="dialog-section__title">Buchung</h3>
                </div>

                <div className="dialog-section__body">
                  <div className="booking-dialog__details">
                    <div className="booking-dialog__row booking-dialog__row--full">
                      <div className="dialog-label">Programm</div>
                      <div className="dialog-value">{programText}</div>
                    </div>

                    <div className="booking-dialog__row booking-dialog__row--full">
                      <div className="dialog-label">Standort</div>
                      <div className="dialog-value">{venueText}</div>
                    </div>

                    <div className="booking-dialog__row">
                      <div className="dialog-label">Name</div>
                      <div className="dialog-value">
                        {booking.firstName} {booking.lastName}
                      </div>
                    </div>

                    <div className="booking-dialog__row">
                      <div className="dialog-label">E-Mail</div>
                      <div className="dialog-value">{booking.email || "—"}</div>
                    </div>

                    <div className="booking-dialog__row">
                      <div className="dialog-label">Alter</div>
                      <div className="dialog-value">{booking.age ?? "—"}</div>
                    </div>

                    <div className="booking-dialog__row">
                      <div className="dialog-label">
                        {isWishDate ? "Wunschtermin" : "Termin / Startdatum"}
                      </div>
                      <div className="dialog-value">
                        {formatDateOnlyDe(booking.date)}
                      </div>
                    </div>

                    <div className="booking-dialog__row">
                      <div className="dialog-label">Erstellt</div>
                      <div className="dialog-value">
                        {formatDateDe(booking.createdAt)}
                      </div>
                    </div>

                    <div className="booking-dialog__row">
                      <div className="dialog-label">
                        {isOneTimeType
                          ? "Zahlung freigegeben am"
                          : "Für Abo freigegeben am"}
                      </div>
                      <div className="dialog-value">
                        {isOneTimeType
                          ? booking.meta?.paymentApprovedAt
                            ? formatDateDe(booking.meta.paymentApprovedAt)
                            : "—"
                          : booking.meta?.subscriptionEligibleAt
                            ? formatDateDe(booking.meta.subscriptionEligibleAt)
                            : "—"}
                      </div>
                    </div>

                    <div className="booking-dialog__row">
                      <div className="dialog-label">Bestätigungscode</div>
                      <div className="dialog-value">
                        {booking.confirmationCode || "—"}
                      </div>
                    </div>

                    {showInvoiceDetails ? (
                      <>
                        <div className="booking-dialog__row">
                          <div className="dialog-label">Rechnungsnummer</div>
                          <div className="dialog-value">
                            {booking.invoiceNumber || booking.invoiceNo || "—"}
                          </div>
                        </div>

                        <div className="booking-dialog__row">
                          <div className="dialog-label">Rechnungsdatum</div>
                          <div className="dialog-value">
                            {formatDateOnlyDe(booking.invoiceDate)}
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              </section>

              <section className="dialog-section booking-dialog__section">
                <div className="dialog-section__head">
                  <h3 className="dialog-section__title">Nachricht</h3>
                </div>

                <div className="dialog-section__body">
                  {messageLines.length ? (
                    <ul className="card-list">
                      {messageLines.map((ln, i) => {
                        const { label, value } = splitLabelValue(ln);
                        return (
                          <li key={i}>
                            {label ? (
                              <>
                                <strong>{label}:</strong> {value || "—"}
                              </>
                            ) : (
                              ln
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="dialog-value">—</div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

// //src\app\admin\(app)\bookings\BookingDialog.tsx
// "use client";

// import React, { useMemo, useState } from "react";
// import { createPortal } from "react-dom";
// import { setSubscriptionEligible, weeklyApproveBooking } from "./api";

// type Status = "pending" | "processing" | "confirmed" | "cancelled" | "deleted";

// type BookingDetail = {
//   child?: {
//     firstName?: string;
//     lastName?: string;
//     gender?: string;
//     birthDate?: string | null;
//   } | null;
//   parent?: {
//     salutation?: string;
//     firstName?: string;
//     lastName?: string;
//     phone?: string;
//   } | null;
//   contact?: string;
//   address?: string;
// } | null;

// export type Booking = {
//   _id: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   age: number;
//   date: string;
//   level: string;
//   message?: string;
//   createdAt: string;
//   status?: Status;
//   confirmationCode?: string;
//   source?: string;
//   offerTitle?: string;
//   offerType?: string;
//   venue?: string;
//   paymentStatus?: "open" | "paid" | "returned";
//   paidAt?: string | null;
//   returnedAt?: string | null;
//   invoiceNumber?: string;
//   invoiceNo?: string;
//   invoiceDate?: string | null;
//   detail?: BookingDetail;
//   meta?: {
//     subscriptionEligible?: boolean;
//     subscriptionEligibleAt?: string | null;
//     paymentApprovalRequired?: boolean;
//     paymentApprovedAt?: string | null;
//     paymentApprovalReason?: string;
//     paymentApprovedEmailSentAt?: string | null;
//   };
// };

// type Props = {
//   booking: Booking;
//   onClose: () => void;
//   onConfirm: () => Promise<string>;
//   onResend: () => Promise<string>;
//   onSetStatus: (s: Status) => Promise<string>;
//   onDelete: () => Promise<string>;
//   onCancelConfirmed: () => Promise<string>;
//   notify: (text: string) => void;
//   onUpdateBooking: (patch: Partial<Booking>) => void;
// };

// function ModalPortal({ children }: { children: React.ReactNode }) {
//   if (typeof document === "undefined") return null;
//   return createPortal(children, document.body);
// }

// function safeText(v: unknown) {
//   return String(v ?? "").trim();
// }

// function formatDateDe(value?: string) {
//   if (!value) return "—";
//   const d = new Date(value);
//   if (Number.isNaN(d.getTime())) return value;
//   return new Intl.DateTimeFormat("de-DE", {
//     dateStyle: "medium",
//     timeStyle: "short",
//   }).format(d);
// }

// function formatDateOnlyDe(value?: string | null) {
//   if (!value) return "—";
//   const isoGuess = /T|\d{2}:\d{2}/.test(value) ? value : `${value}T00:00:00`;
//   const d = new Date(isoGuess);
//   if (Number.isNaN(d.getTime())) return value;
//   return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(d);
// }

// function asStatus(s?: Booking["status"]): Status {
//   return (s ?? "pending") as Status;
// }

// function messageToLines(msg?: string): string[] {
//   if (!msg) return [];
//   let t = msg.trim();

//   t = t
//     .replace(/\s*,\s*Geburtstag:/gi, "\nGeburtstag:")
//     .replace(/\s*,\s*Kontakt:/gi, "\nKontakt:")
//     .replace(/\s*,\s*Adresse:/gi, "\nAdresse:")
//     .replace(/\s*,\s*Telefon:/gi, "\nTelefon:")
//     .replace(/\s*,\s*Gutschein:/gi, "\nGutschein:")
//     .replace(/\s*,\s*Quelle:/gi, "\nQuelle:")
//     .replace(/\s*,\s*Kind:/gi, "\nKind:");

//   t = t.replace(/^\s*Anmeldung\b/i, "Anmeldung");

//   return t
//     .split("\n")
//     .map((s) => s.trim())
//     .filter(Boolean);
// }

// function splitLabelValue(line: string): { label?: string; value: string } {
//   const i = line.indexOf(":");
//   if (i === -1) return { value: line };
//   const label = line.slice(0, i).trim();
//   const value = line.slice(i + 1).trim();
//   return { label, value };
// }

// function extractProgramName(msg?: string): string {
//   if (!msg) return "";
//   const m = msg.match(/Programm:\s*(.+)/i);
//   return m ? m[1].trim() : "";
// }

// function extractAddress(msg?: string) {
//   const lines = messageToLines(msg);
//   for (const ln of lines) {
//     const { label, value } = splitLabelValue(ln);
//     if (!label) continue;
//     if (label.toLowerCase().includes("adresse")) return value;
//   }
//   return "";
// }

// function inferProgram(booking: Booking) {
//   const raw =
//     safeText(booking.offerTitle) ||
//     extractProgramName(booking.message) ||
//     safeText(booking.offerType) ||
//     safeText(booking.level);

//   if (!raw) return "—";
//   const left = raw.split("•")[0]?.trim();
//   return left || raw;
// }

// function inferVenue(booking: Booking) {
//   const directVenue = safeText(booking.venue);
//   if (directVenue) return directVenue;

//   const program = extractProgramName(booking.message);
//   if (program && /•/.test(program)) {
//     const parts = program.split("•");
//     const tail = safeText(parts.slice(1).join("•"));
//     if (tail) return tail;
//   }

//   const address = extractAddress(booking.message);
//   return address || "—";
// }

// function inferBookingType(booking: Booking) {
//   const program = inferProgram(booking).toLowerCase();
//   const offerType = safeText(booking.offerType).toLowerCase();
//   const offerTitle = safeText(booking.offerTitle).toLowerCase();
//   const venue = safeText(booking.venue).toLowerCase();
//   const joined = `${program} ${offerType} ${offerTitle} ${venue}`.trim();

//   if (booking.meta?.subscriptionEligible) return "Weekly";

//   if (
//     /foerdertraining|kindergarten|torwarttraining|foerdertraining_athletik/.test(
//       joined,
//     )
//   ) {
//     return "Weekly";
//   }

//   if (
//     /personaltraining|personal training|einzeltraining|1:1|1to1|individual|coach education|coacheducation|rent-a-coach|rentacoach|clubprogram|club program/.test(
//       joined,
//     )
//   ) {
//     return "One-Time";
//   }

//   if (booking.meta?.paymentApprovalRequired) return "One-Time";

//   return booking.source === "admin_booking" ? "Intern" : "Online";
// }

// function childLine(detail: BookingDetail, booking: Booking) {
//   const first = safeText(detail?.child?.firstName || booking.firstName);
//   const last = safeText(detail?.child?.lastName || booking.lastName);
//   const gender = safeText(detail?.child?.gender);
//   const name = [first, last].filter(Boolean).join(" ").trim();
//   if (!name) return "";
//   return gender ? `${name} (${gender})` : name;
// }

// function adminMessageLines(booking: Booking, detail: BookingDetail) {
//   const lines: string[] = [];
//   const program = inferProgram(booking);
//   const child = childLine(detail, booking);
//   const birthDate = formatDateOnlyDe(detail?.child?.birthDate || null);
//   const contact = safeText(detail?.contact);
//   const address = safeText(detail?.address) || inferVenue(booking);
//   const phone = safeText(detail?.parent?.phone);

//   lines.push(`Anmeldung ${program}`);
//   if (child) lines.push(`Kind: ${child}`);
//   if (birthDate !== "—") lines.push(`Geburtstag: ${birthDate}`);
//   if (contact) lines.push(`Kontakt: ${contact}`);
//   if (address && address !== "—") lines.push(`Adresse: ${address}`);
//   if (phone) lines.push(`Telefon: ${phone}`);
//   return lines;
// }

// export default function BookingDialog({
//   booking,
//   onClose,
//   onConfirm,
//   onResend,
//   onSetStatus,
//   onDelete,
//   onCancelConfirmed,
//   notify,
//   onUpdateBooking,
// }: Props) {
//   const [busy, setBusy] = useState("");

//   const s = booking.status ?? "pending";
//   const isAdminBooking = booking.source === "admin_booking";
//   const programText = useMemo(() => inferProgram(booking), [booking]);
//   const venueText = useMemo(() => inferVenue(booking), [booking]);
//   const bookingType = useMemo(() => inferBookingType(booking), [booking]);
//   const isWeeklyType = bookingType === "Weekly";
//   const isOneTimeType = bookingType === "One-Time";
//   const isWishDate = /schnuppertraining/i.test(booking.message || "");
//   const showInvoiceDetails = booking.paymentStatus === "paid";

//   const canShowProcessing = s === "pending" && !isAdminBooking;
//   const canShowConfirm =
//     s !== "confirmed" && s !== "cancelled" && s !== "deleted";
//   const canShowCancel =
//     s !== "cancelled" && s !== "deleted" && s !== "confirmed";

//   const canShowSubscriptionApprove =
//     isWeeklyType &&
//     s !== "cancelled" &&
//     s !== "deleted" &&
//     booking.paymentStatus !== "paid";

//   const canShowPaymentApprove =
//     isOneTimeType &&
//     s !== "cancelled" &&
//     s !== "deleted" &&
//     booking.paymentStatus !== "paid";

//   const messageLines = useMemo(() => {
//     if (isAdminBooking) {
//       return adminMessageLines(booking, booking.detail || null);
//     }

//     const lines = messageToLines(booking.message);
//     return lines.filter((ln) => {
//       const { label } = splitLabelValue(ln);
//       if (!label) return true;
//       return !label.toLowerCase().includes("programm");
//     });
//   }, [booking, isAdminBooking]);

//   async function run(action: string, fn: () => Promise<string>) {
//     if (busy) return;
//     try {
//       setBusy(action);
//       const text = await fn();
//       notify(text);
//       if (action === "delete") onClose();
//     } catch (e: any) {
//       notify(e?.message || "Aktion fehlgeschlagen");
//     } finally {
//       setBusy("");
//     }
//   }

//   async function setSubscriptionEligibleValue(eligible: boolean) {
//     if (eligible) {
//       const data = await weeklyApproveBooking(booking._id);

//       onUpdateBooking({
//         meta: {
//           ...booking.meta,
//           subscriptionEligible: true,
//           subscriptionEligibleAt:
//             data?.subscriptionEligibleAt || new Date().toISOString(),
//         },
//       });

//       return "Für Abo freigegeben (E-Mail gesendet)";
//     }

//     const data = await setSubscriptionEligible({
//       id: booking._id,
//       eligible: false,
//     });

//     onUpdateBooking({
//       meta: {
//         ...booking.meta,
//         subscriptionEligible: false,
//         subscriptionEligibleAt: data?.subscriptionEligibleAt || null,
//       },
//     });

//     return "Abo-Freigabe entfernt";
//   }

//   async function approvePayment() {
//     const res = await fetch(
//       `/api/admin/bookings/${booking._id}/approve-payment`,
//       {
//         method: "POST",
//         credentials: "include",
//         cache: "no-store",
//       },
//     );

//     const data = await res.json().catch(() => null);
//     if (!res.ok) {
//       throw new Error(data?.error || data?.message || "Aktion fehlgeschlagen");
//     }

//     onUpdateBooking({
//       meta: {
//         ...booking.meta,
//         paymentApprovalRequired: false,
//         paymentApprovedAt: data?.paymentApprovedAt || new Date().toISOString(),
//         paymentApprovedEmailSentAt: data?.paymentApprovedEmailSentAt || null,
//       },
//     });

//     return "Zahlung freigegeben (E-Mail gesendet)";
//   }

//   return (
//     <ModalPortal>
//       <div className="ks-modal-root ks-modal-root--top">
//         <div className="ks-backdrop" onClick={onClose} />
//         <div
//           className="ks-panel ks-panel--md card"
//           role="dialog"
//           aria-modal="true"
//           aria-label="Booking details"
//           onClick={(e) => e.stopPropagation()}
//         >
//           <div className="dialog-head">
//             <div className="dialog-head__left">
//               <h2 className="text-xl font-bold">
//                 {booking.firstName} {booking.lastName}
//               </h2>

//               <span
//                 className={`badge ${
//                   s === "cancelled" || s === "deleted" ? "badge-muted" : ""
//                 }`}
//               >
//                 {asStatus(booking.status)}
//               </span>

//               {booking.paymentStatus ? (
//                 <span
//                   className={`badge ${
//                     booking.paymentStatus === "paid"
//                       ? "badge-success"
//                       : booking.paymentStatus === "returned"
//                         ? "badge-danger"
//                         : ""
//                   }`}
//                 >
//                   {booking.paymentStatus}
//                 </span>
//               ) : null}
//             </div>

//             <div className="dialog-head__actions">
//               <button
//                 type="button"
//                 className="modal__close"
//                 aria-label="Close"
//                 onClick={onClose}
//               >
//                 <img
//                   src="/icons/close.svg"
//                   alt=""
//                   aria-hidden="true"
//                   className="icon-img"
//                 />
//               </button>
//             </div>
//           </div>

//           <div className="flex flex-wrap gap-2 justify-end mb-3">
//             {canShowProcessing ? (
//               <button
//                 type="button"
//                 className="btn"
//                 aria-disabled={busy ? true : undefined}
//                 onClick={() =>
//                   run("processing", () => onSetStatus("processing"))
//                 }
//               >
//                 {busy === "processing" ? "Bitte warten…" : "In Bearbeitung"}
//               </button>
//             ) : null}

//             {canShowConfirm ? (
//               <button
//                 type="button"
//                 className="btn"
//                 aria-disabled={busy ? true : undefined}
//                 onClick={() => run("confirm", () => onConfirm())}
//               >
//                 {busy === "confirm" ? "Bitte warten…" : "Bestätigen"}
//               </button>
//             ) : null}

//             {s === "confirmed" ? (
//               <>
//                 <button
//                   type="button"
//                   className="btn"
//                   aria-disabled={busy ? true : undefined}
//                   onClick={() => run("resend", () => onResend())}
//                 >
//                   {busy === "resend" ? "Bitte warten…" : "Erneut senden"}
//                 </button>

//                 <button
//                   type="button"
//                   className="btn btn--danger"
//                   aria-disabled={busy ? true : undefined}
//                   onClick={() =>
//                     run("cancelConfirmed", () => onCancelConfirmed())
//                   }
//                 >
//                   {busy === "cancelConfirmed"
//                     ? "Bitte warten…"
//                     : "Bestätigten Termin absagen"}
//                 </button>
//               </>
//             ) : null}

//             {canShowCancel ? (
//               <button
//                 type="button"
//                 className="btn"
//                 aria-disabled={busy ? true : undefined}
//                 onClick={() => run("cancelled", () => onSetStatus("cancelled"))}
//               >
//                 {busy === "cancelled" ? "Bitte warten…" : "Absagen"}
//               </button>
//             ) : null}

//             {canShowSubscriptionApprove ? (
//               <button
//                 type="button"
//                 className="btn"
//                 aria-disabled={busy ? true : undefined}
//                 onClick={() =>
//                   run("eligible", () =>
//                     setSubscriptionEligibleValue(
//                       !(booking.meta?.subscriptionEligible === true),
//                     ),
//                   )
//                 }
//               >
//                 {busy === "eligible"
//                   ? "Bitte warten…"
//                   : booking.meta?.subscriptionEligible
//                     ? "Abo-Freigabe entfernen"
//                     : "Für Abo freigeben"}
//               </button>
//             ) : null}

//             {canShowPaymentApprove ? (
//               <button
//                 type="button"
//                 className="btn btn--success"
//                 aria-disabled={busy ? true : undefined}
//                 onClick={() => run("approvePayment", () => approvePayment())}
//               >
//                 {busy === "approvePayment"
//                   ? "Bitte warten…"
//                   : "Zahlung freigeben"}
//               </button>
//             ) : null}

//             {s !== "deleted" ? (
//               <button
//                 type="button"
//                 className="btn btn--danger"
//                 aria-disabled={busy ? true : undefined}
//                 onClick={() => run("delete", () => onDelete())}
//               >
//                 {busy === "delete" ? "Bitte warten…" : "Löschen"}
//               </button>
//             ) : null}
//           </div>

//           <div className="form-columns mb-3">
//             <fieldset className="card">
//               <legend className="font-bold">Buchung</legend>
//               <div className="grid grid-cols-2 gap-2">
//                 <div className="col-span-2">
//                   <label className="lbl">Programm</label>
//                   <div>{programText}</div>
//                 </div>

//                 <div className="col-span-2">
//                   <label className="lbl">Standort</label>
//                   <div>{venueText}</div>
//                 </div>

//                 <div>
//                   <label className="lbl">Name</label>
//                   <div>
//                     {booking.firstName} {booking.lastName}
//                   </div>
//                 </div>

//                 <div>
//                   <label className="lbl">E-Mail</label>
//                   <div>{booking.email || "—"}</div>
//                 </div>

//                 <div>
//                   <label className="lbl">Alter</label>
//                   <div>{booking.age ?? "—"}</div>
//                 </div>

//                 <div>
//                   <label className="lbl">
//                     {isWishDate ? "Wunschtermin" : "Termin / Startdatum"}
//                   </label>
//                   <div>{formatDateOnlyDe(booking.date)}</div>
//                 </div>

//                 <div>
//                   <label className="lbl">Erstellt</label>
//                   <div>{formatDateDe(booking.createdAt)}</div>
//                 </div>

//                 <div>
//                   <label className="lbl">
//                     {isOneTimeType
//                       ? "Zahlung freigegeben am"
//                       : "Für Abo freigegeben am"}
//                   </label>
//                   <div>
//                     {isOneTimeType
//                       ? booking.meta?.paymentApprovedAt
//                         ? formatDateDe(booking.meta.paymentApprovedAt)
//                         : "—"
//                       : booking.meta?.subscriptionEligibleAt
//                         ? formatDateDe(booking.meta.subscriptionEligibleAt)
//                         : "—"}
//                   </div>
//                 </div>

//                 <div>
//                   <label className="lbl">Bestätigungscode</label>
//                   <div>{booking.confirmationCode || "—"}</div>
//                 </div>

//                 {showInvoiceDetails ? (
//                   <>
//                     <div>
//                       <label className="lbl">Rechnungsnummer</label>
//                       <div>
//                         {booking.invoiceNumber || booking.invoiceNo || "—"}
//                       </div>
//                     </div>

//                     <div>
//                       <label className="lbl">Rechnungsdatum</label>
//                       <div>{formatDateOnlyDe(booking.invoiceDate)}</div>
//                     </div>
//                   </>
//                 ) : null}
//               </div>
//             </fieldset>

//             <fieldset className="card">
//               <legend className="font-bold">Nachricht</legend>

//               {messageLines.length ? (
//                 <ul className="card-list">
//                   {messageLines.map((ln, i) => {
//                     const { label, value } = splitLabelValue(ln);
//                     return (
//                       <li key={i}>
//                         {label ? (
//                           <>
//                             <strong>{label}:</strong> {value || "—"}
//                           </>
//                         ) : (
//                           ln
//                         )}
//                       </li>
//                     );
//                   })}
//                 </ul>
//               ) : (
//                 <div>—</div>
//               )}
//             </fieldset>
//           </div>
//         </div>
//       </div>
//     </ModalPortal>
//   );
// }
