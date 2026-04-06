"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import type { RowActionState } from "../../hooks/useInvoiceRowActions";

type Props = {
  state: RowActionState;
  setState: React.Dispatch<React.SetStateAction<RowActionState>>;
  inputsDisabled: boolean;
};

export default function DunningFields({
  state,
  setState,
  inputsDisabled,
}: Props) {
  const { t } = useTranslation();
  if (state.mode !== "dunning") return null;

  return (
    <>
      <label className="ks-inv-dialog__field">
        <span className="ks-inv-dialog__label">
          {t("common.admin.invoices.dialog.dunningFee")}
        </span>
        <input
          className="input"
          type="text"
          inputMode="decimal"
          value={state.dunningFee}
          onChange={(e) =>
            setState((p) => ({ ...p, dunningFee: e.target.value }))
          }
          placeholder={t("common.admin.invoices.dialog.dunningFeePlaceholder")}
          disabled={inputsDisabled}
        />
      </label>

      <label className="ks-inv-dialog__field">
        <span className="ks-inv-dialog__label">
          {t("common.admin.invoices.dialog.processingFee")}
        </span>
        <input
          className="input"
          type="text"
          inputMode="decimal"
          value={state.processingFee}
          onChange={(e) =>
            setState((p) => ({ ...p, processingFee: e.target.value }))
          }
          placeholder={t(
            "common.admin.invoices.dialog.processingFeePlaceholder",
          )}
          disabled={inputsDisabled}
        />
      </label>

      <label className="ks-inv-dialog__field">
        <span className="ks-inv-dialog__label">
          {t("common.admin.invoices.dialog.freeText")}
        </span>
        <textarea
          className="input ks-inv-dialog__textarea"
          value={state.freeText}
          onChange={(e) =>
            setState((p) => ({ ...p, freeText: e.target.value }))
          }
          rows={4}
          disabled={inputsDisabled}
        />
      </label>
    </>
  );
}
