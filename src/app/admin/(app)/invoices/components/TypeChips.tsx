// src/app/admin/(app)/invoices/components/TypeChips.tsx
"use client";

import React from "react";
import { useTranslation } from "react-i18next";

type Props = {
  participation: boolean;
  cancellation: boolean;
  storno: boolean;
  dunning: boolean;
  creditNote: boolean;

  invoice: boolean;
  setInvoice: (v: boolean) => void;

  setParticipation: (v: boolean) => void;
  setCancellation: (v: boolean) => void;
  setStorno: (v: boolean) => void;
  setDunning: (v: boolean) => void;
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

export default function TypeChips({
  participation,
  invoice,
  cancellation,
  storno,
  dunning,
  creditNote,
  setParticipation,
  setInvoice,
  setCancellation,
  setStorno,
  setDunning,
  setCreditNote,
  onAnyChange,
}: Props) {
  const { t } = useTranslation();
  return (
    <div className="ks-filter-chips">
      <Chip
        active={participation}
        label={t("common.admin.invoices.types.participation")}
        onClick={() => {
          setParticipation(!participation);
          onAnyChange();
        }}
      />
      <Chip
        active={invoice}
        label={t("common.admin.invoices.types.invoice")}
        onClick={() => {
          setInvoice(!invoice);
          onAnyChange();
        }}
      />
      <Chip
        active={cancellation}
        label={t("common.admin.invoices.types.cancellation")}
        onClick={() => {
          setCancellation(!cancellation);
          onAnyChange();
        }}
      />
      <Chip
        active={storno}
        label={t("common.admin.invoices.types.storno")}
        onClick={() => {
          setStorno(!storno);
          onAnyChange();
        }}
      />
      <Chip
        active={dunning}
        label={t("common.admin.invoices.types.dunning")}
        onClick={() => {
          setDunning(!dunning);
          onAnyChange();
        }}
      />
      <Chip
        active={creditNote}
        label={t("common.admin.invoices.types.creditNote")}
        onClick={() => {
          setCreditNote(!creditNote);
          onAnyChange();
        }}
      />
    </div>
  );
}
