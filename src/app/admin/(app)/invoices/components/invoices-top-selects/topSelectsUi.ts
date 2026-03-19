export function cssVars(left: number, top: number, width: number) {
  return {
    ["--ksLeft" as any]: `${left}px`,
    ["--ksTop" as any]: `${top}px`,
    ["--ksWidth" as any]: `${width}px`,
  };
}

export function docsLabel(loading: boolean, count: number) {
  if (count) return `Dokumente: ${count} auf dieser Seite`;
  return loading ? "Lade…" : "Dokumente: 0 auf dieser Seite";
}

export function toggleOpen(
  open: boolean,
  setOpen: (v: boolean) => void,
  openMenu: () => void,
) {
  if (open) setOpen(false);
  else openMenu();
}
