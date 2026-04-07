// //src\app\admin\(app)\customers\dialogs\documentsDialog\types.ts
export type DocType =
  | "participation"
  | "cancellation"
  | "storno"
  | "dunning"
  | "contract"
  | "creditnote"
  | string;

export type SortOrder = "newest" | "oldest";

export type DocItem = {
  id: string;
  bookingId: string;
  customerId?: string;
  type: DocType;
  title: string;
  issuedAt?: string;
  href: string;
  status?: string;
  offerTitle?: string;
  offerType?: string;
  invoiceNumber?: string;
  invoiceNo?: string;
  creditNoteNo?: string;
  cancellationNo?: string;
  stornoNo?: string;
  stornoNumber?: string;
  customerNumber?: number | string;
  stage?: string;
  subject?: string;
  fileName?: string;
  dueAt?: string;
  amount?: number;
  currency?: string;
};

export type ListResponse = {
  ok: boolean;
  items: DocItem[];
  total: number;
  page: number;
  limit: number;
};
