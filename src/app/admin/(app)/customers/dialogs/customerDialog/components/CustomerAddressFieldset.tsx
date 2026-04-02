//src\app\admin\(app)\customers\dialogs\customerDialog\components\CustomerAddressFieldset.tsx
"use client";

import React from "react";
import type { Customer } from "../../../types";

type Props = {
  form: Customer;
  up: (path: string, value: any) => void;
};

export default function CustomerAddressFieldset(p: Props) {
  return (
    <fieldset className="card">
      <legend className="font-bold">Address</legend>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="lbl">Street</label>
          <input
            className="input"
            value={p.form.address?.street || ""}
            onChange={(e) => p.up("address.street", e.target.value)}
          />
        </div>
        <div>
          <label className="lbl">House no.</label>
          <input
            className="input"
            value={p.form.address?.houseNo || ""}
            onChange={(e) => p.up("address.houseNo", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="lbl">ZIP</label>
          <input
            className="input"
            value={p.form.address?.zip || ""}
            onChange={(e) => p.up("address.zip", e.target.value)}
          />
        </div>
        <div>
          <label className="lbl">City</label>
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
