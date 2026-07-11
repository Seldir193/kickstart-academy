import { useMemo } from "react";
import type { TFunction } from "i18next";
import type { FranchiseLocation } from "../../types";
import { formatDateTime } from "../../utils/dateFormat";
import { clean, ownerLabel } from "./licenseeInfoDialog.helpers";
import type { LicenseeInfoSections } from "./licenseeInfoDialog.types";

export function useLicenseeInfoSections(
  item: FranchiseLocation | null,
  language: string,
  t: TFunction,
) {
  return useMemo(
    () => buildSections(item, language, t),
    [item, language, t],
  );
}

function buildSections(
  item: FranchiseLocation | null,
  language: string,
  t: TFunction,
): LicenseeInfoSections | null {
  if (!item) return null;
  const status = clean(item.status);
  const updated = formatDateTime(item.updatedAt, language);
  return createSections(item, status, updated, t);
}

function createSections(
  item: FranchiseLocation,
  status: string,
  updated: string,
  t: TFunction,
): LicenseeInfoSections {
  return {
    header: { title: t("common.admin.franchiseLocations.infoDialog.title", { name: ownerLabel(item) }) },
    location: locationData(item),
    contact: contactData(item),
    meta: { status, updated },
    reject: status.toLowerCase() === "rejected" ? { reason: item.rejectionReason } : null,
  };
}

function locationData(item: FranchiseLocation) {
  return {
    firstName: item.licenseeFirstName,
    lastName: item.licenseeLastName,
    country: item.country,
    city: item.city,
    state: item.state,
    zip: item.zip,
    address: item.address,
  };
}

function contactData(item: FranchiseLocation) {
  return {
    website: item.website,
    emailPublic: item.emailPublic,
    phonePublic: item.phonePublic,
  };
}
