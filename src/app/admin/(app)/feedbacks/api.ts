import type { Feedback, FeedbackListResponse } from "./types";
import { FEEDBACKS_API, UPLOAD_API } from "./constants";

type ApiErrorResponse = {
  ok?: boolean;
  error?: string;
};

type UploadResponse = ApiErrorResponse & {
  url?: string;
};

const SESSION_ERROR = "Session expired. Please sign in again.";
const FORBIDDEN_ERROR = "Only super admins can manage feedbacks.";
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

function pickLocalizedText(value: Feedback["quote"]) {
  return {
    de: clean(value?.de),
    en: clean(value?.en),
    tr: clean(value?.tr),
  };
}

function pickFeedback(input: Feedback) {
  return {
    category: input.category,
    imageUrl: clean(input.imageUrl),
    quote: pickLocalizedText(input.quote),
    author: clean(input.author),
    meta: pickLocalizedText(input.meta),
    isActive: input.isActive === true,
    sortOrder: Number(input.sortOrder) || 100,
  };
}

export async function fetchFeedbacks() {
  const response = await fetch(FEEDBACKS_API, {
    cache: "no-store",
    credentials: "include",
  });

  const data = await readJson<FeedbackListResponse>(response);

  if (!response.ok || data.ok === false) {
    throw createRequestError(response, data);
  }

  return data.items || [];
}

export async function createFeedback(feedback: Feedback) {
  const response = await fetch(FEEDBACKS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(pickFeedback(feedback)),
  });

  await assertOk(response);
}

export async function updateFeedback(id: string, feedback: Feedback) {
  const response = await fetch(`${FEEDBACKS_API}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(pickFeedback(feedback)),
  });

  await assertOk(response);
}

export async function deleteFeedback(id: string) {
  const response = await fetch(`${FEEDBACKS_API}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
  });

  await assertOk(response);
}

export async function uploadFeedbackImage(file: File) {
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