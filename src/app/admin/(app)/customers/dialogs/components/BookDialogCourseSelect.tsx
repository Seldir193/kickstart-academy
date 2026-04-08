"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { GROUPED_COURSE_OPTIONS } from "src/app/lib/courseOptions";

type Props = {
  courseValue: string;
  setCourseValue: (v: string) => void;
  selectedCourseLabel: string;
  isOpen: boolean;
  setIsOpen: (v: boolean | ((p: boolean) => boolean)) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
};

export default function BookDialogCourseSelect(p: Props) {
  const { t } = useTranslation();
  return (
    <div
      className={"ks-selectbox" + (p.isOpen ? " ks-selectbox--open" : "")}
      ref={p.dropdownRef}
    >
      <button
        type="button"
        className="ks-selectbox__trigger"
        onClick={() => p.setIsOpen((o) => !o)}
      >
        <span className="ks-selectbox__label">{p.selectedCourseLabel}</span>
        <span className="ks-selectbox__chevron" aria-hidden="true" />
      </button>

      {p.isOpen && (
        <div className="ks-selectbox__panel">
          <button
            type="button"
            className={
              "ks-selectbox__option" +
              (p.courseValue === "" ? " ks-selectbox__option--active" : "")
            }
            onClick={() => {
              p.setCourseValue("");
              p.setIsOpen(false);
            }}
          >
            {t("common.admin.customers.bookDialog.allCourses")}
          </button>

          {GROUPED_COURSE_OPTIONS.map((g) => (
            <div key={g.label} className="ks-selectbox__group">
              <div className="ks-selectbox__group-label">{g.label}</div>
              {g.items.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={
                    "ks-selectbox__option" +
                    (p.courseValue === opt.value
                      ? " ks-selectbox__option--active"
                      : "")
                  }
                  onClick={() => {
                    p.setCourseValue(opt.value);
                    p.setIsOpen(false);
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
