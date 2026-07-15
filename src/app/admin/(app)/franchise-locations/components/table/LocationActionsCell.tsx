import { stop, type Action } from "../LocationsTableList.helpers";
import LocationActionButton from "./LocationActionButton";

type Props = {
  hideActions: boolean;
  actions: Action[];
};

export default function LocationActionsCell({ hideActions, actions }: Props) {
  if (hideActions) return <HiddenActionsCell />;
  return (
    <div
      className="news-list__cell news-list__cell--action"
      onClick={stop}
      onMouseDown={stop}
      onPointerDown={stop}
    >
      {actions.map((action) => (
        <LocationActionButton key={action.key} action={action} />
      ))}
    </div>
  );
}

function HiddenActionsCell() {
  return (
    <div
      className="news-list__cell news-list__cell--action news-list__actions--hidden"
      aria-hidden="true"
    />
  );
}
