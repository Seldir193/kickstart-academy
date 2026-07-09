import type { KeyboardEvent } from "react";
import type { Offer } from "./types";

export function safeText(value: unknown) {
  return String(value ?? "").trim();
}

export function formatPrice(value?: number) {
  if (typeof value !== "number") return "—";
  return `${value} €`;
}

export function courseTitle(t: (key: string) => string, offer: Offer) {
  const raw = safeText(offer.title);
  if (!raw) return t("common.admin.home.courseFallback");
  const dash = raw.split(" — ")[0];
  const dot = dash.split(" • ")[0];
  return safeText(dot) || t("common.admin.home.courseFallback");
}

export function courseMeta(offer: Offer) {
  const titleLower = safeText(offer.title).toLowerCase();
  const course = safeText(offer.sub_type || offer.type);
  if (!course) return "\u00A0";
  if (titleLower.includes(course.toLowerCase())) return "\u00A0";
  return course;
}

export function sortByUpdatedDesc(items: Offer[]) {
  return [...items].sort((a, b) => updatedTime(b) - updatedTime(a));
}

function updatedTime(offer: Offer) {
  return (offer.updatedAt && Date.parse(offer.updatedAt)) || 0;
}

export function offerFilterHref(offer: Offer) {
  const course = safeText(offer.sub_type || offer.type);
  return course ? `/trainings?course=${encodeURIComponent(course)}` : "/trainings";
}

export function handleActivation(event: KeyboardEvent, action: () => void) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  action();
}
