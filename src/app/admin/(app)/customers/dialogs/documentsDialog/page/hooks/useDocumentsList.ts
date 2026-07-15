import { useEffect, useMemo, useState } from "react";
import { toastErrorMessage } from "@/lib/toast-messages";
import type { DocItem, ListResponse } from "../../types";
import type {
  DocumentsListState,
  FamilyScopeState,
  FilterState,
} from "../types";
import { qs, sortParamFrom } from "../../helpers";
import { safeText } from "../lib/text";

type Args = {
  customerId: string;
  t: (key: string, options?: any) => string;
  filters: FilterState;
  scope: FamilyScopeState;
  selectedTypes: string[];
  filterItems: (items: DocItem[]) => DocItem[];
};

export function useDocumentsList(args: Args): DocumentsListState {
  const store = useDocumentStore();
  const query = useDocumentQueries(args);
  const lists = usePagedDocuments(store.items, args.filterItems, args.filters);
  useResetDocuments(args, store);
  useFetchDocuments(args, store, query.fetchQuery);
  usePageOverflowReset(args.filters, lists.totalPages);
  return {
    ...store.state,
    ...lists,
    ...downloadLinks(args.customerId, query.downloadQuery, lists.visibleDocIds),
  };
}

function useDocumentStore() {
  const [items, setItems] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const state = { items, loading, hasLoadedOnce, err };
  return { state, items, setItems, setLoading, setHasLoadedOnce, setErr };
}

function useDocumentQueries(args: Args) {
  const queryData = useMemo(
    () => queryDataFrom(args),
    [
      args.filters.q,
      args.filters.from,
      args.filters.to,
      args.filters.sortOrder,
      args.scope.bookingTarget,
      args.scope.activeChild,
      args.scope.selectedParent,
      args.selectedTypes,
    ],
  );
  return {
    fetchQuery: qs({ page: 1, limit: 1000, ...queryData }),
    downloadQuery: qs(queryData),
  };
}

function queryDataFrom(args: Args) {
  return {
    type: args.selectedTypes.join(","),
    from: args.filters.from,
    to: args.filters.to,
    q: args.filters.q,
    sort: sortParamFrom(args.filters.sortOrder),
    scope: args.scope.bookingTarget,
    childUid: activeChildUid(args.scope),
    parentEmail: activeParentEmail(args.scope),
  };
}

function activeChildUid(scope: FamilyScopeState) {
  return scope.bookingTarget === "child"
    ? safeText(scope.activeChild?.uid)
    : "";
}

function activeParentEmail(scope: FamilyScopeState) {
  return safeText(scope.selectedParent?.parent?.email).toLowerCase();
}

function usePagedDocuments(
  items: DocItem[],
  filterItems: (items: DocItem[]) => DocItem[],
  filters: FilterState,
) {
  const filteredItems = useMemo(() => filterItems(items), [items, filterItems]);
  const totalPages = useMemo(
    () =>
      Math.max(1, Math.ceil(filteredItems.length / Math.max(1, filters.limit))),
    [filteredItems.length, filters.limit],
  );
  const pagedItems = useMemo(
    () => pageItems(filteredItems, filters.page, filters.limit),
    [filteredItems, filters.page, filters.limit],
  );
  const visibleDocIds = useMemo(
    () => pagedItems.map((item) => String(item.id || "")).filter(Boolean),
    [pagedItems],
  );
  return { filteredItems, totalPages, pagedItems, visibleDocIds };
}

function pageItems(items: DocItem[], page: number, limit: number) {
  const start = (page - 1) * limit;
  return items.slice(start, start + limit);
}

function downloadLinks(
  customerId: string,
  downloadQuery: string,
  visibleDocIds: string[],
) {
  const fullQuery = fullDownloadQuery(downloadQuery, visibleDocIds);
  return {
    csvHref: customerDownloadHref(customerId, "documents.csv", fullQuery),
    zipHref: customerDownloadHref(customerId, "documents.zip", fullQuery),
  };
}

function fullDownloadQuery(downloadQuery: string, visibleDocIds: string[]) {
  return [downloadQuery, qs({ ids: visibleDocIds.join(",") })]
    .filter(Boolean)
    .join("&");
}

function customerDownloadHref(customerId: string, file: string, query: string) {
  return `/api/admin/customers/${encodeURIComponent(customerId)}/${file}?${query}`;
}

function useResetDocuments(
  args: Args,
  store: ReturnType<typeof useDocumentStore>,
) {
  useEffect(
    () => resetDocuments(store, args.filters),
    [args.customerId, args.scope.bookingTarget, args.scope.activeChild],
  );
}

function resetDocuments(
  store: ReturnType<typeof useDocumentStore>,
  filters: FilterState,
) {
  store.setItems([]);
  store.setHasLoadedOnce(false);
  store.setErr(null);
  filters.setPage(1);
}

function useFetchDocuments(
  args: Args,
  store: ReturnType<typeof useDocumentStore>,
  fetchQuery: string,
) {
  useEffect(
    () => fetchDocumentsEffect(args, store, fetchQuery),
    [args.customerId, fetchQuery],
  );
}

function fetchDocumentsEffect(
  args: Args,
  store: ReturnType<typeof useDocumentStore>,
  fetchQuery: string,
) {
  let cancelled = false;
  const controller = new AbortController();
  runFetchDocuments(args, store, fetchQuery, controller, () => cancelled);
  return () => {
    cancelled = true;
    controller.abort();
  };
}

async function runFetchDocuments(
  args: Args,
  store: ReturnType<typeof useDocumentStore>,
  query: string,
  controller: AbortController,
  isCancelled: () => boolean,
) {
  startFetch(store);
  try {
    await loadDocuments(args, store, query, controller, isCancelled);
  } catch (error: any) {
    handleFetchError(args, store, error, isCancelled);
  } finally {
    if (!isCancelled()) store.setLoading(false);
  }
}

function startFetch(store: ReturnType<typeof useDocumentStore>) {
  store.setLoading(true);
  store.setErr(null);
}

async function loadDocuments(
  args: Args,
  store: ReturnType<typeof useDocumentStore>,
  query: string,
  controller: AbortController,
  isCancelled: () => boolean,
) {
  const res = await fetch(
    fetchUrl(args.customerId, query),
    fetchOptions(controller),
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as ListResponse;
  if (!isCancelled()) commitDocuments(store, data);
}

function fetchUrl(customerId: string, query: string) {
  return `/api/admin/customers/${encodeURIComponent(customerId)}/documents?${query}`;
}

function fetchOptions(controller: AbortController) {
  return {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    signal: controller.signal,
  } as RequestInit;
}

function commitDocuments(
  store: ReturnType<typeof useDocumentStore>,
  data: ListResponse,
) {
  store.setItems(Array.isArray(data.items) ? data.items : []);
  store.setHasLoadedOnce(true);
}

function handleFetchError(
  args: Args,
  store: ReturnType<typeof useDocumentStore>,
  error: any,
  isCancelled: () => boolean,
) {
  if (isCancelled() || error?.name === "AbortError") return;
  store.setErr(
    toastErrorMessage(
      args.t as any,
      error,
      "admin.customers.documents.error.loadFailed",
    ),
  );
}

function usePageOverflowReset(filters: FilterState, totalPages: number) {
  useEffect(() => {
    if (filters.page > totalPages) filters.setPage(1);
  }, [filters.page, totalPages]);
}
