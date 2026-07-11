"use client";

import type { TFunction } from "i18next";
import type { CustomerParentFieldsetProps } from "./customerParentFieldset.types";

function salutationLabel(value: string | undefined, t: TFunction) {
  if (value === "Frau") return t("common.admin.customers.customerDialog.salutationMs");
  if (value === "Herr") return t("common.admin.customers.customerDialog.salutationMr");
  return "—";
}

function optionClass(active: boolean) {
  return "ks-selectbox__option" + (active ? " ks-selectbox__option--active" : "");
}

function choose(p: CustomerParentFieldsetProps, value: string) {
  p.up("parent.salutation", value);
  p.setSalutationOpen(false);
}

export default function CustomerSalutationField({ p, t }: { p: CustomerParentFieldsetProps; t: TFunction }) {
  const value = p.form.parent?.salutation;
  return <div><label className="lbl">{t("common.admin.customers.customerDialog.salutation")}</label><div className={"ks-selectbox" + (p.salutationOpen ? " ks-selectbox--open" : "")} ref={p.salutationDropdownRef}><button type="button" className="ks-selectbox__trigger" onClick={() => p.setSalutationOpen((open) => !open)}><span className="ks-selectbox__label">{salutationLabel(value, t)}</span><span className="ks-selectbox__chevron" aria-hidden="true" /></button>{p.salutationOpen ? <div className="ks-selectbox__panel"><button type="button" className={optionClass(!value)} onClick={() => choose(p, "")}>—</button><button type="button" className={optionClass(value === "Frau")} onClick={() => choose(p, "Frau")}>{t("common.admin.customers.customerDialog.salutationMs")}</button><button type="button" className={optionClass(value === "Herr")} onClick={() => choose(p, "Herr")}>{t("common.admin.customers.customerDialog.salutationMr")}</button></div> : null}</div></div>;
}
