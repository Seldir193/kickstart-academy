"use client";

import React from "react";
import { useTranslation } from "react-i18next";
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
  onClose: () => void;
};

export default function CustomerDialogHeader(p: Props) {
  const { t } = useTranslation();
  return (
    <div className="dialog-head ks-customer-dialog__head">
      <div className="ks-customer-dialog__head-left">
        <h2 className="dialog-title ks-customer-dialog__title">
          {t("common.admin.customers.customerDialog.customerNumber")} #
          {(p.form as any).userId ?? "—"}
        </h2>

        <div className="ks-customer-dialog__head-meta">
          <span className={`badge ${p.isActive ? "" : "badge-muted"}`}>
            {p.isActive
              ? t("common.admin.customers.customerDialog.statusActive")
              : t("common.admin.customers.customerDialog.statusCancelled")}
          </span>
          {/* 
          {p.mode === "edit" && p.familyCreateMode !== "none" ? (
            <span className="badge badge-info">
              {p.familyCreateMode === "newChild"
                ? t(
                    "common.admin.customers.customerDialog.newChildWillBeCreated",
                  )
                : ""}
            </span>
          ) : null} */}

          {p.mode === "edit" && p.familyCreateMode !== "none" ? (
            <span className="badge badge-info">
              {p.familyCreateMode === "newChild"
                ? t(
                    "common.admin.customers.customerDialog.newChildWillBeCreated",
                  )
                : p.familyCreateMode === "newParent"
                  ? t(
                      "common.admin.customers.customerDialog.newParentWillBeCreated",
                    )
                  : ""}
            </span>
          ) : null}
        </div>
      </div>

      <div className="ks-customer-dialog__head-right">
        <div className="dialog-head__actions ks-customer-dialog__actions">
          <button
            className="btn"
            onClick={() => p.setDocumentsOpen(true)}
            disabled={!p.form._id}
            type="button"
          >
            {t("common.admin.customers.customerDialog.documents")}
          </button>

          <button
            className="btn"
            onClick={() => p.setBookOpen(true)}
            disabled={!p.form._id}
            type="button"
          >
            {t("common.admin.customers.customerDialog.book")}
          </button>

          <button
            className="btn"
            onClick={() => p.setCancelOpen(true)}
            disabled={!p.form._id}
            type="button"
          >
            {t("common.admin.customers.customerDialog.cancel")}
          </button>

          <button
            className="btn"
            onClick={() => p.setStornoOpen(true)}
            disabled={!p.form._id}
            type="button"
          >
            {t("common.admin.customers.customerDialog.creditNote")}
          </button>
        </div>

        <div className="ks-customer-dialog__close-wrap">
          <button
            type="button"
            className="dialog-close modal__close ks-customer-dialog__close"
            aria-label={t("common.close")}
            onClick={p.onClose}
          >
            <img
              src="/icons/close.svg"
              alt=""
              aria-hidden="true"
              className="icon-img"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
