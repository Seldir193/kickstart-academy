import type { Coach } from "../../types";
import { fullName } from "../../utils";
import PendingCoachStatusLine from "./PendingCoachStatusLine";
import { changeDate, changeText, dateLine } from "./pendingCoachText";
import type { Translate } from "./types";

type Props = {
  c: Coach;
  t: Translate;
  lang?: string;
};

export default function PendingCoachMeta({ c, t, lang }: Props) {
  const text = changeText(c, t);
  const date = changeDate(c, lang);
  const line = dateLine(c, date, t);

  return (
    <div className="pending-coaches__meta">
      <div className="pending-coaches__title">{fullName(c)}</div>
      <PendingCoachStatusLine c={c} t={t} />
      {text ? <div className="pending-coaches__sub">{text}</div> : null}
      {line ? <div className="pending-coaches__sub">{line}</div> : null}
    </div>
  );
}
