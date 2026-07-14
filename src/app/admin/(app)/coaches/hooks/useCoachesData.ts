"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchCoachesList, fetchMe } from "../api";
import { FETCH_LIMIT } from "../constants";
import { isAbortError } from "../utils";
import type { Coach, Me } from "../types";

function pickItems(resp: any) {
  if (!resp || resp.ok !== true) return [];
  if (resp.combined === true) {
    const mine = Array.isArray(resp?.mine?.items) ? resp.mine.items : [];
    const p = Array.isArray(resp?.providerPending?.items)
      ? resp.providerPending.items
      : [];
    const a = Array.isArray(resp?.providerApproved?.items)
      ? resp.providerApproved.items
      : [];
    const r = Array.isArray(resp?.providerRejected?.items)
      ? resp.providerRejected.items
      : [];
    return [...mine, ...p, ...a, ...r];
  }
  return Array.isArray(resp.items) ? resp.items : [];
}

export function useCoachesData() {
  const { t } = useTranslation();
  const [me, setMe] = useState<Me | null>(null);
  const [resp, setResp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ctrlRef = useRef<AbortController | null>(null);
  const seqRef = useRef(0);

  useEffect(() => {
    const ctrl = new AbortController();

    fetchMe(ctrl.signal)
      .then((m) => {
        if (!ctrl.signal.aborted) setMe(m);
      })
      .catch(() => null);

    return () => ctrl.abort();
  }, []);

  async function reload() {
    ctrlRef.current?.abort();
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;
    const seq = ++seqRef.current;

    setLoading(true);
    setError(null);

    try {
      const r = await fetchCoachesList({
        page: 1,
        limit: FETCH_LIMIT,
        signal: ctrl.signal,
      });

      if (ctrl.signal.aborted) return;
      if (seq !== seqRef.current) return;

      setResp(r);
    } catch (e: any) {
      if (isAbortError(e) || ctrl.signal.aborted) return;
      if (seq !== seqRef.current) return;

      setError(e?.message || t("common.admin.coaches.errors.loadFailed"));
      setResp(null);
    } finally {
      if (ctrl.signal.aborted) return;
      if (seq !== seqRef.current) return;
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!me?.id) return;
    reload();
    return () => ctrlRef.current?.abort();
  }, [me?.id]);

  const items = useMemo(() => pickItems(resp), [resp]);

  return { me, items, resp, loading, error, reload };
}
