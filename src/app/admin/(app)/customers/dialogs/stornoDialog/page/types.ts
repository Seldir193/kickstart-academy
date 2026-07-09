import type React from "react";
import type { Customer } from "../../../types";
import type { FamilyChild, FamilyMember } from "../../bookDialog/types";
import type { SortOrder, StatusFilter } from "../constants";

export type StornoDialogProps = {
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

export type StornoMenuState = {
  courseDropdownRef: React.RefObject<HTMLDivElement | null>;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  menuRef: React.RefObject<HTMLDivElement | null>;
  statusDropdownRef: React.RefObject<HTMLDivElement | null>;
  sortDropdownRef: React.RefObject<HTMLDivElement | null>;
  isCourseDropdownOpen: boolean;
  menuOpen: boolean;
  isStatusOpen: boolean;
  isSortOpen: boolean;
  setIsCourseDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsStatusOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSortOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export type StornoBookingsState = {
  err: string | null;
  loading: boolean;
  courseValue: string;
  statusFilter: StatusFilter;
  sortOrder: SortOrder;
  selectedId: string;
  selected: any | null;
  isCancelled: boolean;
  filtered: any[];
  statusItems: { value: string; label: string }[];
  sortItems: { value: string; label: string }[];
  statusLabel: string;
  sortLabel: string;
  selectedCourseLabel: string;
  bookingTrigger: { title: string; invoice: string; venue: string; status: string };
  setErr: (value: string | null) => void;
  setCourseValue: (value: string) => void;
  setStatusFilter: (value: StatusFilter) => void;
  setSortOrder: (value: SortOrder) => void;
  setSelectedId: (value: string) => void;
};

export type StornoSubmitState = {
  note: string;
  saving: boolean;
  disabled: boolean;
  submit: () => Promise<void>;
  setNote: (value: string) => void;
};
