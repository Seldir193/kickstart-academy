"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { FormEvent, MouseEvent } from "react";
import type { Feedback, LocalizedText } from "../types";
import type { FeedbackDialogMode } from "../useFeedbacksPage";
import { cloneFeedback } from "../helpers";
import FeedbackDialogFields from "./FeedbackDialogFields";

type Props = {
  mode: FeedbackDialogMode;
  item: Feedback;
  busy: boolean;
  onClose: () => void;
  onSave: (item: Feedback) => Promise<void>;
  onUpload: (file: File) => Promise<string>;
};

export default function FeedbackDialog(props: Props) {
  const { mode, item, busy, onClose, onSave, onUpload } = props;
  const [draft, setDraft] = useState<Feedback>(() => cloneFeedback(item));
  const [formError, setFormError] = useState("");

  function updateFeedback<K extends keyof Feedback>(
    key: K,
    value: Feedback[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
    setFormError("");
  }

  function updateLocalizedText(
    field: "quote" | "meta",
    lang: keyof LocalizedText,
    value: string,
  ) {
    setDraft((current) => ({
      ...current,
      [field]: { ...current[field], [lang]: value },
    }));
    setFormError("");
  }

  async function uploadImage(file?: File) {
    if (!file) return;
    updateFeedback("imageUrl", await onUpload(file));
  }

  async function submitForm(event: FormEvent) {
    event.preventDefault();
    setFormError("");

    try {
      await onSave(draft);
    } catch (error) {
      setFormError(getSubmitError(error));
    }
  }

  return (
    <div
      className="dialog-backdrop feedback-dialog"
      role="dialog"
      aria-modal="true"
    >
      <FeedbackDialogBackdrop onClose={onClose} />

      <form className="dialog feedback-dialog__dialog" onSubmit={submitForm}>
        <FeedbackDialogHead mode={mode} onClose={onClose} />

        <div className="dialog-body feedback-dialog__body">
          <FeedbackDialogFields
            draft={draft}
            updateFeedback={updateFeedback}
            updateLocalizedText={updateLocalizedText}
            uploadImage={uploadImage}
          />
        </div>

        <FeedbackDialogFooter busy={busy} mode={mode} error={formError} />
      </form>
    </div>
  );
}

function FeedbackDialogBackdrop({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      className="dialog-backdrop-hit feedback-dialog__backdrop-hit"
      aria-label={t("common.close")}
      onClick={onClose}
    />
  );
}

function FeedbackDialogHead(props: {
  mode: FeedbackDialogMode;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { mode, onClose } = props;

  return (
    <div className="dialog-head feedback-dialog__head">
      <div className="feedback-dialog__head-left">
        <div className="dialog-title feedback-dialog__title">
          {mode === "create"
            ? t("admin.feedbacks.create")
            : t("admin.feedbacks.edit")}
        </div>
        <div className="dialog-subtitle feedback-dialog__subtitle">
          {t("admin.feedbacks.subtitle")}
        </div>
      </div>

      <div className="feedback-dialog__head-right">
        <div className="dialog-head__actions">
          <button
            type="button"
            className="dialog-close modal__close"
            aria-label={t("common.close")}
            onClick={onClose}
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
    </div>
  );
}

function FeedbackDialogFooter(props: {
  busy: boolean;
  mode: FeedbackDialogMode;
  error: string;
}) {
  const { t } = useTranslation();
  const { busy, mode, error } = props;
  const buttonLabel = getSubmitButtonLabel(t, busy, mode);

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (!busy) return;
    event.preventDefault();
  }

  return (
    <div className="dialog-footer feedback-dialog__footer">
      {error ? (
        <p className="error feedback-dialog__message" role="alert">
          {error}
        </p>
      ) : null}

      <button
        className="btn"
        type="submit"
        aria-disabled={busy}
        onClick={handleClick}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

function getSubmitError(error: unknown) {
  if (error instanceof Error) return error.message;
  return "";
}

function getSubmitButtonLabel(
  t: (key: string) => string,
  busy: boolean,
  mode: FeedbackDialogMode,
) {
  if (busy) return t("admin.feedbacks.saving");
  if (mode === "create") return t("admin.feedbacks.create");
  return t("admin.feedbacks.save");
}
