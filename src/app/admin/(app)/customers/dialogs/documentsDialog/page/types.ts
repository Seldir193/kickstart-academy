import type { MouseEvent, RefObject } from "react";
import type { TFunction } from "i18next";
import type { DocItem, SortOrder } from "../types";
import type { FamilyChild, FamilyMember } from "../../bookDialog/types";
export type { DocItem, SortOrder };

export type DocumentsDialogProps = {
  customerId: string;
  onClose: () => void;
};

export type BookingTarget = "self" | "child";

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

export type TypeFlags = {
  participation: boolean;
  invoice: boolean;
  cancellation: boolean;
  storno: boolean;
  dunning: boolean;
  contract: boolean;
  creditNote: boolean;
};

export type TypeChipState = TypeFlags & {
  setParticipation: (value: boolean) => void;
  setInvoice: (value: boolean) => void;
  setCancellation: (value: boolean) => void;
  setStorno: (value: boolean) => void;
  setDunning: (value: boolean) => void;
  setContract: (value: boolean) => void;
  setCreditNote: (value: boolean) => void;
};

export type SelectboxState = {
  open: boolean;
  pos: { left: number; top: number; width: number };
  triggerRef: RefObject<HTMLButtonElement | null>;
  menuRef: RefObject<HTMLDivElement | null>;
  setOpen: (value: boolean) => void;
  openMenu: () => void;
};

export type ScopeDropdowns = {
  parentDropdownRef: RefObject<HTMLDivElement | null>;
  childDropdownRef: RefObject<HTMLDivElement | null>;
  isParentDropdownOpen: boolean;
  isChildDropdownOpen: boolean;
  setIsParentDropdownOpen: (
    value: boolean | ((value: boolean) => boolean),
  ) => void;
  setIsChildDropdownOpen: (
    value: boolean | ((value: boolean) => boolean),
  ) => void;
};

export type FamilyScopeState = ScopeDropdowns & {
  family: FamilyMember[] | null;
  familyLoading: boolean;
  familyError: string | null;
  childOptions: ChildOption[];
  parentOptions: ParentOption[];
  selectedParentId: string;
  selectedChildUid: string;
  bookingTarget: BookingTarget;
  selfMemberId: string;
  selectedParent: FamilyMember | null;
  selectedParentLabel: string;
  activeChild: FamilyChild | null;
  setSelectedParentId: (value: string) => void;
  setSelectedChildUid: (value: string) => void;
  setBookingTarget: (value: BookingTarget) => void;
};

export type FilterState = {
  q: string;
  from: string;
  to: string;
  sortOrder: SortOrder;
  page: number;
  limit: number;
  setQ: (value: string) => void;
  setFrom: (value: string) => void;
  setTo: (value: string) => void;
  setSortOrder: (value: SortOrder) => void;
  setPage: (value: number | ((value: number) => number)) => void;
  setLimit: (value: number) => void;
};

export type DocumentsListState = {
  items: DocItem[];
  loading: boolean;
  hasLoadedOnce: boolean;
  err: string | null;
  filteredItems: DocItem[];
  pagedItems: DocItem[];
  totalPages: number;
  csvHref: string;
  zipHref: string;
};

export type DocumentsDialogState = {
  t: TFunction;
  onClose: () => void;
  types: TypeChipState;
  selectedTypes: string[];
  filters: FilterState;
  scope: FamilyScopeState;
  list: DocumentsListState;
  docsSelect: SelectboxState;
  perPageSelect: SelectboxState;
  sortSelect: SelectboxState;
};

export type ScopeButtonEvent = MouseEvent<HTMLButtonElement>;
