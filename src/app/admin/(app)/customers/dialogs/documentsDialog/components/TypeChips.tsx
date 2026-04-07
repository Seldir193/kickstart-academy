//src\app\admin\(app)\customers\dialogs\documentsDialog\components\TypeChips.tsx
"use client";

import React from "react";
import { useTranslation } from "react-i18next";

type Props = {
  participation: boolean;
  invoice: boolean;
  cancellation: boolean;
  storno: boolean;
  dunning: boolean;
  contract: boolean;
  creditNote: boolean;
  setParticipation: (v: boolean) => void;
  setInvoice: (v: boolean) => void;
  setCancellation: (v: boolean) => void;
  setStorno: (v: boolean) => void;
  setDunning: (v: boolean) => void;
  setContract: (v: boolean) => void;
  setCreditNote: (v: boolean) => void;
  onAnyChange: () => void;
};

function Chip({
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
      className={"ks-filter-chip" + (active ? " ks-filter-chip--active" : "")}
      aria-pressed={active}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export function TypeChips({
  participation,
  invoice,
  cancellation,
  storno,
  dunning,
  contract,
  creditNote,
  setParticipation,
  setInvoice,
  setCancellation,
  setStorno,
  setDunning,
  setContract,
  setCreditNote,
  onAnyChange,
}: Props) {
  const { t } = useTranslation();
  return (
    <div className="ks-filter-chips">
      <Chip
        active={participation}
        label={t("admin.customers.documents.typeChips.participation")}
        onClick={() => {
          setParticipation(!participation);
          onAnyChange();
        }}
      />
      <Chip
        active={invoice}
        label={t("admin.customers.documents.typeChips.invoice")}
        onClick={() => {
          setInvoice(!invoice);
          onAnyChange();
        }}
      />
      <Chip
        active={cancellation}
        label={t("admin.customers.documents.typeChips.cancellation")}
        onClick={() => {
          setCancellation(!cancellation);
          onAnyChange();
        }}
      />
      <Chip
        active={storno}
        label={t("admin.customers.documents.typeChips.storno")}
        onClick={() => {
          setStorno(!storno);
          onAnyChange();
        }}
      />
      <Chip
        active={dunning}
        label={t("admin.customers.documents.typeChips.dunning")}
        onClick={() => {
          setDunning(!dunning);
          onAnyChange();
        }}
      />
      <Chip
        active={creditNote}
        label={t("admin.customers.documents.typeChips.creditNote")}
        onClick={() => {
          setCreditNote(!creditNote);
          onAnyChange();
        }}
      />
      <Chip
        active={contract}
        label={t("admin.customers.documents.typeChips.contract")}
        onClick={() => {
          setContract(!contract);
          onAnyChange();
        }}
      />
    </div>
  );
}
