import type { TFunction } from "i18next";
import type { Coach } from "../../types";
import { displaySince } from "../../utils";
import { authorText, positionLabel } from "./coachTableDisplay";

type PositionProps = { coach: Coach; t: TFunction };
type AuthorProps = PositionProps & { authorDash?: boolean; meLabel?: string };

export function CoachPositionCell({ coach, t }: PositionProps) {
  return <div className="coach-list__cell coach-list__cell--pos"><span className="coach-list__pill">{positionLabel(coach, t)}</span></div>;
}

export function CoachSinceCell({ coach }: { coach: Coach }) {
  return <div className="coach-list__cell coach-list__cell--since">{displaySince(coach)}</div>;
}

export function CoachAuthorCell(props: AuthorProps) {
  return <div className="coach-list__cell coach-list__cell--author">{authorText(props.coach, props.t, props.authorDash, props.meLabel)}</div>;
}
