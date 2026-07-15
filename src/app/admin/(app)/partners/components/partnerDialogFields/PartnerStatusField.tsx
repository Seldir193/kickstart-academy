"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { useTranslation } from "react-i18next";
import type { PartnerFieldProps } from "./partnerDialogFields.types";

function useCloseOnOutsideClick(
  ref: RefObject<HTMLDivElement | null>,
  close: () => void,
) {
  useEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!ref.current?.contains(event.target as Node)) close();
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [ref, close]);
}

export default function PartnerStatusField({
  draft,
  updatePartner,
}: PartnerFieldProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setIsOpen(false), []);
  useCloseOnOutsideClick(dropdownRef, close);
  const pickStatus = (value: boolean) => {
    updatePartner("isActive", value);
    setIsOpen(false);
  };
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
            {draft.isActive
              ? t("admin.partners.active")
              : t("admin.partners.inactive")}
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
