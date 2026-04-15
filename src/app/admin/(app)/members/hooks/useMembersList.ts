// src/app/admin/(app)/members/hooks/useMembersList.ts
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toastErrorMessage } from "@/lib/toast-messages";
import type { AdminMember, MemberRole } from "../api";
import { fetchMembers } from "../api";

type ArgsObj = {
  enabled: boolean;
  search: string;
  role: MemberRole | "";
  status: "active" | "inactive" | "";
};

type State = {
  items: AdminMember[];
  loading: boolean;
  error: string | null;
};

function clean(v: unknown) {
  return String(v ?? "").trim();
}

function toItems(v: unknown) {
  return Array.isArray(v) ? (v as AdminMember[]) : [];
}

function normArgs(
  a: boolean | ArgsObj,
  search?: string,
  role?: MemberRole | "",
  status?: "active" | "inactive" | "",
): ArgsObj {
  if (typeof a === "object" && a) return a;
  return {
    enabled: Boolean(a),
    search: clean(search),
    role: (role || "") as any,
    status: (status || "") as any,
  };
}

export function useMembersList(
  enabled: boolean,
  search: string,
  role: MemberRole | "",
  status: "active" | "inactive" | "",
): {
  items: AdminMember[];
  loading: boolean;
  error: string | null;
  reload: () => void;
};
export function useMembersList(args: ArgsObj): {
  items: AdminMember[];
  loading: boolean;
  error: string | null;
  reload: () => void;
};
export function useMembersList(
  a: boolean | ArgsObj,
  search?: string,
  role?: MemberRole | "",
  status?: "active" | "inactive" | "",
) {
  const { t } = useTranslation();
  const args = normArgs(a, search, role, status);

  const [state, setState] = useState<State>({
    items: [],
    loading: false,
    error: null,
  });

  const abortRef = useRef<AbortController | null>(null);
  const reqIdRef = useRef(0);
  const keyRef = useRef("");

  const resetDisabled = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState({ items: [], loading: false, error: null });
  }, []);

  const startRequest = useCallback(() => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const reqId = ++reqIdRef.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    return { ctrl, reqId };
  }, []);

  const finish = useCallback(() => {
    setState((s) => ({ ...s, loading: false }));
  }, []);

  const reload = useCallback(async () => {
    if (!args.enabled) return void resetDisabled();

    const { ctrl, reqId } = startRequest();
    try {
      const data = await fetchMembers(t, {
        search: args.search,
        role: args.role,
        status: args.status,
        signal: ctrl.signal,
      });
      if (ctrl.signal.aborted || reqId !== reqIdRef.current) return;
      setState((s) => ({ ...s, items: toItems(data.items) }));
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      if (ctrl.signal.aborted || reqId !== reqIdRef.current) return;
      setState((s) => ({
        ...s,
        error: toastErrorMessage(
          t,
          e,
          "common.admin.members.errors.loadFailed",
        ),
        items: [],
      }));
    } finally {
      if (ctrl.signal.aborted || reqId !== reqIdRef.current) return;
      finish();
    }
  }, [
    args.enabled,
    args.role,
    args.search,
    args.status,
    finish,
    resetDisabled,
    startRequest,
    t,
  ]);

  useEffect(() => {
    const nextKey = `${args.enabled ? 1 : 0}|${clean(args.search)}|${clean(args.role)}|${clean(args.status)}`;

    if (keyRef.current !== nextKey) {
      keyRef.current = nextKey;
      if (!args.enabled) return void resetDisabled();
    }

    reload();
    return () => abortRef.current?.abort();
  }, [
    args.enabled,
    args.role,
    args.search,
    args.status,
    reload,
    resetDisabled,
  ]);

  const items = useMemo(() => [...state.items], [state.items]);

  return { items, loading: state.loading, error: state.error, reload };
}
