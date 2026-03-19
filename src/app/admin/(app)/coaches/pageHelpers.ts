// src/app/admin/(app)/coaches/pageHelpers.ts
import type { Coach, SortKey } from "./types";
import { isApproved, isPending, isRejected, matchCoach } from "./utils";

export type SplitLists = {
  providersPending: Coach[];
  providersApproved: Coach[];
  providersRejected: Coach[];
  mine: Coach[];
};

export function cleanStr(v: unknown) {
  return String(v ?? "").trim();
}

export function getSlugSafe(c: Coach) {
  return cleanStr((c as any).slug);
}

export function isSameSlug(a: Coach, slug: string) {
  return getSlugSafe(a) === cleanStr(slug);
}

export function upsertBySlug(items: Coach[], next: Coach) {
  const slug = getSlugSafe(next);
  const idx = items.findIndex((x) => isSameSlug(x, slug));
  if (idx === -1) return [next, ...items];
  const copy = [...items];
  copy[idx] = { ...copy[idx], ...next };
  return copy;
}

export function removeBySlug(items: Coach[], slug: string) {
  const s = cleanStr(slug);
  return items.filter((x) => !isSameSlug(x, s));
}

export function mergeAndFilter(items: Coach[], q: string) {
  const query = cleanStr(q);
  if (!query) return items;
  return items.filter((c) => matchCoach(c, query));
}

export function splitCombined(resp: any): SplitLists {
  if (resp?.combined === true) {
    return {
      providersPending: Array.isArray(resp?.providerPending?.items)
        ? resp.providerPending.items
        : [],
      providersApproved: Array.isArray(resp?.providerApproved?.items)
        ? resp.providerApproved.items
        : [],
      providersRejected: Array.isArray(resp?.providerRejected?.items)
        ? resp.providerRejected.items
        : [],
      mine: Array.isArray(resp?.mine?.items) ? resp.mine.items : [],
    };
  }
  return {
    providersPending: [],
    providersApproved: [],
    providersRejected: [],
    mine: Array.isArray(resp?.items) ? resp.items : [],
  };
}

export function classifyProvider(list: SplitLists, next: Coach) {
  if (isPending(next)) {
    return {
      ...list,
      providersPending: upsertBySlug(list.providersPending, next),
    };
  }
  if (isRejected(next)) {
    return {
      ...list,
      providersRejected: upsertBySlug(list.providersRejected, next),
    };
  }
  return {
    ...list,
    providersApproved: upsertBySlug(list.providersApproved, next),
  };
}

export function removeFromProviders(list: SplitLists, slug: string) {
  return {
    ...list,
    providersPending: removeBySlug(list.providersPending, slug),
    providersApproved: removeBySlug(list.providersApproved, slug),
    providersRejected: removeBySlug(list.providersRejected, slug),
  };
}

export function removeFromMine(list: SplitLists, slug: string) {
  return { ...list, mine: removeBySlug(list.mine, slug) };
}

export function upsertMine(list: SplitLists, next: Coach) {
  return { ...list, mine: upsertBySlug(list.mine, next) };
}

export function getErrorMessage(e: unknown) {
  const anyErr = e as any;
  return cleanStr(
    anyErr?.message || anyErr?.error || anyErr?.response?.data?.error,
  );
}

export function buildUpdatePayload(values: Partial<Coach>, superUser: boolean) {
  const payload: any = { ...values };
  if (superUser) return payload;
  delete payload.submitForReview;
  delete payload.rejectionReason;
  delete payload.status;
  delete payload.published;
  return payload;
}

export function isProviderItem(c: Coach, myId: string) {
  const pid = cleanStr((c as any).providerId);
  if (!pid) return false;
  if (!myId) return true;
  return pid !== myId;
}

export function pickMyLists(sorted: Coach[]) {
  return {
    pending: sorted.filter(isPending),
    approved: sorted.filter(isApproved),
    rejected: sorted.filter(isRejected),
  };
}
