// src/app/admin/(app)/customers/dialogs/StornoDialog.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toastErrorMessage, toastText } from "@/lib/toast-messages";
import type { Customer } from "../types";
import {
  GROUPED_COURSE_OPTIONS,
  courseValueFromBooking,
} from "src/app/lib/courseOptions";
import {
  fetchOffers,
  fetchCustomer,
  postStornoMail,
  postStornoStatus,
} from "./stornoDialog/api";
import { cx, selectedCourseLabelFor } from "./stornoDialog/formatters";
import { useStornoMenus } from "./stornoDialog/hooks/useStornoMenus";

import InlineSelect from "./stornoDialog/components/InlineSelect";
import { BookingSelect } from "./stornoDialog/components/BookingSelect";
import {
  SORT_OPTIONS,
  STATUS_OPTIONS,
  type SortOrder,
  type StatusFilter,
} from "./stornoDialog/constants";
import { bookingDisplay } from "./stornoDialog/bookingDisplay";

import { useBookDialogFamily } from "./bookDialog/hooks/useBookDialogFamily";
import { useDropdownOutsideClose } from "./bookDialog/hooks/useDropdownOutsideClose";
import type { FamilyChild, FamilyMember } from "./bookDialog/types";

type Props = {
  customer: Customer;

  onClose: () => void;
  onChanged: (freshCustomer: Customer) => void;
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
    t("common.admin.customers.stornoDialog.Child")
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
        t("common.admin.customers.stornoDialog.Parent"),
    }));
  });
}

function safeText(v: unknown) {
  return String(v ?? "").trim();
}

function childMatches(b: any, childFirst?: string, childLast?: string) {
  const cf = safeText(childFirst).toLowerCase();
  const cl = safeText(childLast).toLowerCase();
  if (!cf && !cl) return true;

  const bf = safeText((b as any).childFirstName).toLowerCase();
  const bl = safeText((b as any).childLastName).toLowerCase();

  if (cf && bf !== cf) return false;
  if (cl && bl !== cl) return false;
  return true;
}

function bookingIdentityKey(b: any) {
  return String(b?._id || b?.bookingId || "").trim();
}

function bookingRank(b: any) {
  let rank = 0;
  if (safeText(b?.invoiceNumber || b?.invoiceNo)) rank += 100;
  if (b?.invoiceDate) rank += 20;
  if (b?.cancelDate || b?.cancellationDate) rank += 10;
  if (b?.endDate) rank += 5;
  if (b?.createdAt) rank += 2;
  return rank;
}

function dedupeBookings(items: any[]) {
  const map = new Map<string, any>();

  for (const item of items || []) {
    const key = bookingIdentityKey(item);
    if (!key) continue;

    const current = map.get(key);
    if (!current) {
      map.set(key, item);
      continue;
    }

    if (bookingRank(item) > bookingRank(current)) {
      map.set(key, item);
    }
  }

  return Array.from(map.values());
}

function isSelfScopedBooking(b: any) {
  const childUid = safeText(b?.childUid);
  const childFirst = safeText(b?.childFirstName).toLowerCase();
  const childLast = safeText(b?.childLastName).toLowerCase();
  const parentFirst = safeText(b?.parentFirstName).toLowerCase();
  const parentLast = safeText(b?.parentLastName).toLowerCase();

  if (!childUid) return true;
  if (!childFirst && !childLast) return true;

  return (
    !!parentFirst &&
    !!parentLast &&
    childFirst === parentFirst &&
    childLast === parentLast
  );
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

export default function StornoDialog({
  customer,

  onClose,
  onChanged,
}: Props) {
  const { t } = useTranslation();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const offersById = useMemo(() => {
    const m = new Map<string, any>();
    for (const o of offers) if (o?._id) m.set(String(o._id), o);
    return m;
  }, [offers]);

  const [courseValue, setCourseValue] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  const { family, familyLoading, familyError, baseSelectedId } =
    useBookDialogFamily(customer._id);

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
    if (!selectedParent)
      return t("common.admin.customers.stornoDialog.selectParent");
    return (
      `${selectedParent.parent.firstName} ${selectedParent.parent.lastName}`.trim() ||
      t("common.admin.customers.stornoDialog.parent")
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

  const activeParentEmail = safeText(
    selectedParent?.parent?.email,
  ).toLowerCase();

  const allBookings = useMemo(() => {
    const base = customer.bookings || [];

    return base.filter((b: any) => {
      const bookingParentEmail = safeText(
        (b as any)?.parentEmail,
      ).toLowerCase();

      if (bookingTarget === "child") {
        if (safeText(b?.childUid) !== safeText(activeChild?.uid)) return false;

        if (!activeParentEmail) return true;
        if (!bookingParentEmail) return true;

        return bookingParentEmail === activeParentEmail;
      }

      if (!isSelfScopedBooking(b)) return false;

      if (!activeParentEmail) return true;
      if (!bookingParentEmail) return true;

      return bookingParentEmail === activeParentEmail;
    });
  }, [customer.bookings, bookingTarget, activeChild, activeParentEmail]);

  const filtered = useMemo(() => {
    const byCourse = !courseValue
      ? allBookings
      : allBookings.filter(
          (b) => courseValueFromBooking(b, offersById) === courseValue,
        );

    const deduped = dedupeBookings(byCourse);
    return applyStatusAndSort(deduped, statusFilter, sortOrder);
  }, [allBookings, offersById, courseValue, statusFilter, sortOrder]);

  const [selectedId, setSelectedId] = useState<string>("");
  const selected = useMemo(
    () => filtered.find((b) => String(b._id) === selectedId) || null,
    [filtered, selectedId],
  );

  useEffect(() => {
    void loadOffers(t, setOffers, setLoading, setErr);
  }, [t]);

  useEffect(() => {
    setCourseValue("");
    setStatusFilter("active");
    setSortOrder("newest");
    setSelectedId("");
    setErr(null);
  }, [customer?._id, bookingTarget, selectedChildUid, selectedParentId]);

  useEffect(() => {
    syncSelected(filtered, selectedId, setSelectedId);
  }, [filtered, selectedId]);

  const isCancelled = String(selected?.status || "") === "cancelled";
  const [note, setNote] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const disabled = saving || !selected || isCancelled;

  const courseDropdownRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const {
    isCourseDropdownOpen,
    setIsCourseDropdownOpen,
    menuOpen,
    setMenuOpen,
    openMenu,
  } = useStornoMenus({
    courseDropdownRef,
    triggerRef,
    menuRef,
    filteredCount: filtered.length,
  });

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement | null>(null);
  const sortDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      const t = e.target as Node | null;
      if (
        t &&
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(t)
      ) {
        setIsStatusOpen(false);
      }
      if (
        t &&
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(t)
      ) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const selectedCourseLabel = useMemo(
    () => selectedCourseLabelFor(courseValue, GROUPED_COURSE_OPTIONS, t),
    [courseValue, t],
  );

  // const statusLabel = useMemo(
  //   () =>
  //     STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label ||
  //     toastText(
  //       t,
  //       "common.admin.customers.stornoDialog.statusActive",
  //       "Active",
  //     ),
  //   [statusFilter, t],
  // );

  // const sortLabel = useMemo(
  //   () =>
  //     SORT_OPTIONS.find((o) => o.value === sortOrder)?.label ||
  //     toastText(t, "common.admin.customers.stornoDialog.sortNewest", "Newest"),
  //   [sortOrder, t],
  // );

  const statusLabel = useMemo(
    () =>
      t(
        STATUS_OPTIONS.find((o) => o.value === statusFilter)?.labelKey ||
          "common.admin.customers.stornoDialog.statusActive",
      ),
    [statusFilter, t],
  );

  const sortLabel = useMemo(
    () =>
      t(
        SORT_OPTIONS.find((o) => o.value === sortOrder)?.labelKey ||
          "common.admin.customers.stornoDialog.sortNewest",
      ),
    [sortOrder, t],
  );

  const bookingTrigger = useMemo(() => {
    if (selected) return bookingDisplay(selected, statusFilter, t);
    if (filtered.length)
      return bookingDisplay(
        {
          offerTitle: toastText(
            t,
            "common.admin.customers.stornoDialog.selectBooking",
            "Select…",
          ),
        },
        statusFilter,
        t,
      );
    return bookingDisplay(
      {
        offerTitle: toastText(
          t,
          "common.admin.customers.stornoDialog.noBookings",
          "No bookings",
        ),
      },
      statusFilter,
      t,
    );
  }, [selected, filtered.length, statusFilter, t]);

  async function submit() {
    if (!customer._id || !selected?._id) return;

    setSaving(true);
    setErr(null);

    try {
      await postStornoStatus(customer._id, selected._id, note);
      await postStornoMail(customer._id, selected._id, note);
      const fresh = await fetchCustomer(customer._id);
      if (fresh) onChanged(fresh);
      onClose();
    } catch (e: unknown) {
      setErr(
        toastErrorMessage(
          t,
          e,
          "common.admin.customers.stornoDialog.errors.cancelFailed",
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="dialog-backdrop storno-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="storno-dialog-title"
    >
      <button
        type="button"
        className="dialog-backdrop-hit"
        aria-label={t("common.admin.customers.stornoDialog.close")}
        onClick={onClose}
      />

      <div
        className="dialog storno-dialog__dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-head storno-dialog__head">
          <div className="storno-dialog__head-main">
            <h3 id="storno-dialog-title" className="dialog-title">
              {t("common.admin.customers.stornoDialog.title")}
            </h3>
            <p className="dialog-subtitle">
              {t("common.admin.customers.stornoDialog.subtitle")}
            </p>
          </div>

          <div className="dialog-head__actions">
            <button
              type="button"
              className="dialog-close"
              aria-label={t("common.admin.customers.stornoDialog.close")}
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

        <div className="dialog-body storno-dialog__body">
          <section className="dialog-section storno-dialog__scopeSection">
            <div className="dialog-section__head">
              <h4 className="dialog-section__title">
                {t("common.admin.customers.stornoDialog.scopeTitle")}
              </h4>
            </div>

            <div className="dialog-section__body storno-dialog__scopeBody">
              {familyLoading && (
                <div className="storno-dialog__note">
                  {t("common.admin.customers.stornoDialog.loadingFamily")}
                </div>
              )}

              {familyError && (
                <div className="storno-dialog__error">
                  {t("common.admin.customers.stornoDialog.familyLoadError")}
                </div>
              )}

              {family && family.length > 0 ? (
                <>
                  <div className="storno-dialog__field">
                    <label className="dialog-label">
                      {t("common.admin.customers.stornoDialog.parent")}
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
                            t(
                              "common.admin.customers.stornoDialog.selectParent",
                            )}
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

                  <div className="storno-dialog__scopeButtons">
                    <button
                      type="button"
                      className={
                        "btn btn-sm storno-dialog__scopeBtn" +
                        (bookingTarget === "self"
                          ? " storno-dialog__scopeBtn--active"
                          : "")
                      }
                      onMouseDown={rememberButtonFocusState}
                      onClick={(e) =>
                        toggleButtonFocus(e, () => setBookingTarget("self"))
                      }
                    >
                      {t("common.admin.customers.stornoDialog.customerSelf")}
                    </button>

                    <button
                      type="button"
                      className={
                        "btn btn-sm storno-dialog__scopeBtn" +
                        (bookingTarget === "child"
                          ? " storno-dialog__scopeBtn--active"
                          : "")
                      }
                      onMouseDown={rememberButtonFocusState}
                      onClick={(e) =>
                        toggleButtonFocus(e, () => setBookingTarget("child"))
                      }
                    >
                      {t("common.admin.customers.stornoDialog.child")}
                    </button>
                  </div>

                  {bookingTarget === "child" && (
                    <div className="storno-dialog__field">
                      <label className="dialog-label">
                        {t("common.admin.customers.stornoDialog.child")}
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
                              : t(
                                  "common.admin.customers.stornoDialog.selectChild",
                                )}
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

                  <div className="storno-dialog__summary">
                    <div className="storno-dialog__summaryItem">
                      <span className="dialog-label">
                        {" "}
                        {t("common.admin.customers.stornoDialog.parent")}
                      </span>
                      <span className="dialog-value">
                        {selectedParent
                          ? `${selectedParent.parent.firstName} ${selectedParent.parent.lastName}`.trim()
                          : "—"}
                      </span>
                    </div>

                    <div className="storno-dialog__summaryItem">
                      <span className="dialog-label">
                        {t("common.admin.customers.stornoDialog.child")}
                      </span>
                      <span className="dialog-value">
                        {bookingTarget === "child" && activeChild
                          ? `${activeChild.firstName} ${activeChild.lastName}`.trim()
                          : "—"}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                !familyLoading && (
                  <div className="dialog-value">
                    {t(
                      "common.admin.customers.stornoDialog.currentCustomerInfo",
                    )}
                  </div>
                )
              )}
            </div>
          </section>

          {(err || loading) && (
            <section className="dialog-section storno-dialog__statusSection">
              <div className="dialog-section__body">
                {err && <div className="storno-dialog__error">{err}</div>}
                {loading && (
                  <div className="storno-dialog__note">
                    {" "}
                    {t("common.admin.customers.stornoDialog.loading")}
                  </div>
                )}
              </div>
            </section>
          )}

          <section className="dialog-section storno-dialog__filtersSection">
            <div className="dialog-section__head">
              <h4 className="dialog-section__title">
                {t("common.admin.customers.stornoDialog.filtersTitle")}
              </h4>
            </div>

            <div className="dialog-section__body">
              <div className="ks-storno__filters mb-2">
                <div className="ks-storno__filter">
                  <label className="dialog-label">
                    {t("common.admin.customers.stornoDialog.courses")}
                  </label>

                  <div
                    ref={courseDropdownRef}
                    className={cx(
                      "ks-selectbox",
                      isCourseDropdownOpen && "ks-selectbox--open",
                    )}
                  >
                    <button
                      type="button"
                      className="ks-selectbox__trigger"
                      onClick={() => setIsCourseDropdownOpen((o) => !o)}
                      aria-haspopup="listbox"
                      aria-expanded={isCourseDropdownOpen}
                    >
                      <span className="ks-selectbox__label">
                        {selectedCourseLabel}
                      </span>
                      <span
                        className="ks-selectbox__chevron"
                        aria-hidden="true"
                      />
                    </button>

                    {isCourseDropdownOpen && (
                      <div className="ks-selectbox__panel" role="listbox">
                        <button
                          type="button"
                          className={cx(
                            "ks-selectbox__option",
                            !courseValue && "ks-selectbox__option--active",
                          )}
                          onClick={() => {
                            setCourseValue("");
                            setIsCourseDropdownOpen(false);
                          }}
                        >
                          {t("common.admin.customers.stornoDialog.allCourses")}
                        </button>

                        {GROUPED_COURSE_OPTIONS.map((g) => (
                          <div key={g.label} className="ks-selectbox__group">
                            <div className="ks-selectbox__group-label">
                              {g.label}
                            </div>
                            {g.items.map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                className={cx(
                                  "ks-selectbox__option",
                                  courseValue === opt.value &&
                                    "ks-selectbox__option--active",
                                )}
                                onClick={() => {
                                  setCourseValue(opt.value);
                                  setIsCourseDropdownOpen(false);
                                }}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="ks-storno__filter">
                  <InlineSelect
                    label={t("common.admin.customers.stornoDialog.status")}
                    value={statusFilter}
                    displayLabel={statusLabel}
                    // options={STATUS_OPTIONS}

                    options={STATUS_OPTIONS.map((opt) => ({
                      ...opt,
                      label: t(opt.labelKey),
                    }))}
                    rootRef={statusDropdownRef}
                    open={isStatusOpen}
                    setOpen={setIsStatusOpen}
                    onChange={(v) => setStatusFilter(v as StatusFilter)}
                  />
                </div>

                <div className="ks-storno__filter">
                  <InlineSelect
                    label={t("common.admin.customers.stornoDialog.sort")}
                    value={sortOrder}
                    displayLabel={sortLabel}
                    // options={SORT_OPTIONS}

                    options={SORT_OPTIONS.map((opt) => ({
                      ...opt,
                      label: t(opt.labelKey),
                    }))}
                    rootRef={sortDropdownRef}
                    open={isSortOpen}
                    setOpen={setIsSortOpen}
                    onChange={(v) => setSortOrder(v as SortOrder)}
                  />
                </div>
              </div>

              <div className="ks-storno__section mb-2">
                <BookingSelect
                  label={t("common.admin.customers.stornoDialog.booking")}
                  open={menuOpen}
                  setOpen={setMenuOpen}
                  triggerRef={triggerRef}
                  menuRef={menuRef}
                  disabled={!filtered.length}
                  trigger={bookingTrigger}
                  items={filtered}
                  selectedId={selectedId}
                  onSelect={(id: string) => setSelectedId(id)}
                  statusFilter={statusFilter}
                  isCancelledSelected={isCancelled}
                />
              </div>
            </div>
          </section>

          <section className="dialog-section storno-dialog__detailsSection">
            <div className="dialog-section__head">
              <h4 className="dialog-section__title">
                {t("common.admin.customers.stornoDialog.detailsTitle")}
              </h4>
            </div>

            <div className="dialog-section__body ks-storno__section">
              <div>
                <label className="dialog-label">
                  {" "}
                  {t("common.admin.customers.stornoDialog.noteOptional")}
                </label>
                <textarea
                  className="input"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t(
                    "common.admin.customers.stornoDialog.notePlaceholder",
                  )}
                  disabled={!selected || isCancelled}
                />
              </div>
            </div>
          </section>
        </div>

        <div className="dialog-footer storno-dialog__footer">
          <div className="storno-dialog__footerActions">
            <button
              className="btn storno-dialog__confirmBtn"
              disabled={disabled}
              onClick={submit}
            >
              {saving
                ? t("common.admin.customers.stornoDialog.processing")
                : t("common.admin.customers.stornoDialog.confirm")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function applyStatusAndSort(
  items: any[],
  status: StatusFilter,
  sort: SortOrder,
) {
  const filtered =
    status === "all"
      ? items
      : items.filter((b) => {
          const s = String(b?.status || "")
            .trim()
            .toLowerCase();
          if (status === "active") return s !== "cancelled";
          if (status === "cancelled") return s === "cancelled";
          return true;
        });

  const dir = sort === "newest" ? -1 : 1;

  return [...filtered].sort((a, b) => {
    const at = sortTime(a);
    const bt = sortTime(b);
    if (at !== bt) return (at - bt) * dir;

    const ai = String(a?.invoiceNumber || a?.invoiceNo || "").trim();
    const bi = String(b?.invoiceNumber || b?.invoiceNo || "").trim();
    if (ai !== bi) return ai.localeCompare(bi) * dir;

    const an = String(a?.offerTitle || "").trim();
    const bn = String(b?.offerTitle || "").trim();
    return an.localeCompare(bn);
  });
}

function sortTime(b: any) {
  const d1 = toTime(b?.invoiceDate);
  if (d1 != null) return d1;
  const d2 = toTime(b?.createdAt);
  if (d2 != null) return d2;
  const d3 = toTime(b?.date);
  if (d3 != null) return d3;
  return 0;
}

function toTime(v: any) {
  if (!v) return null;
  const t = new Date(v).getTime();
  if (Number.isFinite(t)) return t;
  return null;
}

async function loadOffers(
  t: (key: string) => string,
  setOffers: (v: any[]) => void,
  setLoading: (v: boolean) => void,
  setErr: (v: string | null) => void,
) {
  try {
    setLoading(true);
    setErr(null);
    setOffers(await fetchOffers(500));
  } catch (e: unknown) {
    setErr(
      toastErrorMessage(
        t,
        e,
        "common.admin.customers.stornoDialog.errors.loadFailed",
      ),
    );
  } finally {
    setLoading(false);
  }
}

function syncSelected(
  filtered: any[],
  selectedId: string,
  setSelectedId: (v: string) => void,
) {
  if (!filtered.length) return void setSelectedId("");
  if (filtered.some((b) => String(b._id) === String(selectedId))) return;
  const firstActive = filtered.find(
    (b) => String(b.status || "") !== "cancelled",
  );
  setSelectedId(String((firstActive || filtered[0])._id));
}
