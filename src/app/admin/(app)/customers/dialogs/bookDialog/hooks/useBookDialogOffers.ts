"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Offer } from "../../../types";
import { toastErrorMessage } from "@/lib/toast-messages";
import { fetchOffers } from "../bookDialogApi";

export function useBookDialogOffers() {
  const { t } = useTranslation();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void loadOffers(setOffers, setLoadingOffers, setErr, t);
  }, [t]);

  return { offers, loadingOffers, err, setErr };
}

async function loadOffers(
  setOffers: (v: Offer[]) => void,
  setLoading: (v: boolean) => void,
  setErr: (v: string | null) => void,
  t: (key: string) => string,
) {
  try {
    setLoading(true);
    setErr(null);
    const list = await fetchOffers();
    setOffers(list as any);
  } catch (e: unknown) {
    setErr(
      toastErrorMessage(
        t,
        e,
        "common.admin.customers.bookDialog.errors.loadOffers",
      ),
    );
  } finally {
    setLoading(false);
  }
}
