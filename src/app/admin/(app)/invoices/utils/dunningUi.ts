import type { TFunction } from "i18next";
import type { DunningStage } from "./invoiceList";

export function stageLabel(
  stage: DunningStage | string | null | undefined,
  t: TFunction,
) {
  return t(stageTranslationKey(stage));
}

function stageTranslationKey(
  stage: DunningStage | string | null | undefined,
) {
  if (stage === "reminder") {
    return "common.admin.invoices.stage.reminder";
  }
  if (stage === "dunning1") {
    return "common.admin.invoices.stage.dunning1";
  }
  if (stage === "dunning2") {
    return "common.admin.invoices.stage.dunning2";
  }
  if (stage === "final") {
    return "common.admin.invoices.stage.final";
  }
  return "common.admin.invoices.stage.default";
}

export function moneyInputToNumber(value: string): number {
  const raw = String(value || "")
    .trim()
    .replace(",", ".");
  if (!raw) return 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}
