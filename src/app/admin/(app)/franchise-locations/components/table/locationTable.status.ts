import type { FranchiseLocation } from "../../types";
import { buildDraftHint, hasReviewChange } from "../LocationsTableList.hints";
import type { RowMode, StatusParts, TFn } from "./locationTable.types";
import { clean } from "./locationTable.values";

function statusOf(item: FranchiseLocation) {
  const status = clean(item?.status);
  return ["pending", "approved", "rejected"].includes(status) ? status : "";
}

function isApproved(item: FranchiseLocation) {
  return statusOf(item) === "approved";
}

function isRejected(item: FranchiseLocation) {
  return (
    statusOf(item) === "rejected" || clean(item?.rejectionReason).length > 0
  );
}

function isPublished(item: FranchiseLocation) {
  return item?.published === true;
}

export function statusClass(item: FranchiseLocation) {
  if (isRejected(item)) return "is-rejected";
  if (hasReviewChange(item)) return "is-off";
  return isApproved(item) && isPublished(item) ? "is-on" : "is-off";
}

function hintFor(item: FranchiseLocation, rowMode: RowMode, t: TFn) {
  if (rowMode !== "provider_pending" || !hasReviewChange(item)) return "";
  return buildDraftHint(item, t);
}

function pendingMain(item: FranchiseLocation, rowMode: RowMode, t: TFn) {
  const review = hasReviewChange(item);
  const providerKey = review ? "pleaseReview" : "awaitingApproval";
  const mineKey = review ? "underReview" : "awaitingApproval";
  const key = rowMode === "provider_pending" ? providerKey : mineKey;
  return t(`common.admin.franchiseLocations.status.${key}`);
}

function approvedParts(
  item: FranchiseLocation,
  rowMode: RowMode,
  t: TFn,
): StatusParts {
  if (rowMode === "mine_approved" && hasReviewChange(item)) {
    return parts(t("common.admin.franchiseLocations.status.underReview"));
  }
  const subKey = isPublished(item) ? "online" : "offline";
  return parts(
    t("common.admin.franchiseLocations.status.approved"),
    t(`common.admin.franchiseLocations.status.${subKey}`),
  );
}

function parts(main: string, sub = "", hint = ""): StatusParts {
  return { main, sub, hint };
}

export function statusParts(
  item: FranchiseLocation,
  rowMode: RowMode,
  t: TFn,
): StatusParts {
  const hint = hintFor(item, rowMode, t);
  if (rowMode.includes("pending"))
    return parts(pendingMain(item, rowMode, t), "", hint);
  if (rowMode.includes("rejected")) {
    return parts(t("common.admin.franchiseLocations.status.rejected"));
  }
  return isApproved(item)
    ? approvedParts(item, rowMode, t)
    : parts(pendingMain(item, rowMode, t));
}
