"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { FormEvent, MouseEvent } from "react";
import type { Partner } from "../types";
import type { PartnerDialogMode } from "../usePartnersPage";
import { clonePartner } from "../helpers";
import PartnerDialogFields from "./PartnerDialogFields";

type Props = {
  mode: PartnerDialogMode;
  item: Partner;
  busy: boolean;
  onClose: () => void;
  onSave: (item: Partner) => Promise<void>;
  onUpload: (file: File) => Promise<string>;
};

type Translate = ReturnType<typeof useTranslation>["t"];

export default function PartnerDialog(props: Props) {
  const { mode, item, busy, onClose, onSave, onUpload } = props;
  const [draft, setDraft] = useState<Partner>(() => clonePartner(item));
  const [formError, setFormError] = useState("");

  function updatePartner<K extends keyof Partner>(key: K, value: Partner[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setFormError("");
  }

  async function uploadLogo(file?: File) {
    if (!file) return;
    updatePartner("logoUrl", await onUpload(file));
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
      className="dialog-backdrop partner-dialog"
      role="dialog"
      aria-modal="true"
    >
      <PartnerDialogBackdrop onClose={onClose} />

      <form className="dialog partner-dialog__dialog" onSubmit={submitForm}>
        <PartnerDialogHead mode={mode} onClose={onClose} />

        <div className="dialog-body partner-dialog__body">
          <PartnerDialogFields
            draft={draft}
            updatePartner={updatePartner}
            uploadLogo={uploadLogo}
          />
        </div>

        <PartnerDialogFooter busy={busy} mode={mode} error={formError} />
      </form>
    </div>
  );
}

function PartnerDialogBackdrop({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      className="dialog-backdrop-hit partner-dialog__backdrop-hit"
      aria-label={t("common.close")}
      onClick={onClose}
    />
  );
}

function PartnerDialogHead(props: {
  mode: PartnerDialogMode;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="dialog-head partner-dialog__head">
      <HeadLeft mode={props.mode} t={t} />

      <HeadRight onClose={props.onClose} t={t} />
    </div>
  );
}

function HeadLeft({ mode, t }: { mode: PartnerDialogMode; t: Translate }) {
  return (
    <div className="partner-dialog__head-left">
      <div className="dialog-title partner-dialog__title">
        {mode === "create"
          ? t("admin.partners.create")
          : t("admin.partners.edit")}
      </div>
      <div className="dialog-subtitle partner-dialog__subtitle">
        {t("admin.partners.subtitle")}
      </div>
    </div>
  );
}

function HeadRight({ onClose, t }: { onClose: () => void; t: Translate }) {
  return (
    <div className="partner-dialog__head-right">
      <div className="dialog-head__actions">
        <CloseButton onClose={onClose} t={t} />
      </div>
    </div>
  );
}

function CloseButton({ onClose, t }: { onClose: () => void; t: Translate }) {
  return (
    <button
      type="button"
      className="dialog-close modal__close"
      aria-label={t("common.close")}
      onClick={onClose}
    >
      <CloseIcon />
    </button>
  );
}

function CloseIcon() {
  return (
    <img
      src="/icons/close.svg"
      alt=""
      aria-hidden="true"
      className="icon-img"
    />
  );
}

function PartnerDialogFooter(props: {
  busy: boolean;
  mode: PartnerDialogMode;
  error: string;
}) {
  const { t } = useTranslation();
  const buttonLabel = getSubmitButtonLabel(t, props.busy, props.mode);

  return (
    <div className="dialog-footer partner-dialog__footer">
      <FooterError error={props.error} />

      <SubmitButton busy={props.busy} label={buttonLabel} />
    </div>
  );
}

function FooterError({ error }: { error: string }) {
  if (!error) return null;
  return (
    <p className="error partner-dialog__message" role="alert">
      {error}
    </p>
  );
}

function SubmitButton({ busy, label }: { busy: boolean; label: string }) {
  return (
    <button
      className="btn"
      type="submit"
      aria-disabled={busy}
      onClick={(event) => guardSubmit(busy, event)}
    >
      {label}
    </button>
  );
}

function guardSubmit(busy: boolean, event: MouseEvent<HTMLButtonElement>) {
  if (!busy) return;
  event.preventDefault();
}

function getSubmitError(error: unknown) {
  if (error instanceof Error) return error.message;
  return "";
}

function getSubmitButtonLabel(
  t: (key: string) => string,
  busy: boolean,
  mode: PartnerDialogMode,
) {
  if (busy) return t("admin.partners.saving");
  if (mode === "create") return t("admin.partners.create");
  return t("admin.partners.save");
}
