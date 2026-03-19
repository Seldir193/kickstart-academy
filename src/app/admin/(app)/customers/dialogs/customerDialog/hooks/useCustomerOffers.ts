"use client";

import { useEffect, useMemo, useState } from "react";
import type { Offer } from "../../../types";
import { fetchOffers } from "../api";

export function useCustomerOffers(mode: "create" | "edit") {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [offersLoading, setOffersLoading] = useState(false);

  useEffect(() => {
    if (mode !== "edit") return;
    void loadOffers(setOffers, setOffersLoading);
  }, [mode]);

  const offerById = useMemo(() => indexOffers(offers), [offers]);

  return { offers, offersLoading, offerById };
}

async function loadOffers(
  setOffers: (v: Offer[]) => void,
  setLoading: (v: boolean) => void,
) {
  try {
    setLoading(true);
    setOffers(await fetchOffers(200));
  } finally {
    setLoading(false);
  }
}

function indexOffers(offers: Offer[]) {
  const m: Record<string, Offer> = {};
  for (const o of offers) m[o._id] = o;
  return m;
}
