//src\app\admin\(app)\vouchers\page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toastErrorMessage, toastText } from "@/lib/toast-messages";
import {
  createVoucher,
  deleteVoucher,
  updateVoucher,
  deleteVoucherMany,
  updateVoucherMany,
} from "./api";
import VouchersTableList from "./components/VouchersTableList";
import { useDebouncedValue } from "../online-bookings/hooks/useDebouncedValue";
import { useNotice } from "../online-bookings/hooks/useNotice";
import { useVouchersList } from "./hooks/useVouchersList";
import type { Voucher, VoucherStatus } from "./types";
import VoucherDialog from "./components/VoucherDialog";
import Pagination from "../members/components/Pagination";

type SortKey = "newest" | "oldest" | "code_asc" | "code_desc";

function sortLabel(t: (key: string) => string, sort: SortKey) {
  if (sort === "newest") {
    return toastText(t, "common.admin.vouchers.sort.newest", "Newest first");
  }
  if (sort === "oldest") {
    return toastText(t, "common.admin.vouchers.sort.oldest", "Oldest first");
  }
  if (sort === "code_asc") {
    return toastText(t, "common.admin.vouchers.sort.codeAsc", "Code A–Z");
  }

  return toastText(t, "common.admin.vouchers.sort.codeDesc", "Code Z–A");
}

function statusLabel(
  t: (key: string) => string,
  status: VoucherStatus,
  total: number,
) {
  if (status === "all")
    return (
      toastText(t, "common.admin.vouchers.status.all", "All") + ` (${total})`
    );
  if (status === "active")
    return toastText(t, "common.admin.vouchers.status.active", "Active");
  return toastText(t, "common.admin.vouchers.status.inactive", "Inactive");
}

function tsOf(v: string) {
  const t = new Date(String(v || "")).getTime();
  return Number.isFinite(t) ? t : 0;
}

function codeKey(v: Voucher) {
  return String(v.code || "")
    .trim()
    .toLowerCase();
}

function sortItems(items: Voucher[], sort: SortKey) {
  const arr = [...items];
  if (sort === "newest") {
    return arr.sort((a, b) => tsOf(b.createdAt) - tsOf(a.createdAt));
  }
  if (sort === "oldest") {
    return arr.sort((a, b) => tsOf(a.createdAt) - tsOf(b.createdAt));
  }
  if (sort === "code_asc") {
    return arr.sort((a, b) => codeKey(a).localeCompare(codeKey(b), "de"));
  }
  return arr.sort((a, b) => codeKey(b).localeCompare(codeKey(a), "de"));
}

export default function AdminVouchersPage() {
  const { t } = useTranslation();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<VoucherStatus>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [statusOpen, setStatusOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sel, setSel] = useState<Voucher | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [page, setPage] = useState(1);

  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);
  const qDebounced = useDebouncedValue(q, 300);
  const { notice, showOk, showError } = useNotice(5000);

  const listParams = useMemo(
    () => ({ q: qDebounced, status }),
    [qDebounced, status],
  );

  const list = useVouchersList(listParams);

  const statusTriggerRef = useRef<HTMLButtonElement | null>(null);
  const statusMenuRef = useRef<HTMLUListElement | null>(null);
  const sortTriggerRef = useRef<HTMLButtonElement | null>(null);
  const sortMenuRef = useRef<HTMLUListElement | null>(null);

  const itemsSorted = useMemo(
    () => sortItems(list.items, sort),
    [list.items, sort],
  );

  const pageSize = 10;
  const pages = Math.max(1, Math.ceil(itemsSorted.length / pageSize));
  const pageSafe = Math.min(page, pages);
  const pagedItems = useMemo(() => {
    const start = (pageSafe - 1) * pageSize;
    return itemsSorted.slice(start, start + pageSize);
  }, [itemsSorted, pageSafe]);

  useEffect(() => {
    if (!list.error) return;
    showError(list.error);
  }, [list.error, showError]);

  useEffect(() => {
    setSelectMode(false);
    setPage(1);
  }, [qDebounced, status, sort]);

  useEffect(() => {
    if (!statusOpen) return;

    function onPointerDown(ev: PointerEvent) {
      const t = ev.target as Node;
      if (statusTriggerRef.current?.contains(t)) return;
      if (statusMenuRef.current?.contains(t)) return;
      setStatusOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [statusOpen]);

  useEffect(() => {
    if (!sortOpen) return;

    function onPointerDown(ev: PointerEvent) {
      const t = ev.target as Node;
      if (sortTriggerRef.current?.contains(t)) return;
      if (sortMenuRef.current?.contains(t)) return;
      setSortOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [sortOpen]);

  function openCreateDialog() {
    setSel(null);
    setDialogOpen(true);
  }

  function openEditDialog(item: Voucher) {
    setSel(item);
    setDialogOpen(true);
  }

  function closeDialogs() {
    setSel(null);
    setDialogOpen(false);
  }

  function onSearchKeyDown(key: string) {
    if (key === "Escape") setQ("");
  }

  function applyStatus(next: VoucherStatus) {
    setStatus(next);
    setStatusOpen(false);
  }

  function applySort(next: SortKey) {
    setSort(next);
    setSortOpen(false);
  }

  async function handleCreate(input: {
    code: string;
    amount: string;
    active: boolean;
  }) {
    setBusy(true);
    try {
      await createVoucher(t, {
        code: input.code,
        amount: Number(input.amount),
        active: input.active,
      });
      await list.reload();
      closeDialogs();
      showOk(
        toastText(t, "common.admin.vouchers.toast.created", "Voucher created."),
      );
    } catch (e: any) {
      showError(
        toastErrorMessage(t, e, "common.admin.vouchers.toast.createFailed"),
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate(
    id: string,
    input: { code: string; amount: string; active: boolean },
  ) {
    setBusy(true);
    try {
      await updateVoucher(t, id, {
        code: input.code,
        amount: Number(input.amount),
        active: input.active,
      });
      await list.reload();
      closeDialogs();
      showOk(
        toastText(t, "common.admin.vouchers.toast.updated", "Voucher updated."),
      );
    } catch (e: any) {
      showError(
        toastErrorMessage(t, e, "common.admin.vouchers.toast.updateFailed"),
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    setBusy(true);
    try {
      await deleteVoucher(t, id);
      await list.reload();
      closeDialogs();
      showOk(
        toastText(t, "common.admin.vouchers.toast.deleted", "Voucher deleted."),
      );
    } catch (e: any) {
      showError(
        toastErrorMessage(t, e, "common.admin.vouchers.toast.deleteFailed"),
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteMany(ids: string[]) {
    if (!ids.length) return;
    setBusy(true);
    try {
      await deleteVoucherMany(t, ids);
      await list.reload();
      showOk(
        `(${ids.length}) ${toastText(
          t,
          "common.admin.vouchers.toast.deletedCount",
          "deleted.",
        )}`,
      );
    } catch (e: any) {
      showError(
        toastErrorMessage(t, e, "common.admin.vouchers.toast.deleteFailed"),
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleActivateMany(ids: string[]) {
    if (!ids.length) return;
    setBusy(true);
    try {
      await updateVoucherMany(t, ids, { active: true });
      await list.reload();
      showOk(
        `${ids.length} ${toastText(
          t,
          "common.admin.vouchers.toast.activatedCount",
          "activated.",
        )}`,
      );
    } catch (e: any) {
      showError(
        toastErrorMessage(t, e, "common.admin.vouchers.toast.activateFailed"),
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleDeactivateMany(ids: string[]) {
    if (!ids.length) return;
    setBusy(true);
    try {
      await updateVoucherMany(t, ids, { active: false });
      await list.reload();
      showOk(
        `${ids.length} ${toastText(
          t,
          "common.admin.vouchers.toast.deactivatedCount",
          "deactivated.",
        )}`,
      );
    } catch (e: any) {
      showError(
        toastErrorMessage(t, e, "common.admin.vouchers.toast.deactivateFailed"),
      );
    } finally {
      setBusy(false);
    }
  }

  const searchItemStyle = { flex: "1 1 640px", minWidth: 520 } as const;
  const ddItemStyle = { flex: "0 0 220px", minWidth: 200 } as const;
  const sortItemStyle = { flex: "0 0 200px", minWidth: 180 } as const;

  return (
    <div className="news-admin ks vouchers-admin">
      {notice ? (
        <div
          className={notice.type === "ok" ? "ok" : "error"}
          style={{
            position: "fixed",
            right: 12,
            bottom: 12,
            zIndex: 6000,
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: "10px 12px",
            boxShadow: "0 10px 25px rgba(17,24,39,.08)",
          }}
        >
          {notice.text}
        </div>
      ) : null}

      <main className="container">
        <div className="ks-vouchers-toolbar">
          <div className="news-admin__filter" style={searchItemStyle}>
            <div className="input-with-icon">
              <img
                src="/icons/search.svg"
                alt=""
                aria-hidden="true"
                className="input-with-icon__icon"
              />
              <input
                className="input input-with-icon__input"
                placeholder={toastText(
                  t,
                  "common.admin.vouchers.searchPlaceholder",
                  "Code...",
                )}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => onSearchKeyDown(e.key)}
              />
            </div>
          </div>

          <div className="news-admin__filter" style={ddItemStyle}>
            <div
              className={
                "ks-training-select" +
                (statusOpen ? " ks-training-select--open" : "")
              }
            >
              <button
                type="button"
                ref={statusTriggerRef}
                className="ks-training-select__trigger"
                onClick={() => setStatusOpen((o) => !o)}
                disabled={busy}
                aria-label={toastText(
                  t,
                  "common.admin.vouchers.aria.status",
                  "Status",
                )}
              >
                <span className="ks-training-select__label">
                  {statusLabel(t, status, list.items.length)}
                </span>
                <span className="ks-training-select__chevron" />
              </button>

              {statusOpen ? (
                <ul
                  ref={statusMenuRef}
                  className="ks-training-select__menu"
                  role="listbox"
                  aria-label={toastText(
                    t,
                    "common.admin.vouchers.aria.status",
                    "Status",
                  )}
                >
                  <li>
                    <button
                      type="button"
                      className={
                        "ks-training-select__option" +
                        (status === "all" ? " is-selected" : "")
                      }
                      onClick={() => applyStatus("all")}
                    >
                      {toastText(t, "common.admin.vouchers.status.all", "All")}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className={
                        "ks-training-select__option" +
                        (status === "active" ? " is-selected" : "")
                      }
                      onClick={() => applyStatus("active")}
                    >
                      {toastText(
                        t,
                        "common.admin.vouchers.status.active",
                        "Active",
                      )}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className={
                        "ks-training-select__option" +
                        (status === "inactive" ? " is-selected" : "")
                      }
                      onClick={() => applyStatus("inactive")}
                    >
                      {toastText(
                        t,
                        "common.admin.vouchers.status.inactive",
                        "Inactive",
                      )}
                    </button>
                  </li>
                </ul>
              ) : null}
            </div>
          </div>

          <div className="news-admin__filter" style={sortItemStyle}>
            <div
              className={
                "ks-training-select" +
                (sortOpen ? " ks-training-select--open" : "")
              }
            >
              <button
                type="button"
                ref={sortTriggerRef}
                className="ks-training-select__trigger"
                onClick={() => setSortOpen((o) => !o)}
                disabled={busy}
                aria-label={toastText(
                  t,
                  "common.admin.vouchers.aria.sorting",
                  "Sorting",
                )}
              >
                <span className="ks-training-select__label">
                  {sortLabel(t, sort)}
                </span>
                <span className="ks-training-select__chevron" />
              </button>

              {sortOpen ? (
                <ul
                  ref={sortMenuRef}
                  className="ks-training-select__menu"
                  role="listbox"
                  aria-label={toastText(
                    t,
                    "common.admin.vouchers.aria.sorting",
                    "Sorting",
                  )}
                >
                  <li>
                    <button
                      type="button"
                      className={
                        "ks-training-select__option" +
                        (sort === "newest" ? " is-selected" : "")
                      }
                      onClick={() => applySort("newest")}
                    >
                      {toastText(
                        t,
                        "common.admin.vouchers.sort.newest",
                        "Newest first",
                      )}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className={
                        "ks-training-select__option" +
                        (sort === "oldest" ? " is-selected" : "")
                      }
                      onClick={() => applySort("oldest")}
                    >
                      {toastText(
                        t,
                        "common.admin.vouchers.sort.oldest",
                        "Oldest first",
                      )}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className={
                        "ks-training-select__option" +
                        (sort === "code_asc" ? " is-selected" : "")
                      }
                      onClick={() => applySort("code_asc")}
                    >
                      {toastText(
                        t,
                        "common.admin.vouchers.sort.codeAsc",
                        "Code A–Z",
                      )}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className={
                        "ks-training-select__option" +
                        (sort === "code_desc" ? " is-selected" : "")
                      }
                      onClick={() => applySort("code_desc")}
                    >
                      {toastText(
                        t,
                        "common.admin.vouchers.sort.codeDesc",
                        "Code Z–A",
                      )}
                    </button>
                  </li>
                </ul>
              ) : null}
            </div>
          </div>

          <div className="ks-vouchers-toolbar__action">
            <button
              type="button"
              className="btn"
              onClick={openCreateDialog}
              disabled={busy}
            >
              <img
                src="/icons/plus.svg"
                alt=""
                aria-hidden="true"
                className="btn__icon"
              />
              {toastText(t, "common.admin.vouchers.newVoucher", "New voucher")}
            </button>
          </div>
        </div>

        {list.error ? (
          <div className="card" role="alert">
            <div className="text-red-600">{list.error}</div>
          </div>
        ) : null}

        <section className="news-admin__section">
          <div className="news-admin__section-head-number">
            <span className="news-admin__section-meta">
              {list.items.length
                ? `(${list.items.length} ${toastText(
                    t,
                    "common.admin.vouchers.count.items",
                    "items",
                  )})`
                : ""}
            </span>
          </div>

          <div className="news-admin__box news-admin__box--scroll3">
            <VouchersTableList
              items={pagedItems}
              selectMode={selectMode}
              busy={busy || list.loading}
              onToggleSelectMode={() => setSelectMode((p) => !p)}
              onOpen={openEditDialog}
              onDeleteMany={handleDeleteMany}
              onActivateMany={handleActivateMany}
              onDeactivateMany={handleDeactivateMany}
              toggleBtnRef={toggleBtnRef}
            />
          </div>

          {pages > 1 ? (
            <div className="mt-3">
              <Pagination
                page={pageSafe}
                pages={pages}
                onPrev={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => Math.min(pages, p + 1))}
              />
            </div>
          ) : null}
        </section>
      </main>

      <VoucherDialog
        voucher={sel}
        open={dialogOpen}
        busy={busy}
        onClose={closeDialogs}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}
