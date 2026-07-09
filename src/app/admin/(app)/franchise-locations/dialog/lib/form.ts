import type { FranchiseLocation, LocationPayload } from "../../types";
import type { LocationFieldConfig, LocationForm } from "../types";

export const LOCATION_FIELDS: LocationFieldConfig[] = [
  { name: "licenseeFirstName", labelKey: "firstName" },
  { name: "licenseeLastName", labelKey: "lastName" },
  { name: "country", labelKey: "country" },
  { name: "city", labelKey: "city" },
  { name: "state", labelKey: "state" },
  { name: "zip", labelKey: "zip" },
  { name: "address", labelKey: "address", full: true },
  { name: "website", labelKey: "website" },
  { name: "emailPublic", labelKey: "publicEmail" },
  { name: "phonePublic", labelKey: "publicPhone" },
];

export function pickStr(v: unknown) {
  return String(v ?? "").trim();
}

export function buildForm(initial?: Partial<FranchiseLocation> | null) {
  return {
    licenseeFirstName: pickStr(initial?.licenseeFirstName) || "",
    licenseeLastName: pickStr(initial?.licenseeLastName) || "",
    country: pickStr(initial?.country) || "",
    city: pickStr(initial?.city) || "",
    state: pickStr(initial?.state) || "",
    address: pickStr(initial?.address) || "",
    zip: pickStr(initial?.zip) || "",
    website: pickStr(initial?.website) || "",
    emailPublic: pickStr(initial?.emailPublic) || "",
    phonePublic: pickStr(initial?.phonePublic) || "",
  } satisfies LocationForm;
}

export function buildPayload(form: LocationForm): LocationPayload {
  return {
    licenseeFirstName: pickStr(form.licenseeFirstName),
    licenseeLastName: pickStr(form.licenseeLastName),
    country: pickStr(form.country),
    city: pickStr(form.city),
    state: pickStr(form.state),
    address: pickStr(form.address),
    zip: pickStr(form.zip),
    website: pickStr(form.website),
    emailPublic: pickStr(form.emailPublic),
    phonePublic: pickStr(form.phonePublic),
  };
}

export function fieldClassName(full?: boolean) {
  return full ? "field field--full" : "field";
}
