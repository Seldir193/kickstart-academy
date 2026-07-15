"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDropdownOutsideClose } from "../../../shared/hooks/useDropdownOutsideClose";
import {
  approvePayment,
  cancelConfirmedBooking,
  confirmBooking,
  deleteBookingsBulk,
  deleteBooking,
  restoreBookingsBulk,
  setBookingStatus,
} from "../../api";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useNotice } from "../../hooks/useNotice";
import { useOnlineBookingsList } from "../../hooks/useOnlineBookingsList";
import type { Booking, ProgramFilter, Status, StatusOrAll } from "../../types";
import {
  statusLabel,
  sortBookings,
  type SortKey,
} from "./onlineBookingOptions";

export function useOnlineBookingsPageState() {
  const filters = useOnlineBookingFilters();
  const menus = useOnlineBookingMenus();
  const table = useOnlineBookingTable(filters);
  const actions = useOnlineBookingActions(table.list, table.setSelectMode);
  useOnlineBookingErrorNotice(table.list.error, actions.showError);
  return { ...filters, ...menus, ...table, ...actions };
}

function useOnlineBookingFilters() {
  const [status, setStatus] = useState<StatusOrAll>("all");
  const [program, setProgram] = useState<ProgramFilter>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const qDebounced = useDebouncedValue(q, 300);
  return {
    status,
    setStatus,
    program,
    setProgram,
    sort,
    setSort,
    q,
    setQ,
    page,
    setPage,
    qDebounced,
  };
}

function useOnlineBookingMenus() {
  const course = useDropdownState<HTMLButtonElement, HTMLUListElement>();
  const status = useDropdownState<HTMLButtonElement, HTMLUListElement>();
  const sort = useDropdownState<HTMLButtonElement, HTMLUListElement>();
  return { courseMenu: course, statusMenu: status, sortMenu: sort };
}

function useDropdownState<
  TTrigger extends HTMLElement,
  TMenu extends HTMLElement,
>() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<TTrigger | null>(null);
  const menuRef = useRef<TMenu | null>(null);
  useDropdownOutsideClose(open, triggerRef, menuRef, () => setOpen(false));
  return { open, setOpen, triggerRef, menuRef };
}

function useOnlineBookingTable(
  filters: ReturnType<typeof useOnlineBookingFilters>,
) {
  const [selectMode, setSelectMode] = useState(false);
  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);
  const [sel, setSel] = useState<Booking | null>(null);
  const list = useOnlineBookingsList({
    status: filters.status,
    program: filters.program,
    q: filters.qDebounced,
    page: filters.page,
  });
  const itemsSorted = useMemo(
    () => sortBookings(list.items, filters.sort),
    [list.items, filters.sort],
  );
  const computedStatusLabel = useComputedStatusLabel(filters, list);
  useResetSelectMode(setSelectMode, filters);
  return {
    list,
    itemsSorted,
    computedStatusLabel,
    selectMode,
    setSelectMode,
    toggleBtnRef,
    sel,
    setSel,
  };
}

function useComputedStatusLabel(
  filters: ReturnType<typeof useOnlineBookingFilters>,
  list: ReturnType<typeof useOnlineBookingsList>,
) {
  const { t } = useTranslation();
  return useMemo(
    () =>
      statusLabel(t, {
        status: filters.status,
        total: list.total,
        totalAll: list.totalAll,
        counts: list.counts,
      }),
    [t, filters.status, list.total, list.totalAll, list.counts],
  );
}

function useResetSelectMode(
  setSelectMode: (next: boolean) => void,
  filters: ReturnType<typeof useOnlineBookingFilters>,
) {
  useEffect(
    () => setSelectMode(false),
    [
      filters.page,
      filters.qDebounced,
      filters.status,
      filters.program,
      filters.sort,
      setSelectMode,
    ],
  );
}

function useOnlineBookingActions(
  list: ReturnType<typeof useOnlineBookingsList>,
  setSelectMode: (next: boolean) => void,
) {
  const { notice, showOk, showError } = useNotice(5000);
  const [mutating, setMutating] = useState(false);
  const run = useMutatingRunner(setMutating);
  return {
    notice,
    showOk,
    showError,
    mutating,
    ...useSingleBookingActions(run, list),
    ...useBulkBookingActions(run, list, setSelectMode, showOk),
  };
}

function useMutatingRunner(setMutating: (next: boolean) => void) {
  return async function run<T>(fn: () => Promise<T>) {
    setMutating(true);
    try {
      return await fn();
    } finally {
      setMutating(false);
    }
  };
}

function useSingleBookingActions(
  run: <T>(fn: () => Promise<T>) => Promise<T>,
  list: ReturnType<typeof useOnlineBookingsList>,
) {
  const reload = async <T>(fn: () => Promise<T>) => {
    const res = await fn();
    await list.reload();
    return res;
  };
  return {
    onConfirm: (id: string, resend: boolean) =>
      run(() => reload(() => confirmBooking(id, resend))),
    onSetStatus: (id: string, next: Status) =>
      run(() => reload(() => setBookingStatus(id, next))),
    onDeleteOne: (id: string) => run(() => reload(() => deleteBooking(id))),
    onCancelConfirmed: (id: string) =>
      run(() => reload(() => cancelConfirmedBooking(id))),
    onApprovePayment: (id: string) =>
      run(() => reload(() => approvePayment(id))),
  };
}

function useBulkBookingActions(
  run: <T>(fn: () => Promise<T>) => Promise<T>,
  list: ReturnType<typeof useOnlineBookingsList>,
  setSelectMode: (next: boolean) => void,
  showOk: (text: string) => void,
) {
  const { t } = useTranslation();
  return {
    onDeleteMany: (ids: string[]) =>
      runBulk(
        ids,
        run,
        () => deleteBookingsBulk(ids),
        list.reload,
        setSelectMode,
        showOk,
        t("common.admin.onlineBookings.bulk.deleted"),
      ),
    onRestoreMany: (ids: string[]) =>
      runBulk(
        ids,
        run,
        () => restoreBookingsBulk(ids),
        list.reload,
        setSelectMode,
        showOk,
        t("common.admin.onlineBookings.bulk.restored"),
      ),
  };
}

async function runBulk(
  ids: string[],
  run: <T>(fn: () => Promise<T>) => Promise<T>,
  action: () => Promise<void>,
  reload: () => Promise<void>,
  setSelectMode: (next: boolean) => void,
  showOk: (text: string) => void,
  label: string,
) {
  if (!ids.length) return;
  await run(async () => {
    await action();
    await reload();
    setSelectMode(false);
  });
  showOk(`(${ids.length}) ${label}.`);
}

function useOnlineBookingErrorNotice(
  error: string | null,
  showError: (text: string) => void,
) {
  useEffect(() => {
    if (error) showError(error);
  }, [error, showError]);
}
