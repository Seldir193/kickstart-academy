//src\app\admin\(app)\vouchers\page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

function sortLabel(sort: SortKey) {
  if (sort === "newest") return "Newest first";
  if (sort === "oldest") return "Oldest first";
  if (sort === "code_asc") return "Code A–Z";
  return "Code Z–A";
}

function statusLabel(status: VoucherStatus, total: number) {
  if (status === "all") return `All (${total})`;
  if (status === "active") return "Active";
  return "Inactive";
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
      await createVoucher({
        code: input.code,
        amount: Number(input.amount),
        active: input.active,
      });
      await list.reload();
      closeDialogs();
      showOk("Voucher created.");
    } catch (e: any) {
      showError(e?.message || "Create failed.");
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
      await updateVoucher(id, {
        code: input.code,
        amount: Number(input.amount),
        active: input.active,
      });
      await list.reload();
      closeDialogs();
      showOk("Voucher updated.");
    } catch (e: any) {
      showError(e?.message || "Update failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    setBusy(true);
    try {
      await deleteVoucher(id);
      await list.reload();
      closeDialogs();
      showOk("Voucher deleted.");
    } catch (e: any) {
      showError(e?.message || "Delete failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteMany(ids: string[]) {
    if (!ids.length) return;
    setBusy(true);
    try {
      await deleteVoucherMany(ids);
      await list.reload();
      showOk(`(${ids.length}) deleted.`);
    } catch (e: any) {
      showError(e?.message || "Delete failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleActivateMany(ids: string[]) {
    if (!ids.length) return;
    setBusy(true);
    try {
      await updateVoucherMany(ids, { active: true });
      await list.reload();
      showOk(`(${ids.length}) activated.`);
    } catch (e: any) {
      showError(e?.message || "Activate failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeactivateMany(ids: string[]) {
    if (!ids.length) return;
    setBusy(true);
    try {
      await updateVoucherMany(ids, { active: false });
      await list.reload();
      showOk(`(${ids.length}) deactivated.`);
    } catch (e: any) {
      showError(e?.message || "Deactivate failed.");
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
                placeholder="Code..."
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
                aria-label="Status"
              >
                <span className="ks-training-select__label">
                  {statusLabel(status, list.items.length)}
                </span>
                <span className="ks-training-select__chevron" />
              </button>

              {statusOpen ? (
                <ul
                  ref={statusMenuRef}
                  className="ks-training-select__menu"
                  role="listbox"
                  aria-label="Status"
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
                      All
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
                      Active
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
                      Inactive
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
                aria-label="Sorting"
              >
                <span className="ks-training-select__label">
                  {sortLabel(sort)}
                </span>
                <span className="ks-training-select__chevron" />
              </button>

              {sortOpen ? (
                <ul
                  ref={sortMenuRef}
                  className="ks-training-select__menu"
                  role="listbox"
                  aria-label="Sorting"
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
                      Newest first
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
                      Oldest first
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
                      Code A–Z
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
                      Code Z–A
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
              New voucher
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
              {list.items.length ? `(${list.items.length})` : ""}
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
