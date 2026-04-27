import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { FormEvent } from "react";
import type { Feedback, FeedbackCategory, LocalizedText } from "../types";
import type { FeedbackDialogMode } from "../useFeedbacksPage";

import { cloneFeedback} from "../helpers";

import { BaseFields, ImageFields } from "./FeedbackDialogFields";
import {
  DialogFooter,
  MetaFields,
  QuoteFields,
} from "./FeedbackDialogTextFields";

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

  function setValue<K extends keyof Feedback>(key: K, value: Feedback[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function setLocalized(field: "quote" | "meta", lang: keyof LocalizedText, value: string) {
    setDraft((current) => ({
      ...current,
      [field]: { ...current[field], [lang]: value },
    }));
  }

  async function handleUpload(file?: File) {
    if (!file) return;
    setValue("imageUrl", await onUpload(file));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    await onSave(draft);
  }

  return (
    <div className="dialog-backdrop" role="presentation">
      <button className="dialog-backdrop-hit" type="button" aria-label={t("admin.feedbacks.cancel")} onClick={onClose} />
      <form className="dialog feedback-dialog" onSubmit={submit}>
        <DialogHead mode={mode} onClose={onClose} />
        <div className="dialog-body">
          <div className="feedback-dialog__stack">
            <BaseFields draft={draft} setValue={setValue} />
            <ImageFields draft={draft} setValue={setValue} onUpload={handleUpload} />
            <QuoteFields draft={draft} setLocalized={setLocalized} />
            <MetaFields draft={draft} setLocalized={setLocalized} />
          </div>
        </div>
        <DialogFooter busy={busy} onClose={onClose} />
      </form>
    </div>
  );
}

function DialogHead({ mode, onClose }: { mode: FeedbackDialogMode; onClose: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="dialog-head">
      <div>
        <h2 className="dialog-title">{mode === "create" ? t("admin.feedbacks.create") : t("admin.feedbacks.edit")}</h2>
        <p className="dialog-subtitle">{t("admin.feedbacks.subtitle")}</p>
      </div>
      <div className="dialog-head__actions">
        <button className="dialog-close" type="button" onClick={onClose}>×</button>
      </div>
    </div>
  );
}