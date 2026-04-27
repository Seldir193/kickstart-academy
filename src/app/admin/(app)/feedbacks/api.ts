import type { Feedback, FeedbackListResponse } from "./types";
import { FEEDBACKS_API, UPLOAD_API } from "./constants";

async function readJson<T>(res: Response) {
  const data = await res.json().catch(() => ({}));
  return data as T;
}

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function errorFor(res: Response, data: any) {
  const backendMsg = clean(data?.error);
  if (res.status === 401) {
    return new Error("Session expired. Please sign in again.");
  }

  if (res.status === 403) {
    return new Error("Only super admins can manage feedbacks.");
  }

  return new Error(backendMsg || "Request failed.");
}

async function assertOk(res: Response) {
  const data = await readJson<any>(res);
  if (!res.ok || data?.ok === false) throw errorFor(res, data);
  return data;
}

function pickFeedback(input: Feedback) {
  return {
    category: input.category,
    imageUrl: clean(input.imageUrl),
    quote: {
      de: clean(input.quote?.de),
      en: clean(input.quote?.en),
      tr: clean(input.quote?.tr),
    },
    author: clean(input.author),
    meta: {
      de: clean(input.meta?.de),
      en: clean(input.meta?.en),
      tr: clean(input.meta?.tr),
    },
    isActive: input.isActive === true,
    sortOrder: Number(input.sortOrder) || 100,
  };
}

export async function fetchFeedbacks() {
  const res = await fetch(FEEDBACKS_API, {
    cache: "no-store",
    credentials: "include",
  });

  const data = await readJson<FeedbackListResponse>(res);
  if (!res.ok || data?.ok === false) throw errorFor(res, data);
  return data.items || [];
}

export async function createFeedback(feedback: Feedback) {
  const res = await fetch(FEEDBACKS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(pickFeedback(feedback)),
  });

  await assertOk(res);
}

export async function updateFeedback(id: string, feedback: Feedback) {
  const res = await fetch(`${FEEDBACKS_API}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(pickFeedback(feedback)),
  });

  await assertOk(res);
}

export async function deleteFeedback(id: string) {
  const res = await fetch(`${FEEDBACKS_API}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
  });

  await assertOk(res);
}

export async function uploadFeedbackImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("filename", file.name);

  const res = await fetch(UPLOAD_API, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  const data = await readJson<any>(res);
  if (!res.ok || !data?.ok) throw errorFor(res, data);

  return String(data.url || "");
}