"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toastErrorMessage, toastText } from "@/lib/toast-messages";
import { useDropdownOutsideClose } from "../../../shared/hooks/useDropdownOutsideClose";
import {
  createVoucher,
  deleteVoucher,
  deleteVoucherMany,
  updateVoucher,
  updateVoucherMany,
} from "../../api";
import { useDebouncedValue } from "../../../online-bookings/hooks/useDebouncedValue";
import { useNotice } from "../../../online-bookings/hooks/useNotice";
import { useVouchersList } from "../../hooks/useVouchersList";
import type { Voucher, VoucherStatus } from "../../types";
import { sortItems, type SortKey } from "./voucherOptions";

export type VoucherInput = { code: string; amount: string; active: boolean };

export function useVouchersPageState() {
  const filters = useVoucherFilters();
  const menus = useVoucherMenus();
  const table = useVoucherTable(filters);
  const actions = useVoucherActions(table.list, table.closeDialogs);
  useVoucherErrorNotice(table.list.error, actions.showError);
  return { ...filters, ...menus, ...table, ...actions };
}

function useVoucherFilters() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<VoucherStatus>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [page, setPage] = useState(1);
  const qDebounced = useDebouncedValue(q, 300);
  return {
    q,
    setQ,
    status,
    setStatus,
    sort,
    setSort,
    page,
    setPage,
    qDebounced,
  };
}

function useVoucherMenus() {
  const statusMenu = useDropdownState<HTMLButtonElement, HTMLUListElement>();
  const sortMenu = useDropdownState<HTMLButtonElement, HTMLUListElement>();
  return { statusMenu, sortMenu };
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

function useVoucherTable(filters: ReturnType<typeof useVoucherFilters>) {
  const [sel, setSel] = useState<Voucher | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);
  const list = useVouchersList(
    useMemo(
      () => ({ q: filters.qDebounced, status: filters.status }),
      [filters.qDebounced, filters.status],
    ),
  );
  const itemsSorted = useMemo(
    () => sortItems(list.items, filters.sort),
    [list.items, filters.sort],
  );
  const pagination = useVoucherPagination(itemsSorted, filters.page);
  useResetVoucherSelection(filters, setSelectMode, filters.setPage);
  return {
    sel,
    setSel,
    dialogOpen,
    setDialogOpen,
    selectMode,
    setSelectMode,
    toggleBtnRef,
    list,
    itemsSorted,
    ...pagination,
    ...useDialogControls(setSel, setDialogOpen),
  };
}

function useVoucherPagination(itemsSorted: Voucher[], page: number) {
  const pageSize = 10;
  const pages = Math.max(1, Math.ceil(itemsSorted.length / pageSize));
  const pageSafe = Math.min(page, pages);
  const pagedItems = useMemo(
    () => itemsSorted.slice((pageSafe - 1) * pageSize, pageSafe * pageSize),
    [itemsSorted, pageSafe],
  );
  return { pages, pageSafe, pagedItems };
}

function useDialogControls(
  setSel: (value: Voucher | null) => void,
  setDialogOpen: (open: boolean) => void,
) {
  return {
    openCreateDialog: () => {
      setSel(null);
      setDialogOpen(true);
    },
    openEditDialog: (item: Voucher) => {
      setSel(item);
      setDialogOpen(true);
    },
    closeDialogs: () => {
      setSel(null);
      setDialogOpen(false);
    },
  };
}

function useResetVoucherSelection(
  filters: ReturnType<typeof useVoucherFilters>,
  setSelectMode: (next: boolean) => void,
  setPage: (value: number) => void,
) {
  useEffect(() => {
    setSelectMode(false);
    setPage(1);
  }, [
    filters.qDebounced,
    filters.status,
    filters.sort,
    setSelectMode,
    setPage,
  ]);
}

function useVoucherActions(
  list: ReturnType<typeof useVouchersList>,
  closeDialogs: () => void,
) {
  const { t } = useTranslation();
  const { notice, showOk, showError } = useNotice(5000);
  const [busy, setBusy] = useState(false);
  const run = useBusyRunner(t, setBusy, showError);
  return {
    notice,
    showOk,
    showError,
    busy,
    ...useVoucherSingleActions(t, list, closeDialogs, showOk, run),
    ...useVoucherBulkActions(t, list, showOk, run),
  };
}

function useBusyRunner(
  t: (key: string) => string,
  setBusy: (next: boolean) => void,
  showError: (text: string) => void,
) {
  return async function run(action: () => Promise<void>, errorKey: string) {
    setBusy(true);
    try {
      await action();
    } catch (error: unknown) {
      showError(toastErrorMessage(t, error, errorKey));
    } finally {
      setBusy(false);
    }
  };
}

function useVoucherSingleActions(
  t: (key: string) => string,
  list: ReturnType<typeof useVouchersList>,
  closeDialogs: () => void,
  showOk: (text: string) => void,
  run: (action: () => Promise<void>, errorKey: string) => Promise<void>,
) {
  return {
    handleCreate: (input: VoucherInput) =>
      run(
        () => createAction(t, input, list.reload, closeDialogs, showOk),
        "common.admin.vouchers.toast.createFailed",
      ),
    handleUpdate: (id: string, input: VoucherInput) =>
      run(
        () => updateAction(t, id, input, list.reload, closeDialogs, showOk),
        "common.admin.vouchers.toast.updateFailed",
      ),
    handleDelete: (id: string) =>
      run(
        () => deleteAction(t, id, list.reload, closeDialogs, showOk),
        "common.admin.vouchers.toast.deleteFailed",
      ),
  };
}

function useVoucherBulkActions(
  t: (key: string) => string,
  list: ReturnType<typeof useVouchersList>,
  showOk: (text: string) => void,
  run: (action: () => Promise<void>, errorKey: string) => Promise<void>,
) {
  return {
    handleDeleteMany: (ids: string[]) =>
      bulkAction(
        ids,
        run,
        () => deleteVoucherMany(t, ids),
        list.reload,
        showOk,
        deletedMessage(t, ids.length),
        "common.admin.vouchers.toast.deleteFailed",
      ),
    handleActivateMany: (ids: string[]) =>
      bulkAction(
        ids,
        run,
        () => updateVoucherMany(t, ids, { active: true }),
        list.reload,
        showOk,
        activeMessage(t, ids.length),
        "common.admin.vouchers.toast.activateFailed",
      ),
    handleDeactivateMany: (ids: string[]) =>
      bulkAction(
        ids,
        run,
        () => updateVoucherMany(t, ids, { active: false }),
        list.reload,
        showOk,
        inactiveMessage(t, ids.length),
        "common.admin.vouchers.toast.deactivateFailed",
      ),
  };
}

async function createAction(
  t: (key: string) => string,
  input: VoucherInput,
  reload: () => Promise<void>,
  closeDialogs: () => void,
  showOk: (text: string) => void,
) {
  await createVoucher(t, {
    code: input.code,
    amount: Number(input.amount),
    active: input.active,
  });
  await reload();
  closeDialogs();
  showOk(
    toastText(t, "common.admin.vouchers.toast.created", "Voucher created."),
  );
}

async function updateAction(
  t: (key: string) => string,
  id: string,
  input: VoucherInput,
  reload: () => Promise<void>,
  closeDialogs: () => void,
  showOk: (text: string) => void,
) {
  await updateVoucher(t, id, {
    code: input.code,
    amount: Number(input.amount),
    active: input.active,
  });
  await reload();
  closeDialogs();
  showOk(
    toastText(t, "common.admin.vouchers.toast.updated", "Voucher updated."),
  );
}

async function deleteAction(
  t: (key: string) => string,
  id: string,
  reload: () => Promise<void>,
  closeDialogs: () => void,
  showOk: (text: string) => void,
) {
  await deleteVoucher(t, id);
  await reload();
  closeDialogs();
  showOk(
    toastText(t, "common.admin.vouchers.toast.deleted", "Voucher deleted."),
  );
}

async function bulkAction(
  ids: string[],
  run: (action: () => Promise<void>, errorKey: string) => Promise<void>,
  action: () => Promise<void>,
  reload: () => Promise<void>,
  showOk: (text: string) => void,
  message: string,
  errorKey: string,
) {
  if (!ids.length) return;
  await run(async () => {
    await action();
    await reload();
    showOk(message);
  }, errorKey);
}

function deletedMessage(t: (key: string) => string, count: number) {
  return `(${count}) ${toastText(t, "common.admin.vouchers.toast.deletedCount", "deleted.")}`;
}

function activeMessage(t: (key: string) => string, count: number) {
  return `${count} ${toastText(t, "common.admin.vouchers.toast.activatedCount", "activated.")}`;
}

function inactiveMessage(t: (key: string) => string, count: number) {
  return `${count} ${toastText(t, "common.admin.vouchers.toast.deactivatedCount", "deactivated.")}`;
}

function useVoucherErrorNotice(
  error: string | null,
  showError: (text: string) => void,
) {
  useEffect(() => {
    if (error) showError(error);
  }, [error, showError]);
}
