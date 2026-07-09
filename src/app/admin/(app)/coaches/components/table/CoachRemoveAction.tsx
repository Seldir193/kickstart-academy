import type { TFunction } from "i18next";
import CoachRowActionButton from "./CoachRowActionButton";
import type { CoachRowActionProps, CoachRowMeta } from "./types";

type Props = CoachRowActionProps & { meta: CoachRowMeta; t: TFunction };

export default function CoachRemoveAction(props: Props) {
  if (props.onDelete) return <DeleteAction {...props} />;
  if (props.onUnapprove) return <UnapproveAction {...props} />;
  return null;
}

function DeleteAction({ meta, busy, onDelete, t }: Props) {
  return <CoachRowActionButton title={t("common.admin.coaches.table.delete")} icon="/icons/delete.svg" disabled={busy} onRun={() => onDelete?.(meta.raw)} />;
}

function UnapproveAction({ meta, busy, onUnapprove, t }: Props) {
  return <CoachRowActionButton title={t("common.admin.coaches.table.remove")} icon="/icons/delete.svg" disabled={busy} onRun={() => onUnapprove?.(meta.raw)} />;
}
