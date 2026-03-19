"use client";

import React from "react";
import type { Customer } from "../../../types";

type Props = {
  form: Customer;
  up: (path: string, value: any) => void;
};

export default function CustomerNotesFieldset(p: Props) {
  return (
    <fieldset className="card">
      <legend className="font-bold">Notes</legend>
      <textarea
        className="input"
        rows={5}
        value={p.form.notes || ""}
        onChange={(e) => p.up("notes", e.target.value)}
      />
    </fieldset>
  );
}
