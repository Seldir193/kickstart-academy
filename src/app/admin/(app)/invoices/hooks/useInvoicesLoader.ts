// src/app/admin/(app)/invoices/hooks/useInvoicesLoader.ts
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DocItem } from "../utils/invoiceUi";
import { runLoad, stableArgs } from "./invoicesLoader/loaderLogic";
import type { LoaderArgs } from "./invoicesLoader/loaderApi";

export function useInvoicesLoader(args: LoaderArgs) {
  const [items, setItems] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const reqIdRef = useRef(0);

  const stable = useMemo(
    () => stableArgs(args),
    [
      args.basePath,
      args.invoiceQuery,
      args.q,
      args.from,
      args.to,
      args.dunningFilter,
      args.sort,
    ],
  );

  const load = useCallback(async () => {
    reqIdRef.current += 1;
    const reqId = reqIdRef.current;
    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setErr(null);

    try {
      const merged = await runLoad(stable, controller.signal);
      if (reqId !== reqIdRef.current) return;
      setItems(merged);
      setHasLoadedOnce(true);
    } catch (e: any) {
      if (reqId !== reqIdRef.current) return;
      if (e?.name === "AbortError") return;
      setErr(e?.message || "Load failed");
      setItems([]);
    } finally {
      if (reqId !== reqIdRef.current) return;
      setLoading(false);
    }
  }, [stable]);

  useEffect(() => {
    void load();
    return () => abortRef.current?.abort();
  }, [load]);

  const reload = useCallback(async () => {
    await load();
  }, [load]);

  return { items, loading, hasLoadedOnce, err, reload };
}
