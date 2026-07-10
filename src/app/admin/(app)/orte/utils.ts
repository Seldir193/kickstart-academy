"use client";

import type { Place } from "@/types/place";

type PlaceLike = Place & { publicId?: number };

export function displayPlaceId(place: PlaceLike) {
  if (isFiniteNumber(place.publicId)) return String(place.publicId);
  return "1" + String(place._id || "").slice(-7).toUpperCase();
}

export function safeText(value: unknown) {
  return String(value ?? "").trim();
}

export function sortPlaces<T extends Place>(
  items: T[],
  sort: "newest" | "oldest" | "city_asc" | "city_desc",
) {
  const next = [...items];
  if (sort === "newest") return sortByTime(next, "desc");
  if (sort === "oldest") return sortByTime(next, "asc");
  return sortByCity(next, sort);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function timeFromObjectIdHex(id?: unknown) {
  const hex = String(id || "").trim();
  if (hex.length < 8) return 0;
  const seconds = parseInt(hex.slice(0, 8), 16);
  return Number.isFinite(seconds) ? seconds * 1000 : 0;
}

function safeTime(place: Place) {
  const iso = place.createdAt || place.updatedAt || readDateValue(place);
  const time = iso ? new Date(iso).getTime() : 0;
  if (Number.isFinite(time) && time > 0) return time;
  return timeFromObjectIdHex(place._id);
}

function readDateValue(place: Place) {
  const record = place as Record<string, unknown>;
  return typeof record.date === "string" ? record.date : "";
}

function sortByTime<T extends Place>(items: T[], direction: "asc" | "desc") {
  const multiplier = direction === "asc" ? 1 : -1;
  return items.sort((a, b) => multiplier * (safeTime(a) - safeTime(b)));
}

function sortByCity<T extends Place>(
  items: T[],
  sort: "city_asc" | "city_desc",
) {
  const collator = new Intl.Collator("de", { sensitivity: "base" });
  const direction = sort === "city_asc" ? 1 : -1;
  return items.sort((a, b) => direction * collator.compare(safeText(a.city), safeText(b.city)));
}
