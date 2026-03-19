import type { DunningStage, InvoiceRow } from "../../utils/invoiceList";

export function normalizeStage(v: unknown): DunningStage {
  const s = String(v || "").trim();
  if (s === "dunning1") return "dunning1";
  if (s === "dunning2") return "dunning2";
  if (s === "final") return "final";
  return "reminder";
}

export function stageExists(row: InvoiceRow, stage: DunningStage) {
  const list = row.dunningSentStages;
  return Array.isArray(list) ? list.includes(stage) : false;
}

export function nextStageFromRow(row: InvoiceRow) {
  return normalizeStage(row.nextDunningStage || "reminder");
}

export function bankFeeFromRow(row: InvoiceRow) {
  const n = row.returnBankFee;
  return n != null && Number.isFinite(Number(n)) ? String(n) : "";
}

export function dunningDocIdFromRow(row: InvoiceRow) {
  const rawId = String((row as any)?.id || "");
  return rawId.startsWith("dunning:") ? rawId.slice(8) : "";
}

export function isHandedOver(row: InvoiceRow) {
  return String((row as any)?.collectionStatus || "none") === "handed_over";
}
