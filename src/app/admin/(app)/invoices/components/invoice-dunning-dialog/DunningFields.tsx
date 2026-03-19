"use client";

import React from "react";
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
  if (state.mode !== "dunning") return null;

  return (
    <>
      <label className="ks-inv-dialog__field">
        <span className="ks-inv-dialog__label">Mahngebühr</span>
        <input
          className="input"
          type="text"
          inputMode="decimal"
          value={state.dunningFee}
          onChange={(e) =>
            setState((p) => ({ ...p, dunningFee: e.target.value }))
          }
          placeholder="z. B. 5,00"
          disabled={inputsDisabled}
        />
      </label>

      <label className="ks-inv-dialog__field">
        <span className="ks-inv-dialog__label">Bearbeitungsgebühr</span>
        <input
          className="input"
          type="text"
          inputMode="decimal"
          value={state.processingFee}
          onChange={(e) =>
            setState((p) => ({ ...p, processingFee: e.target.value }))
          }
          placeholder="z. B. 0,00"
          disabled={inputsDisabled}
        />
      </label>

      <label className="ks-inv-dialog__field">
        <span className="ks-inv-dialog__label">Freitext</span>
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
