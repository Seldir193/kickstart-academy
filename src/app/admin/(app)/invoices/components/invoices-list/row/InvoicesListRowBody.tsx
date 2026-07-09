import type { TFunction } from "i18next";
import type { DocItem } from "../../../utils/invoiceUi";
import type { InvoiceRow } from "../../../utils/invoiceList";
import {
  displayTitle,
  docNoFrom,
  iconForType,
  metaLine,
} from "../../../utils/invoiceUi";
import { isHandedOver } from "../invoicesListLogic";

function InvoiceRowIcon({ type }: { type: DocItem["type"] }) {
  return (
    <span aria-hidden="true" className="ks-invoices__rowIcon">
      <img src={iconForType(type)} alt="" width={18} height={18} />
    </span>
  );
}

function InvoiceRowMeta({ doc, fmtDate, t }: BodyBaseProps) {
  return (
    <div className="ks-invoices__rowLeft">
      <div className="list__title">{displayTitle(doc, t)}</div>
      <InvoiceRowMetaLine doc={doc} fmtDate={fmtDate} t={t} />
    </div>
  );
}

function InvoiceRowMetaLine({ doc, fmtDate, t }: BodyBaseProps) {
  const tip = doc.customerChildName
    ? `${t("common.admin.invoices.meta.child")}: ${doc.customerChildName}`
    : undefined;
  return (
    <div className="list__meta" data-ks-tip={tip}>
      {metaLine(doc, fmtDate, t)}
    </div>
  );
}

function InvoiceRowBadges({ doc, row, t }: BadgesProps) {
  return (
    <div className="ks-doc-select__badgeCol" aria-hidden>
      {isHandedOver(row) ? <InvoiceCollectionBadge t={t} /> : null}
      <span className="ks-doc-select__badge">
        {(docNoFrom(doc) || "").replaceAll("/", "-")}
      </span>
    </div>
  );
}

function InvoiceCollectionBadge({ t }: { t: TFunction }) {
  return (
    <span className="ks-doc-select__badge">
      {t("common.admin.invoices.badge.collection")}
    </span>
  );
}

type BodyBaseProps = {
  doc: DocItem;
  fmtDate: (iso?: string) => string;
  t: TFunction;
};

type BadgesProps = {
  doc: DocItem;
  row: InvoiceRow;
  t: TFunction;
};

type Props = BodyBaseProps & {
  row: InvoiceRow;
};

export function InvoicesListRowBody({ doc, fmtDate, row, t }: Props) {
  return (
    <div className="list__body ks-invoices__rowBody">
      <InvoiceRowIcon type={doc.type} />
      <div className="ks-invoices__rowMain">
        <InvoiceRowMeta doc={doc} fmtDate={fmtDate} t={t} />
        <InvoiceRowBadges doc={doc} row={row} t={t} />
      </div>
    </div>
  );
}
