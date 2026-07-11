import type { Partner } from "../../types";

export type PartnerListProps = {
  items: Partner[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  busyItemId: string;
  onPrev: () => void;
  onNext: () => void;
  onEdit: (item: Partner) => void;
  onDelete: (item: Partner) => void;
  onToggle: (item: Partner) => void;
  onBulkDelete: (items: Partner[]) => Promise<void>;
  onBulkDeactivate: (items: Partner[]) => Promise<void>;
};

export type PartnerSelection = ReturnType<
  typeof import("./usePartnerSelection").usePartnerSelection
>;

export type PartnerTableProps = {
  props: PartnerListProps;
  selection: PartnerSelection;
};
