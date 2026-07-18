import type { TFunction } from "i18next";
import type { Coach } from "../../types";
import {
  CoachAuthorCell,
  CoachPositionCell,
  CoachSinceCell,
} from "./CoachBasicCells";
import CoachNameCell from "./CoachNameCell";
import CoachRowActions from "./CoachRowActions";
import CoachStatusCell from "./CoachStatusCell";
import { rowKeyDown, rowPointerDown } from "./coachTableEvents";
import type { CoachRowMeta, CoachTableListProps } from "./types";

type Props = CoachTableListProps & {
  key?: string;
  meta: CoachRowMeta;
  rowClick: (coach: Coach) => void;
  t: TFunction;
};

export default function CoachTableRow(props: Props) {
  return (
    <li
      key={props.meta.slug}
      className={rowClass(props.meta.checked)}
      onPointerDown={rowPointerDown(props.selectMode)}
      onClick={() => props.rowClick(props.meta.raw)}
      onKeyDown={rowKeyDown(props.meta.raw, props.rowClick)}
      tabIndex={0}
      role="button"
      aria-pressed={props.selectMode ? props.meta.checked : undefined}
    >
      {renderCells(props)}
    </li>
  );
}

function renderCells(props: Props) {
  return (
    <>
      <CoachNameCell coach={props.meta.displayCoach} t={props.t} />
      <CoachPositionCell coach={props.meta.displayCoach} t={props.t} />
      <CoachSinceCell coach={props.meta.displayCoach} />
      <CoachStatusCell {...props} />
      {renderAuthorCell(props)}
      <CoachRowActions {...props} />
    </>
  );
}

function renderAuthorCell(props: Props) {
  return (
    <CoachAuthorCell
      coach={props.meta.raw}
      t={props.t}
      authorDash={props.authorDash}
      meLabel={props.meLabel}
    />
  );
}

function rowClass(checked: boolean) {
  return `list__item chip coach-list__row is-fullhover is-interactive ${checked ? "is-selected" : ""}`;
}
