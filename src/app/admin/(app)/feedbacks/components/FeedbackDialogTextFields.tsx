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

export default function FeedbackDialogFields(props: Props) {
  return (
    <div className="feedback-dialog__grid">
      <BaseFields {...props} />
      <ImageFields {...props} />
      <QuoteFields {...props} />
      <MetaFields {...props} />
    </div>
  );
}

function BaseFields({ draft, updateFeedback }: Props) {
  const { t } = useTranslation();

  return (
    <>
      <div className="field">
        <label className="dialog-label">{t("admin.feedbacks.category")}</label>
        <select
          className="input"
          value={draft.category}
          onChange={(e) =>
            updateFeedback("category", e.target.value as FeedbackCategory)
          }
        >
          {FEEDBACK_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {t(getFeedbackCategoryKey(category))}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label className="dialog-label">{t("admin.feedbacks.sortOrder")}</label>
        <input
          className="input"
          type="number"
          value={draft.sortOrder}
          onChange={(e) =>
            updateFeedback("sortOrder", Number(e.target.value || 100))
          }
        />
      </div>

      <div className="field">
        <label className="dialog-label">{t("admin.feedbacks.author")}</label>
        <input
          className="input"
          value={draft.author}
          onChange={(e) => updateFeedback("author", e.target.value)}
          required
        />
      </div>

      <div className="field">
        <label className="dialog-label">{t("admin.feedbacks.status")}</label>
        <select
          className="input"
          value={draft.isActive ? "active" : "inactive"}
          onChange={(e) =>
            updateFeedback("isActive", e.target.value === "active")
          }
        >
          <option value="active">{t("admin.feedbacks.active")}</option>
          <option value="inactive">{t("admin.feedbacks.inactive")}</option>
        </select>
      </div>
    </>
  );
}

function ImageFields({ draft, updateFeedback, uploadImage }: Props) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");

  async function pickFile(file?: File) {
    setFileName(file?.name || "");
    await uploadImage(file);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <>
      <div className="field field--full">
        <label className="dialog-label">{t("admin.feedbacks.imageUrl")}</label>
        <input
          className="input"
          value={draft.imageUrl}
          onChange={(e) => updateFeedback("imageUrl", e.target.value)}
        />
      </div>

      <div className="field field--full">
        <label className="dialog-label">{t("admin.feedbacks.imageUpload")}</label>
        <div className="feedback-dialog__file">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => pickFile(e.target.files?.[0])}
          />
          <button
            type="button"
            className="btn"
            onClick={() => inputRef.current?.click()}
          >
            {t("admin.feedbacks.chooseFile")}
          </button>
          <span className={!fileName ? "is-empty" : ""}>
            {fileName || t("admin.feedbacks.noFileSelected")}
          </span>
        </div>
      </div>
    </>
  );
}

function QuoteFields({ draft, updateLocalizedText }: Props) {
  const { t } = useTranslation();

  return (
    <>
      <TextAreaField
        label={t("admin.feedbacks.quoteDe")}
        value={draft.quote.de}
        onChange={(value) => updateLocalizedText("quote", "de", value)}
        required
      />
      <TextAreaField
        label={t("admin.feedbacks.quoteEn")}
        value={draft.quote.en}
        onChange={(value) => updateLocalizedText("quote", "en", value)}
      />
      <TextAreaField
        label={t("admin.feedbacks.quoteTr")}
        value={draft.quote.tr}
        onChange={(value) => updateLocalizedText("quote", "tr", value)}
      />
    </>
  );
}

function MetaFields({ draft, updateLocalizedText }: Props) {
  const { t } = useTranslation();

  return (
    <>
      <InputField
        label={t("admin.feedbacks.metaDe")}
        value={draft.meta.de}
        onChange={(value) => updateLocalizedText("meta", "de", value)}
      />
      <InputField
        label={t("admin.feedbacks.metaEn")}
        value={draft.meta.en}
        onChange={(value) => updateLocalizedText("meta", "en", value)}
      />
      <InputField
        label={t("admin.feedbacks.metaTr")}
        value={draft.meta.tr}
        onChange={(value) => updateLocalizedText("meta", "tr", value)}
      />
    </>
  );
}

function TextAreaField(props: {
  label: string;
  value: string;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="field field--full">
      <label className="dialog-label">{props.label}</label>
      <textarea
        className="input"
        rows={3}
        value={props.value}
        required={props.required}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </div>
  );
}

function InputField(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="field">
      <label className="dialog-label">{props.label}</label>
      <input
        className="input"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </div>
  );
}