"use client";

import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import type { DunningStage, InvoiceRow } from "../../utils/invoiceList";
import {
  applyStagePatch,
  canPickStage,
  stageLabel,
  visibleStagesForRow,
} from "./dialogLogic";
import { useStageDropdown } from "./useStageDropdown";
import type { RowActionState } from "../../hooks/useInvoiceRowActions";

type Props = {
  row: InvoiceRow;
  state: RowActionState;
  setState: React.Dispatch<React.SetStateAction<RowActionState>>;
  stageOpen: boolean;
  setStageOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

function toggleOpen(
  setStageOpen: React.Dispatch<React.SetStateAction<boolean>>,
) {
  setStageOpen((v) => !v);
}

function closeOpen(
  setStageOpen: React.Dispatch<React.SetStateAction<boolean>>,
) {
  setStageOpen(false);
}

export default function StageSelectField(props: Props) {
  const { t } = useTranslation();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);

  useStageDropdown(props.stageOpen, { triggerRef, menuRef }, () =>
    closeOpen(props.setStageOpen),
  );

  function applyStage(next: DunningStage) {
    props.setState((prev) => ({
      ...prev,
      ...applyStagePatch(props.row, next),
    }));
    closeOpen(props.setStageOpen);
  }

  return (
    <label className="ks-inv-dialog__field">
      <span className="ks-inv-dialog__label">
        {t("common.admin.invoices.stageSelect.label")}
      </span>

      <div
        className={
          "ks-training-select ks-inv-dialog__select" +
          (props.stageOpen ? " ks-training-select--open" : "")
        }
      >
        <button
          type="button"
          ref={triggerRef}
          className="ks-training-select__trigger"
          onClick={() => toggleOpen(props.setStageOpen)}
          disabled={props.state.loading}
        >
          <span className="ks-training-select__label">
            {stageLabel(props.state.resolvedStage, t)}
          </span>
          <span className="ks-training-select__chevron" aria-hidden="true" />
        </button>

        {props.stageOpen ? (
          <ul
            ref={menuRef}
            className="ks-training-select__menu"
            role="listbox"
            aria-label={t("common.admin.invoices.stageSelect.label")}
          >
            {visibleStagesForRow(props.row).map((st) => {
              const enabled = canPickStage(props.row, st);
              const sel = props.state.resolvedStage === st;
              return (
                <li key={st}>
                  <button
                    type="button"
                    className={
                      "ks-training-select__option" + (sel ? " is-selected" : "")
                    }
                    onClick={() => applyStage(st)}
                    disabled={!enabled}
                  >
                    {stageLabel(st, t)}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </label>
  );
}
