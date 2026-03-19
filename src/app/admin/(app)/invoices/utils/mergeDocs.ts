// src/app/admin/(app)/invoices/utils/mergeDocs.ts
import type { DocItem } from "./invoiceUi";

export function sortMergedDocs(items: DocItem[], sort: string) {
  const [fieldRaw, dirRaw] = String(sort || "issuedAt:desc").split(":");
  const field = fieldRaw || "issuedAt";
  const dir = dirRaw === "asc" ? 1 : -1;

  return [...items].sort((a: any, b: any) => {
    if (field === "issuedAt") return compareIssuedAt(a, b, dir);
    return compareField(a, b, field, dir);
  });
}

function compareIssuedAt(a: any, b: any, dir: number) {
  const ta = a?.issuedAt ? new Date(a.issuedAt).getTime() : 0;
  const tb = b?.issuedAt ? new Date(b.issuedAt).getTime() : 0;
  if (ta !== tb) return (ta - tb) * dir;
  const da = String(
    a?.invoiceNo || a?.stornoNo || a?.cancellationNo || "",
  ).toLowerCase();
  const db = String(
    b?.invoiceNo || b?.stornoNo || b?.cancellationNo || "",
  ).toLowerCase();
  return da.localeCompare(db, "de", { numeric: true }) * dir;
}

function compareField(a: any, b: any, field: string, dir: number) {
  const va = String(a?.[field] ?? "").toLowerCase();
  const vb = String(b?.[field] ?? "").toLowerCase();
  if (va === vb) return 0;
  return va > vb ? dir : -dir;
}
