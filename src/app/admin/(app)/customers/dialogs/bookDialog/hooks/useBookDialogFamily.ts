//src\app\admin\(app)\customers\dialogs\bookDialog\hooks\useBookDialogFamily.ts
"use client";

import { useEffect, useState } from "react";
import type { FamilyMember } from "../types";
import { fetchFamily } from "../bookDialogApi";

export function useBookDialogFamily(customerId: string) {
  const [family, setFamily] = useState<FamilyMember[] | null>(null);
  const [familyLoading, setFamilyLoading] = useState(false);
  const [familyError, setFamilyError] = useState<string | null>(null);
  const [baseSelectedId, setBaseSelectedId] = useState<string>("");

  useEffect(() => {
    if (!customerId) return;
    void loadFamily(
      customerId,
      setFamily,
      setFamilyLoading,
      setFamilyError,
      setBaseSelectedId,
    );
  }, [customerId]);

  return { family, familyLoading, familyError, baseSelectedId };
}

async function loadFamily(
  customerId: string,
  setFamily: (v: FamilyMember[] | null) => void,
  setLoading: (v: boolean) => void,
  setErr: (v: string | null) => void,
  setBase: (v: string) => void,
) {
  try {
    setLoading(true);
    setErr(null);
    const data = await fetchFamily(customerId);
    const members = Array.isArray(data.members) ? data.members : [];
    setFamily(members);
    setBase(pickInitialMemberId(data.baseCustomerId, members));
  } catch (e: any) {
    console.warn("[BookDialog] load family failed:", e?.message || e);
    setFamily(null);
    setErr(e?.message || "Failed to load family");
  } finally {
    setLoading(false);
  }
}

function pickInitialMemberId(
  baseCustomerId: string | undefined,
  members: FamilyMember[],
) {
  if (!members.length) return "";
  if (!baseCustomerId) return members[0]._id;
  return members.find((m) => m._id === baseCustomerId)?._id || members[0]._id;
}
