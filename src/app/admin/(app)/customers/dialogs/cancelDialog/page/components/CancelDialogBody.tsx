import CancelDetailsSection from "./CancelDetailsSection";
import CancelFiltersSection from "./CancelFiltersSection";
import CancelScopeSection from "./CancelScopeSection";
import CancelStatusSection from "./CancelStatusSection";
import type {
  CancelBookingsState,
  CancelMenuState,
  CancelSubmitState,
  FamilyScopeState,
  TFunc,
} from "../types";

type Props = {
  t: TFunc;
  scope: FamilyScopeState;
  menus: CancelMenuState;
  bookings: CancelBookingsState;
  submit: CancelSubmitState;
};

export default function CancelDialogBody(props: Props) {
  return (
    <div className="dialog-body cancel-dialog__body">
      <CancelScopeSection t={props.t} scope={props.scope} />
      <CancelStatusSection t={props.t} bookings={props.bookings} />
      <CancelFiltersSection
        t={props.t}
        menus={props.menus}
        bookings={props.bookings}
        submit={props.submit}
      />
      <CancelDetailsSection
        t={props.t}
        bookings={props.bookings}
        submit={props.submit}
      />
    </div>
  );
}
