"use client";

import React from "react";
import type { Customer } from "../../../types";
import type { FamilyCreateMode } from "../types";

type Props = {
  form: Customer;
  mode: "create" | "edit";
  isActive: boolean;
  familyCreateMode: FamilyCreateMode;
  setDocumentsOpen: (v: boolean) => void;
  setBookOpen: (v: boolean) => void;
  setCancelOpen: (v: boolean) => void;
  setStornoOpen: (v: boolean) => void;
};

export default function CustomerDialogHeader(p: Props) {
  return (
    <div className="dialog-head">
      <div className="dialog-head__left">
        <h2 className="text-xl font-bold">
          Customer #{(p.form as any).userId ?? "—"}
        </h2>
        <span className={`badge ${p.isActive ? "" : "badge-muted"}`}>
          {p.isActive ? "Active" : "Cancelled"}
        </span>
        {p.mode === "edit" && p.familyCreateMode !== "none" && (
          <span className="badge badge-info ml-2">
            {p.familyCreateMode === "newChild"
              ? "Neues Kind wird angelegt"
              : ""}
          </span>
        )}
      </div>

      <div className="dialog-head__actions">
        <button
          className="btn"
          onClick={() => p.setDocumentsOpen(true)}
          disabled={!p.form._id}
        >
          Documents
        </button>
        <button
          className="btn"
          onClick={() => p.setBookOpen(true)}
          disabled={!p.form._id}
        >
          Book
        </button>
        <button
          className="btn"
          onClick={() => p.setCancelOpen(true)}
          disabled={!p.form._id}
        >
          Cancel
        </button>
        <button
          className="btn"
          onClick={() => p.setStornoOpen(true)}
          disabled={!p.form._id}
        >
          Storno
        </button>
      </div>
    </div>
  );
}
