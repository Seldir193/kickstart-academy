//src\app\admin\(app)\invoices\components\invoices-top-selects\topSelectsUi.ts
export function cssVars(left: number, top: number, width: number) {
  return {
    ["--ksLeft" as any]: `${left}px`,
    ["--ksTop" as any]: `${top}px`,
    ["--ksWidth" as any]: `${width}px`,
  };
}

import type { TFunction } from "i18next";

// export function docsLabel(loading: boolean, count: number) {
//   if (count) return `Documents: ${count} on this page`;
//   return loading ? "Loading..." : "Documents: 0 on this page";
// }

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

// //src\app\admin\(app)\invoices\components\invoices-top-selects\topSelectsUi.ts
// export function cssVars(left: number, top: number, width: number) {
//   return {
//     ["--ksLeft" as any]: `${left}px`,
//     ["--ksTop" as any]: `${top}px`,
//     ["--ksWidth" as any]: `${width}px`,
//   };
// }

// export function docsLabel(loading: boolean, count: number) {
//   if (count) return `Dokumente: ${count} auf dieser Seite`;
//   return loading ? "Lade…" : "Dokumente: 0 auf dieser Seite";
// }

// export function toggleOpen(
//   open: boolean,
//   setOpen: (v: boolean) => void,
//   openMenu: () => void,
// ) {
//   if (open) setOpen(false);
//   else openMenu();
// }
