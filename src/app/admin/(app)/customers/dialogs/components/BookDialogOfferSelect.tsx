"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import type { Offer } from "../../types";
import { fmtEUR, isNum } from "../bookDialog/bookDialogFormatters";

type Props = {
  filteredOffers: Offer[];
  selectedOfferId: string;
  setSelectedOfferId: (v: string) => void;
  selectedOfferLabel: string;
  isOpen: boolean;
  setIsOpen: (v: boolean | ((p: boolean) => boolean)) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
};

export default function BookDialogOfferSelect(p: Props) {
  const { i18n } = useTranslation();
  return (
    <div
      className={
        "ks-selectbox" +
        (p.isOpen ? " ks-selectbox--open" : "") +
        (!p.filteredOffers.length ? " ks-selectbox--disabled" : "")
      }
      ref={p.dropdownRef}
    >
      <button
        type="button"
        className="ks-selectbox__trigger"
        onClick={() => {
          if (!p.filteredOffers.length) return;
          p.setIsOpen((o) => !o);
        }}
        disabled={!p.filteredOffers.length}
      >
        <span className="ks-selectbox__label">{p.selectedOfferLabel}</span>
        <span className="ks-selectbox__chevron" aria-hidden="true" />
      </button>

      {p.isOpen && p.filteredOffers.length > 0 && (
        <div className="ks-selectbox__panel">
          {p.filteredOffers.map((o) => {
            const parts = [
              o.title || "—",
              isNum(o.price) ? fmtEUR(o.price, i18n.language) : undefined,
            ].filter(Boolean);
            const label = parts.join(" — ");
            return (
              <button
                key={o._id}
                type="button"
                className={
                  "ks-selectbox__option" +
                  (p.selectedOfferId === o._id
                    ? " ks-selectbox__option--active"
                    : "")
                }
                onClick={() => {
                  p.setSelectedOfferId(o._id);
                  p.setIsOpen(false);
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
