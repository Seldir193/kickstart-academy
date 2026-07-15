import type { TFunction } from "i18next";
import CoachRowActionButton from "./CoachRowActionButton";
import type { CoachRowMeta, CoachRowActionProps } from "./types";

type Props = CoachRowActionProps & { meta: CoachRowMeta; t: TFunction };

export default function CoachReviewAction(props: Props) {
  if (props.meta.showSubmit) return <SubmitAction {...props} />;
  if (props.onReject) return <RejectAction {...props} />;
  return null;
}

function SubmitAction({ meta, onResubmit, t }: Props) {
  return (
    <CoachRowActionButton
      title={t("common.admin.coaches.table.submitForReview")}
      icon="/icons/arrow_right_alt.svg"
      iconClassName="icon-img icon-img--left"
      disabled={meta.submitDisabled}
      tip={submitTip(meta, t)}
      onRun={() => onResubmit?.(meta.raw)}
    />
  );
}

function submitTip(meta: CoachRowMeta, t: TFunction) {
  return meta.submitDisabled
    ? t("common.admin.coaches.table.updateFirst")
    : undefined;
}

function RejectAction({ meta, busy, onReject, t }: Props) {
  return (
    <CoachRowActionButton
      title={t("common.admin.coaches.table.reject")}
      icon="/icons/arrow_right_alt.svg"
      iconClassName="icon-img icon-img--left"
      disabled={busy}
      onRun={() => onReject?.(meta.raw)}
    />
  );
}
