"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import KsDatePicker from "@/app/admin/(app)/invoices/components/KsDatePicker";
import { toastErrorMessage } from "@/lib/toast-messages";
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

// type ChildOption = {
//   uid: string;
//   label: string;
//   parentId: string;
//   child: FamilyChild;
// };

// type ParentOption = {
//   id: string;
//   label: string;
// };

type DownloadButtonProps = {
  href: string;
  label: string;
};

function safeText(v: unknown) {
  return String(v ?? "").trim();
}

// function formatDateOnlyDe(value?: string | null) {
//   if (!value) return "";
//   const iso = /T/.test(value) ? value : `${value}T00:00:00`;
//   const d = new Date(iso);
//   if (Number.isNaN(d.getTime())) return value;

//   return new Intl.DateTimeFormat("de-DE", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//   }).format(d);
// }

function childLabel(child: FamilyChild, t: (key: string) => string) {
  return (
    `${child.firstName} ${child.lastName}`.trim() ||
    t("admin.customers.documents.child.fallback")
  );
}

function buildChildOptions(
  family: FamilyMember[] | null,
  t: (key: string) => string,
) {
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
        label: childLabel(child, t),
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

function buildParentOptions(
  family: FamilyMember[] | null,
  t: (key: string) => string,
) {
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
        t("admin.customers.documents.parent.fallback"),
    }));
  });
}

function openPdf(item: DocItem) {
  const url = normalizePdfHref(item.href);
  window.open(url, "_blank", "noopener,noreferrer");
}

function sortLabel(order: SortOrder, t: (key: string) => string) {
  return order === "oldest"
    ? t("admin.customers.documents.sort.oldest")
    : t("admin.customers.documents.sort.newest");
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

function rememberButtonFocusState(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.dataset.wasFocused = String(
    document.activeElement === e.currentTarget,
  );
}

function toggleButtonFocus(
  e: React.MouseEvent<HTMLButtonElement>,
  action: () => void,
) {
  const btn = e.currentTarget;
  const wasFocused = btn.dataset.wasFocused === "true";
  action();

  requestAnimationFrame(() => {
    if (wasFocused) btn.blur();
    else btn.focus({ preventScroll: true });
    delete btn.dataset.wasFocused;
  });
}

function DocumentRow({
  d,
  hideTitleText = false,
}: {
  d: DocItem;
  hideTitleText?: boolean;
}) {
  const title = trimTitle(d);
  const badge = badgeTextFrom(d);

  return (
    <div className="ks-doc-select__row">
      <div className="ks-doc-select__top ks-doc-select__top--single">
        <div className="ks-doc-select__title" title={title}>
          <span className="ks-doc-select__typeIcon" aria-hidden="true">
            <img src={iconForType(d.type)} alt="" />
          </span>
          {!hideTitleText ? (
            <span className="ks-doc-select__titleText">{title}</span>
          ) : null}
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
      className="btn documents-dialog__downloadBtn"
      title={label}
      aria-label={label}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
      onFocus={() => setIsActive(true)}
      onBlur={() => setIsActive(false)}
    >
      <img
        src={getDownloadIconSrc(isActive)}
        alt=""
        aria-hidden="true"
        className="documents-dialog__downloadIcon"
      />
      <span>{label}</span>
    </a>
  );
}

export default function DocumentsDialog({ customerId, onClose }: Props) {
  const { t } = useTranslation();
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

  const childOptions = useMemo(() => buildChildOptions(family, t), [family, t]);
  const parentOptions = useMemo(
    () => buildParentOptions(family, t),
    [family, t],
  );

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
    if (!selectedParent) return t("admin.customers.documents.parent.select");
    return (
      `${selectedParent.parent.firstName} ${selectedParent.parent.lastName}`.trim() ||
      t("admin.customers.documents.parent.fallback")
    );
  }, [selectedParent, t]);

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
    typeInvoice,
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
        setErr(
          toastErrorMessage(t, e, "admin.customers.documents.error.loadFailed"),
        );
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
    <div
      className="dialog-backdrop documents-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="documents-dialog-title"
    >
      <button
        type="button"
        className="dialog-backdrop-hit"
        aria-label={t("common.actions.close")}
        onClick={onClose}
      />

      <div
        className="dialog documents-dialog__dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-head documents-dialog__head">
          <div className="documents-dialog__head-main">
            <h3 id="documents-dialog-title" className="dialog-title">
              {t("admin.customers.documents.title")}
            </h3>

            <p className="dialog-subtitle">
              {t("admin.customers.documents.subtitle")}
            </p>
          </div>

          <div className="dialog-head__actions">
            <button
              type="button"
              className="dialog-close"
              aria-label={t("common.actions.close")}
              title={t("common.actions.close")}
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
        </div>

        <div className="dialog-body documents-dialog__body">
          <section className="dialog-section documents-dialog__scopeSection">
            <div className="dialog-section__head">
              <h4 className="dialog-section__title">
                {t("admin.customers.documents.scope.title")}
              </h4>
            </div>

            <div className="dialog-section__body documents-dialog__scopeBody">
              {familyLoading && (
                <div className="documents-dialog__note">
                  {t("admin.customers.documents.family.loading")}
                </div>
              )}

              {familyError && (
                <div className="documents-dialog__error">
                  {t("admin.customers.documents.family.error")}
                </div>
              )}

              {family && family.length > 0 ? (
                <>
                  <div className="documents-dialog__field">
                    <label className="dialog-label">
                      {t("admin.customers.documents.parent.label")}
                    </label>

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
                          {selectedParentLabel ||
                            t("admin.customers.documents.parent.select")}
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

                  <div className="documents-dialog__scopeButtons">
                    <button
                      type="button"
                      className={
                        "btn btn-sm documents-dialog__scopeBtn" +
                        (bookingTarget === "self"
                          ? " documents-dialog__scopeBtn--active"
                          : "")
                      }
                      onMouseDown={rememberButtonFocusState}
                      onClick={(e) =>
                        toggleButtonFocus(e, () => setBookingTarget("self"))
                      }
                    >
                      {t("admin.customers.documents.scope.customerSelf")}
                    </button>

                    <button
                      type="button"
                      className={
                        "btn btn-sm documents-dialog__scopeBtn" +
                        (bookingTarget === "child"
                          ? " documents-dialog__scopeBtn--active"
                          : "")
                      }
                      onMouseDown={rememberButtonFocusState}
                      onClick={(e) =>
                        toggleButtonFocus(e, () => setBookingTarget("child"))
                      }
                    >
                      {t("admin.customers.documents.child.label")}
                    </button>
                  </div>

                  {bookingTarget === "child" && (
                    <div className="documents-dialog__field">
                      <label className="dialog-label">
                        {t("admin.customers.documents.child.label")}
                      </label>

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
                              : t("admin.customers.documents.child.select")}
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

                  <div className="documents-dialog__summary">
                    <div className="documents-dialog__summaryItem">
                      <span className="dialog-label">
                        {t("admin.customers.documents.parent.label")}
                      </span>
                      <span className="dialog-value">
                        {selectedParent
                          ? `${selectedParent.parent.firstName} ${selectedParent.parent.lastName}`.trim()
                          : t("admin.customers.documents.common.empty")}
                      </span>
                    </div>

                    <div className="documents-dialog__summaryItem">
                      <span className="dialog-label">
                        {t("admin.customers.documents.child.label")}
                      </span>
                      <span className="dialog-value">
                        {bookingTarget === "child" && activeChild
                          ? `${activeChild.firstName} ${activeChild.lastName}`.trim()
                          : t("admin.customers.documents.common.empty")}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                !familyLoading && (
                  <div className="dialog-value">
                    {t("admin.customers.documents.scope.currentCustomer")}
                  </div>
                )
              )}
            </div>
          </section>

          <section className="dialog-section documents-dialog__filtersSection">
            <div className="dialog-section__head">
              <h4 className="dialog-section__title">
                {t("admin.customers.documents.filters.title")}
              </h4>
            </div>

            <div className="dialog-section__body">
              <div className="ks-documents-premium">
                <div className="ks-documents-premium__topRow">
                  <div className="ks-documents-premium__searchItem">
                    <div className="input-with-icon">
                      <img
                        src="/icons/search.svg"
                        alt=""
                        aria-hidden="true"
                        className="input-with-icon__icon"
                      />
                      <input
                        className="input input-with-icon__input"
                        placeholder={t(
                          "admin.customers.documents.search.placeholder",
                        )}
                        aria-label={t(
                          "admin.customers.documents.search.ariaLabel",
                        )}
                        value={q}
                        onChange={(e) => {
                          setQ(e.target.value);
                          setPage(1);
                        }}
                      />
                    </div>
                  </div>

                  <div className="ks-documents-premium__dateItem">
                    <KsDatePicker
                      value={from}
                      onChange={(nextIso) => {
                        setFrom(nextIso);
                        setPage(1);
                      }}
                      placeholder={t(
                        "admin.customers.documents.date.placeholder",
                      )}
                      disabled={false}
                    />
                  </div>

                  <div className="ks-documents-premium__dateItem">
                    <KsDatePicker
                      value={to}
                      onChange={(nextIso) => {
                        setTo(nextIso);
                        setPage(1);
                      }}
                      placeholder={t(
                        "admin.customers.documents.date.placeholder",
                      )}
                      disabled={false}
                    />
                  </div>

                  <div className="ks-documents-premium__sortItem">
                    <div
                      className={
                        "ks-selectbox documents-dialog__anchor" +
                        (sortSelect.open ? " ks-selectbox--open" : "")
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
                          {sortLabel(sortOrder, t)}
                        </span>
                        <span
                          className="ks-selectbox__chevron"
                          aria-hidden="true"
                        />
                      </button>

                      {sortSelect.open && (
                        <div
                          ref={sortSelect.menuRef}
                          role="listbox"
                          className="ks-selectbox__panel documents-dialog__panel documents-dialog__panel--sort"
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
                                (sortOrder === v
                                  ? " ks-selectbox__option--active"
                                  : "")
                              }
                              onClick={() => {
                                setSortOrder(v);
                                setPage(1);
                                sortSelect.setOpen(false);
                              }}
                            >
                              {sortLabel(v, t)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="ks-documents-premium__typesRow">
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

              <div className="documents-dialog__controls">
                <div className="documents-dialog__field">
                  <label className="dialog-label">
                    {t("admin.customers.documents.list.label")}
                  </label>

                  <div
                    className={
                      "ks-selectbox documents-dialog__anchor" +
                      (docsSelect.open ? " ks-selectbox--open" : "")
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
                          ? t("admin.customers.documents.loading")
                          : t("admin.customers.documents.list.itemsOnPage", {
                              count: pagedItems.length,
                            })}
                      </span>
                      <span
                        className="ks-selectbox__chevron"
                        aria-hidden="true"
                      />
                    </button>

                    {docsSelect.open && !!pagedItems.length && (
                      <div
                        ref={docsSelect.menuRef}
                        role="listbox"
                        className="ks-selectbox__panel documents-dialog__panel documents-dialog__panel--docs"
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
                  </div>
                </div>

                <div className="documents-dialog__pagerRow">
                  <div className="pager pager--arrows">
                    <button
                      type="button"
                      className="btn"
                      aria-label={t(
                        "admin.customers.documents.pagination.previous",
                      )}
                      title={t("admin.customers.documents.pagination.previous")}
                      onClick={() => setPage((p) => prevPage(p))}
                      disabled={page <= 1}
                    >
                      <img
                        src="/icons/arrow_right_alt.svg"
                        alt=""
                        aria-hidden="true"
                        className="icon-img icon-img--left"
                      />
                    </button>

                    <div
                      className="pager__count"
                      aria-live="polite"
                      aria-atomic="true"
                    >
                      {t("admin.customers.documents.pagination.page", {
                        page,
                        totalPages,
                      })}
                    </div>

                    <button
                      type="button"
                      className="btn"
                      aria-label={t(
                        "admin.customers.documents.pagination.next",
                      )}
                      title={t("admin.customers.documents.pagination.next")}
                      onClick={() => setPage((p) => nextPage(p, totalPages))}
                      disabled={page >= totalPages}
                    >
                      <img
                        src="/icons/arrow_right_alt.svg"
                        alt=""
                        aria-hidden="true"
                        className="icon-img"
                      />
                    </button>
                  </div>

                  <div className="documents-dialog__perPage">
                    <span className="documents-dialog__perPageLabel">
                      {t("admin.customers.documents.pagination.perPage")}
                    </span>

                    <div
                      className={
                        "ks-selectbox documents-dialog__anchor" +
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
                        <span className="ks-selectbox__label">
                          {String(limit)}
                        </span>
                        <span
                          className="ks-selectbox__chevron"
                          aria-hidden="true"
                        />
                      </button>

                      {perPageSelect.open && (
                        <div
                          ref={perPageSelect.menuRef}
                          role="listbox"
                          className="ks-selectbox__panel documents-dialog__panel documents-dialog__panel--perpage"
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
                                (limit === n
                                  ? " ks-selectbox__option--active"
                                  : "")
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
                </div>

                {err && (
                  <div className="documents-dialog__error mt-2">{err}</div>
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="dialog-footer documents-dialog__footer">
          <div className="documents-dialog__footerActions">
            <DownloadButton
              href={csvHref}
              label={t("admin.customers.documents.download.csv")}
            />
            <DownloadButton
              href={zipHref}
              label={t("admin.customers.documents.download.zip")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
