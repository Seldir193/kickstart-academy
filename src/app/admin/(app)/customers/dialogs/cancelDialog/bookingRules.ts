// // //src\app\admin\(app)\customers\dialogs\cancelDialog\bookingRules.ts
// // src/app/admin/(app)/customers/dialogs/cancelDialog/bookingRules.ts
// src/app/admin/(app)/customers/dialogs/cancelDialog/bookingRules.ts
import type { BookingRef } from "../../types";

export function labelFor(b: any) {
  const parts = [
    b.offerTitle || "—",
    rawType(b) || "—",
    b.status === "cancelled" ? "Cancelled" : b.status || "Active",
    b.date ? `since ${String(b.date).slice(0, 10)}` : undefined,
  ].filter(Boolean);
  return parts.join(" — ");
}

export function isBookingCancellable(
  booking: any,
  offersById: Map<string, any>,
) {
  const off = booking?.offerId ? offersById.get(String(booking.offerId)) : null;
  const f = pickFields(off, booking);

  if (isCoachEducation(f)) return false;
  if (isRentACoach(f)) return false;
  return matchesBaseRules(f);
}

function rawType(b?: Partial<BookingRef> | null) {
  return (b?.type || (b as any)?.offerType || "").trim();
}

function pickFields(off: any, booking: any) {
  const snapType = String(booking?.offerType ?? "");
  const snapTitle = String(booking?.offerTitle ?? "");

  const cat =
    String(off?.category ?? booking?.category ?? "") ||
    inferCategoryFromSnapshot(snapType, snapTitle);

  const type =
    String(off?.type ?? booking?.type ?? "") ||
    inferTypeFromSnapshot(snapType, snapTitle, cat);

  const subType = String(off?.sub_type ?? snapType ?? "");
  const title = String(off?.title ?? snapTitle ?? "");

  return { type, subType, category: cat, title };
}

function inferCategoryFromSnapshot(offerType: string, title: string) {
  const st = softNorm(String(offerType || ""));
  const tt = softNorm(String(title || ""));

  if (st === "powertraining" || tt.includes("powertraining")) return "Holiday";
  if (st.includes("einzeltraining") || tt.includes("einzeltraining"))
    return "Individual";
  if (st === "rentacoachgeneric" || tt.includes("rentacoach"))
    return "RentACoach";
  if (
    st === "clubprogramgeneric" ||
    st === "coacheducation" ||
    tt.includes("clubprogram")
  )
    return "ClubPrograms";
  return "Weekly";
}

function inferTypeFromSnapshot(
  offerType: string,
  title: string,
  category: string,
) {
  const st = softNorm(String(offerType || ""));
  const tt = softNorm(String(title || ""));
  const c = softNorm(String(category || ""));

  if (c === "holiday") return "Camp";
  if (st.includes("einzeltraining") || tt.includes("einzeltraining"))
    return "PersonalTraining";

  return offerType || title || "";
}

function isCoachEducation(f: any) {
  const st = softNorm(f.subType);
  const tt = softNorm(f.title);
  return st === "coacheducation" || tt.includes("coacheducation");
}

function isRentACoach(f: any) {
  const c = softNorm(f.category);
  const st = softNorm(f.subType);
  if (c === "rentacoach") return true;
  if (st === "rentacoachgeneric") return true;
  return looksLikeRentACoach(f.title);
}

function matchesBaseRules(f: any) {
  const t = softNorm(f.type);
  const st = softNorm(f.subType);
  const c = softNorm(f.category);

  if (st === "powertraining") return false;
  if (t === "camp" || t === "personaltraining") return false;
  if (t === "foerdertraining" || t === "kindergarten") return true;
  if (c === "weekly") return true;

  return false;
}

function norm(s: string) {
  return (s || "")
    .replace(/[Ää]/g, "ae")
    .replace(/[Öö]/g, "oe")
    .replace(/[Üü]/g, "ue")
    .replace(/ß/g, "ss")
    .toLowerCase();
}

function softNorm(s: string) {
  return norm(s).replace(/[\s\-\._]/g, "");
}

function looksLikeRentACoach(s: string) {
  const n = softNorm(s);
  return n.includes("rent") && n.includes("coach");
}

// import type { BookingRef } from "../../types";

// export function labelFor(b: any) {
//   const parts = [
//     b.offerTitle || "—",
//     rawType(b) || "—",
//     b.status === "cancelled" ? "Cancelled" : b.status || "Active",
//     b.date ? `since ${String(b.date).slice(0, 10)}` : undefined,
//   ].filter(Boolean);
//   return parts.join(" — ");
// }

// export function isBookingCancellable(
//   booking: any,
//   offersById: Map<string, any>,
// ) {
//   const status = String(booking?.status || "")
//     .trim()
//     .toLowerCase();
//   if (status === "cancelled") return false;

//   const off = booking?.offerId ? offersById.get(String(booking.offerId)) : null;
//   const f = pickFields(off, booking);

//   if (isCoachEducation(f)) return false;
//   if (isRentACoach(f)) return false;
//   return matchesBaseRules(f);
// }

// function rawType(b?: Partial<BookingRef> | null) {
//   return (b?.type || (b as any)?.offerType || "").trim();
// }

// function pickFields(off: any, booking: any) {
//   const snapType = String(booking?.offerType ?? "");
//   const snapTitle = String(booking?.offerTitle ?? "");

//   const cat =
//     String(off?.category ?? booking?.category ?? "") ||
//     inferCategoryFromSnapshot(snapType, snapTitle);

//   const type =
//     String(off?.type ?? booking?.type ?? "") ||
//     inferTypeFromSnapshot(snapType, snapTitle, cat);

//   const subType = String(off?.sub_type ?? snapType ?? "");
//   const title = String(off?.title ?? snapTitle ?? "");

//   return { type, subType, category: cat, title };
// }

// function inferCategoryFromSnapshot(offerType: string, title: string) {
//   const st = softNorm(String(offerType || ""));
//   const tt = softNorm(String(title || ""));
//   if (st === "powertraining" || tt.includes("powertraining")) return "Holiday";
//   if (st.includes("einzeltraining") || tt.includes("einzeltraining"))
//     return "Individual";
//   if (st === "rentacoachgeneric" || tt.includes("rentacoach"))
//     return "RentACoach";
//   if (
//     st === "clubprogramgeneric" ||
//     st === "coacheducation" ||
//     tt.includes("clubprogram")
//   )
//     return "ClubPrograms";
//   return "Weekly";
// }

// function inferTypeFromSnapshot(
//   offerType: string,
//   title: string,
//   category: string,
// ) {
//   const st = softNorm(String(offerType || ""));
//   const tt = softNorm(String(title || ""));
//   if (category && softNorm(category) === "holiday") return "Camp";
//   if (st.includes("einzeltraining") || tt.includes("einzeltraining"))
//     return "PersonalTraining";
//   return offerType || title || "";
// }

// function isCoachEducation(f: any) {
//   const st = softNorm(f.subType);
//   const tt = softNorm(f.title);
//   return st === "coacheducation" || tt.includes("coacheducation");
// }

// function isRentACoach(f: any) {
//   const c = softNorm(f.category);
//   const st = softNorm(f.subType);
//   if (c === "rentacoach") return true;
//   if (st === "rentacoachgeneric") return true;
//   return looksLikeRentACoach(f.title);
// }

// function matchesBaseRules(f: any) {
//   const t = softNorm(f.type);
//   const st = softNorm(f.subType);
//   const c = softNorm(f.category);

//   if (st === "powertraining") return false;
//   if (t === "camp" || t === "personaltraining") return false;
//   if (t === "foerdertraining" || t === "kindergarten") return true;
//   if (c === "weekly") return true;

//   return false;
// }

// function norm(s: string) {
//   return (s || "")
//     .replace(/[Ää]/g, "ae")
//     .replace(/[Öö]/g, "oe")
//     .replace(/[Üü]/g, "ue")
//     .replace(/ß/g, "ss")
//     .toLowerCase();
// }

// function softNorm(s: string) {
//   return norm(s).replace(/[\s\-\._]/g, "");
// }

// function looksLikeRentACoach(s: string) {
//   const n = softNorm(s);
//   return n.includes("rent") && n.includes("coach");
// }

// import type { BookingRef } from "../../types";

// export function labelFor(b: any) {
//   const parts = [
//     b.offerTitle || "—",
//     rawType(b) || "—",
//     b.status === "cancelled" ? "Cancelled" : b.status || "Active",
//     b.date ? `since ${String(b.date).slice(0, 10)}` : undefined,
//   ].filter(Boolean);
//   return parts.join(" — ");
// }

// export function isBookingCancellable(
//   booking: any,
//   offersById: Map<string, any>,
// ) {
//   const off = booking?.offerId ? offersById.get(String(booking.offerId)) : null;
//   const f = pickFields(off, booking);
//   if (isCoachEducation(f)) return false;
//   if (isRentACoach(f)) return false;
//   return matchesBaseRules(f);
// }

// function rawType(b?: Partial<BookingRef> | null) {
//   return (b?.type || (b as any)?.offerType || "").trim();
// }

// function pickFields(off: any, booking: any) {
//   return {
//     type: String(off?.type ?? booking?.type ?? ""),
//     subType: String(off?.sub_type ?? booking?.offerType ?? ""),
//     category: String(off?.category ?? booking?.category ?? ""),
//     title: String(off?.title ?? booking?.offerTitle ?? ""),
//   };
// }

// function isCoachEducation(f: any) {
//   const st = softNorm(f.subType);
//   const tt = softNorm(f.title);
//   return st === "coacheducation" || tt.includes("coacheducation");
// }

// function isRentACoach(f: any) {
//   const c = softNorm(f.category);
//   const st = softNorm(f.subType);
//   if (c === "rentacoach") return true;
//   if (st === "rentacoachgeneric") return true;
//   return looksLikeRentACoach(f.title);
// }

// function matchesBaseRules(f: any) {
//   const t = softNorm(f.type);
//   const st = softNorm(f.subType);
//   const c = softNorm(f.category);

//   if (st === "powertraining") return false;
//   if (t === "camp" || t === "personaltraining") return false;
//   if (t === "foerdertraining" || t === "kindergarten") return true;
//   if (c === "weekly") return true;

//   return false;
// }

// function norm(s: string) {
//   return (s || "")
//     .replace(/[Ää]/g, "ae")
//     .replace(/[Öö]/g, "oe")
//     .replace(/[Üü]/g, "ue")
//     .replace(/ß/g, "ss")
//     .toLowerCase();
// }

// function softNorm(s: string) {
//   return norm(s).replace(/[\s\-\._]/g, "");
// }

// function looksLikeRentACoach(s: string) {
//   const n = softNorm(s);
//   return n.includes("rent") && n.includes("coach");
// }
