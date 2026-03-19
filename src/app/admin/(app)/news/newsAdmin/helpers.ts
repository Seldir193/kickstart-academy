// //src\app\admin\(app)\news\newsAdmin\helpers.ts
import type { News } from "../types";
import { WP_DETAIL_BASE } from "../constants";

export type Me = { id: string; isSuperAdmin: boolean };

export type ReloadKey =
  | "mine"
  | "provider_pending"
  | "provider_approved"
  | "provider_rejected"
  | "mine_pending"
  | "mine_approved"
  | "mine_rejected";

export function clean(v: unknown) {
  return String(v ?? "").trim();
}

export function getId(n: News | null) {
  return clean((n as any)?._id);
}

export function buildPreview(slug: string) {
  return `${WP_DETAIL_BASE}${encodeURIComponent(slug || "")}`;
}

export function hasDraftForReview(n: News) {
  const anyN = n as any;
  if (anyN?.hasDraft === true) return true;
  const d = anyN?.draft;
  return Boolean(d && typeof d === "object" && Object.keys(d).length > 0);
}

function emptyMe(): Me {
  return { id: "", isSuperAdmin: false };
}

export async function fetchMe(): Promise<Me> {
  const r = await fetch("/api/admin/auth/me", {
    cache: "no-store",
    credentials: "include",
  }).catch(() => null);

  if (!r) return emptyMe();

  const js = await r.json().catch(() => null);
  if (!js?.ok) return emptyMe();

  const id = clean(js?.user?.id);
  return {
    id,
    isSuperAdmin: Boolean(js?.user?.isSuperAdmin),
  };
}

export function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function pagePrev(setPage: (fn: (p: number) => number) => void) {
  setPage((p) => Math.max(1, p - 1));
}

export function pageNext(
  setPage: (fn: (p: number) => number) => void,
  pages: number,
) {
  setPage((p) => Math.min(pages, p + 1));
}

// import type { News } from "../types";
// import { WP_DETAIL_BASE } from "../constants";

// export type Me = { id: string; isSuperAdmin: boolean };

// export type ReloadKey =
//   | "mine"
//   | "provider_pending"
//   | "provider_approved"
//   | "provider_rejected"
//   | "mine_pending"
//   | "mine_approved"
//   | "mine_rejected";

// export function clean(v: unknown) {
//   return String(v ?? "").trim();
// }

// export function getId(n: News | null) {
//   return clean((n as any)?._id);
// }

// export function buildPreview(slug: string) {
//   return `${WP_DETAIL_BASE}${encodeURIComponent(slug || "")}`;
// }

// export function hasDraftForReview(n: News) {
//   const anyN = n as any;
//   if (anyN?.hasDraft === true) return true;
//   const d = anyN?.draft;
//   return Boolean(d && typeof d === "object" && Object.keys(d).length > 0);
// }

// export async function fetchMe(): Promise<Me | null> {
//   const r = await fetch("/api/admin/auth/me", { cache: "no-store" }).catch(
//     () => null,
//   );
//   if (!r) return null;
//   const js = await r.json().catch(() => null);
//   if (!js?.ok || !js?.user?.id) return null;
//   return {
//     id: String(js.user.id),
//     isSuperAdmin: Boolean(js.user.isSuperAdmin),
//   };
// }

// export function delay(ms: number) {
//   return new Promise((r) => setTimeout(r, ms));
// }

// export function pagePrev(setPage: (fn: (p: number) => number) => void) {
//   setPage((p) => Math.max(1, p - 1));
// }

// export function pageNext(
//   setPage: (fn: (p: number) => number) => void,
//   pages: number,
// ) {
//   setPage((p) => Math.min(pages, p + 1));
// }
