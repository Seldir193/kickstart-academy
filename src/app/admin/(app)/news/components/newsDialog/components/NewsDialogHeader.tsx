import type { DialogHeaderProps } from "./types";

export default function NewsDialogHeader({
  props,
  state,
  t,
}: DialogHeaderProps) {
  return (
    <div className="dialog-head news-dialog__head">
      <div className="news-dialog__head-left">
        <NewsDialogTitle props={props} state={state} t={t} />
        <div className="dialog-subtitle news-dialog__subtitle">
          {t("common.admin.news.dialog.subtitle")}
        </div>
        <NewsDialogTitleActions props={props} state={state} t={t} />
      </div>
      <NewsDialogCloseButton props={props} t={t} />
    </div>
  );
}

function NewsDialogTitle({ props, state, t }: DialogHeaderProps) {
  return (
    <div className="dialog-title news-dialog__title">
      {props.mode === "create"
        ? t("common.admin.news.dialog.newArticle")
        : state.form.title || t("common.admin.news.dialog.article")}
    </div>
  );
}

function NewsDialogTitleActions({ props, state, t }: DialogHeaderProps) {
  return (
    <div className="news-dialog__title-actions">
      <span className="dialog-status dialog-status--neutral">
        {props.mode === "create"
          ? t("common.admin.news.dialog.new")
          : t("common.admin.news.dialog.edit")}
      </span>
      <PreviewLink props={props} state={state} t={t} />
    </div>
  );
}

function PreviewLink({ props, state, t }: DialogHeaderProps) {
  if (props.mode !== "edit" || !state.previewUrl) return null;
  return (
    <a className="btn" href={state.previewUrl} target="_blank" rel="noreferrer">
      {t("common.admin.news.dialog.preview")}
    </a>
  );
}

function NewsDialogCloseButton({
  props,
  t,
}: Pick<DialogHeaderProps, "props" | "t">) {
  return (
    <div className="news-dialog__head-right">
      <div className="dialog-head__actions">
        <button
          type="button"
          className="dialog-close modal__close"
          aria-label={t("common.close")}
          onClick={props.onClose}
        >
          <img
            src="/icons/close.svg"
            alt=""
            aria-hidden="true"
            className="icon-img"
          />
        </button>
      </div>
    </div>
  );
}
