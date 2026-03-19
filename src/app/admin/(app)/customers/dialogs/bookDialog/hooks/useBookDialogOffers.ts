"use client";

import { useEffect, useState } from "react";
import type { Offer } from "../../../types";
import { fetchOffers } from "../bookDialogApi";

export function useBookDialogOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void loadOffers(setOffers, setLoadingOffers, setErr);
  }, []);

  return { offers, loadingOffers, err, setErr };
}

async function loadOffers(
  setOffers: (v: Offer[]) => void,
  setLoading: (v: boolean) => void,
  setErr: (v: string | null) => void,
) {
  try {
    setLoading(true);
    setErr(null);
    const list = await fetchOffers();
    setOffers(list as any);
  } catch (e: any) {
    setErr(e?.message || "Failed to load offers");
  } finally {
    setLoading(false);
  }
}
