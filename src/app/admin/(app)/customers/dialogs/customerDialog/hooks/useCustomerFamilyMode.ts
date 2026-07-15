"use client";

import { useEffect } from "react";
import type { Customer } from "../../../types";
import type { FamilyCreateMode, FamilyMember } from "../types";
import { emptyChild, hasChildData, safeText } from "./customerFamily.helpers";

type ResetParams = {
  mode: "create" | "edit";
  customer: Customer | null | undefined;
  setActiveCustomerId: (value: string | null) => void;
  setFamilyMembers: (value: FamilyMember[]) => void;
  closeDropdowns: () => void;
  setFamilyCreateMode: (value: FamilyCreateMode) => void;
};

export function useCustomerFamilyModeReset(params: ResetParams) {
  useEffect(() => {
    if (params.mode === "edit" && params.customer)
      params.setActiveCustomerId(params.customer._id || null);
    if (params.mode !== "create") return;
    params.setActiveCustomerId(null);
    params.setFamilyMembers([]);
    params.closeDropdowns();
    params.setFamilyCreateMode("none");
  }, [params.mode, params.customer]);
}

type ChildResetParams = {
  mode: "create" | "edit";
  familyCreateMode: FamilyCreateMode;
  baseCustomerId: string | null;
  activeFamilyId: string;
  setForm: (value: any) => void;
};

export function useBaseCustomerChildReset(params: ChildResetParams) {
  useEffect(() => {
    if (!shouldResetChild(params)) return;
    params.setForm((previous: any) =>
      resetChild(previous, params.baseCustomerId!),
    );
  }, [
    params.mode,
    params.familyCreateMode,
    params.baseCustomerId,
    params.activeFamilyId,
    params.setForm,
  ]);
}

function shouldResetChild(params: ChildResetParams) {
  if (params.mode !== "edit") return false;
  if (params.familyCreateMode !== "none") return false;
  return (
    !!params.baseCustomerId && params.activeFamilyId === params.baseCustomerId
  );
}

function resetChild(previous: any, baseCustomerId: string) {
  const current = previous?.child || {};
  if (!hasChildData(current) && !safeText(current?.uid)) return previous;
  return {
    ...previous,
    child: emptyChild(),
    __activeChildIdx: -999,
    __activeChildUid: "",
    __activeFamilyId: baseCustomerId,
  };
}
