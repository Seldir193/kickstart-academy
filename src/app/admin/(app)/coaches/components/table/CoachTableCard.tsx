import type { TFunction } from "i18next";
import type { Coach } from "../../types";
import CoachTableHeader from "./CoachTableHeader";
import CoachTableRows from "./CoachTableRows";
import type { CoachTableListProps } from "./types";

type Props = CoachTableListProps & { selected: Set<string>; rowClick: (coach: Coach) => void; t: TFunction };

export default function CoachTableCard(props: Props) {
  return <section className="card coach-list"><div className="coach-list__table"><CoachTableHeader t={props.t} /><CoachTableRows {...props} /></div></section>;
}
