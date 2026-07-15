import { toastErrorMessage } from "@/lib/toast-messages";
import type { Customer } from "../../../types";
import { fetchCustomerById, fetchFamily } from "../api";
import {
  childIndexFromFamilyId,
  childLike,
  emptyChild,
  expandMembersForDropdown,
  isChildFamilyId,
  isParentFamilyId,
  namesMatch,
  normalizeParent,
  parentIndexFromFamilyId,
  safeText,
} from "./customerFamily.helpers";

export async function fetchFamilyMembers(
  id: string,
  t: (key: string) => string,
) {
  try {
    const data = await fetchFamily(id);
    const members = data?.ok && Array.isArray(data.members) ? data.members : [];
    return { members: expandMembersForDropdown(members), error: null };
  } catch (error: any) {
    console.error("reloadFamily failed", error);
    return {
      members: [],
      error: toastErrorMessage(
        t,
        error,
        "common.admin.customers.customerDialog.errors.familyLoadFailed",
      ),
    };
  }
}

function findMatchingChild(children: any[], child: any) {
  const uid = safeText(child?.uid);
  return (
    (uid ? children.find((item) => safeText(item?.uid) === uid) : null) ||
    (child
      ? children.find((item) =>
          namesMatch(
            item?.firstName,
            item?.lastName,
            child?.firstName,
            child?.lastName,
          ),
        )
      : null)
  );
}

function selectedChild(fresh: Customer, activeId: string, child: any) {
  if (!isChildFamilyId(activeId)) return null;
  const children = Array.isArray((fresh as any)?.children)
    ? (fresh as any).children
    : [];
  return (
    findMatchingChild(children, child) ||
    (child ? childLike(child) : null) ||
    (fresh as any)?.child ||
    null
  );
}

function selectedParent(fresh: Customer, activeId: string) {
  const parents = Array.isArray((fresh as any)?.parents)
    ? (fresh as any).parents
    : [];
  const index = parentIndexFromFamilyId(activeId);
  const source = isParentFamilyId(activeId)
    ? parents[index] || (fresh as any)?.parent
    : (fresh as any)?.parent;
  return normalizeParent(source || {});
}

export async function fetchCustomerSelection(
  baseId: string,
  activeId: string,
  child: any,
) {
  const fresh = await fetchCustomerById(baseId);
  const matchedChild = selectedChild(fresh, activeId, child);
  const isChild = isChildFamilyId(activeId);
  return {
    ...(fresh || {}),
    parent: selectedParent(fresh, activeId),
    child: matchedChild || emptyChild(),
    __activeChildIdx: isChild ? childIndexFromFamilyId(activeId) : -999,
    __activeChildUid: isChild ? safeText(matchedChild?.uid) : "",
    __activeFamilyId: activeId,
    __familyCreateMode: "none",
  };
}
