"use client";

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Feedback, FeedbackCategory, LocalizedText } from "../types";
import { FEEDBACK_CATEGORIES } from "../constants";
import { getFeedbackCategoryKey } from "../helpers";

type UpdateFeedback = <K extends keyof Feedback>(
  key: K,
  value: Feedback[K],
) => void;

type UpdateLocalizedText = (
  field: "quote" | "meta",
  lang: keyof LocalizedText,
  value: string,
) => void;

type Props = {
  draft: Feedback;
  updateFeedback: UpdateFeedback;
  updateLocalizedText: UpdateLocalizedText;
  uploadImage: (file?: File) => Promise<void>;
};

type ImageFieldProps = Props & {
  inputRef: React.RefObject<HTMLInputElement | null>;
  fileName: string;
  pickFile: (file?: File) => Promise<void>;
};

export default function FeedbackDialogFields(props: Props) {
  return (
    <div className="feedback-dialog__grid">
      <FeedbackBaseFields {...props} />
      <FeedbackImageFields {...props} />
      <FeedbackQuoteFields {...props} />
      <FeedbackMetaFields {...props} />
    </div>
  );
}

function FeedbackBaseFields({ draft, updateFeedback }: Props) {
  return (
    <>
      <FeedbackCategoryField draft={draft} updateFeedback={updateFeedback} />
      <FeedbackSortField draft={draft} updateFeedback={updateFeedback} />
      <FeedbackAuthorField draft={draft} updateFeedback={updateFeedback} />
      <FeedbackStatusField draft={draft} updateFeedback={updateFeedback} />
    </>
  );
}

function FeedbackCategoryField({ draft, updateFeedback }: Props) {
  const { t } = useTranslation();

  return (
    <div className="field">
      <label className="dialog-label">{t("admin.feedbacks.category")}</label>
      <select
        className="input"
        value={draft.category}
        onChange={(event) =>
          updateFeedback("category", event.target.value as FeedbackCategory)
        }
      >
        {FEEDBACK_CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {t(getFeedbackCategoryKey(category))}
          </option>
        ))}
      </select>
    </div>
  );
}

function FeedbackSortField({ draft, updateFeedback }: Props) {
  const { t } = useTranslation();

  return (
    <div className="field">
      <label className="dialog-label">{t("admin.feedbacks.sortOrder")}</label>
      <input
        className="input"
        type="number"
        value={draft.sortOrder}
        onChange={(event) =>
          updateFeedback("sortOrder", Number(event.target.value || 100))
        }
      />
    </div>
  );
}

function FeedbackAuthorField({ draft, updateFeedback }: Props) {
  const { t } = useTranslation();

  return (
    <div className="field">
      <label className="dialog-label">{t("admin.feedbacks.author")}</label>
      <input
        className="input"
        value={draft.author}
        onChange={(event) => updateFeedback("author", event.target.value)}
        required
      />
    </div>
  );
}

function FeedbackStatusField({ draft, updateFeedback }: Props) {
  const { t } = useTranslation();

  return (
    <div className="field">
      <label className="dialog-label">{t("admin.feedbacks.status")}</label>
      <select
        className="input"
        value={draft.isActive ? "active" : "inactive"}
        onChange={(event) =>
          updateFeedback("isActive", event.target.value === "active")
        }
      >
        <option value="active">{t("admin.feedbacks.active")}</option>
        <option value="inactive">{t("admin.feedbacks.inactive")}</option>
      </select>
    </div>
  );
}

function FeedbackImageFields(props: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");

  async function pickFile(file?: File) {
    setFileName(file?.name || "");
    await props.uploadImage(file);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <>
      <FeedbackImageUrlField {...props} />
      <FeedbackUploadField
        {...props}
        inputRef={inputRef}
        fileName={fileName}
        pickFile={pickFile}
      />
    </>
  );
}

function FeedbackImageUrlField({ draft, updateFeedback }: Props) {
  const { t } = useTranslation();

  return (
    <div className="field field--full">
      <label className="dialog-label">{t("admin.feedbacks.imageUrl")}</label>
      <input
        className="input"
        value={draft.imageUrl}
        onChange={(event) => updateFeedback("imageUrl", event.target.value)}
      />
    </div>
  );
}

function FeedbackUploadField(props: ImageFieldProps) {
  const { t } = useTranslation();

  return (
    <div className="field field--full">
      <label className="dialog-label">{t("admin.feedbacks.imageUpload")}</label>
      <div className="feedback-dialog__file">
        <FeedbackUploadInput {...props} />
        <FeedbackUploadButton inputRef={props.inputRef} />
        <FeedbackFileName fileName={props.fileName} />
      </div>
    </div>
  );
}

function FeedbackUploadInput({ inputRef, pickFile }: ImageFieldProps) {
  return (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      hidden
      onChange={(event) => pickFile(event.target.files?.[0])}
    />
  );
}

function FeedbackUploadButton({
  inputRef,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      className="btn"
      onClick={() => inputRef.current?.click()}
    >
      {t("admin.feedbacks.chooseFile")}
    </button>
  );
}

function FeedbackFileName({ fileName }: { fileName: string }) {
  const { t } = useTranslation();
  const className = "feedback-dialog__file-name" + (!fileName ? " is-empty" : "");

  return (
    <span className={className}>
      {fileName || t("admin.feedbacks.noFileSelected")}
    </span>
  );
}

function FeedbackQuoteFields({ draft, updateLocalizedText }: Props) {
  return (
    <>
      <FeedbackTextareaField
        labelKey="admin.feedbacks.quoteDe"
        value={draft.quote.de}
        required
        onChange={(value) => updateLocalizedText("quote", "de", value)}
      />
      <FeedbackTextareaField
        labelKey="admin.feedbacks.quoteEn"
        value={draft.quote.en}
        onChange={(value) => updateLocalizedText("quote", "en", value)}
      />
      <FeedbackTextareaField
        labelKey="admin.feedbacks.quoteTr"
        value={draft.quote.tr}
        onChange={(value) => updateLocalizedText("quote", "tr", value)}
      />
    </>
  );
}

function FeedbackMetaFields({ draft, updateLocalizedText }: Props) {
  return (
    <>
      <FeedbackInputField
        labelKey="admin.feedbacks.metaDe"
        value={draft.meta.de}
        onChange={(value) => updateLocalizedText("meta", "de", value)}
      />
      <FeedbackInputField
        labelKey="admin.feedbacks.metaEn"
        value={draft.meta.en}
        onChange={(value) => updateLocalizedText("meta", "en", value)}
      />
      <FeedbackInputField
        labelKey="admin.feedbacks.metaTr"
        value={draft.meta.tr}
        onChange={(value) => updateLocalizedText("meta", "tr", value)}
      />
    </>
  );
}

function FeedbackTextareaField(props: {
  labelKey: string;
  value: string;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="field field--full">
      <label className="dialog-label">{t(props.labelKey)}</label>
      <textarea
        className="input"
        rows={3}
        value={props.value}
        required={props.required}
        onChange={(event) => props.onChange(event.target.value)}
      />
    </div>
  );
}

function FeedbackInputField(props: {
  labelKey: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="field">
      <label className="dialog-label">{t(props.labelKey)}</label>
      <input
        className="input"
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
      />
    </div>
  );
}