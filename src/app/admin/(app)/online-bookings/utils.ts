//src\app\admin\(app)\online-bookings\utils.ts
"use client";

import type { Booking, Status } from "./types";

export function safeText(v: unknown) {
  return String(v ?? "").trim();
}

export function formatDateOnlyDE(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
  }).format(d);
}

export function asStatus(s?: Booking["status"]): Status {
  return (s ?? "confirmed") as Status;
}

function includesAny(text: string, parts: string[]) {
  return parts.some((p) => text.includes(p));
}

export function programAbbr(b: Booking): string {
  const text = [
    (b as any).offerType,
    (b as any).offerTitle,
    b.level,
    (b as any).program,
    b.message,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (!text) return "—";
  if (includesAny(text, ["powertraining", "power training"])) return "PWR";
  if (includesAny(text, ["camp", "feriencamp", "holiday camp"])) return "CMP";
  return "—";
}
