//src\app\admin\(app)\customers\dialogs\BookDialog.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Customer, Offer } from "../types";
import {
  GROUPED_COURSE_OPTIONS,
  offerMatchesCourse,
} from "src/app/lib/courseOptions";
import KsDatePicker from "@/app/admin/(app)/invoices/components/KsDatePicker";
import type { FamilyChild, FamilyMember } from "./bookDialog/types";
import {
  fmtDE,
  fmtEUR,
  isNum,
  isWeeklyOffer,
  prorateForStart,
} from "./bookDialog/bookDialogFormatters";
import {
  confirmBookingIfPossible,
  createBooking,
  fetchCustomerById,
} from "./bookDialog/bookDialogApi";
import { useBookDialogOffers } from "./bookDialog/hooks/useBookDialogOffers";
import { useBookDialogFamily } from "./bookDialog/hooks/useBookDialogFamily";
import { useDropdownOutsideClose } from "./bookDialog/hooks/useDropdownOutsideClose";
import BookDialogFamilyBox from "./components/BookDialogFamilyBox";
import BookDialogCourseSelect from "./components/BookDialogCourseSelect";
import BookDialogOfferSelect from "./components/BookDialogOfferSelect";

type Props = {
  customerId: string;
  initialChildUid?: string;
  onClose: () => void;
  onBooked: (freshCustomer: Customer) => void;
};

type BookingTarget = "self" | "child";
type OfferKind = "camp" | "powertraining" | "one_time" | "default";

type ChildOption = {
  uid: string;
  label: string;
  parentId: string;
  child: FamilyChild;
};

function safeText(v: unknown) {
  return String(v ?? "").trim();
}

function normalizeKey(v: string) {
  return safeText(v)
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

function applySelectedChildToFresh(fresh: any, uid: string) {
  const u = safeText(uid);
  if (!fresh) return fresh;
  if (!u) return clearFreshChild(fresh);

  const children = Array.isArray(fresh.children) ? fresh.children : [];
  const legacy = fresh.child || null;

  const hit =
    children.find((c: any) => safeText(c?.uid) === u) ||
    (safeText(legacy?.uid) === u ? legacy : null);

  if (!hit) return clearFreshChild(fresh);

  return {
    ...fresh,
    child: {
      uid: safeText(hit?.uid),
      firstName: safeText(hit?.firstName),
      lastName: safeText(hit?.lastName),
      gender: safeText(hit?.gender),
      birthDate: hit?.birthDate ?? null,
      club: safeText(hit?.club),
    },
    __activeChildUid: safeText(hit?.uid),
  };
}

function clearFreshChild(fresh: any) {
  if (!fresh) return fresh;

  return {
    ...fresh,
    child: {
      uid: "",
      firstName: "",
      lastName: "",
      gender: "",
      birthDate: null,
      club: "",
    },
    __activeChildUid: "",
  };
}

function isCampOffer(offer: Offer | null) {
  const category = safeText((offer as any)?.category).toLowerCase();
  const type = safeText((offer as any)?.type).toLowerCase();
  const subType = safeText((offer as any)?.sub_type).toLowerCase();
  const legacyType = safeText((offer as any)?.legacy_type).toLowerCase();
  const title = safeText((offer as any)?.title).toLowerCase();

  if (category === "clubprograms") return false;
  if (category === "rentacoach") return false;
  if (category === "individual") return false;

  if (subType.includes("clubprogram")) return false;
  if (subType.includes("rentacoach")) return false;
  if (subType.includes("coacheducation")) return false;
  if (subType.includes("powertraining")) return false;

  return (
    category === "holiday" ||
    category === "holidayprograms" ||
    type === "camp" ||
    legacyType === "camp" ||
    title.includes("camp")
  );
}

function isPowertrainingOffer(offer: Offer | null) {
  const category = safeText((offer as any)?.category).toLowerCase();
  const type = safeText((offer as any)?.type).toLowerCase();
  const subType = safeText((offer as any)?.sub_type).toLowerCase();
  const legacyType = safeText((offer as any)?.legacy_type).toLowerCase();
  const title = safeText((offer as any)?.title).toLowerCase();

  if (category === "clubprograms") return false;
  if (category === "rentacoach") return false;

  return (
    type.includes("powertraining") ||
    subType.includes("powertraining") ||
    legacyType.includes("powertraining") ||
    title.includes("powertraining")
  );
}

function getBookDialogOfferKind(offer: Offer | null): OfferKind {
  const category = safeText((offer as any)?.category);
  const subType = safeText((offer as any)?.sub_type).toLowerCase();

  if (isCampOffer(offer)) return "camp";
  if (isPowertrainingOffer(offer)) return "powertraining";

  if (
    category === "RentACoach" ||
    category === "ClubPrograms" ||
    category === "Individual" ||
    subType.includes("clubprogram") ||
    subType.includes("rentacoach") ||
    subType.includes("coacheducation")
  ) {
    return "one_time";
  }

  return "default";
}

function getOfferField(offer: Offer | null, keys: string[]) {
  const src = (offer || {}) as Record<string, unknown>;
  const wanted = new Set(keys.map(normalizeKey));

  for (const key of keys) {
    const value = safeText(src[key]);
    if (value) return value;
  }

  for (const [key, raw] of Object.entries(src)) {
    if (!wanted.has(normalizeKey(key))) continue;
    const value = safeText(raw);
    if (value) return value;
  }

  return "";
}

function findOfferValueByPatterns(
  offer: Offer | null,
  include: string[],
  exclude: string[] = [],
) {
  const src = (offer || {}) as Record<string, unknown>;
  const inc = include.map(normalizeKey);
  const exc = exclude.map(normalizeKey);

  for (const [key, raw] of Object.entries(src)) {
    const nk = normalizeKey(key);
    const value = safeText(raw);
    if (!value) continue;

    const hasInclude = inc.every((part) => nk.includes(part));
    const hasExclude = exc.some((part) => nk.includes(part));

    if (hasInclude && !hasExclude) return value;
  }

  return "";
}

function resolveHolidayLabel(offer: Offer | null) {
  return (
    getOfferField(offer, [
      "holidayWeekName",
      "holidayLabel",
      "holidayWeek",
      "holiday_name",
      "holidayName",
      "holiday",
      "ferien",
      "ferienName",
      "ferienLabel",
      "holiday_title",
      "holidayTitle",
    ]) ||
    findOfferValueByPatterns(offer, ["holiday"], ["from", "to", "date"]) ||
    findOfferValueByPatterns(offer, ["ferien"], ["von", "bis", "datum"]) ||
    ""
  );
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

function holidayFromOf(offer: Offer | null) {
  return (
    getOfferField(offer, [
      "holidayDateFrom",
      "holidayFrom",
      "dateFrom",
      "startDate",
      "ferienVon",
      "ferienStart",
    ]) || findOfferValueByPatterns(offer, ["holiday", "from"])
  );
}

function holidayToOf(offer: Offer | null) {
  return (
    getOfferField(offer, [
      "holidayDateTo",
      "holidayTo",
      "dateTo",
      "endDate",
      "ferienBis",
      "ferienEnde",
    ]) || findOfferValueByPatterns(offer, ["holiday", "to"])
  );
}

function formatRangeDe(from?: string, to?: string) {
  const a = formatDateOnlyDe(from || "");
  const b = formatDateOnlyDe(to || "");

  if (!a && !b) return "";
  if (a && b) return `${a} – ${b}`;
  return a || b;
}

function normalizeGender(raw: unknown) {
  const g = safeText(raw).toLowerCase();
  if (g === "male" || g === "m" || g === "männlich") return "männlich";
  if (g === "female" || g === "f" || g === "weiblich") return "weiblich";
  return "";
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

function parentPayloadFromMember(member: FamilyMember | null) {
  if (!member) return null;

  return {
    salutation: safeText(member.parent?.salutation),
    firstName: safeText(member.parent?.firstName),
    lastName: safeText(member.parent?.lastName),
    email: safeText(member.parent?.email),
    phone: safeText((member.parent as any)?.phone),
    phone2: safeText((member.parent as any)?.phone2),
  };
}

const T_SHIRT_OPTIONS = [
  "Spielertrikot XXS (116)",
  "Spielertrikot XS (128)",
  "Spielertrikot S (140)",
  "Spielertrikot M (152)",
  "Spielertrikot L (164)",
  "Spielertrikot XL (176)",
];

export default function BookDialog({
  customerId,
  initialChildUid,
  onClose,
  onBooked,
}: Props) {
  const { offers, loadingOffers, err, setErr } = useBookDialogOffers();
  const { family, familyLoading, familyError, baseSelectedId } =
    useBookDialogFamily(customerId);

  const [courseValue, setCourseValue] = useState("");
  const [selectedOfferId, setSelectedOfferId] = useState("");
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [saving, setSaving] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState("");
  const [selectedChildUid, setSelectedChildUid] = useState(
    safeText(initialChildUid),
  );
  const [isParentDropdownOpen, setIsParentDropdownOpen] = useState(false);
  const [isChildDropdownOpen, setIsChildDropdownOpen] = useState(false);
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const [isOfferDropdownOpen, setIsOfferDropdownOpen] = useState(false);
  const [bookingTarget, setBookingTarget] = useState<BookingTarget>(() =>
    safeText(initialChildUid) ? "child" : "self",
  );

  const [voucher, setVoucher] = useState("");
  const [source, setSource] = useState("");
  const [mainTShirtSize, setMainTShirtSize] = useState("");
  const [mainGoalkeeperSchool, setMainGoalkeeperSchool] = useState(false);
  const [hasSibling, setHasSibling] = useState(false);
  const [siblingGender, setSiblingGender] = useState("");
  const [siblingBirthDate, setSiblingBirthDate] = useState("");
  const [siblingFirstName, setSiblingFirstName] = useState("");
  const [siblingLastName, setSiblingLastName] = useState("");
  const [siblingTShirtSize, setSiblingTShirtSize] = useState("");
  const [siblingGoalkeeperSchool, setSiblingGoalkeeperSchool] = useState(false);

  const parentDropdownRef = useRef<HTMLDivElement | null>(null);
  const childDropdownRef = useRef<HTMLDivElement | null>(null);
  const courseDropdownRef = useRef<HTMLDivElement | null>(null);
  const offerDropdownRef = useRef<HTMLDivElement | null>(null);

  useDropdownOutsideClose([
    { ref: parentDropdownRef, close: () => setIsParentDropdownOpen(false) },
    { ref: childDropdownRef, close: () => setIsChildDropdownOpen(false) },
    { ref: courseDropdownRef, close: () => setIsCourseDropdownOpen(false) },
    { ref: offerDropdownRef, close: () => setIsOfferDropdownOpen(false) },
  ]);

  const childOptions = useMemo(() => buildChildOptions(family), [family]);
  const parentOptions = useMemo(() => buildParentOptions(family), [family]);

  const selfMemberId = useMemo(() => {
    if (selectedParentId) return selectedParentId;
    if (baseSelectedId) return `${baseSelectedId}::parent::0`;
    const first = family?.[0];
    return first ? `${first._id}::parent::0` : "";
  }, [selectedParentId, baseSelectedId, family]);

  useEffect(() => {
    if (selectedParentId) return;
    if (!parentOptions.length) return;
    setSelectedParentId(parentOptions[0].id);
  }, [selectedParentId, parentOptions]);

  useEffect(() => {
    if (bookingTarget !== "child") return;
    if (selectedChildUid) return;
    if (safeText(initialChildUid)) {
      setSelectedChildUid(safeText(initialChildUid));
      return;
    }
    const firstUid = childOptions[0]?.uid || "";
    if (firstUid) setSelectedChildUid(firstUid);
  }, [bookingTarget, selectedChildUid, initialChildUid, childOptions]);

  const selectedChildOption = useMemo(() => {
    if (!childOptions.length) return null;
    return childOptions.find((item) => item.uid === selectedChildUid) || null;
  }, [childOptions, selectedChildUid]);

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

  const activeChild: FamilyChild | null = useMemo(() => {
    if (bookingTarget !== "child") return null;
    return selectedChildOption?.child || null;
  }, [bookingTarget, selectedChildOption]);

  const filteredOffers = useMemo(() => {
    return offers.filter((o) => offerMatchesCourse(courseValue, o));
  }, [offers, courseValue]);

  const ensuredOfferId = useMemo(() => {
    if (!filteredOffers.length) return "";
    const still = filteredOffers.some((o) => o._id === selectedOfferId);
    return still ? selectedOfferId : filteredOffers[0]._id;
  }, [filteredOffers, selectedOfferId]);

  useEffect(() => {
    if (ensuredOfferId !== selectedOfferId) {
      setSelectedOfferId(ensuredOfferId);
    }
  }, [ensuredOfferId, selectedOfferId]);

  const selectedOffer: Offer | null = useMemo(() => {
    return filteredOffers.find((o) => o._id === selectedOfferId) || null;
  }, [filteredOffers, selectedOfferId]);

  const isWeekly = useMemo(() => isWeeklyOffer(selectedOffer), [selectedOffer]);

  const offerKind = useMemo(() => {
    return getBookDialogOfferKind(selectedOffer);
  }, [selectedOffer]);

  const isCamp = offerKind === "camp";
  const isPowertraining = offerKind === "powertraining";
  const isOneTimeVoucherOffer = offerKind === "one_time";

  const showVoucherSection =
    isWeekly || isCamp || isPowertraining || isOneTimeVoucherOffer;

  const holidayLabel = useMemo(() => {
    return resolveHolidayLabel(selectedOffer);
  }, [selectedOffer]);

  const holidayRange = useMemo(() => {
    return formatRangeDe(
      holidayFromOf(selectedOffer),
      holidayToOf(selectedOffer),
    );
  }, [selectedOffer]);

  const childGender = useMemo(() => {
    return normalizeGender((activeChild as any)?.gender);
  }, [activeChild]);

  const pro = useMemo(() => {
    if (!isWeekly) return null;
    if (!isNum(selectedOffer?.price)) return null;
    return prorateForStart(selectedDate, selectedOffer.price);
  }, [isWeekly, selectedDate, selectedOffer?.price]);

  const selectedCourseLabel = useMemo(() => {
    if (!courseValue) return "All courses";
    for (const group of GROUPED_COURSE_OPTIONS) {
      const found = group.items.find((opt) => opt.value === courseValue);
      if (found) return found.label;
    }
    return "All courses";
  }, [courseValue]);

  const selectedOfferLabel = useMemo(() => {
    if (!filteredOffers.length) return "No offers in this selection.";

    const found =
      filteredOffers.find((o) => o._id === selectedOfferId) ||
      filteredOffers[0];

    const parts = [
      found.title || "—",
      isNum(found.price) ? fmtEUR(found.price) : undefined,
    ].filter(Boolean);

    return parts.join(" — ");
  }, [filteredOffers, selectedOfferId]);

  async function submit() {
    if (!selectedOfferId || !selectedDate) return;

    const uid = safeText(activeChild?.uid);
    const childPayload =
      bookingTarget === "child"
        ? {
            uid,
            firstName: safeText(activeChild?.firstName),
            lastName: safeText(activeChild?.lastName),
          }
        : {
            uid: "",
            firstName: "",
            lastName: "",
          };

    if (bookingTarget === "child" && !uid) {
      setErr("Bitte Kind auswählen (UID fehlt).");
      return;
    }

    setSaving(true);
    setErr(null);

    try {
      const selectedParentPayload = parentPayloadFromMember(selectedParent);

      const payload = await createBooking(
        customerId,
        selectedOfferId,
        selectedDate,
        bookingTarget,
        childPayload,
        selectedParentPayload,
        {
          holidayLabel: isCamp || isPowertraining ? holidayLabel : "",
          holidayFrom:
            isCamp || isPowertraining
              ? safeText(holidayFromOf(selectedOffer))
              : "",
          holidayTo:
            isCamp || isPowertraining
              ? safeText(holidayToOf(selectedOffer))
              : "",
          childGender,
          voucher,
          source,
          mainTShirtSize,
          mainGoalkeeperSchool,
          hasSibling,
          siblingGender,
          siblingBirthDate,
          siblingFirstName,
          siblingLastName,
          siblingTShirtSize,
          siblingGoalkeeperSchool,
        },
      );

      await confirmBookingIfPossible(payload?.booking?._id);

      const freshRaw = await fetchCustomerById(customerId);
      const fresh =
        bookingTarget === "child"
          ? applySelectedChildToFresh(freshRaw, uid)
          : clearFreshChild(freshRaw);

      if (fresh) onBooked(fresh);
      onClose();
    } catch (e: any) {
      setErr(e?.message || "Booking failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="dialog-backdrop book-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-dialog-title"
    >
      <button
        type="button"
        className="dialog-backdrop-hit"
        aria-label="Close"
        onClick={onClose}
      />

      <div
        className="dialog book-dialog__dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-head book-dialog__head">
          <div className="book-dialog__head-main">
            <h3 id="book-dialog-title" className="dialog-title">
              Book offer
            </h3>
            <p className="dialog-subtitle">
              Select scope, course, offer, and booking details.
            </p>
          </div>

          <div className="dialog-head__actions">
            <button
              type="button"
              className="dialog-close"
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
        </div>

        <div className="dialog-body book-dialog__body book-form">
          {(err || loadingOffers) && (
            <section className="dialog-section book-dialog__statusSection">
              <div className="dialog-section__body">
                {err && <div className="book-dialog__error">{err}</div>}
                {loadingOffers && (
                  <div className="book-dialog__note">Loading offers…</div>
                )}
              </div>
            </section>
          )}

          <section className="dialog-section book-dialog__familySection">
            <div className="dialog-section__head">
              <h4 className="dialog-section__title">Booking scope</h4>
            </div>

            <div className="dialog-section__body">
              <BookDialogFamilyBox
                family={family}
                familyLoading={familyLoading}
                familyError={familyError}
                selectedParent={selectedParent}
                selectedParentId={selfMemberId}
                selectedParentLabel={selectedParentLabel}
                parentOptions={parentOptions}
                activeChild={activeChild}
                bookingTarget={bookingTarget}
                setBookingTarget={setBookingTarget}
                parentOpen={isParentDropdownOpen}
                setParentOpen={setIsParentDropdownOpen}
                childOpen={isChildDropdownOpen}
                setChildOpen={setIsChildDropdownOpen}
                setSelectedParentId={setSelectedParentId}
                selectedChildUid={selectedChildUid}
                setSelectedChildUid={setSelectedChildUid}
                childOptions={childOptions}
                parentDropdownRef={parentDropdownRef}
                childDropdownRef={childDropdownRef}
              />
            </div>
          </section>

          <section className="dialog-section book-dialog__selectionSection">
            <div className="dialog-section__head">
              <h4 className="dialog-section__title">Offer selection</h4>
            </div>

            <div className="dialog-section__body book-dialog__selectionBody">
              <div className="book-dialog__field">
                <label className="dialog-label">Courses</label>
                <BookDialogCourseSelect
                  courseValue={courseValue}
                  setCourseValue={setCourseValue}
                  selectedCourseLabel={selectedCourseLabel}
                  isOpen={isCourseDropdownOpen}
                  setIsOpen={setIsCourseDropdownOpen}
                  dropdownRef={courseDropdownRef}
                />
              </div>

              <div className="book-dialog__field">
                <label className="dialog-label">Offer</label>
                <BookDialogOfferSelect
                  filteredOffers={filteredOffers}
                  selectedOfferId={selectedOfferId}
                  setSelectedOfferId={setSelectedOfferId}
                  selectedOfferLabel={selectedOfferLabel}
                  isOpen={isOfferDropdownOpen}
                  setIsOpen={setIsOfferDropdownOpen}
                  dropdownRef={offerDropdownRef}
                />
                {!filteredOffers.length && (
                  <div className="book-dialog__note mt-1">
                    No offers in this selection.
                  </div>
                )}
              </div>

              <div className="book-dialog__field">
                <label className="dialog-label">Start date</label>
                <KsDatePicker
                  value={selectedDate}
                  onChange={(nextIso) => setSelectedDate(nextIso)}
                  placeholder="dd.mm.yyyy"
                  disabled={false}
                />
              </div>
            </div>
          </section>

          {isCamp && (
            <section className="dialog-section book-dialog__detailsSection">
              <div className="dialog-section__head">
                <h4 className="dialog-section__title">Camp details</h4>
              </div>

              <div className="dialog-section__body">
                <section className="camp-options camp-options--premium">
                  <div className="camp-card">
                    <div className="camp-card__head">
                      <div>
                        <div className="camp-card__eyebrow">
                          Holiday program
                        </div>
                        <div className="camp-card__title">Camp details</div>
                      </div>
                    </div>

                    <div className="camp-summary-grid">
                      <div className="camp-summary-item">
                        <span className="camp-summary-item__label">
                          Holiday
                        </span>
                        <span className="camp-summary-item__value">
                          {holidayLabel || "-"}
                        </span>
                      </div>

                      <div className="camp-summary-item">
                        <span className="camp-summary-item__label">Period</span>
                        <span className="camp-summary-item__value">
                          {holidayRange || "-"}
                        </span>
                      </div>
                    </div>

                    <div className="camp-block">
                      <div className="camp-block__title">Main child</div>

                      <div className="camp-grid">
                        <div className="field">
                          <label className="dialog-label">T-shirt size</label>
                          <select
                            className="input"
                            value={mainTShirtSize}
                            onChange={(e) => setMainTShirtSize(e.target.value)}
                          >
                            <option value="">Please select</option>
                            {T_SHIRT_OPTIONS.map((item) => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="field">
                          <label className="dialog-label">
                            Goalkeeper school
                          </label>
                          <div className="camp-toggle-row camp-toggle-row--full">
                            <button
                              type="button"
                              className={`camp-toggle-btn ${
                                !mainGoalkeeperSchool ? "is-active" : ""
                              }`}
                              onClick={() => setMainGoalkeeperSchool(false)}
                            >
                              No
                            </button>

                            <button
                              type="button"
                              className={`camp-toggle-btn ${
                                mainGoalkeeperSchool ? "is-active" : ""
                              }`}
                              onClick={() => setMainGoalkeeperSchool(true)}
                            >
                              Yes (+40€)
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="camp-block camp-block--sibling">
                      <div className="sibling-head">
                        <div>
                          <div className="camp-block__title">Add sibling</div>
                          <div className="sibling-head__subline">
                            Optional add-on with 14 euro discount
                          </div>
                        </div>

                        <label className="sibling-switch">
                          <input
                            type="checkbox"
                            checked={hasSibling}
                            onChange={(e) => setHasSibling(e.target.checked)}
                          />
                          <span className="sibling-switch__text">
                            Yes (get 14 euro discount)
                          </span>
                        </label>
                      </div>

                      {hasSibling && (
                        <div className="sibling-fields is-open">
                          <div className="camp-grid">
                            <div className="field">
                              <label className="dialog-label">Gender</label>
                              <div className="camp-toggle-row camp-toggle-row--full">
                                <button
                                  type="button"
                                  className={`camp-toggle-btn ${
                                    siblingGender === "weiblich"
                                      ? "is-active"
                                      : ""
                                  }`}
                                  onClick={() => setSiblingGender("weiblich")}
                                >
                                  Female
                                </button>

                                <button
                                  type="button"
                                  className={`camp-toggle-btn ${
                                    siblingGender === "männlich"
                                      ? "is-active"
                                      : ""
                                  }`}
                                  onClick={() => setSiblingGender("männlich")}
                                >
                                  Male
                                </button>
                              </div>
                            </div>

                            <div className="field">
                              <label className="dialog-label">Birth date</label>
                              <KsDatePicker
                                value={siblingBirthDate}
                                onChange={(nextIso) =>
                                  setSiblingBirthDate(nextIso)
                                }
                                placeholder="dd.mm.yyyy"
                                disabled={false}
                              />
                            </div>
                          </div>

                          <div className="camp-grid">
                            <div className="field">
                              <label className="dialog-label">First name</label>
                              <input
                                className="input"
                                value={siblingFirstName}
                                onChange={(e) =>
                                  setSiblingFirstName(e.target.value)
                                }
                              />
                            </div>

                            <div className="field">
                              <label className="dialog-label">Last name</label>
                              <input
                                className="input"
                                value={siblingLastName}
                                onChange={(e) =>
                                  setSiblingLastName(e.target.value)
                                }
                              />
                            </div>
                          </div>

                          <div className="camp-grid">
                            <div className="field">
                              <label className="dialog-label">
                                T-shirt size
                              </label>
                              <select
                                className="input"
                                value={siblingTShirtSize}
                                onChange={(e) =>
                                  setSiblingTShirtSize(e.target.value)
                                }
                              >
                                <option value="">Please select</option>
                                {T_SHIRT_OPTIONS.map((item) => (
                                  <option key={item} value={item}>
                                    {item}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="field">
                              <label className="dialog-label">
                                Goalkeeper school
                              </label>
                              <div className="camp-toggle-row camp-toggle-row--full">
                                <button
                                  type="button"
                                  className={`camp-toggle-btn ${
                                    !siblingGoalkeeperSchool ? "is-active" : ""
                                  }`}
                                  onClick={() =>
                                    setSiblingGoalkeeperSchool(false)
                                  }
                                >
                                  No
                                </button>

                                <button
                                  type="button"
                                  className={`camp-toggle-btn ${
                                    siblingGoalkeeperSchool ? "is-active" : ""
                                  }`}
                                  onClick={() =>
                                    setSiblingGoalkeeperSchool(true)
                                  }
                                >
                                  Yes (+40€)
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="camp-block camp-block--footer">
                      <div className="camp-block__title">Booking details</div>

                      <div className="camp-grid camp-grid--top">
                        <div className="field">
                          <label className="dialog-label">Voucher</label>
                          <input
                            className="input"
                            value={voucher}
                            onChange={(e) => setVoucher(e.target.value)}
                          />
                        </div>

                        <div className="field">
                          <label className="dialog-label">Source</label>
                          <input
                            className="input"
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </section>
          )}

          {isPowertraining && (
            <section className="dialog-section book-dialog__detailsSection">
              <div className="dialog-section__head">
                <h4 className="dialog-section__title">Powertraining details</h4>
              </div>

              <div className="dialog-section__body">
                <section className="camp-options camp-options--premium">
                  <div className="camp-card">
                    <div className="camp-card__head">
                      <div>
                        <div className="camp-card__eyebrow">
                          Holiday program
                        </div>
                        <div className="camp-card__title">
                          Powertraining details
                        </div>
                      </div>
                    </div>

                    <div className="camp-summary-grid">
                      <div className="camp-summary-item">
                        <span className="camp-summary-item__label">
                          Holiday
                        </span>
                        <span className="camp-summary-item__value">
                          {holidayLabel || "—"}
                        </span>
                      </div>

                      <div className="camp-summary-item">
                        <span className="camp-summary-item__label">Period</span>
                        <span className="camp-summary-item__value">
                          {holidayRange || "—"}
                        </span>
                      </div>
                    </div>

                    <div className="camp-block camp-block--footer">
                      <div className="camp-block__title">Booking details</div>

                      <div className="camp-grid camp-grid--top">
                        <div className="field">
                          <label className="dialog-label">Voucher</label>
                          <input
                            className="input"
                            value={voucher}
                            onChange={(e) => setVoucher(e.target.value)}
                          />
                        </div>

                        <div className="field">
                          <label className="dialog-label">Source</label>
                          <input
                            className="input"
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </section>
          )}

          {isOneTimeVoucherOffer && (
            <section className="dialog-section book-dialog__detailsSection">
              <div className="dialog-section__head">
                <h4 className="dialog-section__title">Booking details</h4>
              </div>

              <div className="dialog-section__body">
                <section className="camp-options camp-options--premium">
                  <div className="camp-card">
                    <div className="camp-card__head">
                      <div>
                        <div className="camp-card__eyebrow">
                          One-time booking
                        </div>
                        <div className="camp-card__title">Booking details</div>
                      </div>
                    </div>

                    <div className="camp-block camp-block--footer">
                      <div className="camp-block__title">Booking details</div>

                      <div className="camp-grid camp-grid--top">
                        <div className="field">
                          <label className="dialog-label">Voucher</label>
                          <input
                            className="input"
                            value={voucher}
                            onChange={(e) => setVoucher(e.target.value)}
                          />
                        </div>

                        <div className="field">
                          <label className="dialog-label">Source</label>
                          <input
                            className="input"
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </section>
          )}

          {isWeekly && (
            <section className="dialog-section book-dialog__detailsSection">
              <div className="dialog-section__head">
                <h4 className="dialog-section__title">Subscription details</h4>
              </div>

              <div className="dialog-section__body">
                <section className="camp-options camp-options--premium">
                  <div className="camp-card">
                    <div className="camp-card__head">
                      <div>
                        <div className="camp-card__eyebrow">
                          Subscription booking
                        </div>
                        <div className="camp-card__title">Booking details</div>
                      </div>
                    </div>

                    <div className="camp-block camp-block--footer">
                      <div className="camp-block__title">Booking details</div>

                      <div className="camp-grid camp-grid--top">
                        <div className="field">
                          <label className="dialog-label">Voucher</label>
                          <input
                            className="input"
                            value={voucher}
                            onChange={(e) => setVoucher(e.target.value)}
                          />
                        </div>

                        <div className="field">
                          <label className="dialog-label">Source</label>
                          <input
                            className="input"
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </section>
          )}

          {isNum(selectedOffer?.price) && (
            <section className="dialog-section book-dialog__priceSection">
              <div className="dialog-section__head">
                <h4 className="dialog-section__title">Price overview</h4>
              </div>

              <div className="dialog-section__body">
                {isWeekly ? (
                  <div className="book-dialog__priceCard">
                    <ul className="book-dialog__priceList">
                      <li>
                        Monthly price: <b>{fmtEUR(selectedOffer.price!)}</b>
                      </li>
                      {pro ? (
                        <li>
                          First month (pro-rata from{" "}
                          <b>{fmtDE(selectedDate)}</b>:{" "}
                          <b>{fmtEUR(pro.firstMonthPrice)}</b>{" "}
                          <span className="book-dialog__muted">
                            ({pro.daysRemaining}/{pro.daysInMonth} days)
                          </span>
                        </li>
                      ) : (
                        <li className="book-dialog__muted">
                          Select a valid date to see pro-rata.
                        </li>
                      )}
                    </ul>
                  </div>
                ) : (
                  <div className="book-dialog__priceInline">
                    Price: <b>{fmtEUR(selectedOffer.price!)}</b>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        <div className="dialog-footer book-dialog__footer">
          <div className="book-dialog__footerActions">
            <button
              className="btn book-dialog__confirmBtn"
              disabled={saving || !selectedOfferId || !selectedDate}
              onClick={submit}
            >
              {saving ? "Booking…" : "Confirm booking"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

//   return (
//     <div className="ks-modal-root ks-modal-root--top">
//       <div className="ks-backdrop" onClick={onClose} />
//       <div
//         className="ks-panel card ks-panel--md"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="dialog-subhead">
//           <h3 className="text-lg font-bold">Book offer</h3>
//         </div>

//         {err && <div className="mb-2 text-red-600">{err}</div>}
//         {loadingOffers && (
//           <div className="mb-2 text-gray-600">Loading offers…</div>
//         )}

//         <BookDialogFamilyBox
//           family={family}
//           familyLoading={familyLoading}
//           familyError={familyError}
//           selectedParent={selectedParent}
//           selectedParentId={selfMemberId}
//           selectedParentLabel={selectedParentLabel}
//           parentOptions={parentOptions}
//           activeChild={activeChild}
//           bookingTarget={bookingTarget}
//           setBookingTarget={setBookingTarget}
//           parentOpen={isParentDropdownOpen}
//           setParentOpen={setIsParentDropdownOpen}
//           childOpen={isChildDropdownOpen}
//           setChildOpen={setIsChildDropdownOpen}
//           setSelectedParentId={setSelectedParentId}
//           selectedChildUid={selectedChildUid}
//           setSelectedChildUid={setSelectedChildUid}
//           childOptions={childOptions}
//           parentDropdownRef={parentDropdownRef}
//           childDropdownRef={childDropdownRef}
//         />

//         <div className="grid gap-2 mb-2">
//           <div>
//             <label className="lbl">Courses</label>
//             <BookDialogCourseSelect
//               courseValue={courseValue}
//               setCourseValue={setCourseValue}
//               selectedCourseLabel={selectedCourseLabel}
//               isOpen={isCourseDropdownOpen}
//               setIsOpen={setIsCourseDropdownOpen}
//               dropdownRef={courseDropdownRef}
//             />
//           </div>
//         </div>

//         <div className="grid gap-2 mb-2">
//           <div>
//             <label className="lbl">Offer</label>
//             <BookDialogOfferSelect
//               filteredOffers={filteredOffers}
//               selectedOfferId={selectedOfferId}
//               setSelectedOfferId={setSelectedOfferId}
//               selectedOfferLabel={selectedOfferLabel}
//               isOpen={isOfferDropdownOpen}
//               setIsOpen={setIsOfferDropdownOpen}
//               dropdownRef={offerDropdownRef}
//             />
//             {!filteredOffers.length && (
//               <div className="text-gray-600 mt-1">
//                 No offers in this selection.
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="grid gap-2">
//           <div>
//             <label className="lbl">Start date</label>
//             <KsDatePicker
//               value={selectedDate}
//               onChange={(nextIso) => setSelectedDate(nextIso)}
//               placeholder="tt.mm.jjjj"
//               disabled={false}
//             />
//           </div>
//         </div>

//         {isCamp && (
//           <section className="camp-options camp-options--premium">
//             <div className="camp-card">
//               <div className="camp-card__head">
//                 <div>
//                   <div className="camp-card__eyebrow">Ferienprogramm</div>
//                   <div className="camp-card__title">Camp-Details</div>
//                 </div>
//               </div>

//               <div className="camp-summary-grid">
//                 <div className="camp-summary-item">
//                   <span className="camp-summary-item__label">Ferien</span>
//                   <span className="camp-summary-item__value">
//                     {holidayLabel || "-"}
//                   </span>
//                 </div>

//                 <div className="camp-summary-item">
//                   <span className="camp-summary-item__label">Zeitraum</span>
//                   <span className="camp-summary-item__value">
//                     {holidayRange || "-"}
//                   </span>
//                 </div>
//               </div>

//               <div className="camp-block">
//                 <div className="camp-block__title">Hauptkind</div>

//                 <div className="camp-grid">
//                   <div className="field">
//                     <label className="lbl">T-Shirt-Größe (Kind)</label>
//                     <select
//                       className="input"
//                       value={mainTShirtSize}
//                       onChange={(e) => setMainTShirtSize(e.target.value)}
//                     >
//                       <option value="">Bitte wählen</option>
//                       {T_SHIRT_OPTIONS.map((item) => (
//                         <option key={item} value={item}>
//                           {item}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div className="field">
//                     <label className="lbl">Torwartschule (Kind)</label>
//                     <div className="camp-toggle-row camp-toggle-row--full">
//                       <button
//                         type="button"
//                         className={`camp-toggle-btn ${
//                           !mainGoalkeeperSchool ? "is-active" : ""
//                         }`}
//                         onClick={() => setMainGoalkeeperSchool(false)}
//                       >
//                         Nein
//                       </button>

//                       <button
//                         type="button"
//                         className={`camp-toggle-btn ${
//                           mainGoalkeeperSchool ? "is-active" : ""
//                         }`}
//                         onClick={() => setMainGoalkeeperSchool(true)}
//                       >
//                         Ja (+40€)
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="camp-block camp-block--sibling">
//                 <div className="sibling-head">
//                   <div>
//                     <div className="camp-block__title">
//                       Geschwister dazu buchen
//                     </div>
//                     <div className="sibling-head__subline">
//                       Optionaler Zusatz mit 14 Euro Rabatt
//                     </div>
//                   </div>

//                   <label className="sibling-switch">
//                     <input
//                       type="checkbox"
//                       checked={hasSibling}
//                       onChange={(e) => setHasSibling(e.target.checked)}
//                     />
//                     <span className="sibling-switch__text">
//                       Ja (14 Euro Rabatt erhalten)
//                     </span>
//                   </label>
//                 </div>

//                 {hasSibling && (
//                   <div className="sibling-fields is-open">
//                     <div className="camp-grid">
//                       <div className="field">
//                         <label className="lbl">Geschlecht</label>
//                         <div className="camp-toggle-row camp-toggle-row--full">
//                           <button
//                             type="button"
//                             className={`camp-toggle-btn ${
//                               siblingGender === "weiblich" ? "is-active" : ""
//                             }`}
//                             onClick={() => setSiblingGender("weiblich")}
//                           >
//                             weiblich
//                           </button>

//                           <button
//                             type="button"
//                             className={`camp-toggle-btn ${
//                               siblingGender === "männlich" ? "is-active" : ""
//                             }`}
//                             onClick={() => setSiblingGender("männlich")}
//                           >
//                             männlich
//                           </button>
//                         </div>
//                       </div>

//                       <div className="field">
//                         <label className="lbl">Geburtstag</label>
//                         <KsDatePicker
//                           value={siblingBirthDate}
//                           onChange={(nextIso) => setSiblingBirthDate(nextIso)}
//                           placeholder="tt.mm.jjjj"
//                           disabled={false}
//                         />
//                       </div>
//                     </div>

//                     <div className="camp-grid">
//                       <div className="field">
//                         <label className="lbl">Vorname (Kind)</label>
//                         <input
//                           className="input"
//                           value={siblingFirstName}
//                           onChange={(e) => setSiblingFirstName(e.target.value)}
//                         />
//                       </div>

//                       <div className="field">
//                         <label className="lbl">Nachname (Kind)</label>
//                         <input
//                           className="input"
//                           value={siblingLastName}
//                           onChange={(e) => setSiblingLastName(e.target.value)}
//                         />
//                       </div>
//                     </div>

//                     <div className="camp-grid">
//                       <div className="field">
//                         <label className="lbl">
//                           T-Shirt-Größe (Geschwister)
//                         </label>
//                         <select
//                           className="input"
//                           value={siblingTShirtSize}
//                           onChange={(e) => setSiblingTShirtSize(e.target.value)}
//                         >
//                           <option value="">Bitte wählen</option>
//                           {T_SHIRT_OPTIONS.map((item) => (
//                             <option key={item} value={item}>
//                               {item}
//                             </option>
//                           ))}
//                         </select>
//                       </div>

//                       <div className="field">
//                         <label className="lbl">
//                           Torwartschule (Geschwister)
//                         </label>
//                         <div className="camp-toggle-row camp-toggle-row--full">
//                           <button
//                             type="button"
//                             className={`camp-toggle-btn ${
//                               !siblingGoalkeeperSchool ? "is-active" : ""
//                             }`}
//                             onClick={() => setSiblingGoalkeeperSchool(false)}
//                           >
//                             Nein
//                           </button>

//                           <button
//                             type="button"
//                             className={`camp-toggle-btn ${
//                               siblingGoalkeeperSchool ? "is-active" : ""
//                             }`}
//                             onClick={() => setSiblingGoalkeeperSchool(true)}
//                           >
//                             Ja (+40€)
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <div className="camp-block camp-block--footer">
//                 <div className="camp-block__title">Buchungsangaben</div>

//                 <div className="camp-grid camp-grid--top">
//                   <div className="field">
//                     <label className="lbl">Gutschein</label>
//                     <input
//                       className="input"
//                       value={voucher}
//                       onChange={(e) => setVoucher(e.target.value)}
//                     />
//                   </div>

//                   <div className="field">
//                     <label className="lbl">Quelle</label>
//                     <input
//                       className="input"
//                       value={source}
//                       onChange={(e) => setSource(e.target.value)}
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </section>
//         )}

//         {isPowertraining && (
//           <section className="camp-options camp-options--premium">
//             <div className="camp-card">
//               <div className="camp-card__head">
//                 <div>
//                   <div className="camp-card__eyebrow">Ferienprogramm</div>
//                   <div className="camp-card__title">Powertraining-Details</div>
//                 </div>
//               </div>

//               <div className="camp-summary-grid">
//                 <div className="camp-summary-item">
//                   <span className="camp-summary-item__label">Ferien</span>
//                   <span className="camp-summary-item__value">
//                     {holidayLabel || "—"}
//                   </span>
//                 </div>

//                 <div className="camp-summary-item">
//                   <span className="camp-summary-item__label">Zeitraum</span>
//                   <span className="camp-summary-item__value">
//                     {holidayRange || "—"}
//                   </span>
//                 </div>
//               </div>

//               <div className="camp-block camp-block--footer">
//                 <div className="camp-block__title">Buchungsangaben</div>

//                 <div className="camp-grid camp-grid--top">
//                   <div className="field">
//                     <label className="lbl">Gutschein</label>
//                     <input
//                       className="input"
//                       value={voucher}
//                       onChange={(e) => setVoucher(e.target.value)}
//                     />
//                   </div>

//                   <div className="field">
//                     <label className="lbl">Quelle</label>
//                     <input
//                       className="input"
//                       value={source}
//                       onChange={(e) => setSource(e.target.value)}
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </section>
//         )}

//         {isOneTimeVoucherOffer && (
//           <section className="camp-options camp-options--premium">
//             <div className="camp-card">
//               <div className="camp-card__head">
//                 <div>
//                   <div className="camp-card__eyebrow">Einmalbuchung</div>
//                   <div className="camp-card__title">Buchungsdetails</div>
//                 </div>
//               </div>

//               <div className="camp-block camp-block--footer">
//                 <div className="camp-block__title">Buchungsangaben</div>

//                 <div className="camp-grid camp-grid--top">
//                   <div className="field">
//                     <label className="lbl">Gutschein</label>
//                     <input
//                       className="input"
//                       value={voucher}
//                       onChange={(e) => setVoucher(e.target.value)}
//                     />
//                   </div>

//                   <div className="field">
//                     <label className="lbl">Quelle</label>
//                     <input
//                       className="input"
//                       value={source}
//                       onChange={(e) => setSource(e.target.value)}
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </section>
//         )}

//         {isWeekly && (
//           <section className="camp-options camp-options--premium">
//             <div className="camp-card">
//               <div className="camp-card__head">
//                 <div>
//                   <div className="camp-card__eyebrow">Abo-Buchung</div>
//                   <div className="camp-card__title">Buchungsangaben</div>
//                 </div>
//               </div>

//               <div className="camp-block camp-block--footer">
//                 <div className="camp-block__title">Buchungsangaben</div>

//                 <div className="camp-grid camp-grid--top">
//                   <div className="field">
//                     <label className="lbl">Gutschein</label>
//                     <input
//                       className="input"
//                       value={voucher}
//                       onChange={(e) => setVoucher(e.target.value)}
//                     />
//                   </div>

//                   <div className="field">
//                     <label className="lbl">Quelle</label>
//                     <input
//                       className="input"
//                       value={source}
//                       onChange={(e) => setSource(e.target.value)}
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </section>
//         )}

//         {isNum(selectedOffer?.price) &&
//           (isWeekly ? (
//             <div className="mt-3 p-3 rounded bg-gray-50 border">
//               <div className="font-semibold mb-1">Price overview</div>
//               <ul className="list-disc ml-5">
//                 <li>
//                   Monthly price: <b>{fmtEUR(selectedOffer.price!)}</b>
//                 </li>
//                 {pro ? (
//                   <li>
//                     First month (pro-rata from <b>{fmtDE(selectedDate)}</b>:{" "}
//                     <b>{fmtEUR(pro.firstMonthPrice)}</b>{" "}
//                     <span className="text-gray-600">
//                       ({pro.daysRemaining}/{pro.daysInMonth} days)
//                     </span>
//                   </li>
//                 ) : (
//                   <li className="text-gray-600">
//                     Select a valid date to see pro-rata.
//                   </li>
//                 )}
//               </ul>
//             </div>
//           ) : (
//             <div className="mt-3">
//               <div>
//                 Price: <b>{fmtEUR(selectedOffer.price!)}</b>
//               </div>
//             </div>
//           ))}

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

//           <button
//             className="btn"
//             disabled={saving || !selectedOfferId || !selectedDate}
//             onClick={submit}
//           >
//             {saving ? "Booking…" : "Confirm booking"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
