export type StatusFilter = "active" | "cancelled" | "all";
export type SortOrder = "newest" | "oldest";

export const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: "active", label: "Active" },
  { value: "cancelled", label: "Cancelled" },
  { value: "all", label: "All" },
];

export const SORT_OPTIONS: Array<{ value: SortOrder; label: string }> = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
];
