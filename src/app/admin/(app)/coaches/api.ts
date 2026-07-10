"use client";

import type { Coach, Me } from "./types";
import { fullName, getSlug } from "./utils";

type ApiOk<T> = {
  ok: true;
  item?: T;
  items?: unknown;
  combined?: unknown;
  user?: unknown;
};
type ApiErr = { ok?: false; error?: string; message?: string };
type ApiJson<T = unknown> = ApiOk<T> | ApiErr | null;
type JsonRecord = Record<string, unknown>;
type CoachListArgs = {
  page: number;
  limit: number;
  q?: string;
  sort?: string;
  view?: string;
  signal?: AbortSignal;
};

function isRecord(v: unknown): v is JsonRecord {
  return !!v && typeof v === "object";
}

function cleanStr(v: unknown) {
  return String(v ?? "").trim();
}

function pickError(j: unknown) {
  if (!isRecord(j)) return "";
  return cleanStr(j.error || j.message);
}

async function parseJsonSafe(r: Response): Promise<unknown> {
  try {
    return await r.json();
  } catch {
    return null;
  }
}

async function requestJson(url: string, init: RequestInit, fallback: string) {
  const r = await fetch(url, jsonRequest(init));
  const j = (await parseJsonSafe(r)) as ApiJson;
  assertApiOk(r, j, fallback);
  return j;
}

function jsonRequest(init: RequestInit) {
  return {
    ...init,
    cache: "no-store" as RequestCache,
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
  };
}

function assertApiOk(r: Response, j: ApiJson, fallback: string) {
  if (!r.ok) throw new Error(pickError(j) || fallback);
  if (isRecord(j) && j.ok === false) throw new Error(pickError(j) || fallback);
}

function slugOrThrow(slug: string) {
  const s = cleanStr(slug);
  if (!s) throw new Error("Missing slug.");
  return s;
}

function coachListQuery(args: CoachListArgs) {
  const qs = new URLSearchParams();
  qs.set("page", String(args.page));
  qs.set("limit", String(args.limit));
  if (args.q) qs.set("q", args.q);
  if (args.sort) qs.set("sort", args.sort);
  if (args.view) qs.set("view", args.view);
  return qs.toString();
}

function itemOrThrow<T>(j: ApiJson, fallback: string) {
  const record = isRecord(j) ? (j as JsonRecord) : null;
  if (!record?.item) throw new Error(fallback);
  return record.item as T;
}

function coachUrl(slug: string) {
  return `/api/admin/coaches/${encodeURIComponent(slugOrThrow(slug))}`;
}

export async function fetchMe(signal?: AbortSignal): Promise<Me | null> {
  const r = await fetch("/api/admin/auth/me", { cache: "no-store", signal });
  const j = await parseJsonSafe(r);
  const user = meUserOrNull(r, j);
  if (!user) return null;

  return {
    id: cleanStr(user.id),
    isSuperAdmin: Boolean(user.isSuperAdmin),
    role: cleanStr(user.role || "provider") as Me["role"],
    fullName: cleanStr(user.fullName || "") || undefined,
  };
}

function meUserOrNull(r: Response, j: unknown) {
  if (!r.ok || !isRecord(j) || !j.ok || !isRecord(j.user)) return null;
  return j.user;
}

export async function fetchCoachesList(args: CoachListArgs) {
  const r = await fetch(`/api/admin/coaches?${coachListQuery(args)}`, {
    method: "GET",
    signal: args.signal,
    cache: "no-store",
  });

  const j = (await parseJsonSafe(r)) as ApiJson;
  assertApiOk(r, j, "Load failed.");
  return j;
}

export async function createCoach(values: Partial<Coach>) {
  const j = await requestJson(
    "/api/admin/coaches",
    { method: "POST", body: JSON.stringify(values || {}) },
    "Create failed.",
  );
  return itemOrThrow<Coach>(j, "Create failed.");
}

export async function updateCoach(slug: string, values: Partial<Coach>) {
  const j = await requestJson(
    coachUrl(slug),
    { method: "PATCH", body: JSON.stringify(values || {}) },
    "Save failed.",
  );
  return itemOrThrow<Coach>(j, "Save failed.");
}

export async function submitCoachForReview(slug: string) {
  const j = await requestJson(
    coachUrl(slug),
    { method: "PATCH", body: JSON.stringify({ submitForReview: true }) },
    "Submit failed.",
  );
  return itemOrThrow<Coach>(j, "Submit failed.");
}

export async function approveCoach(slug: string) {
  const j = await requestJson(
    coachUrl(slug),
    { method: "PATCH", body: approvedCoachBody() },
    "Approve failed.",
  );
  return itemOrThrow<Coach>(j, "Approve failed.");
}

function approvedCoachBody() {
  return JSON.stringify({ status: "approved", published: true });
}

export async function rejectCoach(slug: string, reason: string) {
  const j = await requestJson(
    coachUrl(slug),
    { method: "PATCH", body: rejectedCoachBody(reason) },
    "Reject failed.",
  );
  return itemOrThrow<Coach>(j, "Reject failed.");
}

function rejectedCoachBody(reason: string) {
  return JSON.stringify({
    status: "rejected",
    rejectionReason: cleanStr(reason),
  });
}

export async function deleteCoach(slug: string) {
  const r = await fetch(coachUrl(slug), {
    method: "DELETE",
    cache: "no-store",
  });
  const j = (await parseJsonSafe(r)) as ApiJson;
  assertApiOk(r, j, "Delete failed.");
  return true;
}

function coachRecord(c: Coach) {
  return c as Coach & JsonRecord;
}

export function hasDraft(c: Coach) {
  return Boolean(coachRecord(c).hasDraft) && !!coachRecord(c).draft;
}

export function draftValue<T>(c: Coach, key: string): T | undefined {
  const d = coachRecord(c).draft;
  if (!isRecord(d)) return undefined;
  return d[key] as T | undefined;
}

export function effectiveCoach(c: Coach): Coach {
  const d = coachRecord(c).draft;
  if (!hasDraft(c) || !isRecord(d)) return c;
  return { ...c, ...d } as Coach;
}

export function effectiveName(c: Coach) {
  return fullName(effectiveCoach(c));
}

export function effectiveSlug(c: Coach) {
  return getSlug(effectiveCoach(c));
}

export function effectivePosition(c: Coach) {
  return cleanStr(coachRecord(effectiveCoach(c)).position);
}

export async function uploadCoachPhoto(file: File) {
  const response = await fetch("/api/uploads/coach", {
    method: "POST",
    body: coachPhotoFormData(file),
    cache: "no-store",
  });

  return uploadedPhotoUrl(response, await parseJsonSafe(response));
}

function coachPhotoFormData(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("filename", file.name);
  return formData;
}

function uploadedPhotoUrl(response: Response, data: unknown) {
  if (!response.ok || (isRecord(data) && data.ok === false)) {
    throw new Error(pickError(data) || "Image upload failed.");
  }
  const photoUrl = cleanStr(isRecord(data) ? data.url : "");
  if (!photoUrl) throw new Error("Image upload failed.");
  return photoUrl;
}
