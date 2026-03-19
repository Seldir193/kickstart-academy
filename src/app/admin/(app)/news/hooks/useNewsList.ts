// src/app/admin/(app)/news/hooks/useNewsList.ts
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { News, SortKey } from "../types";
import { PAGE_LIMIT } from "../constants";
import { fetchNewsPage, type NewsView } from "../api";

type State = {
  items: News[];
  pages: number;
  loading: boolean;
  error: string | null;
};

function toPages(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function toItems(v: unknown) {
  return Array.isArray(v) ? (v as News[]) : [];
}

function clean(v: unknown) {
  return String(v ?? "").trim();
}

function toTs(v: unknown) {
  const t = Date.parse(clean(v));
  return Number.isFinite(t) ? t : 0;
}

function cmpStr(a: unknown, b: unknown) {
  return clean(a).localeCompare(clean(b), "de", { sensitivity: "base" });
}

function sortItems(items: News[], sort: SortKey) {
  const arr = [...items];

  if (sort === "newest" || sort === "oldest") {
    arr.sort((a, b) => {
      const at =
        toTs(a.date) ||
        toTs((a as any).createdAt) ||
        toTs((a as any).updatedAt);
      const bt =
        toTs(b.date) ||
        toTs((b as any).createdAt) ||
        toTs((b as any).updatedAt);
      return sort === "newest" ? bt - at : at - bt;
    });
    return arr;
  }

  if (sort === "title_asc") {
    arr.sort((a, b) => cmpStr(a.title, b.title));
    return arr;
  }

  arr.sort((a, b) => cmpStr(b.title, a.title));
  return arr;
}

export function useNewsList(
  view?: NewsView,
  enabled: boolean = true,
  q: string = "",
  sort: SortKey = "newest",
  ready: boolean = true,
) {
  const effectiveEnabled = enabled && ready;

  const [page, setPage] = useState(1);
  const [state, setState] = useState<State>({
    items: [],
    pages: 1,
    loading: false,
    error: null,
  });

  const abortRef = useRef<AbortController | null>(null);
  const reqIdRef = useRef(0);
  const keyRef = useRef<string>("");

  const resetDisabled = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState({ items: [], pages: 1, loading: false, error: null });
  }, []);

  const startRequest = useCallback(() => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const reqId = ++reqIdRef.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    return { ctrl, reqId };
  }, []);

  const applySuccess = useCallback((data: any) => {
    setState((s) => ({
      ...s,
      items: toItems(data?.items),
      pages: toPages(data?.pages),
    }));
  }, []);

  const applyError = useCallback((e: any) => {
    setState((s) => ({
      ...s,
      error: e?.message || "Load failed.",
      pages: 1,
    }));
  }, []);

  const finish = useCallback(() => {
    setState((s) => ({ ...s, loading: false }));
  }, []);

  const reload = useCallback(async () => {
    if (!effectiveEnabled) {
      resetDisabled();
      return;
    }

    const { ctrl, reqId } = startRequest();
    try {
      const data = await fetchNewsPage({
        page,
        limit: PAGE_LIMIT,
        view,
        search: q,
        signal: ctrl.signal,
      });
      if (ctrl.signal.aborted || reqId !== reqIdRef.current) return;
      applySuccess(data);
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      if (ctrl.signal.aborted || reqId !== reqIdRef.current) return;
      applyError(e);
    } finally {
      if (ctrl.signal.aborted || reqId !== reqIdRef.current) return;
      finish();
    }
  }, [
    applyError,
    applySuccess,
    effectiveEnabled,
    finish,
    page,
    q,
    resetDisabled,
    startRequest,
    view,
  ]);

  useEffect(() => {
    const nextKey = `${effectiveEnabled ? 1 : 0}|${String(view || "")}|${clean(q)}`;
    if (keyRef.current !== nextKey) {
      keyRef.current = nextKey;
      if (!effectiveEnabled) return void resetDisabled();
      if (page !== 1) return void setPage(1);
    }

    reload();
    return () => abortRef.current?.abort();
  }, [effectiveEnabled, page, q, reload, resetDisabled, view]);

  const sortedItems = useMemo(
    () => sortItems(state.items, sort),
    [state.items, sort],
  );

  return {
    items: sortedItems,
    page,
    pages: state.pages,
    loading: state.loading,
    error: state.error,
    setPage,
    reload,
  };
}

// "use client";

// import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import type { News, SortKey } from "../types";
// import { PAGE_LIMIT } from "../constants";
// import { fetchNewsPage, type NewsView } from "../api";

// type State = {
//   items: News[];
//   pages: number;
//   loading: boolean;
//   error: string | null;
// };

// function toPages(v: unknown) {
//   const n = Number(v);
//   return Number.isFinite(n) && n > 0 ? n : 1;
// }

// function toItems(v: unknown) {
//   return Array.isArray(v) ? (v as News[]) : [];
// }

// function clean(v: unknown) {
//   return String(v ?? "").trim();
// }

// function toTs(v: unknown) {
//   const t = Date.parse(clean(v));
//   return Number.isFinite(t) ? t : 0;
// }

// function cmpStr(a: unknown, b: unknown) {
//   return clean(a).localeCompare(clean(b), "de", { sensitivity: "base" });
// }

// function sortItems(items: News[], sort: SortKey) {
//   const arr = [...items];

//   if (sort === "newest" || sort === "oldest") {
//     arr.sort((a, b) => {
//       const at =
//         toTs(a.date) ||
//         toTs((a as any).createdAt) ||
//         toTs((a as any).updatedAt);
//       const bt =
//         toTs(b.date) ||
//         toTs((b as any).createdAt) ||
//         toTs((b as any).updatedAt);
//       return sort === "newest" ? bt - at : at - bt;
//     });
//     return arr;
//   }

//   if (sort === "title_asc") {
//     arr.sort((a, b) => cmpStr(a.title, b.title));
//     return arr;
//   }

//   arr.sort((a, b) => cmpStr(b.title, a.title));
//   return arr;
// }

// export function useNewsList(
//   view?: NewsView,
//   enabled: boolean = true,
//   q: string = "",
//   sort: SortKey = "newest",
// ) {
//   const [page, setPage] = useState(1);
//   const [state, setState] = useState<State>({
//     items: [],
//     pages: 1,
//     loading: false,
//     error: null,
//   });

//   const abortRef = useRef<AbortController | null>(null);
//   const reqIdRef = useRef(0);
//   const keyRef = useRef<string>("");

//   const resetDisabled = useCallback(() => {
//     abortRef.current?.abort();
//     abortRef.current = null;
//     setState({ items: [], pages: 1, loading: false, error: null });
//   }, []);

//   const startRequest = useCallback(() => {
//     abortRef.current?.abort();
//     const ctrl = new AbortController();
//     abortRef.current = ctrl;
//     const reqId = ++reqIdRef.current;
//     setState((s) => ({ ...s, loading: true, error: null }));
//     return { ctrl, reqId };
//   }, []);

//   const applySuccess = useCallback((data: any) => {
//     setState((s) => ({
//       ...s,
//       items: toItems(data?.items),
//       pages: toPages(data?.pages),
//     }));
//   }, []);

//   const applyError = useCallback((e: any) => {
//     setState((s) => ({
//       ...s,
//       error: e?.message || "Load failed.",
//       pages: 1,
//     }));
//   }, []);

//   const finish = useCallback(() => {
//     setState((s) => ({ ...s, loading: false }));
//   }, []);

//   const reload = useCallback(async () => {
//     if (!enabled) return void resetDisabled();

//     const { ctrl, reqId } = startRequest();
//     try {
//       const data = await fetchNewsPage({
//         page,
//         limit: PAGE_LIMIT,
//         view,
//         search: q,
//         signal: ctrl.signal,
//       });
//       if (ctrl.signal.aborted || reqId !== reqIdRef.current) return;
//       applySuccess(data);
//     } catch (e: any) {
//       if (e?.name === "AbortError") return;
//       if (ctrl.signal.aborted || reqId !== reqIdRef.current) return;
//       applyError(e);
//     } finally {
//       if (ctrl.signal.aborted || reqId !== reqIdRef.current) return;
//       finish();
//     }
//   }, [
//     applyError,
//     applySuccess,
//     enabled,
//     finish,
//     page,
//     q,
//     resetDisabled,
//     startRequest,
//     view,
//   ]);

//   useEffect(() => {
//     const nextKey = `${enabled ? 1 : 0}|${String(view || "")}|${clean(q)}`;
//     if (keyRef.current !== nextKey) {
//       keyRef.current = nextKey;
//       if (!enabled) return void resetDisabled();
//       if (page !== 1) return void setPage(1);
//     }

//     reload();
//     return () => abortRef.current?.abort();
//   }, [enabled, page, q, reload, resetDisabled, view]);

//   const sortedItems = useMemo(
//     () => sortItems(state.items, sort),
//     [state.items, sort],
//   );

//   return {
//     items: sortedItems,
//     page,
//     pages: state.pages,
//     loading: state.loading,
//     error: state.error,
//     setPage,
//     reload,
//   };
// }

// "use client";

// import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import type { News, SortKey } from "../types";
// import { PAGE_LIMIT } from "../constants";
// import { fetchNewsPage, type NewsView } from "../api";

// type State = {
//   items: News[];
//   pages: number;
//   loading: boolean;
//   error: string | null;
// };

// function toPages(v: unknown) {
//   const n = Number(v);
//   return Number.isFinite(n) && n > 0 ? n : 1;
// }

// function toItems(v: unknown) {
//   return Array.isArray(v) ? (v as News[]) : [];
// }

// function clean(v: unknown) {
//   return String(v ?? "").trim();
// }

// function toTs(v: unknown) {
//   const t = Date.parse(clean(v));
//   return Number.isFinite(t) ? t : 0;
// }

// function cmpStr(a: unknown, b: unknown) {
//   return clean(a).localeCompare(clean(b), "de", { sensitivity: "base" });
// }

// function sortItems(items: News[], sort: SortKey) {
//   const arr = [...items];

//   if (sort === "newest" || sort === "oldest") {
//     arr.sort((a, b) => {
//       const at =
//         toTs(a.date) ||
//         toTs((a as any).createdAt) ||
//         toTs((a as any).updatedAt);
//       const bt =
//         toTs(b.date) ||
//         toTs((b as any).createdAt) ||
//         toTs((b as any).updatedAt);
//       return sort === "newest" ? bt - at : at - bt;
//     });
//     return arr;
//   }

//   if (sort === "title_asc") {
//     arr.sort((a, b) => cmpStr(a.title, b.title));
//     return arr;
//   }

//   arr.sort((a, b) => cmpStr(b.title, a.title));
//   return arr;
// }

// export function useNewsList(
//   view?: NewsView,
//   enabled: boolean = true,
//   q: string = "",
//   sort: SortKey = "newest",
// ) {
//   const [page, setPage] = useState(1);
//   const [state, setState] = useState<State>({
//     items: [],
//     pages: 1,
//     loading: false,
//     error: null,
//   });

//   const abortRef = useRef<AbortController | null>(null);
//   const reqIdRef = useRef(0);

//   const inflightRef = useRef<{ key: string; p: Promise<void> } | null>(null);
//   const lastRef = useRef<{ key: string; at: number } | null>(null);

//   const resetDisabled = useCallback(() => {
//     abortRef.current?.abort();
//     abortRef.current = null;
//     inflightRef.current = null;
//     setState({ items: [], pages: 1, loading: false, error: null });
//   }, []);

//   const startRequest = useCallback(() => {
//     abortRef.current?.abort();
//     const ctrl = new AbortController();
//     abortRef.current = ctrl;
//     const reqId = ++reqIdRef.current;
//     setState((s) => ({ ...s, loading: true, error: null }));
//     return { ctrl, reqId };
//   }, []);

//   const applySuccess = useCallback((data: any) => {
//     setState((s) => ({
//       ...s,
//       items: toItems(data?.items),
//       pages: toPages(data?.pages),
//     }));
//   }, []);

//   const applyError = useCallback((e: any) => {
//     setState((s) => ({ ...s, error: e?.message || "Load failed.", pages: 1 }));
//   }, []);

//   const finish = useCallback(() => {
//     setState((s) => ({ ...s, loading: false }));
//   }, []);

//   const reload = useCallback(async () => {
//     if (!enabled) return void resetDisabled();

//     const key = `${clean(view)}|${page}|${clean(q)}|${PAGE_LIMIT}`;
//     const now = Date.now();

//     const inflight = inflightRef.current;
//     if (inflight && inflight.key === key) return inflight.p;

//     const last = lastRef.current;
//     if (last && last.key === key && now - last.at < 300) return;

//     lastRef.current = { key, at: now };

//     const p = (async () => {
//       const { ctrl, reqId } = startRequest();
//       try {
//         const data = await fetchNewsPage({
//           page,
//           limit: PAGE_LIMIT,
//           view,
//           search: q,
//           signal: ctrl.signal,
//         });
//         if (ctrl.signal.aborted || reqId !== reqIdRef.current) return;
//         applySuccess(data);
//       } catch (e: any) {
//         if (e?.name === "AbortError") return;
//         if (ctrl.signal.aborted || reqId !== reqIdRef.current) return;
//         applyError(e);
//       } finally {
//         if (ctrl.signal.aborted || reqId !== reqIdRef.current) return;
//         finish();
//       }
//     })();

//     inflightRef.current = { key, p };
//     await p.finally(() => {
//       if (inflightRef.current?.key === key) inflightRef.current = null;
//     });
//   }, [
//     applyError,
//     applySuccess,
//     enabled,
//     finish,
//     page,
//     q,
//     resetDisabled,
//     startRequest,
//     view,
//   ]);

//   useEffect(() => {
//     void reload();
//     return () => abortRef.current?.abort();
//   }, [reload]);

//   useEffect(() => {
//     setPage(1);
//   }, [view, enabled, q]);

//   const sortedItems = useMemo(
//     () => sortItems(state.items, sort),
//     [state.items, sort],
//   );

//   return {
//     items: sortedItems,
//     page,
//     pages: state.pages,
//     loading: state.loading,
//     error: state.error,
//     setPage,
//     reload,
//   };
// }

// "use client";

// import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import type { News, SortKey } from "../types";
// import { PAGE_LIMIT } from "../constants";
// import { fetchNewsPage, type NewsView } from "../api";

// type State = {
//   items: News[];
//   pages: number;
//   loading: boolean;
//   error: string | null;
// };

// function toPages(v: unknown) {
//   const n = Number(v);
//   return Number.isFinite(n) && n > 0 ? n : 1;
// }

// function toItems(v: unknown) {
//   return Array.isArray(v) ? (v as News[]) : [];
// }

// function clean(v: unknown) {
//   return String(v ?? "").trim();
// }

// function toTs(v: unknown) {
//   const t = Date.parse(clean(v));
//   return Number.isFinite(t) ? t : 0;
// }

// function cmpStr(a: unknown, b: unknown) {
//   return clean(a).localeCompare(clean(b), "de", { sensitivity: "base" });
// }

// function sortItems(items: News[], sort: SortKey) {
//   const arr = [...items];

//   if (sort === "newest" || sort === "oldest") {
//     arr.sort((a, b) => {
//       const at =
//         toTs(a.date) ||
//         toTs((a as any).createdAt) ||
//         toTs((a as any).updatedAt);
//       const bt =
//         toTs(b.date) ||
//         toTs((b as any).createdAt) ||
//         toTs((b as any).updatedAt);
//       return sort === "newest" ? bt - at : at - bt;
//     });
//     return arr;
//   }

//   if (sort === "title_asc") {
//     arr.sort((a, b) => cmpStr(a.title, b.title));
//     return arr;
//   }

//   arr.sort((a, b) => cmpStr(b.title, a.title));
//   return arr;
// }

// export function useNewsList(
//   view?: NewsView,
//   enabled: boolean = true,
//   q: string = "",
//   sort: SortKey = "newest",
// ) {
//   const [page, setPage] = useState(1);
//   const [state, setState] = useState<State>({
//     items: [],
//     pages: 1,
//     loading: false,
//     error: null,
//   });

//   const abortRef = useRef<AbortController | null>(null);
//   const reqIdRef = useRef(0);

//   const resetDisabled = useCallback(() => {
//     abortRef.current = null;
//     setState({ items: [], pages: 1, loading: false, error: null });
//   }, []);

//   const startRequest = useCallback(() => {
//     abortRef.current?.abort();
//     const ctrl = new AbortController();
//     abortRef.current = ctrl;
//     const reqId = ++reqIdRef.current;
//     setState((s) => ({ ...s, loading: true, error: null }));
//     return { ctrl, reqId };
//   }, []);

//   const applySuccess = useCallback((data: any) => {
//     setState((s) => ({
//       ...s,
//       items: toItems(data?.items),
//       pages: toPages(data?.pages),
//     }));
//   }, []);

//   const applyError = useCallback((e: any) => {
//     setState((s) => ({ ...s, error: e?.message || "Load failed.", pages: 1 }));
//   }, []);

//   const finish = useCallback(() => {
//     setState((s) => ({ ...s, loading: false }));
//   }, []);

//   const reload = useCallback(async () => {
//     if (!enabled) return void resetDisabled();

//     const { ctrl, reqId } = startRequest();
//     try {
//       const data = await fetchNewsPage({
//         page,
//         limit: PAGE_LIMIT,
//         view,
//         search: q,
//         signal: ctrl.signal,
//       });
//       if (ctrl.signal.aborted || reqId !== reqIdRef.current) return;
//       applySuccess(data);
//     } catch (e: any) {
//       if (e?.name === "AbortError") return;
//       if (ctrl.signal.aborted || reqId !== reqIdRef.current) return;
//       applyError(e);
//     } finally {
//       if (ctrl.signal.aborted || reqId !== reqIdRef.current) return;
//       finish();
//     }
//   }, [
//     applyError,
//     applySuccess,
//     enabled,
//     finish,
//     page,
//     q,
//     resetDisabled,
//     startRequest,
//     view,
//   ]);

//   useEffect(() => {
//     reload();
//     return () => abortRef.current?.abort();
//   }, [reload]);

//   useEffect(() => {
//     setPage(1);
//   }, [view, enabled, q]);

//   const sortedItems = useMemo(
//     () => sortItems(state.items, sort),
//     [state.items, sort],
//   );

//   return {
//     items: sortedItems,
//     page,
//     pages: state.pages,
//     loading: state.loading,
//     error: state.error,
//     setPage,
//     reload,
//   };
// }

// // src/app/admin/(app)/news/hooks/useNewsList.ts
// "use client";

// import { useCallback, useEffect, useRef, useState } from "react";
// import type { News } from "../types";
// import { PAGE_LIMIT } from "../constants";
// import { fetchNewsPage, type NewsView } from "../api";

// type State = {
//   items: News[];
//   pages: number;
//   loading: boolean;
//   error: string | null;
// };

// function toPages(v: unknown) {
//   const n = Number(v);
//   return Number.isFinite(n) && n > 0 ? n : 1;
// }

// function toItems(v: unknown) {
//   return Array.isArray(v) ? (v as News[]) : [];
// }

// export function useNewsList(view?: NewsView, enabled: boolean = true) {
//   const [page, setPage] = useState(1);
//   const [state, setState] = useState<State>({
//     items: [],
//     pages: 1,
//     loading: false,
//     error: null,
//   });

//   const abortRef = useRef<AbortController | null>(null);
//   const reqIdRef = useRef(0);

//   const resetDisabled = useCallback(() => {
//     abortRef.current = null;
//     setState({ items: [], pages: 1, loading: false, error: null });
//   }, []);

//   const startRequest = useCallback(() => {
//     abortRef.current?.abort();
//     const ctrl = new AbortController();
//     abortRef.current = ctrl;
//     const reqId = ++reqIdRef.current;
//     setState((s) => ({ ...s, loading: true, error: null }));
//     return { ctrl, reqId };
//   }, []);

//   const applySuccess = useCallback((data: any) => {
//     setState((s) => ({
//       ...s,
//       items: toItems(data?.items),
//       pages: toPages(data?.pages),
//     }));
//   }, []);

//   const applyError = useCallback((e: any) => {
//     setState((s) => ({ ...s, error: e?.message || "Load failed.", pages: 1 }));
//   }, []);

//   const finish = useCallback(() => {
//     setState((s) => ({ ...s, loading: false }));
//   }, []);

//   const reload = useCallback(async () => {
//     if (!enabled) return void resetDisabled();

//     const { ctrl, reqId } = startRequest();
//     try {
//       const data = await fetchNewsPage({
//         page,
//         limit: PAGE_LIMIT,
//         view,
//         signal: ctrl.signal,
//       });
//       if (ctrl.signal.aborted || reqId !== reqIdRef.current) return;
//       applySuccess(data);
//     } catch (e: any) {
//       if (e?.name === "AbortError") return;
//       if (ctrl.signal.aborted || reqId !== reqIdRef.current) return;
//       applyError(e);
//     } finally {
//       if (ctrl.signal.aborted || reqId !== reqIdRef.current) return;
//       finish();
//     }
//   }, [
//     applyError,
//     applySuccess,
//     enabled,
//     finish,
//     page,
//     resetDisabled,
//     startRequest,
//     view,
//   ]);

//   useEffect(() => {
//     reload();
//     return () => abortRef.current?.abort();
//   }, [reload]);

//   useEffect(() => {
//     setPage(1);
//   }, [view, enabled]);

//   return {
//     items: state.items,
//     page,
//     pages: state.pages,
//     loading: state.loading,
//     error: state.error,
//     setPage,
//     reload,
//   };
// }
