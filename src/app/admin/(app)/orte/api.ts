"use client";

import type { Place } from "@/types/place";

type SortKey = "newest" | "oldest" | "city_asc" | "city_desc";

type PlacesApiResponse = {
  items?: Place[];
  total?: number;
};

type FetchPlacesArgs = {
  page: number;
  pageSize: number;
  q: string;
  sort: SortKey;
};

export async function fetchPlaces(args: FetchPlacesArgs) {
  const params = createPlacesParams(args);
  const response = await fetch(`/api/admin/places?${params.toString()}`, {
    cache: "no-store",
  });
  return normalizePlacesResponse(await readPlacesResponse(response));
}

function createPlacesParams({ page, pageSize, q, sort }: FetchPlacesArgs) {
  const params = new URLSearchParams();
  if (q.trim().length >= 2) params.set("q", q.trim());
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  params.set("limit", String(pageSize));
  params.set("sort", sort);
  return params;
}

function normalizePlacesResponse(data: PlacesApiResponse) {
  const list = Array.isArray(data.items) ? data.items : [];
  const total = Number(data.total || list.length || 0);
  return { items: list, total };
}

export async function deletePlace(id: string) {
  const response = await fetch(`/api/admin/places/${encodeURIComponent(id)}`, {
    method: "DELETE",
    cache: "no-store",
  });

  if (response.status === 409) await throwDeleteConflict(response);
  if (!response.ok) await throwDeleteFailure(response);
}

export async function deletePlacesBulk(ids: string[]) {
  const results = await Promise.allSettled(ids.map((id) => deletePlace(id)));
  const failed = results.filter((result) => result.status === "rejected");
  if (!failed.length) return;
}

async function readPlacesResponse(
  response: Response,
): Promise<PlacesApiResponse> {
  return response.json().catch(() => ({}));
}

async function throwDeleteConflict(response: Response) {
  const data = await response.json().catch(() => ({}));
  throw new Error(readError(data) || "Cannot delete: place is in use.");
}

async function throwDeleteFailure(response: Response) {
  const data = await response.json().catch(() => ({}));
  throw new Error(readError(data) || `Delete failed (${response.status})`);
}

function readError(data: unknown) {
  if (!isRecord(data) || typeof data.error !== "string") return "";
  return data.error;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
