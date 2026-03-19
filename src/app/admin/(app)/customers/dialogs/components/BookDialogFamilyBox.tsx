//src\app\admin\(app)\customers\dialogs\components\BookDialogFamilyBox.tsx
"use client";

import React from "react";
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

export default function BookDialogFamilyBox(p: Props) {
  return (
    <div className="mb-3 p-3 rounded border bg-gray-50 text-sm">
      <div className="font-semibold mb-1">Booking for</div>

      {p.familyLoading && <div className="text-gray-600">Loading family…</div>}

      {p.familyError && (
        <div className="text-red-600">
          Family could not be loaded – booking is still possible.
        </div>
      )}

      {p.family && p.family.length > 0 ? (
        <>
          <div className="mb-2">
            <label className="lbl">Elternteil</label>
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
                  {p.selectedParentLabel || "Elternteil wählen …"}
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
              className={`btn btn-sm ${
                p.bookingTarget === "self" ? "btn--tab-active" : "btn-outline"
              }`}
              onClick={() => p.setBookingTarget("self")}
            >
              Kunde selbst
            </button>

            <button
              type="button"
              className={`btn btn-sm ${
                p.bookingTarget === "child" ? "btn--tab-active" : "btn-outline"
              }`}
              onClick={() => p.setBookingTarget("child")}
            >
              Kind
            </button>
          </div>

          {p.bookingTarget === "child" && (
            <div className="mb-2">
              <label className="lbl">Kind</label>
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
                      : "Kind wählen …"}
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
              <span className="font-medium">Parent:</span>{" "}
              {p.selectedParent
                ? `${p.selectedParent.parent.firstName} ${p.selectedParent.parent.lastName}`.trim()
                : "—"}
            </div>

            <div>
              <span className="font-medium">Child:</span>{" "}
              {p.bookingTarget === "child" && p.activeChild
                ? `${p.activeChild.firstName} ${p.activeChild.lastName}`.trim()
                : "—"}
            </div>
          </div>
        </>
      ) : (
        !p.familyLoading && (
          <div className="text-gray-700">
            Booking will be created for the current customer.
          </div>
        )
      )}
    </div>
  );
}
