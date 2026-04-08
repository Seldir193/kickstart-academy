"use client";

import React from "react";
import { useTranslation } from "react-i18next";

type Props = {
  mode: "create" | "edit";
  saving: boolean;
  onClose: () => void;
  onCreate: () => void;
  onSave: () => void;
};

export default function CustomerDialogFooter(p: Props) {
  const { t } = useTranslation();
  return (
    <div className="dialog-footer ks-customer-dialog__footer">
      {p.mode === "create" ? (
        <button
          className="btn"
          onClick={p.onCreate}
          disabled={p.saving}
          type="button"
        >
          {p.saving
            ? t("common.admin.customers.customerDialog.creating")
            : t("common.admin.customers.customerDialog.create")}
        </button>
      ) : (
        <button
          className="btn"
          onClick={p.onSave}
          disabled={p.saving}
          type="button"
        >
          {p.saving
            ? t("common.admin.customers.customerDialog.creating")
            : t("common.admin.customers.customerDialog.create")}
        </button>
      )}
    </div>
  );
}
