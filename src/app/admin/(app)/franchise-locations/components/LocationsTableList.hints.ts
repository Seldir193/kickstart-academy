// src/app/admin/(app)/franchise-locations/components/LocationsTableList.hints.ts
"use client";

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

function labels() {
  return {
    licenseeFirstName: "Licensee",
    licenseeLastName: "Licensee",
    country: "Country",
    city: "City",
    state: "State",
    address: "Address",
    zip: "ZIP code",
    website: "Website",
    emailPublic: "Email",
    phonePublic: "Phone",
  } as const;
}

function changedKeys(d: any) {
  const map = labels() as Record<string, string>;
  return Object.keys(map).filter((k) => k in d);
}

function licenseeName(d: any, it: any) {
  const fn = clean(d.licenseeFirstName ?? it.licenseeFirstName);
  const ln = clean(d.licenseeLastName ?? it.licenseeLastName);
  return `${fn} ${ln}`.trim();
}

function hintForKey(d: any, it: any, k: string) {
  const map = labels() as Record<string, string>;
  const label = map[k];
  if (!label) return "Change submitted";
  if (label === "Licensee") {
    const name = licenseeName(d, it);
    return name ? `Change ${label}: ${name}` : "Change submitted";
  }
  const v = clean(d?.[k]);
  if (v) return `Change ${label}: ${v}`;
  return `Change ${label}`;
}

export function buildDraftHint(it: any) {
  const d = draftOf(it) || {};
  const keys = changedKeys(d);
  if (!keys.length) return "Change submitted";
  return hintForKey(d, it, keys[0]);
}

// // src/app/admin/(app)/franchise-locations/components/LocationsTableList.hints.ts
// "use client";

// function clean(v: unknown) {
//   return String(v ?? "").trim();
// }

// function isObj(v: any) {
//   return v && typeof v === "object" && !Array.isArray(v);
// }

// function draftOf(it: any) {
//   if (!isObj(it?.draft)) return null;
//   return it.draft;
// }

// function hasDraft(it: any) {
//   return it?.hasDraft === true && !!draftOf(it);
// }

// function submittedAt(it: any) {
//   return clean(it?.submittedAt);
// }

// function isApprovedLike(it: any) {
//   const s = clean(it?.status);
//   if (s === "approved") return true;
//   return Boolean(clean(it?.approvedAt));
// }

// export function hasReviewChange(it: any) {
//   return hasDraft(it) && Boolean(submittedAt(it)) && isApprovedLike(it);
// }

// function labels() {
//   return {
//     licenseeFirstName: "Lizenznehmer",
//     licenseeLastName: "Lizenznehmer",
//     country: "Land",
//     city: "Stadt",
//     state: "Bundesland",
//     address: "Adresse",
//     zip: "PLZ",
//     website: "Website",
//     emailPublic: "E-Mail",
//     phonePublic: "Telefon",
//   } as const;
// }

// function changedKeys(d: any) {
//   const map = labels() as Record<string, string>;
//   return Object.keys(map).filter((k) => k in d);
// }

// function licenseeName(d: any, it: any) {
//   const fn = clean(d.licenseeFirstName ?? it.licenseeFirstName);
//   const ln = clean(d.licenseeLastName ?? it.licenseeLastName);
//   return `${fn} ${ln}`.trim();
// }

// function hintForKey(d: any, it: any, k: string) {
//   const map = labels() as Record<string, string>;
//   const label = map[k];
//   if (!label) return "Änderung eingereicht";
//   if (label === "Lizenznehmer") {
//     const name = licenseeName(d, it);
//     return name ? `Änderung ${label}: ${name}` : "Änderung eingereicht";
//   }
//   const v = clean(d?.[k]);
//   if (v) return `Änderung ${label}: ${v}`;
//   return `Änderung ${label}`;
// }

// export function buildDraftHint(it: any) {
//   const d = draftOf(it) || {};
//   const keys = changedKeys(d);
//   if (!keys.length) return "Änderung eingereicht";
//   return hintForKey(d, it, keys[0]);
// }
