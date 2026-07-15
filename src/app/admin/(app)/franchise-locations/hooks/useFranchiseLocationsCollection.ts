"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { FranchiseLocation } from "../types";
import { fetchMe } from "../franchise_locations.api";
import {
  paginate,
  sortLocations,
  type SortKey,
} from "../franchise_locations.utils";
import { isSuperAdminUser } from "../page.helpers";
import { toastErrorMessage } from "@/lib/toast-messages";
import {
  applySearch,
  loadView,
  pageSize,
} from "./franchiseLocationsPage.helpers";

export function useFranchiseLocationsCollection(
  toastErr: (text: string) => void,
) {
  const { t } = useTranslation();
  const [meUser, setMeUser] = useState<{
    role?: string | null;
    isSuperAdmin?: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [lists, setLists] = useState(
    () =>
      ({ mp: [], ma: [], mr: [], pp: [], pa: [], pr: [] }) as Record<
        string,
        FranchiseLocation[]
      >,
  );
  const didLoadOnce = useRef(false);
  const superAdmin = useMemo(() => isSuperAdminUser(meUser), [meUser]);

  const assignLists = useCallback(
    (values: FranchiseLocation[][]) => {
      const [mp, ma, mr, pp, pa, pr] = values;
      setLists({
        mp: sortLocations(mp, sort),
        ma: sortLocations(ma, sort),
        mr: sortLocations(mr, sort),
        pp: sortLocations(pp, sort),
        pa: sortLocations(pa, sort),
        pr: sortLocations(pr, sort),
      });
    },
    [sort],
  );

  const loadAll = useCallback(
    async (silent?: boolean) => {
      if (!silent) {
        setLoading(true);
        setErr(null);
      }
      try {
        const me = await fetchMe();
        setMeUser(me);
        const admin = isSuperAdminUser(me);
        const views = admin
          ? [
              null,
              "mine_approved",
              null,
              "provider_pending",
              "provider_approved",
              "provider_rejected",
            ]
          : [
              "mine_pending",
              "mine_approved",
              "mine_rejected",
              null,
              null,
              null,
            ];
        assignLists(
          await Promise.all(
            views.map((view) => (view ? loadView(view) : Promise.resolve([]))),
          ),
        );
      } catch (error: unknown) {
        const message = toastErrorMessage(
          t,
          error,
          "common.admin.franchiseLocations.toast.loadFailed",
        );
        setErr(message);
        toastErr(message);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [assignLists, t, toastErr],
  );

  useEffect(() => {
    const silent = didLoadOnce.current;
    didLoadOnce.current = true;
    loadAll(silent);
  }, [loadAll]);

  const filtered = useMemo(
    () => ({
      mp: applySearch(lists.mp, q),
      ma: applySearch(lists.ma, q),
      mr: applySearch(lists.mr, q),
      pp: applySearch(lists.pp, q),
      pa: applySearch(lists.pa, q),
      pr: applySearch(lists.pr, q),
    }),
    [lists, q],
  );

  return {
    t,
    loading,
    err,
    q,
    setQ,
    sort,
    setSort,
    superAdmin,
    lists,
    filtered,
    loadAll,
  };
}

export function useLocationPagination(
  filtered: Record<string, FranchiseLocation[]>,
  q: string,
  resetSelection: () => void,
) {
  const [pages, setPages] = useState(() => ({
    mp: 1,
    ma: 1,
    mr: 1,
    pp: 1,
    pa: 1,
    pr: 1,
  }));
  useEffect(() => {
    setPages({ mp: 1, ma: 1, mr: 1, pp: 1, pa: 1, pr: 1 });
    resetSelection();
  }, [q, resetSelection]);
  const paged = useMemo(
    () => ({
      mp: paginate(filtered.mp, pages.mp, pageSize),
      ma: paginate(filtered.ma, pages.ma, pageSize),
      mr: paginate(filtered.mr, pages.mr, pageSize),
      pp: paginate(filtered.pp, pages.pp, pageSize),
      pa: paginate(filtered.pa, pages.pa, pageSize),
      pr: paginate(filtered.pr, pages.pr, pageSize),
    }),
    [filtered, pages],
  );
  const move = useCallback(
    (key: string, direction: 1 | -1) => {
      setPages((current) => ({
        ...current,
        [key]: Math.min(
          Math.max(current[key as keyof typeof current] + direction, 1),
          paged[key as keyof typeof paged].pages,
        ),
      }));
    },
    [paged],
  );
  return { pages, paged, move };
}
