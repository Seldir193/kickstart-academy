import type { ChangeEvent } from "react";
import type { DialogComponentProps } from "./types";

export default function NewsCoverFields({ state, t }: DialogComponentProps) {
  return (
    <>
      <CoverUrlField state={state} t={t} />
      <CoverUploadField state={state} t={t} />
    </>
  );
}

function CoverUrlField({ state, t }: DialogComponentProps) {
  return (
    <div className="field field--full">
      <label className="dialog-label">
        {t("common.admin.news.dialog.coverImageUrl")}
      </label>
      <input
        className="input"
        value={state.form.coverImage || ""}
        onChange={(event) =>
          state.actions.update("coverImage", event.target.value)
        }
        placeholder={t("common.admin.news.dialog.coverImagePlaceholder")}
      />
    </div>
  );
}

function CoverUploadField({ state, t }: DialogComponentProps) {
  return (
    <div className="field field--full">
      <label className="dialog-label">
        {t("common.admin.news.dialog.uploadCover")}
      </label>
      <div className="news-dialog__file">
        <CoverFileInput state={state} />
        <CoverFileButton state={state} t={t} />
        <CoverFileName state={state} t={t} />
      </div>
    </div>
  );
}

function CoverFileInput({ state }: Pick<DialogComponentProps, "state">) {
  return (
    <input
      ref={state.coverRef}
      type="file"
      accept="image/*"
      hidden
      onChange={(event) => handleCoverChange(state, event)}
    />
  );
}

function CoverFileButton({ state, t }: DialogComponentProps) {
  return (
    <button
      type="button"
      className="btn"
      onClick={() => state.coverRef.current?.click()}
    >
      {t("common.admin.news.dialog.chooseFile")}
    </button>
  );
}

function CoverFileName({ state, t }: DialogComponentProps) {
  return (
    <span className={fileClassName(state.coverFileName)}>
      {state.coverFileName || t("common.admin.news.dialog.noFileSelected")}
    </span>
  );
}

function fileClassName(fileName: string) {
  return "news-dialog__file-name" + (!fileName ? " is-empty" : "");
}

function handleCoverChange(
  state: DialogComponentProps["state"],
  event: ChangeEvent<HTMLInputElement>,
) {
  const file = event.target.files?.[0];
  state.actions.updateCoverFileName(file?.name || "");
  state.actions.uploadCover(file);
}
