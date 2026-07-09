import type { KeyboardEvent, PointerEvent } from "react";
import type { RowProps } from "./rowTypes";
import { idOf } from "../lib/ids";
import { NewsTitleCell } from "./NewsTitleCell";
import { NewsCategoryCell } from "./NewsCategoryCell";
import { NewsDateCell } from "./NewsDateCell";
import { NewsStatusCell } from "./NewsStatusCell";
import { NewsAuthorCell } from "./NewsAuthorCell";
import { NewsActionCell } from "./NewsActionCell";


export function NewsTableRow(row: RowProps) {
  const model = rowModel(row);
  return <li {...rowAttrs(row, model)}><NewsTitleCell item={row.item} t={row.t} /><NewsCategoryCell item={row.item} t={row.t} /><NewsDateCell item={row.item} t={row.t} lang={row.lang} /><NewsStatusCell item={row.item} props={row.props} t={row.t} showSwitch={row.showSwitch} id={model.id} /><NewsAuthorCell item={row.item} /><NewsActionCell row={row} hideActions={model.hideActions} /></li>;
}

function rowModel({ item, state, props }: RowProps) {
  const id = idOf(item);
  const checked = state.selection.selected.has(id);
  return { id, checked, hideActions: props.selectMode || checked };
}

function rowAttrs(row: RowProps, model: ReturnType<typeof rowModel>) {
  return {
    className: rowClass(model.checked),
    onPointerDown: (event: PointerEvent) => onRowPointerDown(event, row.props.selectMode),
    onClick: () => rowClick(row, model.id),
    onKeyDown: (event: KeyboardEvent) => onRowKey(event, row, model.id),
    tabIndex: 0,
    role: "button",
    "aria-pressed": row.props.selectMode ? model.checked : undefined,
  };
}

function rowClick({ item, props, state }: RowProps, id: string) {
  if (!id) return;
  if (props.selectMode) return void state.selection.toggleOne(id);
  props.onOpen(item);
}

function onRowKey(event: KeyboardEvent, row: RowProps, id: string) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  rowClick(row, id);
}

function onRowPointerDown(event: PointerEvent, selectMode: boolean) {
  if (selectMode) event.preventDefault();
}

function rowClass(checked: boolean) {
  return `list__item chip news-list__row is-fullhover is-interactive ${checked ? "is-selected" : ""}`;
}
