import type { BookDialogController } from "../types";

type Props = { controller: BookDialogController };

export default function BookDialogBookingFields({ controller }: Props) {
  return <div className="camp-grid camp-grid--top"><VoucherField controller={controller} /><SourceField controller={controller} /></div>;
}

function VoucherField({ controller }: Props) {
  return <div className="field"><label className="dialog-label">{controller.t("common.admin.customers.bookDialog.voucher")}</label><input className="input" value={controller.details.voucher} onChange={(event) => controller.details.setVoucher(event.target.value)} /></div>;
}

function SourceField({ controller }: Props) {
  return <div className="field"><label className="dialog-label">{controller.t("common.admin.customers.bookDialog.source")}</label><input className="input" value={controller.details.source} onChange={(event) => controller.details.setSource(event.target.value)} /></div>;
}
