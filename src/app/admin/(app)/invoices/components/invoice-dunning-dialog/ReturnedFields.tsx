"use client";

import React from "react";
import type { RowActionState } from "../../hooks/useInvoiceRowActions";

type Props = {
  state: RowActionState;
  setState: React.Dispatch<React.SetStateAction<RowActionState>>;
  inputsDisabled: boolean;
};

export default function ReturnedFields({
  state,
  setState,
  inputsDisabled,
}: Props) {
  if (state.mode !== "returned") return null;

  return (
    <label className="ks-inv-dialog__field">
      <span className="ks-inv-dialog__label">Return note</span>
      <textarea
        className="input ks-inv-dialog__textarea"
        value={state.returnNote}
        onChange={(e) =>
          setState((p) => ({ ...p, returnNote: e.target.value }))
        }
        rows={3}
        disabled={state.loading || inputsDisabled}
      />
    </label>
  );
}
