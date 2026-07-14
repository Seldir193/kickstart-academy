export function cssVars(left: number, top: number, width: number) {
  return {
    ["--ksLeft" as any]: `${left}px`,
    ["--ksTop" as any]: `${top}px`,
    ["--ksWidth" as any]: `${width}px`,
  };
}

import type { TFunction } from "i18next";

export function docsLabel(
  loading: boolean,
  count: number,
  t: TFunction,
): string {
  if (count) {
    return t("common.admin.invoices.docs.label", { count });
  }
  return loading
    ? t("common.admin.invoices.list.loading")
    : t("common.admin.invoices.docs.label", { count: 0 });
}

export function toggleOpen(
  open: boolean,
  setOpen: (v: boolean) => void,
  openMenu: () => void,
) {
  if (open) setOpen(false);
  else openMenu();
}
