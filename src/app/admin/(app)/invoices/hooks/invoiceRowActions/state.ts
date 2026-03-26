//src\app\admin\(app)\invoices\hooks\invoiceRowActions\state.ts
import type { DunningStage, InvoiceRow } from "../../utils/invoiceList";

type RowActionMode = "returned" | "dunning" | "refund" | "withdraw" | null;
type ActionNoticeTone = "idle" | "success" | "error";

export type RowActionState = {
  open: boolean;
  mode: RowActionMode;
  row: InvoiceRow | null;
  loading: boolean;
  error: string;

  bankFee: string;
  returnNote: string;

  dunningFee: string;
  processingFee: string;
  freeText: string;

  stage: DunningStage;
  resolvedStage: DunningStage;
  canSend: boolean;
  inputsDisabled: boolean;

  reason: string;

  notice: string;
  noticeTone: ActionNoticeTone;
};

export function createInitialActionState(): RowActionState {
  return {
    open: false,
    mode: null,
    row: null,
    loading: false,
    error: "",

    bankFee: "",
    returnNote: "",

    dunningFee: "",
    processingFee: "",
    freeText: "",

    stage: "reminder",
    resolvedStage: "reminder",
    canSend: true,
    inputsDisabled: false,

    reason: "",

    notice: "",
    noticeTone: "idle",
  };
}

export function busyOff(prev: RowActionState): RowActionState {
  return { ...prev, loading: false };
}
