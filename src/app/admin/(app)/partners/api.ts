import type { Partner, PartnerListResponse } from "./types";
import { PARTNERS_API, UPLOAD_API } from "./constants";

type ApiErrorResponse = {
  ok?: boolean;
  error?: string;
};

type UploadResponse = ApiErrorResponse & {
  url?: string;
};

const SESSION_ERROR = "Session expired. Please sign in again.";
const FORBIDDEN_ERROR = "Only super admins can manage partners.";
const REQUEST_ERROR = "Request failed.";

async function readJson<T>(response: Response) {
  const data = await response.json().catch(() => ({}));
  return data as T;
}

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function getErrorMessage(response: Response, data: ApiErrorResponse) {
  const backendMessage = clean(data.error);
  if (response.status === 401) return SESSION_ERROR;
  if (response.status === 403) return FORBIDDEN_ERROR;
  return backendMessage || REQUEST_ERROR;
}

function createRequestError(response: Response, data: ApiErrorResponse) {
  return new Error(getErrorMessage(response, data));
}

async function assertOk(response: Response) {
  const data = await readJson<ApiErrorResponse>(response);

  if (!response.ok || data.ok === false) {
    throw createRequestError(response, data);
  }

  return data;
}

function pickPartner(input: Partner) {
  return {
    name: clean(input.name),
    logoUrl: clean(input.logoUrl),
    url: clean(input.url),
    isActive: input.isActive === true,
    sortOrder: Number(input.sortOrder) || 100,
  };
}

export async function fetchPartners() {
  const response = await fetch(PARTNERS_API, {
    cache: "no-store",
    credentials: "include",
  });

  const data = await readJson<PartnerListResponse>(response);

  if (!response.ok || data.ok === false) {
    throw createRequestError(response, data);
  }

  return data.items || [];
}

export async function createPartner(partner: Partner) {
  const response = await fetch(PARTNERS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(pickPartner(partner)),
  });

  await assertOk(response);
}

export async function updatePartner(id: string, partner: Partner) {
  const response = await fetch(`${PARTNERS_API}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(pickPartner(partner)),
  });

  await assertOk(response);
}

export async function deletePartner(id: string) {
  const response = await fetch(`${PARTNERS_API}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
  });

  await assertOk(response);
}

export async function uploadPartnerLogo(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("filename", file.name);

  const response = await fetch(UPLOAD_API, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  const data = await readJson<UploadResponse>(response);

  if (!response.ok || data.ok === false) {
    throw createRequestError(response, data);
  }

  return clean(data.url);
}
