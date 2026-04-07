//src\app\admin\(app)\customers\hooks\useCustomersList.ts
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toastErrorMessage } from "@/lib/toast-messages";
import type { MutableRefObject } from "react";
import type { Customer, ListResponse } from "../types";

export type Tab = "customers" | "newsletter" | "all";
export type NewsletterFilter = "all" | "true" | "false";

type Args = {
  q: string;
  tab: Tab;
  newsletter: NewsletterFilter;
  page: number;
  limit: number;
};

type State = {
  items: Customer[];
  total: number;
  listLoading: boolean;
  showListLoading: boolean;
  err: string | null;
  reload: () => Promise<void>;
};

function buildQuery(a: Args) {
  const p = new URLSearchParams();
  const qq = a.q.trim();

  if (qq) p.set("q", qq);
  if (a.newsletter !== "all") p.set("newsletter", a.newsletter);
  if (a.tab !== "all") p.set("tab", a.tab);

  p.set("page", String(a.page));
  p.set("limit", String(a.limit));
  p.set("sort", "createdAt:desc");

  return p.toString();
}

function clearTimer(ref: MutableRefObject<number | null>) {
  if (ref.current != null) window.clearTimeout(ref.current);
  ref.current = null;
}

function startTimer(
  ref: MutableRefObject<number | null>,
  setShow: (v: boolean) => void,
) {
  clearTimer(ref);
  setShow(false);
  ref.current = window.setTimeout(() => setShow(true), 300);
}

async function fetchList(qs: string, signal: AbortSignal) {
  const res = await fetch(`/api/admin/customers?${qs}`, {
    credentials: "include",
    cache: "no-store",
    signal,
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as ListResponse;
}

export function useCustomersList(args: Args): State {
  const { t } = useTranslation();
  const [items, setItems] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [listLoading, setListLoading] = useState(true);
  const [showListLoading, setShowListLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const reqIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<number | null>(null);

  const qs = useMemo(
    () => buildQuery(args),
    [args.q, args.tab, args.newsletter, args.page, args.limit],
  );

  async function reload() {
    const id = ++reqIdRef.current;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setListLoading(true);
    startTimer(timerRef, setShowListLoading);
    setErr(null);

    try {
      const data = await fetchList(qs, abortRef.current.signal);
      if (reqIdRef.current !== id) return;

      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      if (reqIdRef.current !== id) return;

      setErr(toastErrorMessage(t, e, "admin.customers.list.error.loadFailed"));
    } finally {
      if (reqIdRef.current !== id) return;

      setListLoading(false);
      clearTimer(timerRef);
      setShowListLoading(false);
    }
  }

  useEffect(() => {
    void reload();
    return () => clearTimer(timerRef);
  }, [qs]);

  return { items, total, listLoading, showListLoading, err, reload };
}
