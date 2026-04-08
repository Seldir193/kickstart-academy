//src\app\admin\(app)\customers\dialogs\cancelDialog\constants.ts
export type StatusFilter = "active" | "cancelled" | "all";
export type SortOrder = "newest" | "oldest";

export const STATUS_OPTIONS: Array<{ value: StatusFilter; labelKey: string }> =
  [
    {
      value: "active",
      labelKey: "common.admin.customers.cancelDialog.statusActive",
    },
    {
      value: "cancelled",
      labelKey: "common.admin.customers.cancelDialog.statusCancelled",
    },
    { value: "all", labelKey: "common.admin.customers.cancelDialog.statusAll" },
  ];

export const SORT_OPTIONS: Array<{ value: SortOrder; labelKey: string }> = [
  {
    value: "newest",
    labelKey: "common.admin.customers.cancelDialog.sortNewest",
  },
  {
    value: "oldest",
    labelKey: "common.admin.customers.cancelDialog.sortOldest",
  },
];
