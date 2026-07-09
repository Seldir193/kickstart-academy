import type React from "react";
import type { Customer } from "../../../types";
import type { FamilyChild, FamilyMember } from "../../bookDialog/types";
import type { SortOrder, StatusFilter } from "../constants";

export type CancelDialogProps = {
  customer: Customer;
  onClose: () => void;
  onChanged: (freshCustomer: Customer) => void;
};

export type BookingTarget = "self" | "child";
export type TFunc = (key: string) => string;

export type ChildOption = {
  uid: string;
  label: string;
  parentId: string;
  child: FamilyChild;
};

export type ParentOption = {
  id: string;
  label: string;
};

export type FamilyScopeState = {
  family: FamilyMember[] | null;
  familyLoading: boolean;
  familyError: string | null;
  parentOptions: ParentOption[];
  childOptions: ChildOption[];
  selectedParent: FamilyMember | null;
  selectedParentLabel: string;
  activeChild: FamilyChild | null;
  bookingTarget: BookingTarget;
  selectedChildUid: string;
  selfMemberId: string;
  isParentDropdownOpen: boolean;
  isChildDropdownOpen: boolean;
  parentDropdownRef: React.RefObject<HTMLDivElement | null>;
  childDropdownRef: React.RefObject<HTMLDivElement | null>;
  setBookingTarget: (value: BookingTarget) => void;
  setSelectedParentId: (value: string) => void;
  setSelectedChildUid: (value: string) => void;
  setIsParentDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsChildDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export type CancelMenuState = {
  courseDropdownRef: React.RefObject<HTMLDivElement | null>;
  bookingDropdownRef: React.RefObject<HTMLDivElement | null>;
  statusDropdownRef: React.RefObject<HTMLDivElement | null>;
  sortDropdownRef: React.RefObject<HTMLDivElement | null>;
  isCourseDropdownOpen: boolean;
  isBookingDropdownOpen: boolean;
  isStatusOpen: boolean;
  isSortOpen: boolean;
  setIsCourseDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsBookingDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsStatusOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSortOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export type CancelBookingsState = {
  err: string | null;
  loadingOffers: boolean;
  courseValue: string;
  statusFilter: StatusFilter;
  sortOrder: SortOrder;
  selectedId: string;
  selected: any | null;
  selectedIsCancelled: boolean;
  filteredBookings: any[];
  statusItems: { value: string; label: string }[];
  sortItems: { value: string; label: string }[];
  statusLabel: string;
  sortLabel: string;
  selectedCourseLabel: string;
  bookingTrigger: { title: string; invoice: string; venue: string; status: string };
  courseValueIsNonCancelable: boolean;
  setErr: (value: string | null) => void;
  setCourseValue: (value: string) => void;
  setStatusFilter: (value: StatusFilter) => void;
  setSortOrder: (value: SortOrder) => void;
  setSelectedId: (value: string) => void;
};

export type CancelSubmitState = {
  cancelDate: string;
  endDate: string;
  reason: string;
  saving: boolean;
  endBeforeStart: boolean;
  disabled: boolean;
  disabledByNonCancelableCourse: boolean;
  submit: () => Promise<void>;
  setCancelDate: (value: string) => void;
  setEndDate: (value: string) => void;
  setReason: (value: string) => void;
};
