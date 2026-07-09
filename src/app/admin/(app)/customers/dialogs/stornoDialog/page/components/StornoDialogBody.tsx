import StornoDetailsSection from "./StornoDetailsSection";
import StornoFiltersSection from "./StornoFiltersSection";
import StornoScopeSection from "./StornoScopeSection";
import StornoStatusSection from "./StornoStatusSection";
import type { FamilyScopeState, StornoBookingsState, StornoMenuState, StornoSubmitState, TFunc } from "../types";

type Props = {
  t: TFunc;
  scope: FamilyScopeState;
  menus: StornoMenuState;
  bookings: StornoBookingsState;
  submit: StornoSubmitState;
};

export default function StornoDialogBody(props: Props) {
  return (
    <div className="dialog-body storno-dialog__body">
      <StornoScopeSection t={props.t} scope={props.scope} />
      <StornoStatusSection t={props.t} bookings={props.bookings} />
      <StornoFiltersSection t={props.t} menus={props.menus} bookings={props.bookings} />
      <StornoDetailsSection t={props.t} bookings={props.bookings} submit={props.submit} />
    </div>
  );
}
