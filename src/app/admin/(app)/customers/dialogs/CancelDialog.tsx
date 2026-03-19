// src/app/admin/(app)/customers/dialogs/CancelDialog.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
  // childFirst?: string;
  // childLast?: string;
  onClose: () => void;
  onChanged: (freshCustomer: Customer) => void;
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

export default function CancelDialog({
  customer,
  // childFirst,
  // childLast,
  onClose,
  onChanged,
}: Props) {
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

  // const filteredBookings = useMemo(() => {
  //   const base = (customer.bookings || []).filter((b: any) => {
  //     if (!childMatches(b, childFirst, childLast)) return false;
  //     return isBookingCancellable(b, offersById);
  //   });

  //   if (courseValueIsNonCancelable) return [];
  //   // const byCourse = courseValue
  //   //   ? base.filter(
  //   //       (b: any) => courseValueFromBooking(b, offersById) === courseValue,
  //   //     )
  //   //   : base;

  //   // return applyStatusAndSort(byCourse, statusFilter, sortOrder);

  //   const byCourse = courseValue
  //     ? base.filter(
  //         (b: any) => courseValueFromBooking(b, offersById) === courseValue,
  //       )
  //     : base;

  //   const deduped = dedupeBookings(byCourse);
  //   return applyStatusAndSort(deduped, statusFilter, sortOrder);
  // }, [
  //   customer.bookings,
  //   offersById,
  //   courseValue,
  //   courseValueIsNonCancelable,
  //   statusFilter,
  //   sortOrder,
  //   childFirst,
  //   childLast,
  // ]);

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

  // const filteredBookings = useMemo(() => {
  //   const base = (customer.bookings || []).filter((b: any) => {
  //     if (!isBookingCancellable(b, offersById)) return false;

  //     if (bookingTarget === "child") {
  //       if (safeText(b?.childUid) !== safeText(activeChild?.uid)) return false;

  //       //   const bookingParentEmail = safeText(
  //       //     (b as any)?.parentEmail,
  //       //   ).toLowerCase();
  //       //   if (activeParentEmail && bookingParentEmail) {
  //       //     return bookingParentEmail === activeParentEmail;
  //       //   }

  //       //   return true;
  //       // }

  //       const bookingParentEmail = safeText(
  //         (b as any)?.parentEmail,
  //       ).toLowerCase();
  //       if (activeParentEmail) {
  //         return bookingParentEmail === activeParentEmail;
  //       }

  //       return true;
  //     }

  //     return !safeText((b as any)?.childUid);
  //   });

  //   if (courseValueIsNonCancelable) return [];

  //   const byCourse = courseValue
  //     ? base.filter(
  //         (b: any) => courseValueFromBooking(b, offersById) === courseValue,
  //       )
  //     : base;

  //   const deduped = dedupeBookings(byCourse);
  //   return applyStatusAndSort(deduped, statusFilter, sortOrder);
  // }, [
  //   customer.bookings,
  //   offersById,
  //   courseValue,
  //   courseValueIsNonCancelable,
  //   statusFilter,
  //   sortOrder,
  //   bookingTarget,
  //   activeChild,
  //   activeParentEmail,
  // ]);

  const [selectedId, setSelectedId] = useState("");
  const selected = useMemo(() => {
    return (
      filteredBookings.find((b: any) => String(b._id) === selectedId) || null
    );
  }, [filteredBookings, selectedId]);

  useEffect(() => {
    void loadOffers(setOffers, setLoadingOffers, setErr);
  }, []);

  // useEffect(() => {
  //   setCourseValue("");
  //   setStatusFilter("active");
  //   setSortOrder("newest");
  //   setSelectedId("");
  //   setErr(null);
  // }, [customer?._id, childFirst, childLast]);

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
    if (!courseValue) return "All courses";
    for (const group of GROUPED_COURSE_OPTIONS) {
      const found = group.items.find((opt) => opt.value === courseValue);
      if (found) return found.label;
    }
    return "All courses";
  }, [courseValue]);

  const statusLabel = useMemo(() => {
    return (
      STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label || "Active"
    );
  }, [statusFilter]);

  const sortLabel = useMemo(() => {
    return SORT_OPTIONS.find((o) => o.value === sortOrder)?.label || "Newest";
  }, [sortOrder]);

  const bookingTrigger = useMemo(() => {
    if (courseValueIsNonCancelable)
      return bookingDisplay(null, true, statusFilter);
    if (selected) return bookingDisplay(selected, false, statusFilter);
    if (filteredBookings.length)
      return bookingDisplay("select", false, statusFilter);
    return bookingDisplay(null, false, statusFilter);
  }, [courseValueIsNonCancelable, selected, filteredBookings, statusFilter]);

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
    } catch (e: any) {
      setErr(e?.message || "Cancel failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="ks-modal-root ks-modal-root--top ks ks-cancel">
      <div className="ks-backdrop" onClick={onClose} />
      <div
        className="ks-panel card ks-panel--md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-subhead">
          <h3 className="text-lg font-bold">Confirm cancellation</h3>
        </div>

        <div className="mb-3 p-3 rounded border bg-gray-50 text-sm">
          <div className="font-semibold mb-1">Cancellation for</div>

          {familyLoading && (
            <div className="text-gray-600">Loading family…</div>
          )}

          {familyError && (
            <div className="text-red-600">
              Family could not be loaded – cancellation list may be incomplete.
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
                Cancellations are shown for the current customer.
              </div>
            )
          )}
        </div>

        {err && <div className="mb-2 text-red-600">{err}</div>}
        {loadingOffers && (
          <div className="mb-2 text-gray-600">Loading courses…</div>
        )}

        <div className="ks-storno__filters mb-2">
          <div className="ks-storno__filter">
            <label className="lbl">Courses</label>

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
                <span className="ks-selectbox__chevron" aria-hidden="true" />
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
                    All courses
                  </button>

                  {GROUPED_COURSE_OPTIONS.map((g) => (
                    <div key={g.label} className="ks-selectbox__group">
                      <div className="ks-selectbox__group-label">{g.label}</div>
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

            {/* {!filteredBookings.length && (
              <div className="text-sm text-gray-600 mt-1">
                {courseValueIsNonCancelable
                  ? "This course type is not cancellable (e.g., Rent a Coach / Coach Education)."
                  : "No cancellable bookings for this filter. Powertraining and certain one-off programs are not cancellable."}
              </div>
            )} */}
          </div>

          <div className="ks-storno__filter">
            <InlineSelect
              label="Status"
              valueLabel={statusLabel}
              open={isStatusOpen}
              setOpen={setIsStatusOpen}
              rootRef={statusDropdownRef}
              items={STATUS_OPTIONS}
              activeValue={statusFilter}
              onSelect={(v) => setStatusFilter(v as StatusFilter)}
            />
          </div>

          <div className="ks-storno__filter">
            <InlineSelect
              label="Sort"
              valueLabel={sortLabel}
              open={isSortOpen}
              setOpen={setIsSortOpen}
              rootRef={sortDropdownRef}
              items={SORT_OPTIONS}
              activeValue={sortOrder}
              onSelect={(v) => setSortOrder(v as SortOrder)}
            />
          </div>
        </div>

        <div className="ks-storno__section mb-2">
          <BookingSelect
            label="Booking"
            open={isBookingDropdownOpen}
            setOpen={setIsBookingDropdownOpen}
            rootRef={bookingDropdownRef}
            disabled={!filteredBookings.length}
            title={
              courseValueIsNonCancelable
                ? "This course is not cancellable"
                : undefined
            }
            trigger={bookingTrigger}
            items={filteredBookings}
            selectedId={selectedId}
            onSelect={(id: string) => setSelectedId(id)}
            statusFilter={statusFilter}
          />
        </div>

        <div className="ks-storno__section">
          <div>
            <label className="lbl">Receipt date (vom) — required</label>
            <KsDatePicker
              value={cancelDate}
              onChange={(nextIso) => {
                const minIso = todayISO();
                if (nextIso && nextIso < minIso) return;
                setCancelDate(nextIso);
              }}
              placeholder="tt.mm.jjjj"
              disabled={
                !selected ||
                selectedIsCancelled ||
                disabledByNonCancelableCourse
              }
            />
          </div>

          <div>
            <label className="lbl">End date (zum) — required</label>
            <KsDatePicker
              value={endDate}
              onChange={(nextIso) => {
                const minIso = cancelDate || todayISO();
                if (nextIso && nextIso < minIso) return;
                setEndDate(nextIso);
              }}
              placeholder="tt.mm.jjjj"
              disabled={
                !selected ||
                selectedIsCancelled ||
                disabledByNonCancelableCourse
              }
            />
            {endBeforeStart && (
              <div className="text-sm text-red-600 mt-1">
                End date must be on or after the receipt date.
              </div>
            )}
          </div>

          <div>
            <label className="lbl">Reason (optional)</label>
            <textarea
              className="input"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., moved away, club change"
              disabled={
                !selected ||
                selectedIsCancelled ||
                disabledByNonCancelableCourse
              }
            />
          </div>

          {selected && selectedIsCancelled && (
            <div className="text-gray-600">
              This booking is already cancelled.
            </div>
          )}

          {disabledByNonCancelableCourse && (
            <div className="text-gray-600">
              Cancellations are not allowed for this course type.
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-3">
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

          <button className="btn" disabled={disabled} onClick={submit}>
            {saving ? "Cancelling…" : "Confirm cancellation"}
          </button>
        </div>
      </div>
    </div>
  );
}

async function loadOffers(
  setOffers: (v: any[]) => void,
  setLoading: (v: boolean) => void,
  setErr: (v: string | null) => void,
) {
  try {
    setLoading(true);
    setErr(null);
    setOffers(await fetchOffers(500));
  } catch (e: any) {
    setErr(e?.message || "Failed to load offers");
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

// // // // // app/admin/customers/dialogs/CancelDialog.tsx
// "use client";

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import type { Customer } from "../types";
// import {
//   GROUPED_COURSE_OPTIONS,
//   courseValueFromBooking,
// } from "src/app/lib/courseOptions";
// import KsDatePicker from "@/app/admin/(app)/invoices/components/KsDatePicker";
// import { fetchOffers, fetchCustomer, postCancel } from "./cancelDialog/api";
// import { todayISO } from "./cancelDialog/formatters";
// import {
//   buildCourseMeta,
//   isNonCancelableCourseValue,
// } from "./cancelDialog/courseMeta";
// import { isBookingCancellable } from "./cancelDialog/bookingRules";
// import { useCancelDropdowns } from "./cancelDialog/hooks/useCancelDropdowns";
// import {
//   SORT_OPTIONS,
//   STATUS_OPTIONS,
//   type SortOrder,
//   type StatusFilter,
// } from "./cancelDialog/constants";
// import { bookingDisplay } from "./cancelDialog/bookingDisplay";
// import { applyStatusAndSort } from "./cancelDialog/filtering";
// import { useOutsideClose } from "./cancelDialog/hooks/useOutsideClose";
// import { InlineSelect } from "./cancelDialog/components/InlineSelect";
// import { BookingSelect } from "./cancelDialog/components/BookingSelect";

// type Props = {
//   customer: Customer;
//   onClose: () => void;
//   onChanged: (freshCustomer: Customer) => void;
// };

// export default function CancelDialog({ customer, onClose, onChanged }: Props) {
//   const [offers, setOffers] = useState<any[]>([]);
//   const [loadingOffers, setLoadingOffers] = useState(false);
//   const [err, setErr] = useState<string | null>(null);

//   const [courseValue, setCourseValue] = useState("");
//   const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
//   const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

//   const courseMetaByValue = useMemo(
//     () => buildCourseMeta(GROUPED_COURSE_OPTIONS),
//     [],
//   );

//   const courseValueIsNonCancelable = useMemo(() => {
//     return isNonCancelableCourseValue(courseValue, courseMetaByValue);
//   }, [courseValue, courseMetaByValue]);

//   const offersById = useMemo(() => {
//     const m = new Map<string, any>();
//     for (const o of offers) if (o?._id) m.set(String(o._id), o);
//     return m;
//   }, [offers]);

//   const filteredBookings = useMemo(() => {
//     const base = (customer.bookings || []).filter((b: any) => {
//       return isBookingCancellable(b, offersById);
//     });

//     if (courseValueIsNonCancelable) return [];
//     const byCourse = courseValue
//       ? base.filter(
//           (b: any) => courseValueFromBooking(b, offersById) === courseValue,
//         )
//       : base;

//     return applyStatusAndSort(byCourse, statusFilter, sortOrder);
//   }, [
//     customer.bookings,
//     offersById,
//     courseValue,
//     courseValueIsNonCancelable,
//     statusFilter,
//     sortOrder,
//   ]);

//   const [selectedId, setSelectedId] = useState("");
//   const selected = useMemo(() => {
//     return (
//       filteredBookings.find((b: any) => String(b._id) === selectedId) || null
//     );
//   }, [filteredBookings, selectedId]);

//   useEffect(() => {
//     void loadOffers(setOffers, setLoadingOffers, setErr);
//   }, []);

//   useEffect(() => {
//     setCourseValue("");
//     setStatusFilter("active");
//     setSortOrder("newest");
//     setSelectedId("");
//     setErr(null);
//   }, [customer?._id]);

//   useEffect(() => {
//     syncSelected(filteredBookings, selectedId, setSelectedId);
//   }, [filteredBookings, selectedId]);

//   const selectedIsCancelled = String(selected?.status || "") === "cancelled";

//   const [cancelDate, setCancelDate] = useState(todayISO());
//   const [endDate, setEndDate] = useState("");
//   const [reason, setReason] = useState("");
//   const [saving, setSaving] = useState(false);

//   const endBeforeStart = Boolean(endDate && cancelDate && endDate < cancelDate);
//   const disabledByNonCancelableCourse = courseValueIsNonCancelable;

//   const disabled =
//     saving ||
//     !selected ||
//     !cancelDate ||
//     !endDate ||
//     selectedIsCancelled ||
//     endBeforeStart ||
//     disabledByNonCancelableCourse;

//   const selectedCourseLabel = useMemo(() => {
//     if (!courseValue) return "All courses";
//     for (const group of GROUPED_COURSE_OPTIONS) {
//       const found = group.items.find((opt) => opt.value === courseValue);
//       if (found) return found.label;
//     }
//     return "All courses";
//   }, [courseValue]);

//   const statusLabel = useMemo(() => {
//     return (
//       STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label || "Active"
//     );
//   }, [statusFilter]);

//   const sortLabel = useMemo(() => {
//     return SORT_OPTIONS.find((o) => o.value === sortOrder)?.label || "Newest";
//   }, [sortOrder]);

//   const bookingTrigger = useMemo(() => {
//     if (courseValueIsNonCancelable)
//       return bookingDisplay(null, true, statusFilter);
//     if (selected) return bookingDisplay(selected, false, statusFilter);
//     if (filteredBookings.length)
//       return bookingDisplay("select", false, statusFilter);
//     return bookingDisplay(null, false, statusFilter);
//   }, [courseValueIsNonCancelable, selected, filteredBookings, statusFilter]);

//   const courseDropdownRef = useRef<HTMLDivElement | null>(null);
//   const bookingDropdownRef = useRef<HTMLDivElement | null>(null);
//   const statusDropdownRef = useRef<HTMLDivElement | null>(null);
//   const sortDropdownRef = useRef<HTMLDivElement | null>(null);

//   const {
//     isCourseDropdownOpen,
//     setIsCourseDropdownOpen,
//     isBookingDropdownOpen,
//     setIsBookingDropdownOpen,
//   } = useCancelDropdowns(courseDropdownRef, bookingDropdownRef);

//   const [isStatusOpen, setIsStatusOpen] = useState(false);
//   const [isSortOpen, setIsSortOpen] = useState(false);

//   useOutsideClose(statusDropdownRef, isStatusOpen, setIsStatusOpen);
//   useOutsideClose(sortDropdownRef, isSortOpen, setIsSortOpen);

//   async function submit() {
//     if (!customer._id || !selected?._id || !cancelDate || !endDate) return;
//     if (disabledByNonCancelableCourse) return;

//     setSaving(true);
//     setErr(null);

//     try {
//       await postCancel(customer._id, selected._id, cancelDate, endDate, reason);
//       const fresh = await fetchCustomer(customer._id);
//       if (fresh) onChanged(fresh);
//       onClose();
//     } catch (e: any) {
//       setErr(e?.message || "Cancel failed");
//     } finally {
//       setSaving(false);
//     }
//   }

//   return (
//     <div className="ks-modal-root ks-modal-root--top ks ks-cancel">
//       <div className="ks-backdrop" onClick={onClose} />
//       <div
//         className="ks-panel card ks-panel--md"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="dialog-subhead">
//           <h3 className="text-lg font-bold">Confirm cancellation</h3>
//         </div>

//         {err && <div className="mb-2 text-red-600">{err}</div>}
//         {loadingOffers && (
//           <div className="mb-2 text-gray-600">Loading courses…</div>
//         )}

//         {/* <div className="grid gap-2 mb-2">
//           <div>
//             <label className="lbl">Courses</label>

//             <div
//               className={
//                 "ks-selectbox" +
//                 (isCourseDropdownOpen ? " ks-selectbox--open" : "")
//               }
//               ref={courseDropdownRef}
//             >
//               <button
//                 type="button"
//                 className="ks-selectbox__trigger"
//                 onClick={() => setIsCourseDropdownOpen((o) => !o)}
//                 aria-haspopup="listbox"
//                 aria-expanded={isCourseDropdownOpen}
//               >
//                 <span className="ks-selectbox__label">
//                   {selectedCourseLabel}
//                 </span>
//                 <span className="ks-selectbox__chevron" aria-hidden="true" />
//               </button>

//               {isCourseDropdownOpen && (
//                 <div className="ks-selectbox__panel" role="listbox">
//                   <button
//                     type="button"
//                     className={
//                       "ks-selectbox__option" +
//                       (courseValue === ""
//                         ? " ks-selectbox__option--active"
//                         : "")
//                     }
//                     onClick={() => {
//                       setCourseValue("");
//                       setIsCourseDropdownOpen(false);
//                     }}
//                   >
//                     All courses
//                   </button>

//                   {GROUPED_COURSE_OPTIONS.map((g) => (
//                     <div key={g.label} className="ks-selectbox__group">
//                       <div className="ks-selectbox__group-label">{g.label}</div>
//                       {g.items.map((opt) => (
//                         <button
//                           key={opt.value}
//                           type="button"
//                           className={
//                             "ks-selectbox__option" +
//                             (courseValue === opt.value
//                               ? " ks-selectbox__option--active"
//                               : "")
//                           }
//                           onClick={() => {
//                             setCourseValue(opt.value);
//                             setIsCourseDropdownOpen(false);
//                           }}
//                         >
//                           {opt.label}
//                         </button>
//                       ))}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {!filteredBookings.length && (
//               <div className="text-sm text-gray-600 mt-1">
//                 {courseValueIsNonCancelable
//                   ? "This course type is not cancellable (e.g., Rent a Coach / Coach Education)."
//                   : "No cancellable bookings for this filter. Powertraining and certain one-off programs are not cancellable."}
//               </div>
//             )}
//           </div>

//           <div className="grid grid-cols-2 gap-2">
//             <InlineSelect
//               label="Status"
//               valueLabel={statusLabel}
//               open={isStatusOpen}
//               setOpen={setIsStatusOpen}
//               rootRef={statusDropdownRef}
//               items={STATUS_OPTIONS}
//               activeValue={statusFilter}
//               onSelect={(v) => setStatusFilter(v as StatusFilter)}
//             />

//             <InlineSelect
//               label="Sort"
//               valueLabel={sortLabel}
//               open={isSortOpen}
//               setOpen={setIsSortOpen}
//               rootRef={sortDropdownRef}
//               items={SORT_OPTIONS}
//               activeValue={sortOrder}
//               onSelect={(v) => setSortOrder(v as SortOrder)}
//             />
//           </div>
//         </div> */}

//         <div className="ks-storno__filters mb-2">
//           <div className="ks-storno__filter">
//             <label className="lbl">Courses</label>

//             <div
//               className={
//                 "ks-selectbox" +
//                 (isCourseDropdownOpen ? " ks-selectbox--open" : "")
//               }
//               ref={courseDropdownRef}
//             >
//               <button
//                 type="button"
//                 className="ks-selectbox__trigger"
//                 onClick={() => setIsCourseDropdownOpen((o) => !o)}
//                 aria-haspopup="listbox"
//                 aria-expanded={isCourseDropdownOpen}
//               >
//                 <span className="ks-selectbox__label">
//                   {selectedCourseLabel}
//                 </span>
//                 <span className="ks-selectbox__chevron" aria-hidden="true" />
//               </button>

//               {isCourseDropdownOpen && (
//                 <div
//                   className="ks-selectbox__panel ks-storno__menu"
//                   role="listbox"
//                 >
//                   <button
//                     type="button"
//                     className={
//                       "ks-selectbox__option" +
//                       (courseValue === ""
//                         ? " ks-selectbox__option--active"
//                         : "")
//                     }
//                     onClick={() => {
//                       setCourseValue("");
//                       setIsCourseDropdownOpen(false);
//                     }}
//                   >
//                     All courses
//                   </button>

//                   {GROUPED_COURSE_OPTIONS.map((g) => (
//                     <div key={g.label} className="ks-selectbox__group">
//                       <div className="ks-selectbox__group-label">{g.label}</div>
//                       {g.items.map((opt) => (
//                         <button
//                           key={opt.value}
//                           type="button"
//                           className={
//                             "ks-selectbox__option" +
//                             (courseValue === opt.value
//                               ? " ks-selectbox__option--active"
//                               : "")
//                           }
//                           onClick={() => {
//                             setCourseValue(opt.value);
//                             setIsCourseDropdownOpen(false);
//                           }}
//                         >
//                           {opt.label}
//                         </button>
//                       ))}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {!filteredBookings.length && (
//               <div className="text-sm text-gray-600 mt-1">
//                 {courseValueIsNonCancelable
//                   ? "This course type is not cancellable (e.g., Rent a Coach / Coach Education)."
//                   : "No cancellable bookings for this filter. Powertraining and certain one-off programs are not cancellable."}
//               </div>
//             )}
//           </div>

//           <div className="ks-storno__filter">
//             <InlineSelect
//               label="Status"
//               valueLabel={statusLabel}
//               open={isStatusOpen}
//               setOpen={setIsStatusOpen}
//               rootRef={statusDropdownRef}
//               items={STATUS_OPTIONS}
//               activeValue={statusFilter}
//               onSelect={(v) => setStatusFilter(v as StatusFilter)}
//             />
//           </div>

//           <div className="ks-storno__filter">
//             <InlineSelect
//               label="Sort"
//               valueLabel={sortLabel}
//               open={isSortOpen}
//               setOpen={setIsSortOpen}
//               rootRef={sortDropdownRef}
//               items={SORT_OPTIONS}
//               activeValue={sortOrder}
//               onSelect={(v) => setSortOrder(v as SortOrder)}
//             />
//           </div>
//         </div>

//         <div className="ks-storno__section mb-2">
//           <BookingSelect
//             label="Booking"
//             open={isBookingDropdownOpen}
//             setOpen={setIsBookingDropdownOpen}
//             rootRef={bookingDropdownRef}
//             disabled={!filteredBookings.length}
//             title={
//               courseValueIsNonCancelable
//                 ? "This course is not cancellable"
//                 : undefined
//             }
//             trigger={bookingTrigger}
//             items={filteredBookings}
//             selectedId={selectedId}
//             //onSelect={(id) => setSelectedId(id)}
//             onSelect={(id: string) => setSelectedId(id)}
//             statusFilter={statusFilter}
//           />
//         </div>

//         <div className="ks-storno__section">
//           <div>
//             <label className="lbl">Receipt date (vom) — required</label>
//             <KsDatePicker
//               value={cancelDate}
//               onChange={(nextIso) => {
//                 const minIso = todayISO();
//                 if (nextIso && nextIso < minIso) return;
//                 setCancelDate(nextIso);
//               }}
//               placeholder="tt.mm.jjjj"
//               disabled={
//                 !selected ||
//                 selectedIsCancelled ||
//                 disabledByNonCancelableCourse
//               }
//             />
//           </div>

//           <div>
//             <label className="lbl">End date (zum) — required</label>
//             <KsDatePicker
//               value={endDate}
//               onChange={(nextIso) => {
//                 const minIso = cancelDate || todayISO();
//                 if (nextIso && nextIso < minIso) return;
//                 setEndDate(nextIso);
//               }}
//               placeholder="tt.mm.jjjj"
//               disabled={
//                 !selected ||
//                 selectedIsCancelled ||
//                 disabledByNonCancelableCourse
//               }
//             />
//             {endBeforeStart && (
//               <div className="text-sm text-red-600 mt-1">
//                 End date must be on or after the receipt date.
//               </div>
//             )}
//           </div>

//           <div>
//             <label className="lbl">Reason (optional)</label>
//             <textarea
//               className="input"
//               rows={3}
//               value={reason}
//               onChange={(e) => setReason(e.target.value)}
//               placeholder="e.g., moved away, club change"
//               disabled={
//                 !selected ||
//                 selectedIsCancelled ||
//                 disabledByNonCancelableCourse
//               }
//             />
//           </div>

//           {selected && selectedIsCancelled && (
//             <div className="text-gray-600">
//               This booking is already cancelled.
//             </div>
//           )}

//           {disabledByNonCancelableCourse && (
//             <div className="text-gray-600">
//               Cancellations are not allowed for this course type.
//             </div>
//           )}
//         </div>

//         <div className="flex justify-end gap-2 mt-3">
//           <button
//             type="button"
//             className="modal__close"
//             aria-label="Close"
//             onClick={onClose}
//           >
//             <img
//               src="/icons/close.svg"
//               alt=""
//               aria-hidden="true"
//               className="icon-img"
//             />
//           </button>

//           <button className="btn" disabled={disabled} onClick={submit}>
//             {saving ? "Cancelling…" : "Confirm cancellation"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// async function loadOffers(
//   setOffers: (v: any[]) => void,
//   setLoading: (v: boolean) => void,
//   setErr: (v: string | null) => void,
// ) {
//   try {
//     setLoading(true);
//     setErr(null);
//     setOffers(await fetchOffers(500));
//   } catch (e: any) {
//     setErr(e?.message || "Failed to load offers");
//   } finally {
//     setLoading(false);
//   }
// }

// function syncSelected(
//   filtered: any[],
//   selectedId: string,
//   setSelectedId: (v: string) => void,
// ) {
//   if (!filtered.length) return void setSelectedId("");
//   if (filtered.some((b: any) => String(b._id) === String(selectedId))) return;
//   const firstActive = filtered.find(
//     (b: any) => String(b.status || "") !== "cancelled",
//   );
//   const next = (firstActive || filtered[0])?._id || "";
//   setSelectedId(String(next));
// }
