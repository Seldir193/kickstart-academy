import type { TFunction } from "i18next";
import CoachRemoveAction from "./CoachRemoveAction";
import CoachReviewAction from "./CoachReviewAction";
import CoachRowActionButton from "./CoachRowActionButton";
import { stopEvent } from "./coachTableEvents";
import type { CoachRowActionProps, CoachRowMeta } from "./types";

type Props = CoachRowActionProps & { meta: CoachRowMeta; t: TFunction };

export default function CoachRowActions(props: Props) {
  if (props.meta.hideActions) return <HiddenActions />;
  return (
    <div
      className="coach-list__cell coach-list__cell--action"
      onClick={stopEvent}
      onMouseDown={stopEvent}
    >
      <EditAction {...props} />
      <InfoAction {...props} />
      <CoachReviewAction {...props} />
      <CoachRemoveAction {...props} />
    </div>
  );
}

function HiddenActions() {
  return (
    <div
      className="coach-list__cell coach-list__cell--action coach-list__actions--hidden"
      aria-hidden="true"
    />
  );
}

function EditAction({ meta, busy, onOpen, t }: Props) {
  return (
    <CoachRowActionButton
      title={t("common.admin.coaches.table.edit")}
      icon="/icons/edit.svg"
      disabled={busy}
      onRun={() => onOpen(meta.raw)}
    />
  );
}

function InfoAction({ meta, busy, onInfo, t }: Props) {
  if (!onInfo) return null;
  return (
    <CoachRowActionButton
      title={t("common.admin.coaches.table.info")}
      icon="/icons/info.svg"
      disabled={busy}
      onRun={() => onInfo(meta.raw)}
    />
  );
}
