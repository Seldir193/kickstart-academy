import { formatDateOnly } from "../../utils";
import type { Booking, BookingDetail } from "../../types";
import type { Translate } from "../types";
import { messageToLines, safeText, splitLabelValue } from "./text";

export function extractProgramName(msg?: string) {
  if (!msg) return "";
  const m = msg.match(/Programm:\s*(.+)/i);
  return m ? m[1].trim() : "";
}

export function inferProgram(booking: Booking) {
  const raw = programSource(booking);
  if (!raw) return "—";
  const left = raw.split("•")[0]?.trim();
  return left || raw;
}

export function inferVenue(booking: Booking, t: Translate) {
  const directVenue = safeText(booking.venue);
  if (directVenue) return directVenue;
  return venueFromProgram(booking.message) || extractAddress(booking.message, t) || "—";
}

export function inferBookingType(booking: Booking) {
  const joined = typeSearchText(booking);
  if (booking.meta?.subscriptionEligible) return "Weekly";
  if (isWeeklyText(joined)) return "Weekly";
  if (isOneTimeText(joined)) return "One-Time";
  if (booking.meta?.paymentApprovalRequired) return "One-Time";
  return booking.source === "admin_booking" ? "Intern" : "Online";
}

export function isWeeklyBooking(booking: Booking, bookingType: string) {
  const metaCategory = metaValue(booking, "offerCategory");
  const offerCategory = bookingValue(booking, "offerCategory");
  const text = weeklySearchText(booking, bookingType, metaCategory, offerCategory);
  return bookingType === "Weekly" || metaCategory === "Weekly" || offerCategory === "Weekly" || text.includes("weekly");
}

export function adminMessageLines(booking: Booking, detail: BookingDetail, t: Translate, lang?: string) {
  return adminMessageParts(booking, detail, t, lang).filter(Boolean);
}

function programSource(booking: Booking) {
  return safeText(booking.offerTitle) || extractProgramName(booking.message) || safeText(booking.offerType) || safeText(booking.level);
}

function venueFromProgram(message?: string) {
  const program = extractProgramName(message);
  if (!program || !/•/.test(program)) return "";
  return safeText(program.split("•").slice(1).join("•"));
}

function extractAddress(msg: string | undefined, t: Translate) {
  return messageToLines(msg, t).reduce((found, ln) => found || addressValue(ln), "");
}

function addressValue(line: string) {
  const { label, value } = splitLabelValue(line);
  return label?.toLowerCase().includes("address") ? value : "";
}

function typeSearchText(booking: Booking) {
  return [inferProgram(booking), booking.offerType, booking.offerTitle, booking.venue].map(safeText).join(" ").toLowerCase();
}

function isWeeklyText(text: string) {
  return /foerdertraining|kindergarten|torwarttraining|foerdertraining_athletik/.test(text);
}

function isOneTimeText(text: string) {
  return /personaltraining|personal training|einzeltraining|1:1|1to1|individual|coach education|coacheducation|rent-a-coach|rentacoach|clubprogram|club program/.test(text);
}

function metaValue(booking: Booking, key: string) {
  return safeText((booking.meta as Record<string, unknown> | undefined)?.[key]);
}

function bookingValue(booking: Booking, key: string) {
  return safeText((booking as unknown as Record<string, unknown>)[key]);
}

function weeklySearchText(booking: Booking, bookingType: string, metaCategory: string, offerCategory: string) {
  return [bookingType, metaCategory, offerCategory, booking.offerType, booking.offerTitle, booking.meta?.scheduleLine].filter(Boolean).join(" ").toLowerCase();
}

function childLine(detail: BookingDetail, booking: Booking) {
  const first = safeText(detail?.child?.firstName || booking.firstName);
  const last = safeText(detail?.child?.lastName || booking.lastName);
  return childName([first, last].filter(Boolean).join(" ").trim(), detail);
}

function childName(name: string, detail: BookingDetail) {
  const gender = safeText(detail?.child?.gender);
  if (!name) return "";
  return gender ? `${name} (${gender})` : name;
}

function adminMessageParts(booking: Booking, detail: BookingDetail, t: Translate, lang?: string) {
  return [registrationLine(booking, t), childMessageLine(booking, detail, t), birthLine(detail, t, lang), contactLine(detail, t), addressLine(booking, detail, t), phoneLine(detail, t)];
}

function registrationLine(booking: Booking, t: Translate) {
  return `${t("common.admin.bookings.dialog.message.registration")} ${inferProgram(booking)}`;
}

function childMessageLine(booking: Booking, detail: BookingDetail, t: Translate) {
  const child = childLine(detail, booking);
  return child ? `${t("common.admin.bookings.dialog.message.child")}: ${child}` : "";
}

function birthLine(detail: BookingDetail, t: Translate, lang?: string) {
  const birthDate = formatDateOnly(detail?.child?.birthDate || null, lang);
  return birthDate !== "—" ? `${t("common.admin.bookings.dialog.message.birthday")}: ${birthDate}` : "";
}

function contactLine(detail: BookingDetail, t: Translate) {
  const contact = safeText(detail?.contact);
  return contact ? `${t("common.admin.bookings.dialog.message.contact")}: ${contact}` : "";
}

function addressLine(booking: Booking, detail: BookingDetail, t: Translate) {
  const address = safeText(detail?.address) || inferVenue(booking, t);
  return address && address !== "—" ? `${t("common.admin.bookings.dialog.message.address")}: ${address}` : "";
}

function phoneLine(detail: BookingDetail, t: Translate) {
  const phone = safeText(detail?.parent?.phone);
  return phone ? `${t("common.admin.bookings.dialog.message.phone")}: ${phone}` : "";
}
