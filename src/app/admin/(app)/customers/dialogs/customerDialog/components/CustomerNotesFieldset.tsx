//src\app\admin\(app)\customers\dialogs\customerDialog\components\CustomerNotesFieldset.tsx
"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import type { Customer } from "../../../types";

type Props = {
  form: Customer;
  up: (path: string, value: any) => void;
};

export default function CustomerNotesFieldset(p: Props) {
  const { t } = useTranslation();
  return (
    <fieldset className="card">
      <legend className="font-bold">
        {t("common.admin.customers.customerDialog.notes")}
      </legend>
      <textarea
        className="input"
        rows={5}
        value={p.form.notes || ""}
        onChange={(e) => p.up("notes", e.target.value)}
      />
    </fieldset>
  );
}
