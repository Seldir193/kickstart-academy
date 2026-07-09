import type React from "react";
import type { Customer, Offer } from "../../../types";
import type { FamilyChild, FamilyMember } from "../types";

export type BookDialogProps = {
  customerId: string;
  initialChildUid?: string;
  onClose: () => void;
  onBooked: (freshCustomer: Customer) => void;
};

export type BookingTarget = "self" | "child";
export type OfferKind = "camp" | "powertraining" | "one_time" | "default";
export type TFunc = (key: string, options?: Record<string, unknown>) => string;

export type ChildOption = { uid: string; label: string; parentId: string; child: FamilyChild };
export type ParentOption = { id: string; label: string };

export type OpenControl = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export type BookDropdowns = {
  parentDropdownRef: React.RefObject<HTMLDivElement | null>;
  childDropdownRef: React.RefObject<HTMLDivElement | null>;
  courseDropdownRef: React.RefObject<HTMLDivElement | null>;
  offerDropdownRef: React.RefObject<HTMLDivElement | null>;
  mainTShirtDropdownRef: React.RefObject<HTMLDivElement | null>;
  siblingTShirtDropdownRef: React.RefObject<HTMLDivElement | null>;
  isParentDropdownOpen: boolean;
  isChildDropdownOpen: boolean;
  isCourseDropdownOpen: boolean;
  isOfferDropdownOpen: boolean;
  isMainTShirtOpen: boolean;
  isSiblingTShirtOpen: boolean;
  setIsParentDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsChildDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsCourseDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsOfferDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsMainTShirtOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSiblingTShirtOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export type BookFamilyScope = {
  family: FamilyMember[] | null;
  familyLoading: boolean;
  familyError: string | null;
  childOptions: ChildOption[];
  parentOptions: ParentOption[];
  selectedParent: FamilyMember | null;
  selectedParentLabel: string;
  selfMemberId: string;
  activeChild: FamilyChild | null;
  selectedChildUid: string;
  bookingTarget: BookingTarget;
  setBookingTarget: React.Dispatch<React.SetStateAction<BookingTarget>>;
  setSelectedParentId: React.Dispatch<React.SetStateAction<string>>;
  setSelectedChildUid: React.Dispatch<React.SetStateAction<string>>;
};

export type BookOfferScope = {
  offers: Offer[];
  loadingOffers: boolean;
  err: string | null;
  setErr: React.Dispatch<React.SetStateAction<string | null>>;
  courseValue: string;
  setCourseValue: React.Dispatch<React.SetStateAction<string>>;
  selectedOfferId: string;
  setSelectedOfferId: React.Dispatch<React.SetStateAction<string>>;
  selectedDate: string;
  setSelectedDate: React.Dispatch<React.SetStateAction<string>>;
  filteredOffers: Offer[];
  selectedOffer: Offer | null;
  selectedCourseLabel: string;
  selectedOfferLabel: string;
  isWeekly: boolean;
  isCamp: boolean;
  isPowertraining: boolean;
  isOneTimeVoucherOffer: boolean;
  scheduleLine: string;
  scheduleLabel: string;
  regularCourseLine: string;
  weeklyHolidayNotice: string;
  holidayLabel: string;
  holidayRange: string;
};

export type BookDetailsState = {
  voucher: string;
  source: string;
  mainTShirtSize: string;
  mainGoalkeeperSchool: boolean;
  hasSibling: boolean;
  siblingGender: string;
  siblingBirthDate: string;
  siblingFirstName: string;
  siblingLastName: string;
  siblingTShirtSize: string;
  siblingGoalkeeperSchool: boolean;
  setVoucher: React.Dispatch<React.SetStateAction<string>>;
  setSource: React.Dispatch<React.SetStateAction<string>>;
  setMainTShirtSize: React.Dispatch<React.SetStateAction<string>>;
  setMainGoalkeeperSchool: React.Dispatch<React.SetStateAction<boolean>>;
  setHasSibling: React.Dispatch<React.SetStateAction<boolean>>;
  setSiblingGender: React.Dispatch<React.SetStateAction<string>>;
  setSiblingBirthDate: React.Dispatch<React.SetStateAction<string>>;
  setSiblingFirstName: React.Dispatch<React.SetStateAction<string>>;
  setSiblingLastName: React.Dispatch<React.SetStateAction<string>>;
  setSiblingTShirtSize: React.Dispatch<React.SetStateAction<string>>;
  setSiblingGoalkeeperSchool: React.Dispatch<React.SetStateAction<boolean>>;
};

export type BookSubmitState = { saving: boolean; submit: () => Promise<void> };
export type BookDialogController = { t: TFunc; family: BookFamilyScope; offers: BookOfferScope; details: BookDetailsState; dropdowns: BookDropdowns; submit: BookSubmitState };
