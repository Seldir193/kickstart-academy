"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
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

type UploadProps = {
  inputRef: RefObject<HTMLInputElement | null>;
  fileName: string;
  onPickFile: (file?: File) => Promise<void>;
};

function categoryLabel(category: FeedbackCategory, t: (key: string) => string) {
  return t(getFeedbackCategoryKey(category));
}

function statusLabel(active: boolean, t: (key: string) => string) {
  return active ? t("admin.feedbacks.active") : t("admin.feedbacks.inactive");
}

function useCloseOnOutsideClick(
  ref: RefObject<HTMLDivElement | null>,
  close: () => void,
) {
  useEffect(() => {
    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (!ref.current?.contains(event.target as Node)) close();
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [ref, close]);
}

export default function FeedbackDialogFields(props: Props) {
  return (
    <div className="feedback-dialog__grid">
      <FeedbackCategoryField {...props} />
      <FeedbackSortField {...props} />
      <FeedbackAuthorField {...props} />
      <FeedbackStatusField {...props} />
      <FeedbackImageUrlField {...props} />
      <FeedbackUploadField uploadImage={props.uploadImage} />
      <FeedbackQuoteFields {...props} />
      <FeedbackMetaFields {...props} />
    </div>
  );
}

function FeedbackCategoryField({ draft, updateFeedback }: Props) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useCloseOnOutsideClick(dropdownRef, () => setIsOpen(false));

  function pickCategory(category: FeedbackCategory) {
    updateFeedback("category", category);
    setIsOpen(false);
  }

  return (
    <div className="field">
      <label className="dialog-label">{t("admin.feedbacks.category")}</label>
      <div
        ref={dropdownRef}
        className={"ks-selectbox" + (isOpen ? " ks-selectbox--open" : "")}
      >
        <button
          type="button"
          className="ks-selectbox__trigger"
          onClick={() => setIsOpen((open) => !open)}
        >
          <span className="ks-selectbox__label">
            {categoryLabel(draft.category, t)}
          </span>
          <span className="ks-selectbox__chevron" aria-hidden="true" />
        </button>

        {isOpen ? (
          <div className="ks-selectbox__panel">
            {FEEDBACK_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                className={
                  "ks-selectbox__option" +
                  (draft.category === category
                    ? " ks-selectbox__option--active"
                    : "")
                }
                onClick={() => pickCategory(category)}
              >
                {categoryLabel(category, t)}
              </button>
            ))}
          </div>
        ) : null}
      </div>
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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useCloseOnOutsideClick(dropdownRef, () => setIsOpen(false));

  function pickStatus(nextActive: boolean) {
    updateFeedback("isActive", nextActive);
    setIsOpen(false);
  }

  return (
    <div className="field">
      <label className="dialog-label">{t("admin.feedbacks.status")}</label>
      <div
        ref={dropdownRef}
        className={"ks-selectbox" + (isOpen ? " ks-selectbox--open" : "")}
      >
        <button
          type="button"
          className="ks-selectbox__trigger"
          onClick={() => setIsOpen((open) => !open)}
        >
          <span className="ks-selectbox__label">
            {statusLabel(draft.isActive, t)}
          </span>
          <span className="ks-selectbox__chevron" aria-hidden="true" />
        </button>

        {isOpen ? (
          <div className="ks-selectbox__panel">
            <button
              type="button"
              className={
                "ks-selectbox__option" +
                (draft.isActive ? " ks-selectbox__option--active" : "")
              }
              onClick={() => pickStatus(true)}
            >
              {t("admin.feedbacks.active")}
            </button>

            <button
              type="button"
              className={
                "ks-selectbox__option" +
                (!draft.isActive ? " ks-selectbox__option--active" : "")
              }
              onClick={() => pickStatus(false)}
            >
              {t("admin.feedbacks.inactive")}
            </button>
          </div>
        ) : null}
      </div>
    </div>
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

function FeedbackUploadField({
  uploadImage,
}: {
  uploadImage: (file?: File) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");

  async function pickFile(file?: File) {
    setFileName(file?.name || "");
    await uploadImage(file);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <FeedbackUploadControl
      inputRef={inputRef}
      fileName={fileName}
      onPickFile={pickFile}
    />
  );
}

function FeedbackUploadControl(props: UploadProps) {
  const { t } = useTranslation();

  return (
    <div className="field field--full">
      <label className="dialog-label">{t("admin.feedbacks.imageUpload")}</label>
      <div className="feedback-dialog__file">
        <FeedbackUploadInput {...props} />
        <FeedbackUploadButton inputRef={props.inputRef} />
        <FeedbackUploadFileName fileName={props.fileName} />
      </div>
    </div>
  );
}

function FeedbackUploadInput({ inputRef, onPickFile }: UploadProps) {
  return (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      hidden
      onChange={(event) => onPickFile(event.target.files?.[0])}
    />
  );
}

function FeedbackUploadButton({
  inputRef,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
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

function FeedbackUploadFileName({ fileName }: { fileName: string }) {
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