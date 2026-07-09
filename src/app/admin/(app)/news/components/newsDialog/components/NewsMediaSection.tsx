import MediaManager from "../../MediaManager";
import type { DialogComponentProps } from "./types";

export default function NewsMediaSection({ state, t }: DialogComponentProps) {
  return (
    <div className="field field--full">
      <label className="dialog-label">{t("common.admin.news.dialog.media")}</label>
      <MediaManager
        items={state.form.media || []}
        upload={state.actions.uploadMedia}
        onChange={(media) => state.actions.update("media", media)}
      />
    </div>
  );
}
