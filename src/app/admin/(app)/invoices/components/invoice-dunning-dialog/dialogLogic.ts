import type { DunningStage, InvoiceRow } from "../../utils/invoiceList";
import type { RowActionState } from "../../hooks/useInvoiceRowActions";

export function stageLabel(value: DunningStage) {
  if (value === "reminder") return "Payment reminder";
  if (value === "dunning1") return "1st dunning notice";
  if (value === "dunning2") return "2nd dunning notice";
  return "Final dunning notice";
}

export function orderedStages(): DunningStage[] {
  return ["reminder", "dunning1", "dunning2", "final"];
}

export function nextStageForRow(row: InvoiceRow): DunningStage {
  const next = String(row.nextDunningStage || "reminder").trim();
  if (next === "dunning1") return "dunning1";
  if (next === "dunning2") return "dunning2";
  if (next === "final") return "final";
  return "reminder";
}

export function visibleStagesForRow(row: InvoiceRow): DunningStage[] {
  const list = orderedStages();
  const next = nextStageForRow(row);
  const idx = list.indexOf(next);
  if (idx < 0) return ["reminder"];
  return list.slice(0, idx + 1);
}

export function canPickStage(row: InvoiceRow, stage: DunningStage) {
  return nextStageForRow(row) === stage;
}

export function stageExists(row: InvoiceRow, stage: DunningStage) {
  const list = row.dunningSentStages;
  if (Array.isArray(list)) return list.includes(stage);
  return false;
}

export function docRefFromRow(row: InvoiceRow) {
  return (
    row.invoiceNo || row.stornoNo || row.cancellationNo || row.bookingId || "-"
  );
}

export function applyStagePatch(row: InvoiceRow, next: DunningStage) {
  const exists = stageExists(row, next);
  return {
    stage: next,
    resolvedStage: next,
    canSend: !exists,
    inputsDisabled: exists,
  };
}

export function dialogAriaLabel(state: RowActionState) {
  return state.mode === "returned"
    ? "Mark as returned and add bank fee"
    : "Send dunning step";
}

export function dialogTitle(state: RowActionState) {
  return state.mode === "returned"
    ? "Mark as returned + bank fee"
    : "Send dunning step";
}

// import type { DunningStage, InvoiceRow } from "../../utils/invoiceList";
// import type { RowActionState } from "../../hooks/useInvoiceRowActions";

// export function stageLabel(value: DunningStage) {
//   if (value === "reminder") return "Zahlungserinnerung";
//   if (value === "dunning1") return "1. Mahnung";
//   if (value === "dunning2") return "2. Mahnung";
//   return "Letzte Mahnung";
// }

// export function orderedStages(): DunningStage[] {
//   return ["reminder", "dunning1", "dunning2", "final"];
// }

// export function nextStageForRow(row: InvoiceRow): DunningStage {
//   const next = String(row.nextDunningStage || "reminder").trim();
//   if (next === "dunning1") return "dunning1";
//   if (next === "dunning2") return "dunning2";
//   if (next === "final") return "final";
//   return "reminder";
// }

// export function visibleStagesForRow(row: InvoiceRow): DunningStage[] {
//   const list = orderedStages();
//   const next = nextStageForRow(row);
//   const idx = list.indexOf(next);
//   if (idx < 0) return ["reminder"];
//   return list.slice(0, idx + 1);
// }

// export function canPickStage(row: InvoiceRow, stage: DunningStage) {
//   return nextStageForRow(row) === stage;
// }

// export function stageExists(row: InvoiceRow, stage: DunningStage) {
//   const list = row.dunningSentStages;
//   if (Array.isArray(list)) return list.includes(stage);
//   return false;
// }

// export function docRefFromRow(row: InvoiceRow) {
//   return (
//     row.invoiceNo || row.stornoNo || row.cancellationNo || row.bookingId || "-"
//   );
// }

// export function applyStagePatch(row: InvoiceRow, next: DunningStage) {
//   const exists = stageExists(row, next);
//   return {
//     stage: next,
//     resolvedStage: next,
//     canSend: !exists,
//     inputsDisabled: exists,
//   };
// }

// export function dialogAriaLabel(state: RowActionState) {
//   return state.mode === "returned"
//     ? "Mark returned and bank fee"
//     : "Send dunning step";
// }

// export function dialogTitle(state: RowActionState) {
//   return state.mode === "returned"
//     ? "Mark returned + bank fee"
//     : "Send dunning step";
// }
