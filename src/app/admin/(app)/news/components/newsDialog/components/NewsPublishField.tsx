import type { DialogComponentProps } from "./types";

export default function NewsPublishField({ state, t }: DialogComponentProps) {
  return (
    <div className="field field--full news-dialog__publish">
      <label className="news-dialog__check">
        <input type="checkbox" checked={!!state.form.published} onChange={state.actions.togglePublished} />
        <span>{t("common.admin.news.dialog.published")}</span>
      </label>
    </div>
  );
}
