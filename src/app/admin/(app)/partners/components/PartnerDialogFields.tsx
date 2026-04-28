"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { useTranslation } from "react-i18next";
import type { Partner } from "../types";

type UpdatePartner = <K extends keyof Partner>(
  key: K,
  value: Partner[K],
) => void;

type Props = {
  draft: Partner;
  updatePartner: UpdatePartner;
  uploadLogo: (file?: File) => Promise<void>;
};

type UploadProps = {
  inputRef: RefObject<HTMLInputElement | null>;
  fileName: string;
  onPickFile: (file?: File) => Promise<void>;
};

function statusLabel(active: boolean, t: (key: string) => string) {
  return active ? t("admin.partners.active") : t("admin.partners.inactive");
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

export default function PartnerDialogFields(props: Props) {
  return (
    <div className="partner-dialog__grid">
      <PartnerNameField {...props} />
      <PartnerSortField {...props} />
      <PartnerUrlField {...props} />
      <PartnerStatusField {...props} />
      <PartnerLogoUrlField {...props} />
      <PartnerUploadField uploadLogo={props.uploadLogo} />
    </div>
  );
}

function PartnerNameField({ draft, updatePartner }: Props) {
  const { t } = useTranslation();

  return (
    <div className="field">
      <label className="dialog-label">{t("admin.partners.name")}</label>
      <input
        className="input"
        value={draft.name}
        onChange={(event) => updatePartner("name", event.target.value)}
        required
      />
    </div>
  );
}

function PartnerSortField({ draft, updatePartner }: Props) {
  const { t } = useTranslation();

  return (
    <div className="field">
      <label className="dialog-label">{t("admin.partners.sortOrder")}</label>
      <input
        className="input"
        type="number"
        value={draft.sortOrder}
        onChange={(event) =>
          updatePartner("sortOrder", Number(event.target.value || 100))
        }
      />
    </div>
  );
}

function PartnerUrlField({ draft, updatePartner }: Props) {
  const { t } = useTranslation();

  return (
    <div className="field">
      <label className="dialog-label">{t("admin.partners.url")}</label>
      <input
        className="input"
        type="url"
        value={draft.url}
        onChange={(event) => updatePartner("url", event.target.value)}
      />
    </div>
  );
}

function PartnerStatusField({ draft, updatePartner }: Props) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useCloseOnOutsideClick(dropdownRef, () => setIsOpen(false));

  function pickStatus(nextActive: boolean) {
    updatePartner("isActive", nextActive);
    setIsOpen(false);
  }

  return (
    <div className="field">
      <label className="dialog-label">{t("admin.partners.status")}</label>
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
              {t("admin.partners.active")}
            </button>

            <button
              type="button"
              className={
                "ks-selectbox__option" +
                (!draft.isActive ? " ks-selectbox__option--active" : "")
              }
              onClick={() => pickStatus(false)}
            >
              {t("admin.partners.inactive")}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PartnerLogoUrlField({ draft, updatePartner }: Props) {
  const { t } = useTranslation();

  return (
    <div className="field field--full">
      <label className="dialog-label">{t("admin.partners.logoUrl")}</label>
      <input
        className="input"
        value={draft.logoUrl}
        onChange={(event) => updatePartner("logoUrl", event.target.value)}
        required
      />
    </div>
  );
}

function PartnerUploadField({
  uploadLogo,
}: {
  uploadLogo: (file?: File) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");

  async function pickFile(file?: File) {
    setFileName(file?.name || "");
    await uploadLogo(file);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <PartnerUploadControl
      inputRef={inputRef}
      fileName={fileName}
      onPickFile={pickFile}
    />
  );
}

function PartnerUploadControl(props: UploadProps) {
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

function PartnerUploadInput({ inputRef, onPickFile }: UploadProps) {
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
