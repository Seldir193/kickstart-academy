"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import type { FamilyMember } from "../types";
import { formatChildLabel } from "../formatters";

type Props = {
  mode: "create" | "edit";
  childFamilyMembers: FamilyMember[];
  selfFamilyMembers: FamilyMember[];
  familyLoading: boolean;
  familyError: string | null;
  familyDropdownOpen: boolean;
  selfDropdownOpen: boolean;
  setFamilyDropdownOpen: (v: boolean | ((p: boolean) => boolean)) => void;
  setSelfDropdownOpen: (v: boolean | ((p: boolean) => boolean)) => void;
  familyDropdownRef: React.RefObject<HTMLDivElement | null>;
  selfDropdownRef: React.RefObject<HTMLDivElement | null>;
  activeFamilyId: string;
  selectedChildLabel: string;
  selectedSelfLabel: string;
  handleSelectFamilyMember: (id: string) => void;
  handleAddSibling: () => void;
  handleAddParent: () => void;
};

function formatSelfLabel(member: FamilyMember, t: (key: string) => string) {
  const first = String(member?.parent?.firstName ?? "").trim();
  const last = String(member?.parent?.lastName ?? "").trim();
  const label = [first, last].filter(Boolean).join(" ");
  return label || t("common.admin.customers.customerDialog.parent");
}

function rememberButtonFocusState(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.dataset.wasFocused = String(
    document.activeElement === e.currentTarget,
  );
}

function toggleButtonFocus(
  e: React.MouseEvent<HTMLButtonElement>,
  action: () => void,
) {
  const btn = e.currentTarget;
  const wasFocused = btn.dataset.wasFocused === "true";
  action();
  requestAnimationFrame(() => {
    if (wasFocused) btn.blur();
    else btn.focus({ preventScroll: true });
    delete btn.dataset.wasFocused;
  });
}

function renderDropdown(
  label: string,
  items: FamilyMember[],
  open: boolean,
  setOpen: (v: boolean | ((p: boolean) => boolean)) => void,
  dropdownRef: React.RefObject<HTMLDivElement | null>,
  activeFamilyId: string,
  selectedLabel: string,
  placeholder: string,
  onSelect: (id: string) => void,
  itemLabel: (member: FamilyMember) => string,
  keepVisible = false,
) {
  if (!items.length && !keepVisible) return null;

  return (
    <div>
      <label className="lbl">{label}</label>

      <div
        className={"family-dropdown" + (open ? " family-dropdown--open" : "")}
        ref={dropdownRef}
      >
        <button
          type="button"
          className="family-dropdown-trigger input"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="family-dropdown-label">
            {selectedLabel || placeholder}
          </span>
          <span className="family-dropdown-caret" aria-hidden="true" />
        </button>

        {open ? (
          <ul className="family-dropdown-menu" role="listbox">
            {items.length
              ? items.map((m) => (
                  <li
                    key={m._id}
                    className={
                      "family-dropdown-item" +
                      (m._id === activeFamilyId
                        ? " family-dropdown-item--active"
                        : "")
                    }
                    onClick={() => onSelect(m._id)}
                    role="option"
                    aria-selected={m._id === activeFamilyId}
                  >
                    {itemLabel(m)}
                  </li>
                ))
              : null}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

export default function CustomerFamilySection(p: Props) {
  const { t } = useTranslation();
  if (p.mode !== "edit") return null;

  return (
    <fieldset className="card mb-3">
      <legend className="font-bold">
        {t("common.admin.customers.customerDialog.familyChildren")}
      </legend>

      {p.familyLoading ? (
        <div className="text-xs text-gray-600 mb-1">
          {t("common.admin.customers.customerDialog.loadingFamily")}
        </div>
      ) : null}

      {p.familyError ? (
        <div className="text-xs text-red-600 mb-1">{p.familyError}</div>
      ) : null}

      {p.childFamilyMembers.length || p.selfFamilyMembers.length ? (
        <>
          <div className="grid md:grid-cols-2 gap-2 mb-2">
            {renderDropdown(
              t("common.admin.customers.customerDialog.selectChild"),
              p.childFamilyMembers,
              p.familyDropdownOpen,
              p.setFamilyDropdownOpen,
              p.familyDropdownRef,
              p.activeFamilyId,
              p.selectedChildLabel,
              t("common.admin.customers.customerDialog.selectChildPlaceholder"),
              p.handleSelectFamilyMember,

              (member) => formatChildLabel(member, t),
            )}

            {renderDropdown(
              t("common.admin.customers.customerDialog.selectParent"),
              p.selfFamilyMembers,
              p.selfDropdownOpen,
              p.setSelfDropdownOpen,
              p.selfDropdownRef,
              p.activeFamilyId,
              p.selectedSelfLabel,
              t("common.admin.customers.customerDialog.selectParent"),
              p.handleSelectFamilyMember,
              (member) => formatSelfLabel(member, t),
              true,
            )}
          </div>

          <div className="flex flex-wrap gap-2 text-sm mt-1">
            <button
              type="button"
              className="btn btn-outline btn-sm ks-customer-family__add-btn"
              onMouseDown={rememberButtonFocusState}
              onClick={(e) => toggleButtonFocus(e, p.handleAddSibling)}
            >
              <img
                src="/icons/plus.svg"
                alt=""
                aria-hidden="true"
                className="btn__icon ks-customer-family__add-icon"
              />
              <span>
                {t("common.admin.customers.customerDialog.addAnotherChild")}
              </span>
            </button>

            <button
              type="button"
              className="btn btn-outline btn-sm ks-customer-family__add-btn"
              onMouseDown={rememberButtonFocusState}
              onClick={(e) => toggleButtonFocus(e, p.handleAddParent)}
            >
              <img
                src="/icons/plus.svg"
                alt=""
                aria-hidden="true"
                className="btn__icon ks-customer-family__add-icon"
              />
              <span>
                {t("common.admin.customers.customerDialog.addAnotherParent")}
              </span>
            </button>
          </div>
        </>
      ) : (
        <div className="text-sm text-gray-600">
          {t("common.admin.customers.customerDialog.noAdditionalChildren")}
        </div>
      )}
    </fieldset>
  );
}
