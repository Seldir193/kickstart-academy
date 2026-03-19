// //src\app\admin\(app)\invoices\utils\invoiceList.ts
export type DunningStage = "reminder" | "dunning1" | "dunning2" | "final";

export type InvoicePaymentStatus = "open" | "paid" | "returned";

export type InvoiceRow = {
  id: string;
  bookingId?: string;
  customerId?: string;
  type?: string;
  title?: string;
  issuedAt?: string;
  offerTitle?: string;
  offerType?: string;
  amount?: number;
  currency?: string;
  customerNumber?: number | string;
  customerName?: string;
  customerChildName?: string;
  invoiceNo?: string;
  cancellationNo?: string;
  stornoNo?: string;
  href?: string;
  paymentStatus?: InvoicePaymentStatus;
  paidAt?: string | null;
  returnedAt?: string | null;
  returnBankFee?: number;
  returnNote?: string;
  dunningCount?: number;
  lastDunningStage?: DunningStage | null;
  lastDunningSentAt?: string | null;
  nextDunningStage?: DunningStage | null;
  dunningSentStages?: DunningStage[];
  dunningDocIdByStage?: Partial<Record<DunningStage, string>>;
  //neu
  creditNoteNo?: string | null;
  creditNoteDate?: string | null;
  creditNoteAmount?: number | null;
  refundId?: string | null;

  stripeMode?: string;
  subscriptionId?: string | null;
  paymentIntentId?: string | null;
  contractSignedAt?: string | null;
  createdAt?: string | null;
};

export type InvoiceListResponse = {
  ok?: boolean;
  items: InvoiceRow[];
  total?: number;
  page?: number;
  limit?: number;
};

export type ListResponse<T> =
  | { ok: boolean; items: T[]; total: number; page: number; limit: number }
  | { items: T[]; total?: number }
  | T[];

export function asList<T>(raw: ListResponse<T>): { items: T[]; total: number } {
  if (Array.isArray(raw)) return { items: raw, total: raw.length };
  const items = Array.isArray((raw as any).items) ? (raw as any).items : [];
  const total = Number((raw as any).total ?? items.length ?? 0);
  return { items, total };
}

export function qs(params: Record<string, any>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    sp.set(k, String(v));
  }
  return sp.toString();
}

function isValidDate(d: Date) {
  return !Number.isNaN(d.getTime());
}

export function fmtDate(s?: string) {
  if (!s) return "—";
  const d = new Date(s);
  if (!isValidDate(d)) return "—";
  return new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}
