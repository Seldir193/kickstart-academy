import { idOf } from "../LocationsTableList.helpers";
import { isMineRow } from "./locationTableState";
import LocationTableRow, {
  type LocationTableRowProps,
} from "./LocationTableRow";
import type { LocationsTableListProps, SelectionState } from "./types";

type Props = LocationsTableListProps & {
  selection: SelectionState;
  showSwitch: boolean;
  t: (key: string) => string;
  lang?: string;
};

export default function LocationsRows(p: Props) {
  const showHint = !isMineRow(p.rowMode);
  return (
    <ul className="list list--bleed">
      {p.items.map((item) => renderRow(p, item, showHint))}
    </ul>
  );
}

function renderRow(p: Props, item: Props["items"][number], showHint: boolean) {
  return <LocationTableRow key={idOf(item)} {...rowProps(p, item, showHint)} />;
}

function rowProps(
  p: Props,
  item: Props["items"][number],
  showHint: boolean,
): LocationTableRowProps {
  return {
    item,
    ...rowStateProps(p, item, showHint),
    ...rowContextProps(p),
    ...rowCallbacks(p),
  };
}

function rowStateProps(
  p: Props,
  item: Props["items"][number],
  showHint: boolean,
) {
  return {
    busy: p.busy,
    selectMode: p.selectMode,
    selected: p.selection.selected.has(idOf(item)),
    showHint,
  };
}

function rowContextProps(p: Props) {
  return {
    rowMode: p.rowMode,
    showSwitch: p.showSwitch,
    publishedBusyId: p.publishedBusyId,
    selection: p.selection,
    t: p.t,
    lang: p.lang,
  };
}

function rowCallbacks(p: Props) {
  return {
    onOpen: p.onOpen,
    onInfo: p.onInfo,
    onResubmit: p.onResubmit,
    onSubmitForReview: p.onSubmitForReview,
    onAskReject: p.onAskReject,
    onDeleteOne: p.onDeleteOne,
    onTogglePublished: p.onTogglePublished,
  };
}
