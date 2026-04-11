"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import type { FamilyChild, FamilyMember } from "../bookDialog/types";

type BookingTarget = "self" | "child";

type ChildOption = {
  uid: string;
  label: string;
  parentId: string;
  child: FamilyChild;
};

type ParentOption = {
  id: string;
  label: string;
};

type Props = {
  family: FamilyMember[] | null;
  familyLoading: boolean;
  familyError: string | null;
  selectedParent: FamilyMember | null;
  selectedParentId: string;
  selectedParentLabel: string;
  parentOptions: ParentOption[];
  activeChild: FamilyChild | null;
  bookingTarget: BookingTarget;
  setBookingTarget: (v: BookingTarget) => void;
  parentOpen: boolean;
  setParentOpen: (v: boolean | ((p: boolean) => boolean)) => void;
  childOpen: boolean;
  setChildOpen: (v: boolean | ((p: boolean) => boolean)) => void;
  setSelectedParentId: (v: string) => void;
  selectedChildUid: string;
  setSelectedChildUid: (v: string) => void;
  childOptions: ChildOption[];
  parentDropdownRef: React.RefObject<HTMLDivElement | null>;
  childDropdownRef: React.RefObject<HTMLDivElement | null>;
};

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

export default function BookDialogFamilyBox(p: Props) {
  const { t } = useTranslation();

  return (
    <div className="mb-3 p-3 rounded border bg-gray-50 text-sm">
      <div className="font-semibold mb-1">
        {t("common.admin.customers.bookDialog.family.bookingFor")}
      </div>
      {p.familyLoading && (
        <div className="text-gray-600">
          {t("common.admin.customers.bookDialog.family.loading")}
        </div>
      )}

      {p.familyError && (
        <div className="text-red-600">
          {t("common.admin.customers.bookDialog.family.error")}
        </div>
      )}
      {p.family && p.family.length > 0 ? (
        <>
          <div className="mb-2">
            <label className="lbl">
              {" "}
              {t("common.admin.customers.bookDialog.parent")}
            </label>
            <div
              className={
                "ks-selectbox" + (p.parentOpen ? " ks-selectbox--open" : "")
              }
              ref={p.parentDropdownRef}
            >
              <button
                type="button"
                className="ks-selectbox__trigger"
                onClick={() => p.setParentOpen((o) => !o)}
              >
                <span className="ks-selectbox__label">
                  {p.selectedParentLabel ||
                    t("common.admin.customers.bookDialog.selectParent")}
                </span>
                <span className="ks-selectbox__chevron" aria-hidden="true" />
              </button>

              {p.parentOpen && (
                <div className="ks-selectbox__panel" role="listbox">
                  {p.parentOptions.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      className={
                        "ks-selectbox__option" +
                        (item.id === p.selectedParentId
                          ? " ks-selectbox__option--active"
                          : "")
                      }
                      onClick={() => {
                        p.setSelectedParentId(item.id);
                        p.setParentOpen(false);
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 mb-2">
            <button
              type="button"
              className={
                "btn btn-sm book-dialog__scopeBtn" +
                (p.bookingTarget === "self"
                  ? " book-dialog__scopeBtn--active"
                  : "")
              }
              onMouseDown={rememberButtonFocusState}
              onClick={(e) =>
                toggleButtonFocus(e, () => p.setBookingTarget("self"))
              }
            >
              {t("common.admin.customers.bookDialog.customerSelf")}
            </button>

            <button
              type="button"
              className={
                "btn btn-sm book-dialog__scopeBtn" +
                (p.bookingTarget === "child"
                  ? " book-dialog__scopeBtn--active"
                  : "")
              }
              onMouseDown={rememberButtonFocusState}
              onClick={(e) =>
                toggleButtonFocus(e, () => p.setBookingTarget("child"))
              }
            >
              {t("common.admin.customers.bookDialog.child")}
            </button>
          </div>

          {p.bookingTarget === "child" && (
            <div className="mb-2">
              <label className="lbl">
                {" "}
                {t("common.admin.customers.bookDialog.child")}
              </label>
              <div
                className={
                  "ks-selectbox" + (p.childOpen ? " ks-selectbox--open" : "")
                }
                ref={p.childDropdownRef}
              >
                <button
                  type="button"
                  className="ks-selectbox__trigger"
                  onClick={() => p.setChildOpen((o) => !o)}
                >
                  <span className="ks-selectbox__label">
                    {p.activeChild
                      ? `${p.activeChild.firstName} ${p.activeChild.lastName}`.trim()
                      : t("common.admin.customers.bookDialog.selectChild")}
                  </span>
                  <span className="ks-selectbox__chevron" aria-hidden="true" />
                </button>

                {p.childOpen && (
                  <div className="ks-selectbox__panel" role="listbox">
                    {p.childOptions.map((item) => (
                      <button
                        type="button"
                        key={item.uid}
                        className={
                          "ks-selectbox__option" +
                          (item.uid === p.selectedChildUid
                            ? " ks-selectbox__option--active"
                            : "")
                        }
                        onClick={() => {
                          p.setSelectedChildUid(item.uid);
                          p.setChildOpen(false);
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="text-gray-700 mt-2">
            <div>
              <span className="font-medium">
                {t("common.admin.customers.bookDialog.parentLabel")}
              </span>{" "}
              {p.selectedParent
                ? `${p.selectedParent.parent.firstName} ${p.selectedParent.parent.lastName}`.trim()
                : t("common.admin.customers.bookDialog.empty")}
            </div>

            <div>
              <span className="font-medium">
                {t("common.admin.customers.bookDialog.childLabel")}
              </span>{" "}
              {p.bookingTarget === "child" && p.activeChild
                ? `${p.activeChild.firstName} ${p.activeChild.lastName}`.trim()
                : t("common.admin.customers.bookDialog.empty")}
            </div>
          </div>
        </>
      ) : (
        !p.familyLoading && (
          <div className="text-gray-700">
            {t("common.admin.customers.bookDialog.family.currentCustomer")}
          </div>
        )
      )}
    </div>
  );
}
