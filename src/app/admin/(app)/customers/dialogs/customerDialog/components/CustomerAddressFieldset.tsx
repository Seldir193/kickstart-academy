//src\app\admin\(app)\customers\dialogs\customerDialog\components\CustomerAddressFieldset.tsx
"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import type { Customer } from "../../../types";

type Props = {
  form: Customer;
  up: (path: string, value: any) => void;
};

export default function CustomerAddressFieldset(p: Props) {
  const { t } = useTranslation();
  return (
    <fieldset className="card">
      <legend className="font-bold">
        {t("common.admin.customers.customerDialog.address")}
      </legend>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="lbl">
            {t("common.admin.customers.customerDialog.street")}
          </label>
          <input
            className="input"
            value={p.form.address?.street || ""}
            onChange={(e) => p.up("address.street", e.target.value)}
          />
        </div>
        <div>
          <label className="lbl">
            {t("common.admin.customers.customerDialog.houseNo")}
          </label>
          <input
            className="input"
            value={p.form.address?.houseNo || ""}
            onChange={(e) => p.up("address.houseNo", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="lbl">
            {t("common.admin.customers.customerDialog.zip")}
          </label>
          <input
            className="input"
            value={p.form.address?.zip || ""}
            onChange={(e) => p.up("address.zip", e.target.value)}
          />
        </div>
        <div>
          <label className="lbl">
            {t("common.admin.customers.customerDialog.city")}
          </label>
          <input
            className="input"
            value={p.form.address?.city || ""}
            onChange={(e) => p.up("address.city", e.target.value)}
          />
        </div>
      </div>
    </fieldset>
  );
}
