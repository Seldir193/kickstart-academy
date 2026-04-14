"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toastErrorMessage } from "@/lib/toast-messages";
import { fetchVouchers } from "../api";
import type { Voucher, VoucherStatus } from "../types";

export function useVouchersList(params: { q: string; status: VoucherStatus }) {
  const { t } = useTranslation();
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
      setError(
        toastErrorMessage(t, e, "common.admin.vouchers.error.loadFailed"),
      );
    } finally {
      setLoading(false);
    }
  }, [params.q, params.status, t]);

  useEffect(() => {
    load();
  }, [load]);

  return { items, loading, error, reload: load };
}
