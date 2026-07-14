import type { DocItem } from "./invoiceUi";

export function sortMergedDocs(items: DocItem[], sort: string) {
  const [fieldRaw, dirRaw] = String(sort || "issuedAt:desc").split(":");
  const field = fieldRaw || "issuedAt";
  const dir = dirRaw === "asc" ? 1 : -1;

  return [...items].sort((a, b) => {
    if (field === "issuedAt") return compareIssuedAt(a, b, dir);
    return compareField(a, b, field, dir);
  });
}

function compareIssuedAt(a: DocItem, b: DocItem, dir: number) {
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

function compareField(a: DocItem, b: DocItem, field: string, dir: number) {
  const va = normalizedField(a, field);
  const vb = normalizedField(b, field);
  if (va === vb) return 0;
  return va > vb ? dir : -dir;
}

function normalizedField(doc: DocItem, field: string) {
  const value = (doc as DocItem & Record<string, unknown>)[field];
  return String(value ?? "").toLowerCase();
}
