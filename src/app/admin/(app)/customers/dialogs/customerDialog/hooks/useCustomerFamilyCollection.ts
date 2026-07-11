"use client";

import { useEffect, useState } from "react";
import type { Customer } from "../../../types";
import type { FamilyMember } from "../types";
import { fetchFamilyMembers } from "./customerFamily.loaders";

export function useCustomerFamilyCollection(
  mode: "create" | "edit",
  customer: Customer | null | undefined,
  formId: string,
  t: (key: string) => string,
) {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [familyLoading, setFamilyLoading] = useState(false);
  const [familyError, setFamilyError] = useState<string | null>(null);
  const baseCustomerId = customer?._id || null;

  async function reloadFamily(id?: string) {
    const targetId = id || baseCustomerId || formId;
    if (!targetId) return;
    setFamilyLoading(true);
    setFamilyError(null);
    const result = await fetchFamilyMembers(targetId, t);
    setFamilyMembers(result.members);
    setFamilyError(result.error);
    setFamilyLoading(false);
  }

  useEffect(() => {
    if (mode !== "edit" || !customer?._id) return;
    void reloadFamily(customer._id);
  }, [mode, customer?._id]);

  useEffect(() => {
    if (mode !== "create") return;
    setFamilyMembers([]);
  }, [mode]);

  return { familyMembers, setFamilyMembers, familyLoading, familyError, baseCustomerId, reloadFamily };
}
