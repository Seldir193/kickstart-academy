import type { DialogHeaderProps } from "./types";

export default function NewsDialogFooter({
  props,
  state,
  t,
}: DialogHeaderProps) {
  return (
    <div className="dialog-footer news-dialog__footer">
      <button
        className="btn"
        onClick={state.actions.saveNow}
        disabled={state.busy}
        type="button"
      >
        {buttonLabel(props.mode, state.busy, t)}
      </button>
    </div>
  );
}

function buttonLabel(
  mode: DialogHeaderProps["props"]["mode"],
  busy: boolean,
  t: DialogHeaderProps["t"],
) {
  if (busy) return t("common.admin.news.dialog.saving");
  return mode === "create"
    ? t("common.admin.news.dialog.create")
    : t("common.admin.news.dialog.save");
}
