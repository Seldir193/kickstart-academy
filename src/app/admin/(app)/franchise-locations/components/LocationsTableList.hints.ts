// src/app/admin/(app)/franchise-locations/components/LocationsTableList.hints.ts
"use client";

type TFn = (key: string) => string;

function clean(v: unknown) {
  return String(v ?? "").trim();
}

function isObj(v: any) {
  return v && typeof v === "object" && !Array.isArray(v);
}

function draftOf(it: any) {
  if (!isObj(it?.draft)) return null;
  return it.draft;
}

function hasDraft(it: any) {
  return it?.hasDraft === true && !!draftOf(it);
}

function submittedAt(it: any) {
  return clean(it?.submittedAt);
}

function isApprovedLike(it: any) {
  const s = clean(it?.status);
  if (s === "approved") return true;
  return Boolean(clean(it?.approvedAt));
}

export function hasReviewChange(it: any) {
  return hasDraft(it) && Boolean(submittedAt(it)) && isApprovedLike(it);
}

function labels(t: TFn) {
  return {
    licenseeFirstName: t(
      "common.admin.franchiseLocations.hints.fields.licensee",
    ),
    licenseeLastName: t(
      "common.admin.franchiseLocations.hints.fields.licensee",
    ),
    country: t("common.admin.franchiseLocations.hints.fields.country"),
    city: t("common.admin.franchiseLocations.hints.fields.city"),
    state: t("common.admin.franchiseLocations.hints.fields.state"),
    address: t("common.admin.franchiseLocations.hints.fields.address"),
    zip: t("common.admin.franchiseLocations.hints.fields.zip"),
    website: t("common.admin.franchiseLocations.hints.fields.website"),
    emailPublic: t("common.admin.franchiseLocations.hints.fields.email"),
    phonePublic: t("common.admin.franchiseLocations.hints.fields.phone"),
  } as const;
}

function changedKeys(d: any, t: TFn) {
  const map = labels(t) as Record<string, string>;
  return Object.keys(map).filter((k) => k in d);
}

function licenseeName(d: any, it: any) {
  const fn = clean(d.licenseeFirstName ?? it.licenseeFirstName);
  const ln = clean(d.licenseeLastName ?? it.licenseeLastName);
  return `${fn} ${ln}`.trim();
}

function hintForKey(d: any, it: any, k: string, t: TFn) {
  const map = labels(t) as Record<string, string>;
  const label = map[k];
  if (!label) {
    return t("common.admin.franchiseLocations.hints.changeSubmitted");
  }

  if (k === "licenseeFirstName" || k === "licenseeLastName") {
    const name = licenseeName(d, it);
    return name
      ? t("common.admin.franchiseLocations.hints.changeFieldValue")
          .replace("{{field}}", label)
          .replace("{{value}}", name)
      : t("common.admin.franchiseLocations.hints.changeSubmitted");
  }

  const v = clean(d?.[k]);
  if (v) {
    return t("common.admin.franchiseLocations.hints.changeFieldValue")
      .replace("{{field}}", label)
      .replace("{{value}}", v);
  }

  return t("common.admin.franchiseLocations.hints.changeField").replace(
    "{{field}}",
    label,
  );
}

export function buildDraftHint(it: any, t: TFn) {
  const d = draftOf(it) || {};
  const keys = changedKeys(d, t);
  if (!keys.length) {
    return t("common.admin.franchiseLocations.hints.changeSubmitted");
  }
  return hintForKey(d, it, keys[0], t);
}
