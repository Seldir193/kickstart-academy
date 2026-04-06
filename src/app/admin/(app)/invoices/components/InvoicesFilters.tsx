// src/app/admin/(app)/invoices/components/InvoicesFilters.tsx
"use client";

import React, { useMemo } from "react";
import KsDatePicker from "@/app/admin/(app)/invoices/components/KsDatePicker";
import TypeChips from "./TypeChips";
import { useTranslation } from "react-i18next";

type Props = {
  typeParticipation: boolean;
  typeCancellation: boolean;
  typeStorno: boolean;
  typeDunning: boolean;
  typeCreditNote: boolean;
  typeInvoice: boolean;
  setTypeInvoice: (v: boolean) => void;
  setTypeParticipation: (v: boolean) => void;
  setTypeCancellation: (v: boolean) => void;
  setTypeStorno: (v: boolean) => void;
  setTypeDunning: (v: boolean) => void;
  setTypeCreditNote: (v: boolean) => void;
  q: string;
  setQ: (v: string) => void;
  from: string;
  setFrom: (v: string) => void;
  to: string;
  setTo: (v: string) => void;
  onAnyChangeResetPage: () => void;
  children?: React.ReactNode;
};

export default function InvoicesFilters(props: Props) {
  const { t } = useTranslation();
  const toYear = useMemo(() => new Date().getFullYear() + 2, []);

  function onSearchChange(v: string) {
    props.setQ(v);
    props.onAnyChangeResetPage();
  }

  function onFromChange(nextIso: string) {
    props.setFrom(nextIso);
    props.onAnyChangeResetPage();
  }

  function onToChange(nextIso: string) {
    props.setTo(nextIso);
    props.onAnyChangeResetPage();
  }

  return (
    <div className="form ks-invoices__formNoTop">
      <div className="ks-invoices__topToolbar">
        <div className="ks-invoices__searchItem">
          <div className="input-with-icon">
            <img
              src="/icons/search.svg"
              alt=""
              aria-hidden="true"
              className="input-with-icon__icon"
            />
            <input
              className="input input-with-icon__input"
              placeholder={t("common.admin.invoices.search.placeholder")}
              value={props.q}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        <div className="ks-invoices__dateItem">
          <KsDatePicker
            value={props.from}
            onChange={onFromChange}
            fromYear={1970}
            toYear={toYear}
          />
        </div>

        <div className="ks-invoices__dateItem">
          <KsDatePicker
            value={props.to}
            onChange={onToChange}
            fromYear={1970}
            toYear={toYear}
          />
        </div>

        {props.children}
      </div>

      <div className="ks-invoices__typesRow">
        <TypeChips
          participation={props.typeParticipation}
          cancellation={props.typeCancellation}
          storno={props.typeStorno}
          dunning={props.typeDunning}
          creditNote={props.typeCreditNote}
          invoice={props.typeInvoice}
          setInvoice={props.setTypeInvoice}
          setParticipation={props.setTypeParticipation}
          setCancellation={props.setTypeCancellation}
          setStorno={props.setTypeStorno}
          setDunning={props.setTypeDunning}
          setCreditNote={props.setTypeCreditNote}
          onAnyChange={props.onAnyChangeResetPage}
        />
      </div>
    </div>
  );
}
