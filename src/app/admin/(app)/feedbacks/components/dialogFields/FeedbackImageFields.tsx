"use client";

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { FeedbackDialogTextFieldsProps } from "./feedbackDialogTextFields.types";

type UploadProps = FeedbackDialogTextFieldsProps & {
  inputRef: React.RefObject<HTMLInputElement | null>;
  fileName: string;
  pickFile: (file?: File) => Promise<void>;
};

export default function FeedbackImageFields(props: FeedbackDialogTextFieldsProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const pickFile = createFilePicker(props, inputRef, setFileName);
  return <>{renderImageFields({ ...props, inputRef, fileName, pickFile })}</>;
}

function createFilePicker(
  props: FeedbackDialogTextFieldsProps,
  inputRef: React.RefObject<HTMLInputElement | null>,
  setFileName: (value: string) => void,
) {
  return async (file?: File) => {
    setFileName(file?.name || "");
    await props.uploadImage(file);
    if (inputRef.current) inputRef.current.value = "";
  };
}

function renderImageFields(props: UploadProps) {
  return [
    <FeedbackImageUrlField key="url" {...props} />,
    <FeedbackUploadField key="upload" {...props} />,
  ];
}

function FeedbackImageUrlField(props: FeedbackDialogTextFieldsProps) {
  const { t } = useTranslation();
  return (
    <div className="field field--full">
      <label className="dialog-label">{t("admin.feedbacks.imageUrl")}</label>
      <input className="input" value={props.draft.imageUrl} onChange={(event) => props.updateFeedback("imageUrl", event.target.value)} />
    </div>
  );
}

function FeedbackUploadField(props: UploadProps) {
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

function FeedbackUploadInput(props: UploadProps) {
  return <input ref={props.inputRef} type="file" accept="image/*" hidden onChange={(event) => props.pickFile(event.target.files?.[0])} />;
}

function FeedbackUploadButton({ inputRef }: Pick<UploadProps, "inputRef">) {
  const { t } = useTranslation();
  return <button type="button" className="btn" onClick={() => inputRef.current?.click()}>{t("admin.feedbacks.chooseFile")}</button>;
}

function FeedbackFileName({ fileName }: Pick<UploadProps, "fileName">) {
  const { t } = useTranslation();
  const className = `feedback-dialog__file-name${fileName ? "" : " is-empty"}`;
  return <span className={className}>{fileName || t("admin.feedbacks.noFileSelected")}</span>;
}
