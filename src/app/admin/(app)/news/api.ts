// src/app/admin/(app)/news/api.ts

import type { ListResponse, News } from "./types";
import { NEWS_API, UPLOAD_API } from "./constants";

export type NewsView =
  | "mine"
  | "provider_pending"
  | "provider_approved"
  | "provider_rejected"
  | "mine_pending"
  | "mine_approved"
  | "mine_rejected";

async function readJson<T>(res: Response) {
  const data = await res.json().catch(() => ({}));
  return data as T;
}

function clean(v: unknown) {
  return String(v ?? "").trim();
}

function pickEditableNews(input: any) {
  return {
    date: clean(input?.date),
    title: clean(input?.title),
    slug: clean(input?.slug),
    category: input?.category,
    tags: Array.isArray(input?.tags) ? input.tags : [],
    excerpt: clean(input?.excerpt),
    content: clean(input?.content),
    coverImage: clean(input?.coverImage),
    media: Array.isArray(input?.media) ? input.media : [],
  };
}

function errorFor(res: Response, js: any) {
  const backendMsg = clean(js?.error);
  if (res.status === 401)
    return new Error("Session expired. Please sign in again.");
  if (res.status === 429)
    return new Error("Too many requests. Please wait a moment and try again.");
  return new Error(backendMsg || "Request failed.");
}

async function assertOk(res: Response) {
  const js = await readJson<any>(res);
  if (!res.ok || js?.ok === false) throw errorFor(res, js);
  return js;
}

const inFlight = new Map<string, Promise<any>>();

let active = 0;
const MAX_ACTIVE = 2;
const queue: Array<() => void> = [];

function runQueued<T>(fn: () => Promise<T>) {
  return new Promise<T>((resolve, reject) => {
    const start = () => {
      active++;
      fn()
        .then(resolve, reject)
        .finally(() => {
          active--;
          const next = queue.shift();
          if (next) next();
        });
    };

    if (active < MAX_ACTIVE) start();
    else queue.push(start);
  });
}

function keyOf(args: {
  page: number;
  limit: number;
  view?: NewsView;
  search?: string;
}) {
  return JSON.stringify({
    p: args.page,
    l: args.limit,
    v: clean(args.view),
    q: clean(args.search),
  });
}

function sleep(ms: number, signal?: AbortSignal) {
  if (!ms) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    const onAbort = () => {
      clearTimeout(t);
      reject(Object.assign(new Error("Aborted"), { name: "AbortError" }));
    };
    if (signal) {
      if (signal.aborted) return onAbort();
      signal.addEventListener("abort", onAbort, { once: true });
    }
  });
}

function retryAfterMs(res: Response) {
  const ra = clean(res.headers.get("retry-after"));
  if (!ra) return 0;

  const sec = Number(ra);
  if (Number.isFinite(sec) && sec > 0) return Math.min(10_000, sec * 1000);

  const dt = Date.parse(ra);
  if (Number.isFinite(dt)) {
    const ms = dt - Date.now();
    return ms > 0 ? Math.min(10_000, ms) : 0;
  }

  return 0;
}

async function fetchWith429Retry(
  url: string,
  init: RequestInit,
  signal?: AbortSignal,
  tries = 3,
) {
  let attempt = 0;

  while (true) {
    //const res = await fetch(url, init);
    const res = await fetch(url, { ...init, credentials: "include" });

    if (res.status !== 429) return res;

    attempt++;
    if (attempt > tries) return res;

    const waitMs =
      retryAfterMs(res) ||
      Math.min(1200, 250 * attempt) + Math.floor(Math.random() * 150);

    await sleep(waitMs, signal);
  }
}

export async function fetchNewsPage(args: {
  page: number;
  limit: number;
  view?: NewsView;
  search?: string;
  signal?: AbortSignal;
}) {
  const qs = new URLSearchParams();
  qs.set("limit", String(args.limit));
  qs.set("page", String(args.page));
  if (args.view) qs.set("view", args.view);

  const s = clean(args.search || "");
  if (s) qs.set("search", s);

  const key = keyOf(args);
  const existing = inFlight.get(key);
  if (existing) return existing;

  const p = runQueued(async () => {
    try {
      const url = `${NEWS_API}?${qs.toString()}`;
      const res = await fetchWith429Retry(
        url,
        { signal: args.signal },
        args.signal,
        2,
      );

      const js = await readJson<ListResponse>(res);
      if (!res.ok || !js?.ok) throw errorFor(res, js);
      return js;
    } finally {
      inFlight.delete(key);
    }
  });

  inFlight.set(key, p);
  return p;
}

export async function uploadNewsFile(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("filename", file.name);

  const res = await fetch(UPLOAD_API, {
    method: "POST",
    body: fd,
    credentials: "include",
  });

  const js = await readJson<any>(res);
  if (!res.ok || !js?.ok) throw errorFor(res, js);

  return js as { url: string; mimetype: string };
}

export async function createNews(news: News) {
  const res = await fetch(NEWS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pickEditableNews(news)),
  });
  await assertOk(res);
}

export async function updateNews(id: string, news: News) {
  const res = await fetch(`${NEWS_API}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pickEditableNews(news)),
  });
  await assertOk(res);
}

export async function deleteNewsRecord(id: string) {
  const res = await fetch(`${NEWS_API}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  await assertOk(res);
}

export async function approveNews(id: string) {
  const res = await fetch(`${NEWS_API}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ published: true }),
  });
  await assertOk(res);
}

export async function rejectNews(id: string, reason: string) {
  const res = await fetch(`${NEWS_API}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ published: false, rejectionReason: clean(reason) }),
  });
  await assertOk(res);
}

export async function submitNewsForReview(id: string) {
  const res = await fetch(`${NEWS_API}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ submitForReview: true }),
  });
  await assertOk(res);
}

export async function toggleNewsPublished(id: string, next: boolean) {
  const res = await fetch(`${NEWS_API}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ published: !!next }),
  });
  await assertOk(res);
}

// // src/app/admin/(app)/news/api.ts

// import type { ListResponse, News } from "./types";
// import { NEWS_API, UPLOAD_API } from "./constants";

// export type NewsView =
//   | "mine"
//   | "provider_pending"
//   | "provider_approved"
//   | "provider_rejected"
//   | "mine_pending"
//   | "mine_approved"
//   | "mine_rejected";

// async function readJson<T>(res: Response) {
//   const data = await res.json().catch(() => ({}));
//   return data as T;
// }

// function clean(v: unknown) {
//   return String(v ?? "").trim();
// }

// function pickEditableNews(input: any) {
//   return {
//     date: clean(input?.date),
//     title: clean(input?.title),
//     slug: clean(input?.slug),
//     category: input?.category,
//     tags: Array.isArray(input?.tags) ? input.tags : [],
//     excerpt: clean(input?.excerpt),
//     content: clean(input?.content),
//     coverImage: clean(input?.coverImage),
//     media: Array.isArray(input?.media) ? input.media : [],
//   };
// }

// function errorFor(res: Response, js: any) {
//   const backendMsg = clean(js?.error);
//   if (res.status === 401)
//     return new Error("Sitzung abgelaufen. Bitte neu einloggen.");
//   if (res.status === 429)
//     return new Error(
//       "Zu viele Anfragen. Bitte kurz warten und erneut versuchen.",
//     );
//   return new Error(backendMsg || "Request failed.");
// }

// async function assertOk(res: Response) {
//   const js = await readJson<any>(res);
//   if (!res.ok || js?.ok === false) throw errorFor(res, js);
//   return js;
// }

// const inFlight = new Map<string, Promise<any>>();

// let active = 0;
// const MAX_ACTIVE = 2;
// const queue: Array<() => void> = [];

// function runQueued<T>(fn: () => Promise<T>) {
//   return new Promise<T>((resolve, reject) => {
//     const start = () => {
//       active++;
//       fn()
//         .then(resolve, reject)
//         .finally(() => {
//           active--;
//           const next = queue.shift();
//           if (next) next();
//         });
//     };

//     if (active < MAX_ACTIVE) start();
//     else queue.push(start);
//   });
// }

// function keyOf(args: {
//   page: number;
//   limit: number;
//   view?: NewsView;
//   search?: string;
// }) {
//   return JSON.stringify({
//     p: args.page,
//     l: args.limit,
//     v: clean(args.view),
//     q: clean(args.search),
//   });
// }

// function sleep(ms: number, signal?: AbortSignal) {
//   if (!ms) return Promise.resolve();
//   return new Promise<void>((resolve, reject) => {
//     const t = setTimeout(resolve, ms);
//     const onAbort = () => {
//       clearTimeout(t);
//       reject(Object.assign(new Error("Aborted"), { name: "AbortError" }));
//     };
//     if (signal) {
//       if (signal.aborted) return onAbort();
//       signal.addEventListener("abort", onAbort, { once: true });
//     }
//   });
// }

// function retryAfterMs(res: Response) {
//   const ra = clean(res.headers.get("retry-after"));
//   if (!ra) return 0;

//   const sec = Number(ra);
//   if (Number.isFinite(sec) && sec > 0) return Math.min(10_000, sec * 1000);

//   const dt = Date.parse(ra);
//   if (Number.isFinite(dt)) {
//     const ms = dt - Date.now();
//     return ms > 0 ? Math.min(10_000, ms) : 0;
//   }

//   return 0;
// }

// async function fetchWith429Retry(
//   url: string,
//   init: RequestInit,
//   signal?: AbortSignal,
//   tries = 3,
// ) {
//   let attempt = 0;

//   while (true) {
//     //const res = await fetch(url, init);
//     const res = await fetch(url, { ...init, credentials: "include" });

//     if (res.status !== 429) return res;

//     attempt++;
//     if (attempt > tries) return res;

//     const waitMs =
//       retryAfterMs(res) ||
//       Math.min(1200, 250 * attempt) + Math.floor(Math.random() * 150);

//     await sleep(waitMs, signal);
//   }
// }

// export async function fetchNewsPage(args: {
//   page: number;
//   limit: number;
//   view?: NewsView;
//   search?: string;
//   signal?: AbortSignal;
// }) {
//   const qs = new URLSearchParams();
//   qs.set("limit", String(args.limit));
//   qs.set("page", String(args.page));
//   if (args.view) qs.set("view", args.view);

//   const s = clean(args.search || "");
//   if (s) qs.set("search", s);

//   const key = keyOf(args);
//   const existing = inFlight.get(key);
//   if (existing) return existing;

//   const p = runQueued(async () => {
//     try {
//       const url = `${NEWS_API}?${qs.toString()}`;
//       const res = await fetchWith429Retry(
//         url,
//         { signal: args.signal },
//         args.signal,
//         2,
//       );

//       const js = await readJson<ListResponse>(res);
//       if (!res.ok || !js?.ok) throw errorFor(res, js);
//       return js;
//     } finally {
//       inFlight.delete(key);
//     }
//   });

//   inFlight.set(key, p);
//   return p;
// }
