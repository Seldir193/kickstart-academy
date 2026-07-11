import type { FranchiseLocation } from "../../types";
import { formatDateOnly } from "../../utils/dateFormat";

export function clean(value: unknown) {
  return String(value ?? "").trim();
}

type LocationIdentity = Partial<{ id: string; _id: string; slug: string }>;

export function idOf(item: LocationIdentity) {
  return clean(item.id || item._id || item.slug);
}

export function fullName(item: FranchiseLocation) {
  const firstName = clean(item.licenseeFirstName);
  const lastName = clean(item.licenseeLastName);
  return `${firstName} ${lastName}`.trim();
}

export function fmtDate(value?: string, lang?: string) {
  return formatDateOnly(value, lang);
}
