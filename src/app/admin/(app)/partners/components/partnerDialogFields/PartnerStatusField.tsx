"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { useTranslation } from "react-i18next";
import type { PartnerFieldProps } from "./partnerDialogFields.types";

type StatusView = {
  t: ReturnType<typeof useTranslation>["t"];
  dropdownRef: RefObject<HTMLDivElement | null>;
  isOpen: boolean;
  isActive: boolean;
  toggle: () => void;
  pick: (value: boolean) => void;
};

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
  const view: StatusView = {
    t,
    dropdownRef,
    isOpen,
    isActive: draft.isActive,
    toggle: () => setIsOpen((open) => !open),
    pick: (value) => pickStatus(updatePartner, setIsOpen, value),
  };
  return <StatusField {...view} />;
}

function StatusField(view: StatusView) {
  return (
    <div className="field">
      <label className="dialog-label">{view.t("admin.partners.status")}</label>
      <div
        ref={view.dropdownRef}
        className={"ks-selectbox" + (view.isOpen ? " ks-selectbox--open" : "")}
      >
        <StatusTrigger {...view} />
        {view.isOpen ? <StatusPanel {...view} /> : null}
      </div>
    </div>
  );
}

function StatusTrigger({ isActive, toggle, t }: StatusView) {
  return (
    <button type="button" className="ks-selectbox__trigger" onClick={toggle}>
      <span className="ks-selectbox__label">
        {isActive ? t("admin.partners.active") : t("admin.partners.inactive")}
      </span>
      <span className="ks-selectbox__chevron" aria-hidden="true" />
    </button>
  );
}

function StatusPanel({ isActive, pick, t }: StatusView) {
  return (
    <div className="ks-selectbox__panel">
      <StatusOption
        active={isActive}
        label={t("admin.partners.active")}
        onClick={() => pick(true)}
      />
      <StatusOption
        active={!isActive}
        label={t("admin.partners.inactive")}
        onClick={() => pick(false)}
      />
    </div>
  );
}

function StatusOption({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={
        "ks-selectbox__option" + (active ? " ks-selectbox__option--active" : "")
      }
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function pickStatus(
  updatePartner: PartnerFieldProps["updatePartner"],
  setIsOpen: (open: boolean) => void,
  value: boolean,
) {
  updatePartner("isActive", value);
  setIsOpen(false);
}
