"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Customer } from "../../../types";
import type { FamilyCreateMode } from "../types";
import { useCustomerFamilyActions } from "./useCustomerFamilyActions";
import { useCustomerFamilyCollection } from "./useCustomerFamilyCollection";
import { useCustomerFamilyDerived } from "./useCustomerFamilyDerived";
import { useCustomerFamilyDropdowns } from "./useCustomerFamilyDropdowns";
import {
  useBaseCustomerChildReset,
  useCustomerFamilyModeReset,
} from "./useCustomerFamilyMode";

export function useCustomerFamily(
  mode: "create" | "edit",
  customer: Customer | null | undefined,
  form: Customer,
  setForm: (value: any) => void,
) {
  const { t } = useTranslation();
  const [activeCustomerId, setActiveCustomerId] = useState<string | null>(
    customer?._id || null,
  );
  const [familyCreateMode, setFamilyCreateMode] =
    useState<FamilyCreateMode>("none");
  const collection = useCustomerFamilyCollection(mode, customer, form._id, t);
  const dropdowns = useCustomerFamilyDropdowns();
  const closeDropdowns = () => closeFamilyDropdowns(dropdowns);
  useCustomerFamilyModeReset({
    mode,
    customer,
    setActiveCustomerId,
    setFamilyMembers: collection.setFamilyMembers,
    closeDropdowns,
    setFamilyCreateMode,
  });
  const derived = useCustomerFamilyDerived(
    collection.familyMembers,
    form,
    collection.baseCustomerId,
    activeCustomerId,
    t,
  );
  useBaseCustomerChildReset({
    mode,
    familyCreateMode,
    baseCustomerId: collection.baseCustomerId,
    activeFamilyId: derived.activeFamilyId,
    setForm,
  });
  const actions = useCustomerFamilyActions({
    form,
    setForm,
    baseCustomerId: collection.baseCustomerId,
    familyMembers: collection.familyMembers,
    selfFamilyMembers: derived.selfFamilyMembers,
    setFamilyCreateMode,
    setActiveCustomerId,
    closeDropdowns,
    reloadFamily: collection.reloadFamily,
  });
  return buildResult(
    collection,
    dropdowns,
    derived,
    actions,
    familyCreateMode,
    setFamilyCreateMode,
    activeCustomerId,
    setActiveCustomerId,
  );
}

function closeFamilyDropdowns(
  dropdowns: ReturnType<typeof useCustomerFamilyDropdowns>,
) {
  dropdowns.setFamilyDropdownOpen(false);
  dropdowns.setSelfDropdownOpen(false);
}

function buildResult(
  collection: ReturnType<typeof useCustomerFamilyCollection>,
  dropdowns: ReturnType<typeof useCustomerFamilyDropdowns>,
  derived: ReturnType<typeof useCustomerFamilyDerived>,
  actions: ReturnType<typeof useCustomerFamilyActions>,
  familyCreateMode: FamilyCreateMode,
  setFamilyCreateMode: (value: FamilyCreateMode) => void,
  activeCustomerId: string | null,
  setActiveCustomerId: (value: string | null) => void,
) {
  return {
    familyMembers: collection.familyMembers,
    ...derived,
    familyLoading: collection.familyLoading,
    familyError: collection.familyError,
    ...dropdowns,
    ...actions,
    familyCreateMode,
    setFamilyCreateMode,
    activeCustomerId,
    setActiveCustomerId,
    baseCustomerId: collection.baseCustomerId,
    reloadFamily: collection.reloadFamily,
  };
}
