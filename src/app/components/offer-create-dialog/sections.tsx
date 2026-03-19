"use client";

import React from "react";
import type { Place } from "@/types/place";
import type { CategoryKey } from "./types";
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  HOLIDAY_WEEK_PRESETS,
} from "./constants";
import { clsx } from "./utils";

export function DialogShell({
  panelRef,
  title,
  onClose,
  children,
}: {
  panelRef: React.RefObject<HTMLDivElement | null>;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="modal">
      <div className="modal__overlay" />
      <div className="modal__wrap">
        <div
          ref={panelRef}
          className="modal__panel"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={onClose}
            className="modal__close"
            aria-label="Close"
          >
            <img
              src="/icons/close.svg"
              alt=""
              aria-hidden="true"
              className="icon-img"
            />
          </button>

          <h2 className="modal__title">{title}</h2>
          {children}
        </div>
      </div>
    </div>
  );
}

export function KsSelectbox({
  rootRef,
  open,
  onToggle,
  label,
  children,
}: {
  rootRef: React.RefObject<HTMLDivElement | null>;
  open: boolean;
  onToggle: () => void;
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      ref={rootRef}
      className={clsx("ks-selectbox", open && "ks-selectbox--open")}
    >
      <button
        type="button"
        className="ks-selectbox__trigger"
        onClick={onToggle}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="ks-selectbox__label">{label}</span>
        <span className="ks-selectbox__chevron" aria-hidden="true" />
      </button>

      {open ? (
        <div className="ks-selectbox__panel" role="listbox">
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function CategoryField({
  categoryDropdownRef,
  categoryOpen,
  setCategoryOpen,
  categoryUI,
  onPick,
}: {
  categoryDropdownRef: React.RefObject<HTMLDivElement | null>;
  categoryOpen: boolean;
  setCategoryOpen: React.Dispatch<React.SetStateAction<boolean>>;
  categoryUI: CategoryKey | "";
  onPick: (next: CategoryKey | "") => void;
}) {
  return (
    <div className="form__group">
      <label className="label">Category</label>

      <KsSelectbox
        rootRef={categoryDropdownRef}
        open={categoryOpen}
        onToggle={() => setCategoryOpen((o) => !o)}
        label={categoryUI ? CATEGORY_LABEL[categoryUI] : "— Select category —"}
      >
        <button
          type="button"
          className={clsx(
            "ks-selectbox__option",
            !categoryUI && "ks-selectbox__option--active",
          )}
          onClick={() => {
            onPick("");
            setCategoryOpen(false);
          }}
        >
          — All categories —
        </button>

        {CATEGORY_ORDER.map((k) => (
          <button
            key={k}
            type="button"
            className={clsx(
              "ks-selectbox__option",
              categoryUI === k && "ks-selectbox__option--active",
            )}
            onClick={() => {
              onPick(k);
              setCategoryOpen(false);
            }}
          >
            {CATEGORY_LABEL[k]}
          </button>
        ))}
      </KsSelectbox>
    </div>
  );
}

export function CourseField({
  courseDropdownRef,
  courseOpen,
  setCourseOpen,
  selectedCourseLabel,
  courseUI,
  groupedCourses,
  onPick,
}: {
  courseDropdownRef: React.RefObject<HTMLDivElement | null>;
  courseOpen: boolean;
  setCourseOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedCourseLabel: string | null;
  courseUI: string;
  groupedCourses: Array<{
    cat: CategoryKey;
    items: Array<{ value: string; label: string }>;
  }>;
  onPick: (value: string) => void;
}) {
  return (
    <div className="form__group">
      <label className="label">Course</label>

      <KsSelectbox
        rootRef={courseDropdownRef}
        open={courseOpen}
        onToggle={() => setCourseOpen((o) => !o)}
        label={selectedCourseLabel ? selectedCourseLabel : "— Select course —"}
      >
        <button
          type="button"
          className={clsx(
            "ks-selectbox__option",
            !courseUI && "ks-selectbox__option--active",
          )}
          onClick={() => {
            onPick("");
            setCourseOpen(false);
          }}
        >
          — No course selected —
        </button>

        {groupedCourses.map(({ cat, items }) => (
          <div key={cat} className="ks-selectbox__group">
            <div className="ks-selectbox__group-label">
              {CATEGORY_LABEL[cat]}
            </div>
            {items.map((c) => (
              <button
                key={c.value}
                type="button"
                className={clsx(
                  "ks-selectbox__option",
                  courseUI === c.value && "ks-selectbox__option--active",
                )}
                onClick={() => {
                  onPick(c.value);
                  setCourseOpen(false);
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        ))}
      </KsSelectbox>
    </div>
  );
}

export function PlaceField({
  placeDropdownRef,
  placeOpen,
  setPlaceOpen,
  selectedPlaceLabel,
  selectedPlace,
  places,
  onPick,
}: {
  placeDropdownRef: React.RefObject<HTMLDivElement | null>;
  placeOpen: boolean;
  setPlaceOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedPlaceLabel: string;
  selectedPlace: Place | null;
  places: Place[];
  onPick: (placeId: string) => void;
}) {
  return (
    <div className="form__group">
      <label className="label">Place</label>

      <KsSelectbox
        rootRef={placeDropdownRef}
        open={placeOpen}
        onToggle={() => setPlaceOpen((o) => !o)}
        label={
          selectedPlace
            ? `${selectedPlace.name} • ${selectedPlace.city}`
            : selectedPlaceLabel
        }
      >
        <button
          type="button"
          className={clsx(
            "ks-selectbox__option",
            !selectedPlace && "ks-selectbox__option--active",
          )}
          onClick={() => {
            onPick("");
            setPlaceOpen(false);
          }}
        >
          — Select place —
        </button>

        {places.map((p) => (
          <button
            key={p._id}
            type="button"
            className={clsx(
              "ks-selectbox__option",
              selectedPlace?._id === p._id && "ks-selectbox__option--active",
            )}
            onClick={() => {
              onPick(p._id);
              setPlaceOpen(false);
            }}
          >
            {p.name} • {p.city}
          </button>
        ))}
      </KsSelectbox>
    </div>
  );
}

export function HolidayWeekField({
  holidayDropdownRef,
  holidayOpen,
  setHolidayOpen,
  holidayPreset,
  holidayCustom,
  onPickPreset,
  onChangeCustom,
}: {
  holidayDropdownRef: React.RefObject<HTMLDivElement | null>;
  holidayOpen: boolean;
  setHolidayOpen: React.Dispatch<React.SetStateAction<boolean>>;
  holidayPreset: string;
  holidayCustom: string;
  onPickPreset: (next: string) => void;
  onChangeCustom: (val: string) => void;
}) {
  return (
    <div className="form__group">
      <label className="label">Ferienwoche</label>

      <div className="grid grid--2">
        <KsSelectbox
          rootRef={holidayDropdownRef}
          open={holidayOpen}
          onToggle={() => setHolidayOpen((o) => !o)}
          label={
            !holidayPreset
              ? "— Bitte wählen —"
              : holidayPreset === "__custom__"
                ? "Andere Ferienwoche…"
                : holidayPreset
          }
        >
          <button
            type="button"
            className={clsx(
              "ks-selectbox__option",
              !holidayPreset && "ks-selectbox__option--active",
            )}
            onClick={() => {
              onPickPreset("");
              setHolidayOpen(false);
            }}
          >
            — Bitte wählen —
          </button>

          {HOLIDAY_WEEK_PRESETS.map((name) => (
            <button
              key={name}
              type="button"
              className={clsx(
                "ks-selectbox__option",
                holidayPreset === name && "ks-selectbox__option--active",
              )}
              onClick={() => {
                onPickPreset(name);
                setHolidayOpen(false);
              }}
            >
              {name}
            </button>
          ))}

          <button
            type="button"
            className={clsx(
              "ks-selectbox__option",
              holidayPreset === "__custom__" && "ks-selectbox__option--active",
            )}
            onClick={() => {
              onPickPreset("__custom__");
              setHolidayOpen(false);
            }}
          >
            Andere Ferienwoche…
          </button>
        </KsSelectbox>

        {holidayPreset === "__custom__" ? (
          <input
            className="input"
            placeholder="z. B. Osterferien Intensivcamp"
            value={holidayCustom}
            onChange={(e) => onChangeCustom(e.target.value)}
          />
        ) : null}
      </div>
    </div>
  );
}
