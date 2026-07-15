import type React from "react";
import CancelDialogBody from "./CancelDialogBody";
import CancelDialogFooter from "./CancelDialogFooter";
import CancelDialogHeader from "./CancelDialogHeader";
import type {
  CancelBookingsState,
  CancelDialogProps,
  CancelMenuState,
  CancelSubmitState,
  FamilyScopeState,
  TFunc,
} from "../types";

type Props = CancelDialogProps & {
  t: TFunc;
  scope: FamilyScopeState;
  menus: CancelMenuState;
  bookings: CancelBookingsState;
  submit: CancelSubmitState;
};

export default function CancelDialogView(props: Props) {
  return (
    <div
      className="dialog-backdrop cancel-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-dialog-title"
    >
      <button
        type="button"
        className="dialog-backdrop-hit"
        aria-label={props.t("common.actions.close")}
        onClick={props.onClose}
      />
      <CancelDialogPanel {...props} />
    </div>
  );
}

function CancelDialogPanel(props: Props) {
  return (
    <div
      className="dialog cancel-dialog__dialog"
      onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
    >
      <CancelDialogHeader t={props.t} onClose={props.onClose} />
      <CancelDialogBody
        t={props.t}
        scope={props.scope}
        menus={props.menus}
        bookings={props.bookings}
        submit={props.submit}
      />
      <CancelDialogFooter t={props.t} submit={props.submit} />
    </div>
  );
}
