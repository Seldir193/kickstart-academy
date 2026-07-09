import { useTranslation } from "react-i18next";
import type { UploadControlProps } from "../types";

export default function FeedbackUploadControl(props: UploadControlProps) {
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

function FeedbackUploadInput({ inputRef, onPickFile }: UploadControlProps) {
  return <input ref={inputRef} type="file" accept="image/*" hidden onChange={(event) => onPickFile(event.target.files?.[0])} />;
}

function FeedbackUploadButton({ inputRef }: Pick<UploadControlProps, "inputRef">) {
  const { t } = useTranslation();
  return <button type="button" className="btn" onClick={() => inputRef.current?.click()}>{t("admin.feedbacks.chooseFile")}</button>;
}

function FeedbackUploadFileName({ fileName }: { fileName: string }) {
  const { t } = useTranslation();
  const className = "feedback-dialog__file-name" + (!fileName ? " is-empty" : "");
  return <span className={className}>{fileName || t("admin.feedbacks.noFileSelected")}</span>;
}
