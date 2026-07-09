import { toastText } from "@/lib/toast-messages";
import type { FranchiseLocation } from "../../types";
import type { TFn } from "./types";

function text(value: unknown) {
  return String(value || "").trim();
}

function cityCountry(item: FranchiseLocation | null) {
  const city = text(item?.city);
  const country = text(item?.country);
  if (city && country) return `${city}, ${country}`;
  return city;
}

function licenseeName(item: FranchiseLocation | null) {
  return `${text(item?.licenseeFirstName)} ${text(item?.licenseeLastName)}`.trim();
}

export function locationName(item: FranchiseLocation | null, t: TFn) {
  const label = cityCountry(item) || licenseeName(item);
  if (label) return label;
  return toastText(
    t,
    "common.admin.franchiseLocations.deleteFallbackLocation",
    "this location",
  );
}
