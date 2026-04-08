// src/app/admin/(app)/customers/dialogs/CancelDialog.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toastErrorMessage, toastText } from "@/lib/toast-messages";
import type { Customer } from "../types";
import {
  GROUPED_COURSE_OPTIONS,
  courseValueFromBooking,
} from "src/app/lib/courseOptions";
import KsDatePicker from "@/app/admin/(app)/invoices/components/KsDatePicker";
import { fetchOffers, fetchCustomer, postCancel } from "./cancelDialog/api";
import { todayISO } from "./cancelDialog/formatters";
import {
  buildCourseMeta,
  isNonCancelableCourseValue,
} from "./cancelDialog/courseMeta";
import { isBookingCancellable } from "./cancelDialog/bookingRules";
import { useCancelDropdowns } from "./cancelDialog/hooks/useCancelDropdowns";
import {
  SORT_OPTIONS,
  STATUS_OPTIONS,
  type SortOrder,
  type StatusFilter,
} from "./cancelDialog/constants";
import { bookingDisplay } from "./cancelDialog/bookingDisplay";
import { applyStatusAndSort } from "./cancelDialog/filtering";
import { useOutsideClose } from "./cancelDialog/hooks/useOutsideClose";
import { InlineSelect } from "./cancelDialog/components/InlineSelect";
import { BookingSelect } from "./cancelDialog/components/BookingSelect";

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
    t("common.admin.customers.cancelDialog.child")
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
        t("common.admin.customers.cancelDialog.parent"),
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

export default function CancelDialog({
  customer,
  // childFirst,
  // childLast,
  onClose,
  onChanged,
}: Props) {
  const { t } = useTranslation();
  const [offers, setOffers] = useState<any[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [courseValue, setCourseValue] = useState("");
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
      return t("common.admin.customers.cancelDialog.selectParent");
    return (
      `${selectedParent.parent.firstName} ${selectedParent.parent.lastName}`.trim() ||
      t("common.admin.customers.cancelDialog.parent")
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

  const courseMetaByValue = useMemo(
    () => buildCourseMeta(GROUPED_COURSE_OPTIONS),
    [],
  );

  const courseValueIsNonCancelable = useMemo(() => {
    return isNonCancelableCourseValue(courseValue, courseMetaByValue);
  }, [courseValue, courseMetaByValue]);

  const offersById = useMemo(() => {
    const m = new Map<string, any>();
    for (const o of offers) if (o?._id) m.set(String(o._id), o);
    return m;
  }, [offers]);

  const filteredBookings = useMemo(() => {
    const base = (customer.bookings || []).filter((b: any) => {
      if (!isBookingCancellable(b, offersById)) return false;

      const bookingParentEmail = safeText(
        (b as any)?.parentEmail,
      ).toLowerCase();

      if (bookingTarget === "child") {
        if (safeText(b?.childUid) !== safeText(activeChild?.uid)) return false;

        if (activeParentEmail) {
          return bookingParentEmail === activeParentEmail;
        }

        return true;
      }

      if (safeText((b as any)?.childUid)) return false;

      if (activeParentEmail) {
        return bookingParentEmail === activeParentEmail;
      }

      return true;
    });

    if (courseValueIsNonCancelable) return [];

    const byCourse = courseValue
      ? base.filter(
          (b: any) => courseValueFromBooking(b, offersById) === courseValue,
        )
      : base;

    const deduped = dedupeBookings(byCourse);
    return applyStatusAndSort(deduped, statusFilter, sortOrder);
  }, [
    customer.bookings,
    offersById,
    courseValue,
    courseValueIsNonCancelable,
    statusFilter,
    sortOrder,
    bookingTarget,
    activeChild,
    activeParentEmail,
  ]);

  const [selectedId, setSelectedId] = useState("");
  const selected = useMemo(() => {
    return (
      filteredBookings.find((b: any) => String(b._id) === selectedId) || null
    );
  }, [filteredBookings, selectedId]);

  useEffect(() => {
    void loadOffers(setOffers, setLoadingOffers, setErr, t);
  }, []);

  useEffect(() => {
    setCourseValue("");
    setStatusFilter("active");
    setSortOrder("newest");
    setSelectedId("");
    setErr(null);
  }, [customer?._id, bookingTarget, selectedChildUid, selectedParentId]);

  useEffect(() => {
    syncSelected(filteredBookings, selectedId, setSelectedId);
  }, [filteredBookings, selectedId]);

  const selectedIsCancelled = String(selected?.status || "") === "cancelled";

  const [cancelDate, setCancelDate] = useState(todayISO());
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const endBeforeStart = Boolean(endDate && cancelDate && endDate < cancelDate);
  const disabledByNonCancelableCourse = courseValueIsNonCancelable;

  const disabled =
    saving ||
    !selected ||
    !cancelDate ||
    !endDate ||
    selectedIsCancelled ||
    endBeforeStart ||
    disabledByNonCancelableCourse;

  const selectedCourseLabel = useMemo(() => {
    if (!courseValue)
      return t("common.admin.customers.cancelDialog.allCourses");
    for (const group of GROUPED_COURSE_OPTIONS) {
      const found = group.items.find((opt) => opt.value === courseValue);
      if (found) return found.label;
    }
    return t("common.admin.customers.cancelDialog.allCourses");
  }, [courseValue, t]);

  // const statusLabel = useMemo(() => {
  //   return (
  //     STATUS_OPTIONS.find((o) => o.value === statusFilter)?.labelKey ||
  //     t("common.admin.customers.cancelDialog.statusActive")
  //   );
  // }, [statusFilter, t]);

  // rein
  const statusItems = useMemo(() => {
    return STATUS_OPTIONS.map((o) => ({
      value: o.value,
      label: t(o.labelKey),
    }));
  }, [t]);

  const statusLabel = useMemo(() => {
    return (
      statusItems.find((o) => o.value === statusFilter)?.label ||
      t("common.admin.customers.cancelDialog.statusActive")
    );
  }, [statusFilter, statusItems, t]);

  // const sortLabel = useMemo(() => {
  //   return (
  //     SORT_OPTIONS.find((o) => o.value === sortOrder)?.labelKey ||
  //     t("common.admin.customers.cancelDialog.sortNewest")
  //   );
  // }, [sortOrder, t]);

  // rein
  const sortItems = useMemo(() => {
    return SORT_OPTIONS.map((o) => ({
      value: o.value,
      label: t(o.labelKey),
    }));
  }, [t]);

  const sortLabel = useMemo(() => {
    return (
      sortItems.find((o) => o.value === sortOrder)?.label ||
      t("common.admin.customers.cancelDialog.sortNewest")
    );
  }, [sortOrder, sortItems, t]);

  const bookingTrigger = useMemo(() => {
    if (courseValueIsNonCancelable)
      return bookingDisplay(null, true, statusFilter, t);
    if (selected) return bookingDisplay(selected, false, statusFilter, t);
    if (filteredBookings.length)
      return bookingDisplay("select", false, statusFilter, t);
    return bookingDisplay(null, false, statusFilter, t);
  }, [courseValueIsNonCancelable, selected, filteredBookings, statusFilter, t]);

  const courseDropdownRef = useRef<HTMLDivElement | null>(null);
  const bookingDropdownRef = useRef<HTMLDivElement | null>(null);
  const statusDropdownRef = useRef<HTMLDivElement | null>(null);
  const sortDropdownRef = useRef<HTMLDivElement | null>(null);

  const {
    isCourseDropdownOpen,
    setIsCourseDropdownOpen,
    isBookingDropdownOpen,
    setIsBookingDropdownOpen,
  } = useCancelDropdowns(courseDropdownRef, bookingDropdownRef);

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  useOutsideClose(statusDropdownRef, isStatusOpen, setIsStatusOpen);
  useOutsideClose(sortDropdownRef, isSortOpen, setIsSortOpen);

  async function submit() {
    if (!customer._id || !selected?._id || !cancelDate || !endDate) return;
    if (disabledByNonCancelableCourse) return;

    setSaving(true);
    setErr(null);

    try {
      await postCancel(customer._id, selected._id, cancelDate, endDate, reason);
      const fresh = await fetchCustomer(customer._id);
      if (fresh) onChanged(fresh);
      onClose();
    } catch (e: unknown) {
      setErr(
        toastErrorMessage(
          t,
          e,
          "common.admin.customers.cancelDialog.errors.cancelFailed",
        ),
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <div
      className="dialog-backdrop cancel-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-dialog-title"
    >
      <button
        type="button"
        className="dialog-backdrop-hit"
        aria-label={t("common.actions.close")}
        onClick={onClose}
      />

      <div
        className="dialog cancel-dialog__dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-head cancel-dialog__head">
          <div className="cancel-dialog__head-main">
            <h3 id="cancel-dialog-title" className="dialog-title">
              {t("common.admin.customers.cancelDialog.title")}
            </h3>
            <p className="dialog-subtitle">
              {t("common.admin.customers.cancelDialog.subtitle")}
            </p>
          </div>

          <div className="dialog-head__actions">
            <button
              type="button"
              className="dialog-close"
              aria-label={t("common.actions.close")}
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

        <div className="dialog-body cancel-dialog__body">
          <section className="dialog-section cancel-dialog__scopeSection">
            <div className="dialog-section__head">
              <h4 className="dialog-section__title">
                {t("common.admin.customers.cancelDialog.scopeTitle")}
              </h4>
            </div>

            <div className="dialog-section__body cancel-dialog__scopeBody">
              {familyLoading && (
                <div className="cancel-dialog__note">
                  {t("common.admin.customers.cancelDialog.loadingFamily")}
                </div>
              )}

              {familyError && (
                <div className="cancel-dialog__error">
                  {t("common.admin.customers.cancelDialog.familyError")}
                </div>
              )}

              {family && family.length > 0 ? (
                <>
                  <div className="cancel-dialog__field">
                    <label className="dialog-label">
                      {t("common.admin.customers.cancelDialog.parent")}
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
                              "common.admin.customers.cancelDialog.selectParent",
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

                  <div className="cancel-dialog__scopeButtons">
                    <button
                      type="button"
                      className={
                        "btn btn-sm cancel-dialog__scopeBtn" +
                        (bookingTarget === "self"
                          ? " cancel-dialog__scopeBtn--active"
                          : "")
                      }
                      onMouseDown={rememberButtonFocusState}
                      onClick={(e) =>
                        toggleButtonFocus(e, () => setBookingTarget("self"))
                      }
                    >
                      {t("common.admin.customers.cancelDialog.customerSelf")}
                    </button>

                    <button
                      type="button"
                      className={
                        "btn btn-sm cancel-dialog__scopeBtn" +
                        (bookingTarget === "child"
                          ? " cancel-dialog__scopeBtn--active"
                          : "")
                      }
                      onMouseDown={rememberButtonFocusState}
                      onClick={(e) =>
                        toggleButtonFocus(e, () => setBookingTarget("child"))
                      }
                    >
                      {t("common.admin.customers.cancelDialog.child")}
                    </button>
                  </div>

                  {bookingTarget === "child" && (
                    <div className="cancel-dialog__field">
                      <label className="dialog-label">
                        {t("common.admin.customers.cancelDialog.child")}
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
                                  "common.admin.customers.cancelDialog.selectChild",
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

                  <div className="cancel-dialog__summary">
                    <div className="cancel-dialog__summaryItem">
                      <span className="dialog-label">
                        {t("common.admin.customers.cancelDialog.parent")}
                      </span>
                      <span className="dialog-value">
                        {selectedParent
                          ? `${selectedParent.parent.firstName} ${selectedParent.parent.lastName}`.trim()
                          : t("common.admin.customers.cancelDialog.empty")}
                      </span>
                    </div>

                    <div className="cancel-dialog__summaryItem">
                      <span className="dialog-label">
                        {t("common.admin.customers.cancelDialog.child")}
                      </span>
                      <span className="dialog-value">
                        {bookingTarget === "child" && activeChild
                          ? `${activeChild.firstName} ${activeChild.lastName}`.trim()
                          : t("common.admin.customers.cancelDialog.empty")}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                !familyLoading && (
                  <div className="dialog-value">
                    {t("common.admin.customers.cancelDialog.currentCustomer")}
                  </div>
                )
              )}
            </div>
          </section>

          {(err || loadingOffers) && (
            <section className="dialog-section cancel-dialog__statusSection">
              <div className="dialog-section__body">
                {err && <div className="cancel-dialog__error">{err}</div>}
                {loadingOffers && (
                  <div className="cancel-dialog__note">
                    {t("common.admin.customers.cancelDialog.loadingCourses")}
                  </div>
                )}
              </div>
            </section>
          )}

          <section className="dialog-section cancel-dialog__filtersSection">
            <div className="dialog-section__head">
              <h4 className="dialog-section__title">
                {t("common.admin.customers.cancelDialog.filters")}
              </h4>
            </div>

            <div className="dialog-section__body">
              <div className="ks-storno__filters mb-2">
                <div className="ks-storno__filter">
                  <label className="dialog-label">
                    {t("common.admin.customers.cancelDialog.courses")}
                  </label>

                  <div
                    className={
                      "ks-selectbox" +
                      (isCourseDropdownOpen ? " ks-selectbox--open" : "")
                    }
                    ref={courseDropdownRef}
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
                      <div
                        className="ks-selectbox__panel ks-storno__menu"
                        role="listbox"
                      >
                        <button
                          type="button"
                          className={
                            "ks-selectbox__option" +
                            (courseValue === ""
                              ? " ks-selectbox__option--active"
                              : "")
                          }
                          onClick={() => {
                            setCourseValue("");
                            setIsCourseDropdownOpen(false);
                          }}
                        >
                          {t("common.admin.customers.cancelDialog.allCourses")}
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
                                className={
                                  "ks-selectbox__option" +
                                  (courseValue === opt.value
                                    ? " ks-selectbox__option--active"
                                    : "")
                                }
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
                    label={t("common.admin.customers.cancelDialog.status")}
                    valueLabel={statusLabel}
                    open={isStatusOpen}
                    setOpen={setIsStatusOpen}
                    rootRef={statusDropdownRef}
                    // items={STATUS_OPTIONS}
                    items={statusItems}
                    activeValue={statusFilter}
                    onSelect={(v) => setStatusFilter(v as StatusFilter)}
                  />
                </div>

                <div className="ks-storno__filter">
                  <InlineSelect
                    label={t("common.admin.customers.cancelDialog.sort")}
                    valueLabel={sortLabel}
                    open={isSortOpen}
                    setOpen={setIsSortOpen}
                    rootRef={sortDropdownRef}
                    // items={SORT_OPTIONS}
                    items={sortItems}
                    activeValue={sortOrder}
                    onSelect={(v) => setSortOrder(v as SortOrder)}
                  />
                </div>
              </div>

              <div className="ks-storno__section mb-2">
                <BookingSelect
                  label={t("common.admin.customers.cancelDialog.booking")}
                  open={isBookingDropdownOpen}
                  setOpen={setIsBookingDropdownOpen}
                  rootRef={bookingDropdownRef}
                  disabled={!filteredBookings.length}
                  title={
                    courseValueIsNonCancelable
                      ? t("common.admin.customers.cancelDialog.notCancellable")
                      : undefined
                  }
                  trigger={bookingTrigger}
                  items={filteredBookings}
                  selectedId={selectedId}
                  onSelect={(id: string) => setSelectedId(id)}
                  statusFilter={statusFilter}
                />
              </div>
            </div>
          </section>

          <section className="dialog-section cancel-dialog__detailsSection">
            <div className="dialog-section__head">
              <h4 className="dialog-section__title">
                {t("common.admin.customers.cancelDialog.detailsTitle")}
              </h4>
            </div>

            <div className="dialog-section__body ks-storno__section">
              <div>
                <label className="dialog-label">
                  {t("common.admin.customers.cancelDialog.receiptDateRequired")}
                </label>
                <KsDatePicker
                  value={cancelDate}
                  onChange={(nextIso) => {
                    const minIso = todayISO();
                    if (nextIso && nextIso < minIso) return;
                    setCancelDate(nextIso);
                  }}
                  placeholder={t("common.placeholders.date")}
                  disabled={
                    !selected ||
                    selectedIsCancelled ||
                    disabledByNonCancelableCourse
                  }
                />
              </div>

              <div>
                <label className="dialog-label">
                  {t("common.admin.customers.cancelDialog.endDateRequired")}
                </label>
                <KsDatePicker
                  value={endDate}
                  onChange={(nextIso) => {
                    const minIso = cancelDate || todayISO();
                    if (nextIso && nextIso < minIso) return;
                    setEndDate(nextIso);
                  }}
                  placeholder={t("common.placeholders.date")}
                  disabled={
                    !selected ||
                    selectedIsCancelled ||
                    disabledByNonCancelableCourse
                  }
                />
                {endBeforeStart && (
                  <div className="cancel-dialog__error mt-1">
                    {t(
                      "common.admin.customers.cancelDialog.endDateAfterReceipt",
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="dialog-label">
                  {t("common.admin.customers.cancelDialog.reasonOptional")}
                </label>
                <textarea
                  className="input"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={t(
                    "common.admin.customers.cancelDialog.reasonPlaceholder",
                  )}
                  disabled={
                    !selected ||
                    selectedIsCancelled ||
                    disabledByNonCancelableCourse
                  }
                />
              </div>

              {selected && selectedIsCancelled && (
                <div className="cancel-dialog__note">
                  {t("common.admin.customers.cancelDialog.alreadyCancelled")}
                </div>
              )}

              {disabledByNonCancelableCourse && (
                <div className="cancel-dialog__note">
                  {t(
                    "common.admin.customers.cancelDialog.cancellationsNotAllowed",
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="dialog-footer cancel-dialog__footer">
          <div className="cancel-dialog__footerActions">
            <button
              className="btn cancel-dialog__confirmBtn"
              disabled={disabled}
              onClick={submit}
            >
              {saving
                ? t("common.admin.customers.cancelDialog.cancelling")
                : t("common.admin.customers.cancelDialog.confirmCancellation")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

async function loadOffers(
  setOffers: (v: any[]) => void,
  setLoading: (v: boolean) => void,
  setErr: (v: string | null) => void,
  t: (key: string) => string,
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
        "common.admin.customers.cancelDialog.errors.loadOffers",
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
  if (filtered.some((b: any) => String(b._id) === String(selectedId))) return;
  const firstActive = filtered.find(
    (b: any) => String(b.status || "") !== "cancelled",
  );
  const next = (firstActive || filtered[0])?._id || "";
  setSelectedId(String(next));
}
