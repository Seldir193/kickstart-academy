import type { TFunction } from "i18next";
import type { DocItem } from "../../../utils/invoiceUi";
import type { InvoiceRow } from "../../../utils/invoiceList";

export type InvoicesListRowProps = {
  d: DocItem;
  idx: number;
  total: number;
  openPdf: (d: DocItem) => void;
  fmtDate: (iso?: string) => string;
  rowBusyId?: string;
  onMarkPaid?: (row: InvoiceRow) => void;
  onOpenReturned?: (row: InvoiceRow) => void;
  onOpenDunning?: (row: InvoiceRow) => void;
  onQuickSendDoc?: (row: InvoiceRow) => void;
  onVoidDunning?: (row: InvoiceRow) => void;
  onMarkCollection?: (row: InvoiceRow) => void;
  onOpenRefund?: (row: InvoiceRow) => void;
  onOpenWithdraw?: (row: InvoiceRow) => void;
};

export type InvoiceRowState = {
  row: InvoiceRow;
  isCreditNote: boolean;
  busy: boolean;
  paymentDisabled: boolean;
  quickAllowed: boolean;
  showCollection: boolean;
  refundAllowed: boolean;
  withdrawAllowed: boolean;
  sendDisabled: boolean;
  sendTitle: string;
};

export type InvoiceRowAction = {
  key: string;
  icon: string;
  label: string;
  title: string;
  disabled?: boolean;
  ariaDisabled?: boolean;
  hidden?: boolean;
  tabIndex?: number;
  blocked?: boolean;
  onClick?: () => void;
  guard?: () => boolean;
};

export type InvoiceRowActionFactoryArgs = {
  props: InvoicesListRowProps;
  state: InvoiceRowState;
  t: TFunction;
};
