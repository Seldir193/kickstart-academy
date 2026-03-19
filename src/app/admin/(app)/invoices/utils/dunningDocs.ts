// src/app/admin/(app)/invoices/utils/dunningDocs.ts
export type DunningDocApiItem = {
  _id: string;
  kind: "dunning";
  stage?: string;
  fileName?: string;
  bookingId?: string;
  customerId?: string;
  customerNo?: string;
  invoiceNo?: string;
  invoiceDate?: string;
  offerTitle?: string;
  subject?: string;
  sentAt?: string;
  dueAt?: string;
  createdAt?: string;
  feesSnapshot?: {
    returnBankFee?: number;
    dunningFee?: number;
    processingFee?: number;
    totalExtraFees?: number;
    currency?: string;
  };
  voidedAt?: string | null;
};

export function dunningStageLabel(stage?: string | null) {
  if (stage === "reminder") return "Zahlungserinnerung";
  if (stage === "dunning1") return "1. Mahnung";
  if (stage === "dunning2") return "2. Mahnung";
  if (stage === "final") return "Letzte Mahnung";
  return "Mahnung";
}

export function mapDunningDocToRow(item: DunningDocApiItem) {
  const id = `dunning:${String(item._id || "")}`;
  const title =
    String(item.subject || "").trim() || dunningStageLabel(item.stage);

  return {
    id,
    type: "dunning",
    title,
    issuedAt: item.sentAt || item.createdAt || "",
    bookingId: item.bookingId || "",
    customerId: item.customerId || "",
    customerNumber: item.customerNo || "",
    invoiceNo: item.invoiceNo || "",
    offerTitle: item.offerTitle || "",
    customerName: "",
    customerChildName: "",
    href: `/api/admin/invoices/dunning-documents/${encodeURIComponent(
      String(item._id || ""),
    )}/download`,
    paymentStatus: "open",
    dunningCount: 0,
    lastDunningStage: item.stage || null,
    lastDunningSentAt: item.sentAt || null,
    nextDunningStage: item.stage === "final" ? "final" : null,
    voidedAt: item.voidedAt || null,
  };
}
