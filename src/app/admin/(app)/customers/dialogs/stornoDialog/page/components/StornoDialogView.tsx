import type React from "react";
import StornoDialogBody from "./StornoDialogBody";
import StornoDialogFooter from "./StornoDialogFooter";
import StornoDialogHeader from "./StornoDialogHeader";
import type { FamilyScopeState, StornoBookingsState, StornoDialogProps, StornoMenuState, StornoSubmitState, TFunc } from "../types";

type Props = StornoDialogProps & {
  t: TFunc;
  scope: FamilyScopeState;
  menus: StornoMenuState;
  bookings: StornoBookingsState;
  submit: StornoSubmitState;
};

export default function StornoDialogView(props: Props) {
  return (
    <div className="dialog-backdrop storno-dialog" role="dialog" aria-modal="true" aria-labelledby="storno-dialog-title">
      <button type="button" className="dialog-backdrop-hit" aria-label={props.t("common.admin.customers.stornoDialog.close")} onClick={props.onClose} />
      <StornoDialogPanel {...props} />
    </div>
  );
}

function StornoDialogPanel(props: Props) {
  return (
    <div className="dialog storno-dialog__dialog" onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
      <StornoDialogHeader t={props.t} onClose={props.onClose} />
      <StornoDialogBody t={props.t} scope={props.scope} menus={props.menus} bookings={props.bookings} submit={props.submit} />
      <StornoDialogFooter t={props.t} submit={props.submit} />
    </div>
  );
}
