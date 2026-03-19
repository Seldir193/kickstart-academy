//src\app\admin\(app)\invoices\utils\dunningUi.ts
import type { DunningStage } from "./invoiceList";

export function stageLabel(stage?: string | null) {
  if (stage === "reminder") return "Zahlungserinnerung";
  if (stage === "dunning1") return "1. Mahnung";
  if (stage === "dunning2") return "2. Mahnung";
  if (stage === "final") return "Letzte Mahnung";
  return "Mahnung";
}

export function moneyInputToNumber(value: string): number {
  const raw = String(value || "")
    .trim()
    .replace(",", ".");
  if (!raw) return 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}
