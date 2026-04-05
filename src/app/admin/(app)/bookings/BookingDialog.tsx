//src\app\admin\(app)\bookings\BookingDialog.tsx
"use client";

import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { setSubscriptionEligible, weeklyApproveBooking } from "./api";
import { useTranslation } from "react-i18next";
import { formatDateOnly, formatDateTime } from "./utils";
import type { Booking, BookingDetail, Status } from "./types";
import { toastErrorMessage, toastText } from "@/lib/toast-messages";

type Props = {
  booking: Booking;
  onClose: () => void;

  onConfirm: () => Promise<unknown>;
  onResend: () => Promise<unknown>;
  onSetStatus: (s: Status) => Promise<unknown>;
  onDelete: () => Promise<unknown>;
  onCancelConfirmed: () => Promise<unknown>;
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

function asStatus(s?: Booking["status"]): Status {
  return (s ?? "pending") as Status;
}

function messageToLines(
  msg: string | undefined,
  t: (key: string) => string,
): string[] {
  if (!msg) return [];
  let text = msg.trim();

  text = text
    .replace(
      /\s*,\s*Geburtstag:/gi,
      `\n${t("common.admin.bookings.dialog.message.birthday")}:`,
    )
    .replace(
      /\s*,\s*Kontakt:/gi,
      `\n${t("common.admin.bookings.dialog.message.contact")}:`,
    )
    .replace(
      /\s*,\s*Adresse:/gi,
      `\n${t("common.admin.bookings.dialog.message.address")}:`,
    )
    .replace(
      /\s*,\s*Telefon:/gi,
      `\n${t("common.admin.bookings.dialog.message.phone")}:`,
    )
    .replace(
      /\s*,\s*Gutschein:/gi,
      `\n${t("common.admin.bookings.dialog.message.voucher")}:`,
    )
    .replace(
      /\s*,\s*Quelle:/gi,
      `\n${t("common.admin.bookings.dialog.message.source")}:`,
    )
    .replace(
      /\s*,\s*Kind:/gi,
      `\n${t("common.admin.bookings.dialog.message.child")}:`,
    );

  text = text.replace(
    /^\s*Anmeldung\b/i,
    t("common.admin.bookings.dialog.message.registration"),
  );

  return text
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

function extractAddress(msg: string | undefined, t: (key: string) => string) {
  const lines = messageToLines(msg, t);
  for (const ln of lines) {
    const { label, value } = splitLabelValue(ln);
    if (!label) continue;
    if (label.toLowerCase().includes("address")) return value;
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

function inferVenue(booking: Booking, t: (key: string) => string) {
  const directVenue = safeText(booking.venue);
  if (directVenue) return directVenue;

  const program = extractProgramName(booking.message);
  if (program && /•/.test(program)) {
    const parts = program.split("•");
    const tail = safeText(parts.slice(1).join("•"));
    if (tail) return tail;
  }

  const address = extractAddress(booking.message, t);
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

function adminMessageLines(
  booking: Booking,
  detail: BookingDetail,
  t: (key: string) => string,
  lang?: string,
) {
  const lines: string[] = [];
  const program = inferProgram(booking);
  const child = childLine(detail, booking);

  const birthDate = formatDateOnly(detail?.child?.birthDate || null, lang);
  const contact = safeText(detail?.contact);
  const address = safeText(detail?.address) || inferVenue(booking, t);
  const phone = safeText(detail?.parent?.phone);

  lines.push(
    `${t("common.admin.bookings.dialog.message.registration")} ${program}`,
  );
  if (child)
    lines.push(`${t("common.admin.bookings.dialog.message.child")}: ${child}`);
  if (birthDate !== "—")
    lines.push(
      `${t("common.admin.bookings.dialog.message.birthday")}: ${birthDate}`,
    );
  if (contact)
    lines.push(
      `${t("common.admin.bookings.dialog.message.contact")}: ${contact}`,
    );
  if (address && address !== "—")
    lines.push(
      `${t("common.admin.bookings.dialog.message.address")}: ${address}`,
    );
  if (phone)
    lines.push(`${t("common.admin.bookings.dialog.message.phone")}: ${phone}`);
  return lines;
}

function successMessageKey(action: string) {
  switch (action) {
    case "processing":
    case "cancelled":
      return "common.admin.bookings.notice.statusUpdated";
    case "confirm":
      return "common.admin.bookings.notice.confirmed";
    case "resend":
      return "common.admin.bookings.notice.confirmationResent";
    case "cancelConfirmed":
      return "common.admin.bookings.notice.cancelledConfirmed";
    case "delete":
      return "common.admin.bookings.notice.deleted";
    case "restore":
      return "common.admin.bookings.notice.restored";
    case "eligible":
      return "common.admin.bookings.notice.subscriptionUpdated";
    case "approvePayment":
      return "common.admin.bookings.notice.paymentApproved";
    default:
      return "common.admin.bookings.dialog.error.actionFailed";
  }
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
  const { t, i18n } = useTranslation();
  const [busy, setBusy] = useState("");

  const s = booking.status ?? "pending";
  const isAdminBooking = booking.source === "admin_booking";
  const programText = useMemo(() => inferProgram(booking), [booking]);
  const venueText = useMemo(() => inferVenue(booking, t), [booking, t]);
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
      return adminMessageLines(
        booking,
        booking.detail || null,
        t,
        i18n.language,
      );
    }

    const lines = messageToLines(booking.message, t);
    return lines.filter((ln) => {
      const { label } = splitLabelValue(ln);
      if (!label) return true;
      return !label.toLowerCase().includes("programm");
    });
  }, [booking, isAdminBooking, t, i18n.language]);

  async function run(action: string, fn: () => Promise<unknown>) {
    if (busy) return;
    try {
      setBusy(action);

      await fn();
      notify(toastText(t, successMessageKey(action)));
      if (action === "delete") onClose();
    } catch (e: any) {
      notify(
        toastErrorMessage(
          e,
          t,
          "common.admin.bookings.dialog.error.actionFailed",
        ),
      );
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
      throw new Error(
        data?.error ||
          data?.message ||
          t("common.admin.bookings.dialog.error.actionFailed"),
      );
    }

    onUpdateBooking({
      meta: {
        ...booking.meta,
        paymentApprovalRequired: false,
        paymentApprovedAt: data?.paymentApprovedAt || new Date().toISOString(),
        paymentApprovedEmailSentAt: data?.paymentApprovedEmailSentAt || null,
      },
    });
  }

  return (
    <ModalPortal>
      <div
        className="dialog-backdrop booking-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={t("common.admin.bookings.dialog.ariaLabel")}
      >
        <button
          type="button"
          className="dialog-backdrop-hit"
          aria-label={t("common.admin.bookings.dialog.close")}
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
                  {t(
                    `common.admin.bookings.status.${asStatus(booking.status)}`,
                  )}
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
                    {t(
                      `common.admin.bookings.payment.${booking.paymentStatus}`,
                    )}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="dialog-head__actions">
              <button
                type="button"
                className="dialog-close"
                aria-label={t("common.admin.bookings.dialog.close")}
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
            <div className="booking-dialog__grid">
              <section className="dialog-section booking-dialog__section">
                <div className="dialog-section__head">
                  <h3 className="dialog-section__title booking-dialog__section-title">
                    {t("common.admin.bookings.dialog.sections.booking")}
                  </h3>
                </div>

                <div className="dialog-section__body">
                  <div className="booking-dialog__details">
                    <div className="booking-dialog__row booking-dialog__row--full">
                      <div className="dialog-label">
                        {t("common.admin.bookings.dialog.labels.program")}
                      </div>
                      <div className="dialog-value">{programText}</div>
                    </div>

                    <div className="booking-dialog__row booking-dialog__row--full">
                      <div className="dialog-label">
                        {t("common.admin.bookings.dialog.labels.venue")}
                      </div>
                      <div className="dialog-value">{venueText}</div>
                    </div>

                    <div className="booking-dialog__row">
                      <div className="dialog-label">
                        {t("common.admin.bookings.dialog.labels.name")}
                      </div>
                      <div className="dialog-value">
                        {booking.firstName} {booking.lastName}
                      </div>
                    </div>

                    <div className="booking-dialog__row">
                      <div className="dialog-label">
                        {t("common.admin.bookings.dialog.labels.email")}
                      </div>

                      <div className="dialog-value">
                        {booking.email ||
                          t("common.admin.bookings.dialog.empty")}
                      </div>
                    </div>

                    <div className="booking-dialog__row">
                      <div className="dialog-label">
                        {t("common.admin.bookings.dialog.labels.age")}
                      </div>

                      <div className="dialog-value">
                        {booking.age ?? t("common.admin.bookings.dialog.empty")}
                      </div>
                    </div>

                    <div className="booking-dialog__row">
                      <div className="dialog-label">
                        {isWishDate
                          ? t(
                              "common.admin.bookings.dialog.labels.preferredDate",
                            )
                          : t(
                              "common.admin.bookings.dialog.labels.dateStartDate",
                            )}
                      </div>
                      <div className="dialog-value">
                        {formatDateOnly(booking.date, i18n.language)}
                      </div>
                    </div>

                    <div className="booking-dialog__row">
                      <div className="dialog-label">
                        {t("common.admin.bookings.dialog.labels.created")}
                      </div>
                      <div className="dialog-value">
                        {formatDateTime(booking.createdAt, i18n.language)}
                      </div>
                    </div>

                    <div className="booking-dialog__row">
                      <div className="dialog-label">
                        {isOneTimeType
                          ? t(
                              "common.admin.bookings.dialog.labels.paymentApprovedAt",
                            )
                          : t(
                              "common.admin.bookings.dialog.labels.subscriptionApprovedAt",
                            )}
                      </div>
                      <div className="dialog-value">
                        {isOneTimeType
                          ? booking.meta?.paymentApprovedAt
                            ? formatDateTime(
                                booking.meta.paymentApprovedAt,
                                i18n.language,
                              )
                            : "—"
                          : booking.meta?.subscriptionEligibleAt
                            ? formatDateTime(
                                booking.meta.subscriptionEligibleAt,
                                i18n.language,
                              )
                            : "—"}
                      </div>
                    </div>

                    <div className="booking-dialog__row">
                      <div className="dialog-label">
                        {t(
                          "common.admin.bookings.dialog.labels.confirmationCode",
                        )}
                      </div>
                      <div className="dialog-value">
                        {booking.confirmationCode ||
                          t("common.admin.bookings.dialog.empty")}
                      </div>
                    </div>

                    {showInvoiceDetails ? (
                      <>
                        <div className="booking-dialog__row">
                          <div className="dialog-label">
                            {t(
                              "common.admin.bookings.dialog.labels.invoiceNumber",
                            )}
                          </div>
                          <div className="dialog-value">
                            {booking.invoiceNumber ||
                              booking.invoiceNo ||
                              t("common.admin.bookings.dialog.empty")}
                          </div>
                        </div>

                        <div className="booking-dialog__row">
                          <div className="dialog-label">
                            {t(
                              "common.admin.bookings.dialog.labels.invoiceDate",
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

              <section className="dialog-section booking-dialog__section">
                <div className="dialog-section__head">
                  <h3 className="dialog-section__title booking-dialog__section-title">
                    {t("common.admin.bookings.dialog.sections.message")}
                  </h3>
                </div>

                <div className="dialog-section__body">
                  {messageLines.length ? (
                    <div className="booking-dialog__message-list">
                      {messageLines.map((ln, i) => {
                        const { label, value } = splitLabelValue(ln);

                        if (!label) {
                          return (
                            <div
                              key={i}
                              className="booking-dialog__message-line"
                            >
                              <div className="dialog-value">{ln}</div>
                            </div>
                          );
                        }

                        return (
                          <div key={i} className="booking-dialog__message-row">
                            <div className="dialog-label">{label}</div>

                            <div className="dialog-value">
                              {value || t("common.admin.bookings.dialog.empty")}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="dialog-value">
                      {t("common.admin.bookings.dialog.empty")}
                    </div>
                  )}
                </div>
              </section>
            </div>

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
                  {busy === "processing"
                    ? t("common.admin.bookings.dialog.actions.pleaseWait")
                    : t("common.admin.bookings.dialog.actions.processing")}
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
                    ? t("common.admin.bookings.dialog.actions.pleaseWait")
                    : t("common.admin.bookings.dialog.actions.confirm")}
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
                      ? t("common.admin.bookings.dialog.actions.pleaseWait")
                      : t("common.admin.bookings.dialog.actions.resend")}
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
                      ? t("common.admin.bookings.dialog.actions.pleaseWait")
                      : t(
                          "common.admin.bookings.dialog.actions.cancelConfirmedBooking",
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
                    ? t("common.admin.bookings.dialog.actions.pleaseWait")
                    : t("common.admin.bookings.dialog.actions.cancel")}
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
                    ? t("common.admin.bookings.dialog.actions.pleaseWait")
                    : booking.meta?.subscriptionEligible
                      ? t(
                          "common.admin.bookings.dialog.actions.removeSubscriptionApproval",
                        )
                      : t(
                          "common.admin.bookings.dialog.actions.approveForSubscription",
                        )}
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
                    ? t("common.admin.bookings.dialog.actions.pleaseWait")
                    : t("common.admin.bookings.dialog.actions.approvePayment")}
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
                    ? t("common.admin.bookings.dialog.actions.pleaseWait")
                    : t("common.admin.bookings.dialog.actions.delete")}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
