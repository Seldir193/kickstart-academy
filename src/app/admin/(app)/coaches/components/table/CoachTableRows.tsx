import type { TFunction } from "i18next";
import type { Coach } from "../../types";
import CoachTableRow from "./CoachTableRow";
import { buildCoachRowMeta } from "./coachTableDisplay";
import type { CoachTableListProps } from "./types";

type Props = CoachTableListProps & { selected: Set<string>; rowClick: (coach: Coach) => void; t: TFunction };

export default function CoachTableRows(props: Props) {
  return <ul className="list list--bleed">{props.items.map((raw) => <CoachTableRow key={rowKey(raw)} {...props} meta={buildCoachRowMeta(raw, props, isChecked(raw, props.selected))} />)}</ul>;
}

function rowKey(raw: Coach) {
  return String((raw as any).slug ?? "").trim();
}

function isChecked(raw: Coach, selected: Set<string>) {
  return selected.has(rowKey(raw));
}
