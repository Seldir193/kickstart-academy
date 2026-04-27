"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { FormEvent } from "react";
import type { Feedback, FeedbackCategory, LocalizedText } from "../types";
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
  const { t } = useTranslation();
  const { mode, item, busy, onClose, onSave, onUpload } = props;
  const [draft, setDraft] = useState<Feedback>(() => cloneFeedback(item));

  function updateFeedback<K extends keyof Feedback>(
    key: K,
    value: Feedback[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
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
  }

  async function uploadImage(file?: File) {
    if (!file) return;
    updateFeedback("imageUrl", await onUpload(file));
  }

  async function submitForm(event: FormEvent) {
    event.preventDefault();
    await onSave(draft);
  }

  return (
    <div className="dialog-backdrop feedback-dialog" role="dialog" aria-modal="true">
      <button
        type="button"
        className="dialog-backdrop-hit feedback-dialog__backdrop-hit"
        aria-label={t("common.close")}
        onClick={onClose}
      />

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
        <FeedbackDialogFooter busy={busy} mode={mode} />
      </form>
    </div>
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
}) {
  const { t } = useTranslation();
  const { busy, mode } = props;

  return (
    <div className="dialog-footer feedback-dialog__footer">
      <button className="btn" disabled={busy} type="submit">
        {busy
          ? t("admin.feedbacks.saving")
          : mode === "create"
            ? t("admin.feedbacks.create")
            : t("admin.feedbacks.save")}
      </button>
    </div>
  );
}