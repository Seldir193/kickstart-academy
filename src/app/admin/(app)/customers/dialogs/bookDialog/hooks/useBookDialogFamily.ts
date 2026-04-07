//src\app\admin\(app)\customers\dialogs\bookDialog\hooks\useBookDialogFamily.ts
"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { FamilyMember } from "../types";
import { toastErrorMessage } from "@/lib/toast-messages";
import { fetchFamily } from "../bookDialogApi";

export function useBookDialogFamily(customerId: string) {
  const { t } = useTranslation();
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
      t,
    );
  }, [customerId, t]);

  return { family, familyLoading, familyError, baseSelectedId };
}

async function loadFamily(
  customerId: string,
  setFamily: (v: FamilyMember[] | null) => void,
  setLoading: (v: boolean) => void,
  setErr: (v: string | null) => void,
  setBase: (v: string) => void,
  t: (key: string) => string,
) {
  try {
    setLoading(true);
    setErr(null);
    const data = await fetchFamily(customerId);
    const members = Array.isArray(data.members) ? data.members : [];
    setFamily(members);
    setBase(pickInitialMemberId(data.baseCustomerId, members));
  } catch (e: unknown) {
    console.warn("[BookDialog] load family failed:", e);
    setFamily(null);
    setErr(
      toastErrorMessage(
        t,
        e,
        "common.admin.customers.bookDialog.errors.loadFamily",
      ),
    );
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
