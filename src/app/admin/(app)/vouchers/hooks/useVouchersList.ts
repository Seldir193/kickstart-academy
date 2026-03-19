"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchVouchers } from "../api";
import type { Voucher, VoucherStatus } from "../types";

export function useVouchersList(params: { q: string; status: VoucherStatus }) {
  const [items, setItems] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchVouchers({
        q: params.q,
        status: params.status,
      });
      setItems(Array.isArray(data?.vouchers) ? data.vouchers : []);
    } catch (e: any) {
      setError(e?.message || "Failed to load vouchers.");
    } finally {
      setLoading(false);
    }
  }, [params.q, params.status]);

  useEffect(() => {
    load();
  }, [load]);

  return { items, loading, error, reload: load };
}
