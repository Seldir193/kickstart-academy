import type { TFunction } from "i18next";
import type { CSSProperties } from "react";

type OverlayCssVars = CSSProperties & {
  "--ksLeft": string;
  "--ksTop": string;
  "--ksWidth": string;
};

export function cssVars(left: number, top: number, width: number) {
  const vars: OverlayCssVars = {
    "--ksLeft": `${left}px`,
    "--ksTop": `${top}px`,
    "--ksWidth": `${width}px`,
  };
  return vars;
}

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
