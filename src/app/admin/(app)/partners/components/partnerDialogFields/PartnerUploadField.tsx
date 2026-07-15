"use client";

import { useRef, useState } from "react";
import type { RefObject } from "react";
import { useTranslation } from "react-i18next";
import type { PartnerUploadProps } from "./partnerDialogFields.types";

function PartnerUploadInput({ inputRef, onPickFile }: PartnerUploadProps) {
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

function PartnerUploadButton({
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
      {t("admin.partners.chooseFile")}
    </button>
  );
}

function PartnerUploadFileName({ fileName }: { fileName: string }) {
  const { t } = useTranslation();
  const className =
    "partner-dialog__file-name" + (!fileName ? " is-empty" : "");
  return (
    <span className={className}>
      {fileName || t("admin.partners.noFileSelected")}
    </span>
  );
}

function PartnerUploadControl(props: PartnerUploadProps) {
  const { t } = useTranslation();
  return (
    <div className="field field--full">
      <label className="dialog-label">{t("admin.partners.logoUpload")}</label>
      <div className="partner-dialog__file">
        <PartnerUploadInput {...props} />
        <PartnerUploadButton inputRef={props.inputRef} />
        <PartnerUploadFileName fileName={props.fileName} />
      </div>
    </div>
  );
}

export default function PartnerUploadField({
  uploadLogo,
}: {
  uploadLogo: (file?: File) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const onPickFile = async (file?: File) => {
    setFileName(file?.name || "");
    await uploadLogo(file);
    if (inputRef.current) inputRef.current.value = "";
  };
  return (
    <PartnerUploadControl
      inputRef={inputRef}
      fileName={fileName}
      onPickFile={onPickFile}
    />
  );
}
