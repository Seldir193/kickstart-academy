// src/app/admin/(app)/customers/dialogs/DocumentsDialog.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import KsDatePicker from "@/app/admin/(app)/invoices/components/KsDatePicker";
import { useFixedSelectbox } from "../hooks/useFixedSelectbox";
import type { DocItem, ListResponse, SortOrder } from "./documentsDialog/types";
import {
  docNoFrom,
  normalizePdfHref,
  qs,
  sortParamFrom,
} from "./documentsDialog/helpers";
import { useOverlayVars } from "./documentsDialog/hooks/useOverlayVars";
import { TypeChips } from "./documentsDialog/components/TypeChips";

import { useBookDialogFamily } from "./bookDialog/hooks/useBookDialogFamily";
import { useDropdownOutsideClose } from "./bookDialog/hooks/useDropdownOutsideClose";
import type { FamilyChild, FamilyMember } from "./bookDialog/types";

type Props = {
  customerId: string;
  onClose: () => void;
};

type BookingTarget = "self" | "child";

type ChildOption = {
  uid: string;
  label: string;
  parentId: string;
  child: FamilyChild;
};

type ParentOption = {
  id: string;
  label: string;
};

type DownloadButtonProps = {
  href: string;
  label: string;
};

function safeText(v: unknown) {
  return String(v ?? "").trim();
}

function formatDateOnlyDe(value?: string | null) {
  if (!value) return "";
  const iso = /T/.test(value) ? value : `${value}T00:00:00`;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return value;

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

function childLabel(child: FamilyChild) {
  const full = `${child.firstName} ${child.lastName}`.trim();
  const birth = formatDateOnlyDe(child.birthDate);
  return [full || "Kind", birth].filter(Boolean).join(" - ");
}

function buildChildOptions(family: FamilyMember[] | null) {
  const members = Array.isArray(family) ? family : [];

  return members.flatMap((member) => {
    const children = Array.isArray(member.children) ? member.children : [];
    const parentFirst = safeText(member.parent.firstName).toLowerCase();
    const parentLast = safeText(member.parent.lastName).toLowerCase();
    const parentFull = `${parentFirst} ${parentLast}`.trim();

    return children
      .filter((child) => {
        const uid = safeText(child?.uid);
        const first = safeText(child?.firstName);
        const last = safeText(child?.lastName);
        const firstLower = first.toLowerCase();
        const lastLower = last.toLowerCase();
        const fullLower = `${firstLower} ${lastLower}`.trim();

        if (!uid) return false;
        if (!first && !last) return false;
        if (fullLower === "kunde selbst") return false;
        if (fullLower.includes("kunde selbst")) return false;
        if (fullLower.includes("eltern")) return false;
        if (fullLower.includes("parent")) return false;
        if (firstLower === parentFirst && lastLower === parentLast) {
          return false;
        }
        if (fullLower === parentFull) return false;

        return true;
      })
      .map((child) => ({
        uid: safeText(child.uid),
        label: childLabel(child),
        parentId: member._id,
        child,
      }));
  });
}

function parentIndexFromMemberId(id: string) {
  const value = safeText(id);
  const marker = "::parent::";
  const idx = value.indexOf(marker);
  if (idx < 0) return -1;
  const n = Number(value.slice(idx + marker.length));
  return Number.isFinite(n) ? n : -1;
}

function baseMemberId(id: string) {
  const value = safeText(id);
  const marker = "::parent::";
  const idx = value.indexOf(marker);
  return idx >= 0 ? value.slice(0, idx) : value;
}

function parentOptionId(memberId: string, idx: number) {
  return `${memberId}::parent::${idx}`;
}

function buildParentOptions(family: FamilyMember[] | null) {
  const members = Array.isArray(family) ? family : [];

  return members.flatMap((member) => {
    const rawParents =
      Array.isArray(member.parents) && member.parents.length
        ? member.parents
        : [member.parent];

    return rawParents.map((parent, idx) => ({
      id: parentOptionId(member._id, idx),
      label:
        `${safeText(parent?.firstName)} ${safeText(parent?.lastName)}`.trim() ||
        "Elternteil",
    }));
  });
}

function openPdf(item: DocItem) {
  const url = normalizePdfHref(item.href);
  window.open(url, "_blank", "noopener,noreferrer");
}

function sortLabel(order: SortOrder) {
  return order === "oldest" ? "Oldest" : "Newest";
}

function nextPage(p: number, totalPages: number) {
  return Math.min(totalPages, p + 1);
}

function prevPage(p: number) {
  return Math.max(1, p - 1);
}

function iconForType(t: string) {
  const type = String(t || "").toLowerCase();
  if (type === "invoice") return "/icons/invoice.svg";
  if (type === "participation") return "/icons/participation.svg";
  if (type === "cancellation") return "/icons/cancellation.svg";
  if (type === "storno") return "/icons/storno.svg";
  if (type === "dunning") return "/icons/warning.svg";
  if (type === "creditnote") return "/icons/credit_note.svg";
  if (type === "contract") return "/icons/contract.svg";
  return "/icons/invoice.svg";
}

function badgeTextFrom(d: DocItem) {
  return docNoFrom(d) || "";
}

function trimTitle(d: DocItem) {
  const full = String(d.title || "").trim();
  if (!full) return "";
  const beforeType = full.split(" – ")[0] || full;
  const noAddress = beforeType.split(" — ")[0] || beforeType;
  return noAddress.trim();
}

function getDownloadIconSrc(isActive: boolean) {
  return isActive ? "/icons/download-light.svg" : "/icons/download-dark.svg";
}

function DocumentRow({ d }: { d: DocItem }) {
  const title = trimTitle(d);
  const badge = badgeTextFrom(d);

  return (
    <div className="ks-doc-select__row">
      <div className="ks-doc-select__top ks-doc-select__top--single">
        <div className="ks-doc-select__title" title={title}>
          <span className="ks-doc-select__typeIcon" aria-hidden="true">
            <img src={iconForType(d.type)} alt="" />
          </span>
          <span className="ks-doc-select__titleText">{title}</span>
        </div>

        <div className="ks-doc-select__badgeCol">
          {badge ? <span className="ks-doc-select__badge">{badge}</span> : null}
        </div>
      </div>
    </div>
  );
}

function DownloadButton({ href, label }: DownloadButtonProps) {
  const [isActive, setIsActive] = useState(false);

  return (
    <a
      href={href}
      className="btn ks-invoices__downloadBtn"
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
      onFocus={() => setIsActive(true)}
      onBlur={() => setIsActive(false)}
    >
      <img
        src={getDownloadIconSrc(isActive)}
        alt=""
        aria-hidden="true"
        className="ks-invoices__downloadIcon"
      />
      <span>{label}</span>
    </a>
  );
}

export default function DocumentsDialog({
  customerId,

  onClose,
}: Props) {
  const [typeParticipation, setTypeParticipation] = useState(true);
  const [typeInvoice, setTypeInvoice] = useState(true);
  const [typeCancellation, setTypeCancellation] = useState(true);
  const [typeStorno, setTypeStorno] = useState(true);
  const [typeDunning, setTypeDunning] = useState(true);
  const [typeContract, setTypeContract] = useState(true);
  const [typeCreditNote, setTypeCreditNote] = useState(true);

  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [items, setItems] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const docsSelect = useFixedSelectbox();
  const perPageSelect = useFixedSelectbox();
  const sortSelect = useFixedSelectbox();

  const { family, familyLoading, familyError, baseSelectedId } =
    useBookDialogFamily(customerId);

  const [selectedParentId, setSelectedParentId] = useState("");
  const [selectedChildUid, setSelectedChildUid] = useState("");
  const [bookingTarget, setBookingTarget] = useState<BookingTarget>("self");
  const [isParentDropdownOpen, setIsParentDropdownOpen] = useState(false);
  const [isChildDropdownOpen, setIsChildDropdownOpen] = useState(false);

  const parentDropdownRef = useRef<HTMLDivElement | null>(null);
  const childDropdownRef = useRef<HTMLDivElement | null>(null);

  useDropdownOutsideClose([
    { ref: parentDropdownRef, close: () => setIsParentDropdownOpen(false) },
    { ref: childDropdownRef, close: () => setIsChildDropdownOpen(false) },
  ]);

  const childOptions = useMemo(() => buildChildOptions(family), [family]);
  const parentOptions = useMemo(() => buildParentOptions(family), [family]);

  useEffect(() => {
    if (selectedParentId) return;
    if (!parentOptions.length) return;
    const firstId = baseSelectedId
      ? `${baseSelectedId}::parent::0`
      : parentOptions[0].id;
    setSelectedParentId(firstId);
  }, [selectedParentId, parentOptions, baseSelectedId]);

  useEffect(() => {
    if (bookingTarget !== "child") return;
    if (selectedChildUid) return;
    const firstUid = childOptions[0]?.uid || "";
    if (firstUid) setSelectedChildUid(firstUid);
  }, [bookingTarget, selectedChildUid, childOptions]);

  const selfMemberId = useMemo(() => {
    if (selectedParentId) return selectedParentId;
    if (baseSelectedId) return `${baseSelectedId}::parent::0`;
    const first = family?.[0];
    return first ? `${first._id}::parent::0` : "";
  }, [selectedParentId, baseSelectedId, family]);

  const selectedParent = useMemo(() => {
    if (!family?.length) return null;

    const baseId = baseMemberId(selfMemberId);
    const parentIdx = parentIndexFromMemberId(selfMemberId);

    const rawMember =
      family.find((member) => member._id === baseId) ||
      family.find((member) => member._id === selfMemberId) ||
      family[0];

    if (!rawMember) return null;

    const parentList =
      Array.isArray(rawMember.parents) && rawMember.parents.length
        ? rawMember.parents
        : [rawMember.parent];

    const selected = parentList[parentIdx] || rawMember.parent;

    return {
      ...rawMember,
      parent: {
        salutation: safeText(selected?.salutation),
        firstName: safeText(selected?.firstName),
        lastName: safeText(selected?.lastName),
        email: safeText(selected?.email),
        phone: safeText((selected as any)?.phone),
        phone2: safeText((selected as any)?.phone2),
      },
    };
  }, [family, selfMemberId]);

  const selectedParentLabel = useMemo(() => {
    if (!selectedParent) return "Elternteil wählen …";
    return (
      `${selectedParent.parent.firstName} ${selectedParent.parent.lastName}`.trim() ||
      "Elternteil"
    );
  }, [selectedParent]);

  const selectedChildOption = useMemo(() => {
    if (!childOptions.length) return null;
    return childOptions.find((item) => item.uid === selectedChildUid) || null;
  }, [childOptions, selectedChildUid]);

  const activeChild: FamilyChild | null = useMemo(() => {
    if (bookingTarget !== "child") return null;
    return selectedChildOption?.child || null;
  }, [bookingTarget, selectedChildOption]);

  useOverlayVars(docsSelect);
  useOverlayVars(perPageSelect);
  useOverlayVars(sortSelect);

  const selectedTypes = useMemo(() => {
    // const t: string[] = [];
    const t: string[] = ["invoice"];
    if (typeParticipation) t.push("participation");
    if (typeInvoice) t.push("invoice");
    if (typeCancellation) t.push("cancellation");
    if (typeStorno) t.push("storno");
    if (typeDunning) t.push("dunning");
    if (typeCreditNote) t.push("creditnote");
    if (typeContract) t.push("contract");
    return t;
  }, [
    typeParticipation,
    typeCancellation,
    typeInvoice,
    typeStorno,
    typeDunning,
    typeCreditNote,
    typeContract,
  ]);

  const sort = useMemo(() => sortParamFrom(sortOrder), [sortOrder]);

  const activeChildUid =
    bookingTarget === "child" ? safeText(activeChild?.uid) : "";
  const activeParentEmail = safeText(
    selectedParent?.parent?.email,
  ).toLowerCase();

  const fetchQuery = useMemo(() => {
    return qs({
      page: 1,
      limit: 1000,
      type: selectedTypes.join(","),
      from,
      to,
      q,
      sort,
      scope: bookingTarget,
      childUid: activeChildUid,
      parentEmail: activeParentEmail,
    });
  }, [
    selectedTypes,
    from,
    to,
    q,
    sort,
    bookingTarget,
    activeChildUid,
    activeParentEmail,
  ]);

  const downloadQuery = useMemo(() => {
    return qs({
      type: selectedTypes.join(","),
      from,
      to,
      q,
      sort,
      scope: bookingTarget,
      childUid: activeChildUid,
      parentEmail: activeParentEmail,
    });
  }, [
    selectedTypes,
    from,
    to,
    q,
    sort,
    bookingTarget,
    activeChildUid,
    activeParentEmail,
  ]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const type = String(item.type || "").toLowerCase();
      // if (type === "invoice") return true;
      if (type === "invoice") return typeInvoice;
      if (type === "participation") return typeParticipation;
      if (type === "cancellation") return typeCancellation;
      if (type === "storno") return typeStorno;
      if (type === "dunning") return typeDunning;
      if (type === "creditnote") return typeCreditNote;
      if (type === "contract") return typeContract;
      return false;
    });
  }, [
    items,
    typeParticipation,
    typeCancellation,
    typeStorno,
    typeDunning,
    typeCreditNote,
    typeContract,
  ]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredItems.length / Math.max(1, limit)));
  }, [filteredItems.length, limit]);

  const pagedItems = useMemo(() => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return filteredItems.slice(start, end);
  }, [filteredItems, page, limit]);

  const visibleDocIds = useMemo(() => {
    return pagedItems.map((item) => String(item.id || "")).filter(Boolean);
  }, [pagedItems]);

  const csvHref = useMemo(() => {
    const idsQuery = qs({ ids: visibleDocIds.join(",") });
    const fullQuery = [downloadQuery, idsQuery].filter(Boolean).join("&");

    return `/api/admin/customers/${encodeURIComponent(
      customerId,
    )}/documents.csv?${fullQuery}`;
  }, [customerId, downloadQuery, visibleDocIds]);

  const zipHref = useMemo(() => {
    const idsQuery = qs({ ids: visibleDocIds.join(",") });
    const fullQuery = [downloadQuery, idsQuery].filter(Boolean).join("&");

    return `/api/admin/customers/${encodeURIComponent(
      customerId,
    )}/documents.zip?${fullQuery}`;
  }, [customerId, downloadQuery, visibleDocIds]);

  useEffect(() => {
    setItems([]);
    setHasLoadedOnce(false);
    setErr(null);
    setPage(1);
  }, [customerId, bookingTarget, activeChildUid]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function run() {
      setLoading(true);
      setErr(null);

      try {
        const url = `/api/admin/customers/${encodeURIComponent(
          customerId,
        )}/documents?${fetchQuery}`;

        const res = await fetch(url, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as ListResponse;
        if (cancelled) return;

        setItems(Array.isArray(data.items) ? data.items : []);

        setHasLoadedOnce(true);
      } catch (e: any) {
        if (cancelled) return;
        if (e?.name === "AbortError") return;
        setErr(e?.message || "Load failed");
        setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [customerId, fetchQuery]);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  return (
    <div className="ks-modal-root ks-modal-root--top ks documents-dialog">
      <div className="ks-backdrop" onClick={onClose} />
      <div
        className="ks-panel card ks-panel--md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-subhead">
          <h3 className="text-lg font-bold">Documents</h3>
        </div>

        <div className="mb-3 p-3 rounded border bg-gray-50 text-sm">
          <div className="font-semibold mb-1">Documents for</div>

          {familyLoading && (
            <div className="text-gray-600">Loading family…</div>
          )}

          {familyError && (
            <div className="text-red-600">
              Family could not be loaded – documents are still visible.
            </div>
          )}

          {family && family.length > 0 ? (
            <>
              <div className="mb-2">
                <label className="lbl">Elternteil</label>
                <div
                  className={
                    "ks-selectbox" +
                    (isParentDropdownOpen ? " ks-selectbox--open" : "")
                  }
                  ref={parentDropdownRef}
                >
                  <button
                    type="button"
                    className="ks-selectbox__trigger"
                    onClick={() => setIsParentDropdownOpen((o) => !o)}
                  >
                    <span className="ks-selectbox__label">
                      {selectedParentLabel || "Elternteil wählen …"}
                    </span>
                    <span
                      className="ks-selectbox__chevron"
                      aria-hidden="true"
                    />
                  </button>

                  {isParentDropdownOpen && (
                    <div className="ks-selectbox__panel" role="listbox">
                      {parentOptions.map((item) => (
                        <button
                          type="button"
                          key={item.id}
                          className={
                            "ks-selectbox__option" +
                            (item.id === selfMemberId
                              ? " ks-selectbox__option--active"
                              : "")
                          }
                          onClick={() => {
                            setSelectedParentId(item.id);
                            setIsParentDropdownOpen(false);
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  className={`btn btn-sm ${
                    bookingTarget === "self" ? "btn--tab-active" : "btn-outline"
                  }`}
                  onClick={() => setBookingTarget("self")}
                >
                  Kunde selbst
                </button>

                <button
                  type="button"
                  className={`btn btn-sm ${
                    bookingTarget === "child"
                      ? "btn--tab-active"
                      : "btn-outline"
                  }`}
                  onClick={() => setBookingTarget("child")}
                >
                  Kind
                </button>
              </div>

              {bookingTarget === "child" && (
                <div className="mb-2">
                  <label className="lbl">Kind</label>
                  <div
                    className={
                      "ks-selectbox" +
                      (isChildDropdownOpen ? " ks-selectbox--open" : "")
                    }
                    ref={childDropdownRef}
                  >
                    <button
                      type="button"
                      className="ks-selectbox__trigger"
                      onClick={() => setIsChildDropdownOpen((o) => !o)}
                    >
                      <span className="ks-selectbox__label">
                        {activeChild
                          ? `${activeChild.firstName} ${activeChild.lastName}`.trim()
                          : "Kind wählen …"}
                      </span>
                      <span
                        className="ks-selectbox__chevron"
                        aria-hidden="true"
                      />
                    </button>

                    {isChildDropdownOpen && (
                      <div className="ks-selectbox__panel" role="listbox">
                        {childOptions.map((item) => (
                          <button
                            type="button"
                            key={item.uid}
                            className={
                              "ks-selectbox__option" +
                              (item.uid === selectedChildUid
                                ? " ks-selectbox__option--active"
                                : "")
                            }
                            onClick={() => {
                              setSelectedChildUid(item.uid);
                              setIsChildDropdownOpen(false);
                            }}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="text-gray-700 mt-2">
                <div>
                  <span className="font-medium">Parent:</span>{" "}
                  {selectedParent
                    ? `${selectedParent.parent.firstName} ${selectedParent.parent.lastName}`.trim()
                    : "—"}
                </div>

                <div>
                  <span className="font-medium">Child:</span>{" "}
                  {bookingTarget === "child" && activeChild
                    ? `${activeChild.firstName} ${activeChild.lastName}`.trim()
                    : "—"}
                </div>
              </div>
            </>
          ) : (
            !familyLoading && (
              <div className="text-gray-700">
                Documents are shown for the current customer.
              </div>
            )
          )}
        </div>

        <div className="ks-storno__filters ks-storno__filters--docs mb-2">
          <div className="ks-storno__filter">
            <label className="lbl">Types</label>
            <div className="card p-2">
              <TypeChips
                participation={typeParticipation}
                cancellation={typeCancellation}
                storno={typeStorno}
                dunning={typeDunning}
                contract={typeContract}
                creditNote={typeCreditNote}
                invoice={typeInvoice}
                setInvoice={setTypeInvoice}
                setParticipation={setTypeParticipation}
                setCancellation={setTypeCancellation}
                setStorno={setTypeStorno}
                setDunning={setTypeDunning}
                setContract={setTypeContract}
                setCreditNote={setTypeCreditNote}
                onAnyChange={() => setPage(1)}
              />
            </div>
          </div>

          <div className="ks-storno__filter">
            <label className="lbl">Search & Date</label>
            <div className="card p-2">
              <input
                className="input mb-2"
                placeholder="Search…"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
              />

              <div className="ks-documents__dates">
                <KsDatePicker
                  value={from}
                  onChange={(nextIso) => {
                    setFrom(nextIso);
                    setPage(1);
                  }}
                  placeholder="tt.mm.jjjj"
                  disabled={false}
                />
                <KsDatePicker
                  value={to}
                  onChange={(nextIso) => {
                    setTo(nextIso);
                    setPage(1);
                  }}
                  placeholder="tt.mm.jjjj"
                  disabled={false}
                />
              </div>
            </div>
          </div>

          <div className="ks-storno__filter">
            <label className="lbl">Sort</label>

            <div
              className={
                "ks-selectbox" + (sortSelect.open ? " ks-selectbox--open" : "")
              }
            >
              <button
                ref={sortSelect.triggerRef}
                type="button"
                className="ks-selectbox__trigger"
                onClick={() =>
                  sortSelect.open
                    ? sortSelect.setOpen(false)
                    : sortSelect.openMenu()
                }
                aria-haspopup="listbox"
                aria-expanded={sortSelect.open}
              >
                <span className="ks-selectbox__label">
                  {sortLabel(sortOrder)}
                </span>
                <span className="ks-selectbox__chevron" aria-hidden="true" />
              </button>
            </div>

            {sortSelect.open && (
              <div
                ref={sortSelect.menuRef}
                role="listbox"
                className="ks-selectbox__panel ks-documents-overlay ks-documents-overlay--sort"
                onWheel={(e) => e.stopPropagation()}
                onScroll={(e) => e.stopPropagation()}
              >
                {(["newest", "oldest"] as SortOrder[]).map((v) => (
                  <button
                    key={v}
                    type="button"
                    role="option"
                    aria-selected={sortOrder === v}
                    className={
                      "ks-selectbox__option ks-documents-option" +
                      (sortOrder === v ? " ks-selectbox__option--active" : "")
                    }
                    onClick={() => {
                      setSortOrder(v);
                      setPage(1);
                      sortSelect.setOpen(false);
                    }}
                  >
                    {sortLabel(v)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="ks-storno__section mb-2">
          <div>
            <label className="lbl">Documents</label>

            <div
              className={
                "ks-selectbox" + (docsSelect.open ? " ks-selectbox--open" : "")
              }
            >
              <button
                ref={docsSelect.triggerRef}
                type="button"
                className="ks-selectbox__trigger"
                onClick={() =>
                  docsSelect.open
                    ? docsSelect.setOpen(false)
                    : docsSelect.openMenu()
                }
                disabled={!pagedItems.length}
                aria-haspopup="listbox"
                aria-expanded={docsSelect.open}
              >
                <span className="ks-selectbox__label">
                  {!hasLoadedOnce && loading
                    ? "Loading…"
                    : `${pagedItems.length} item(s) on this page`}
                </span>
                <span className="ks-selectbox__chevron" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {docsSelect.open && !!pagedItems.length && (
          <div
            ref={docsSelect.menuRef}
            role="listbox"
            className="ks-selectbox__panel ks-documents-overlay ks-documents-overlay--docs"
            onWheel={(e) => e.stopPropagation()}
            onScroll={(e) => e.stopPropagation()}
          >
            {pagedItems.map((d) => (
              <button
                key={d.id}
                type="button"
                role="option"
                className="ks-selectbox__option ks-documents-option ks-doc-select__option ks-storno__option"
                onClick={() => {
                  docsSelect.setOpen(false);
                  openPdf(d);
                }}
              >
                <DocumentRow d={d} />
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <button
              className="btn"
              onClick={() => setPage((p) => prevPage(p))}
              disabled={page <= 1}
            >
              Prev
            </button>

            <div>
              Page {page} / {totalPages}
            </div>

            <button
              className="btn"
              onClick={() => setPage((p) => nextPage(p, totalPages))}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-600">Per page</span>

            <div
              className={
                "ks-selectbox" +
                (perPageSelect.open ? " ks-selectbox--open" : "")
              }
            >
              <button
                ref={perPageSelect.triggerRef}
                type="button"
                className="ks-selectbox__trigger"
                onClick={() =>
                  perPageSelect.open
                    ? perPageSelect.setOpen(false)
                    : perPageSelect.openMenu()
                }
                aria-haspopup="listbox"
                aria-expanded={perPageSelect.open}
              >
                <span className="ks-selectbox__label">{String(limit)}</span>
                <span className="ks-selectbox__chevron" aria-hidden="true" />
              </button>
            </div>

            {perPageSelect.open && (
              <div
                ref={perPageSelect.menuRef}
                role="listbox"
                className="ks-selectbox__panel ks-documents-overlay ks-documents-overlay--perpage"
                onWheel={(e) => e.stopPropagation()}
                onScroll={(e) => e.stopPropagation()}
              >
                {[10, 20, 50, 100].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="option"
                    aria-selected={limit === n}
                    className={
                      "ks-selectbox__option ks-documents-option" +
                      (limit === n ? " ks-selectbox__option--active" : "")
                    }
                    onClick={() => {
                      setLimit(n);
                      setPage(1);
                      perPageSelect.setOpen(false);
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <DownloadButton href={csvHref} label="Download CSV" />
          <DownloadButton href={zipHref} label="Download ZIP" />

          <button
            type="button"
            className="modal__close"
            aria-label="Close"
            onClick={onClose}
          >
            <img
              src="/icons/close.svg"
              alt=""
              aria-hidden="true"
              className="icon-img"
            />
          </button>
        </div>

        {err && <div className="mt-2 text-red-600">{err}</div>}
      </div>
    </div>
  );
}
