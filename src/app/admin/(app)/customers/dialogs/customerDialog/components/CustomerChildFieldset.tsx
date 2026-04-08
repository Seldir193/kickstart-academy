"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import type { Customer } from "../../../types";
import KsBirthDateSelect from "../../components/KsBirthDateSelect";

type Props = {
  form: Customer;
  up: (path: string, value: any) => void;
  genderOpen: boolean;
  setGenderOpen: (v: boolean | ((p: boolean) => boolean)) => void;
  genderDropdownRef: React.RefObject<HTMLDivElement | null>;
};

function genderLabel(value?: string, t?: (key: string) => string) {
  if (value === "weiblich")
    return t
      ? t("common.admin.customers.customerDialog.genderFemale")
      : "Female";
  if (value === "männlich")
    return t ? t("common.admin.customers.customerDialog.genderMale") : "Male";
  return "—";
}

export default function CustomerChildFieldset(p: Props) {
  const { t } = useTranslation();
  return (
    <fieldset className="card">
      <legend className="font-bold">
        {t("common.admin.customers.customerDialog.child")}
      </legend>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="lbl">
            {t("common.admin.customers.customerDialog.firstName")}
          </label>
          <input
            className="input"
            value={p.form.child?.firstName || ""}
            onChange={(e) => p.up("child.firstName", e.target.value)}
          />
        </div>
        <div>
          <label className="lbl">
            {t("common.admin.customers.customerDialog.lastName")}
          </label>
          <input
            className="input"
            value={p.form.child?.lastName || ""}
            onChange={(e) => p.up("child.lastName", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="lbl">
            {t("common.admin.customers.customerDialog.gender")}
          </label>

          <div
            className={
              "ks-selectbox" + (p.genderOpen ? " ks-selectbox--open" : "")
            }
            ref={p.genderDropdownRef}
          >
            <button
              type="button"
              className="ks-selectbox__trigger"
              onClick={() => p.setGenderOpen((o) => !o)}
            >
              <span className="ks-selectbox__label">
                {genderLabel(p.form.child?.gender, t)}
              </span>
              <span className="ks-selectbox__chevron" aria-hidden="true" />
            </button>

            {p.genderOpen ? (
              <div className="ks-selectbox__panel">
                <button
                  type="button"
                  className={
                    "ks-selectbox__option" +
                    (!p.form.child?.gender
                      ? " ks-selectbox__option--active"
                      : "")
                  }
                  onClick={() => {
                    p.up("child.gender", "");
                    p.setGenderOpen(false);
                  }}
                >
                  —
                </button>

                <button
                  type="button"
                  className={
                    "ks-selectbox__option" +
                    (p.form.child?.gender === "weiblich"
                      ? " ks-selectbox__option--active"
                      : "")
                  }
                  onClick={() => {
                    p.up("child.gender", "weiblich");
                    p.setGenderOpen(false);
                  }}
                >
                  {t("common.admin.customers.customerDialog.genderFemale")}
                </button>

                <button
                  type="button"
                  className={
                    "ks-selectbox__option" +
                    (p.form.child?.gender === "männlich"
                      ? " ks-selectbox__option--active"
                      : "")
                  }
                  onClick={() => {
                    p.up("child.gender", "männlich");
                    p.setGenderOpen(false);
                  }}
                >
                  {t("common.admin.customers.customerDialog.genderMale")}
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div>
          <label className="lbl">
            {t("common.admin.customers.customerDialog.birthDate")}
          </label>
          <KsBirthDateSelect
            value={p.form.child?.birthDate}
            onChange={(iso) => p.up("child.birthDate", iso)}
            fromYear={1980}
            toYear={new Date().getFullYear()}
          />
        </div>

        <div>
          <label className="lbl">
            {t("common.admin.customers.customerDialog.club")}
          </label>
          <input
            className="input"
            value={p.form.child?.club || ""}
            onChange={(e) => p.up("child.club", e.target.value)}
          />
        </div>
      </div>
    </fieldset>
  );
}
