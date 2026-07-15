import type { FranchiseLocation } from "../../types";
import LocationSwitch from "../LocationSwitch";
import { stop } from "../LocationsTableList.helpers";
import type { LocationToggleHandler } from "./types";

type Props = {
  item: FranchiseLocation;
  show: boolean;
  published: boolean;
  disabled: boolean;
  busy: boolean;
  onTogglePublished?: LocationToggleHandler;
};

function wrapClass(busy: boolean, disabled: boolean) {
  return `news-switch-wrap ${busy ? "is-busy" : ""} ${disabled ? "is-disabled" : ""}`;
}

export default function LocationStatusSwitch(p: Props) {
  if (!p.show || !p.onTogglePublished) return null;
  return (
    <span
      className={wrapClass(p.busy, p.disabled)}
      onClick={stop}
      onMouseDown={stop}
      onPointerDown={stop}
    >
      <LocationSwitch
        checked={p.published}
        busy={p.busy}
        disabled={p.disabled}
        onToggle={() => toggle(p)}
      />
    </span>
  );
}

function toggle(p: Props) {
  if (p.disabled) return;
  p.onTogglePublished?.(p.item, !p.published);
}
