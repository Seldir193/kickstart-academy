"use client";

import React from "react";
import {
  GROUPED_COURSE_OPTIONS,
  ALL_COURSE_OPTIONS,
} from "@/app/lib/courseOptions";
import { clsx } from "../utils";

type Props = {
  q: string;
  setQ: (v: string) => void;
  setPage: (v: number) => void;

  createOpen: boolean; // nur damit Props stabil bleiben (nicht genutzt)
  setCreateOpen: (v: boolean) => void;

  locations: string[];
  locationFilter: string;
  setLocationFilter: (v: string) => void;

  courseValue: string;
  setCourseValue: (v: string) => void;

  locationOpen: boolean;
  setLocationOpen: React.Dispatch<React.SetStateAction<boolean>>;
  courseOpen: boolean;
  setCourseOpen: React.Dispatch<React.SetStateAction<boolean>>;

  locationDropdownRef: React.RefObject<HTMLDivElement | null>;
  courseDropdownRef: React.RefObject<HTMLDivElement | null>;
};

export default function TrainingFilters(props: Props) {
  const {
    q,
    setQ,
    setPage,
    setCreateOpen,
    locations,
    locationFilter,
    setLocationFilter,
    courseValue,
    setCourseValue,
    locationOpen,
    setLocationOpen,
    courseOpen,
    setCourseOpen,
    locationDropdownRef,
    courseDropdownRef,
  } = props;

  const locationLabel = !locationFilter ? "All locations" : locationFilter;

  const courseLabel = (() => {
    if (!courseValue) return "All courses";
    const found =
      ALL_COURSE_OPTIONS.find((o) => o.value === courseValue) || null;
    return found?.label || "All courses";
  })();

  return (
    <section className="filters">
      <div className="filters__row">
        <div className="filters__field">
          <button className="btn" onClick={() => setCreateOpen(true)}>
            <img
              src="/icons/plus.svg"
              alt=""
              aria-hidden="true"
              className="btn__icon"
            />
            Create new offer
          </button>
        </div>
        <div className="filters__field filters__field--grow">
          <label className="label">Search offers (min. 2 letters)</label>

          <div className="input-with-icon">
            <img
              src="/icons/search.svg"
              alt=""
              aria-hidden="true"
              className="input-with-icon__icon"
            />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              className="input input-with-icon__input"
              placeholder="e.g., Summer Camp or street/city/zip"
            />
          </div>
        </div>
      </div>

      {/* Locations – Custom Dropdown */}
      <div className="filters__field">
        <label className="label">Locations</label>
        <div
          className={clsx(
            "ks-training-select",
            locationOpen && "ks-training-select--open",
          )}
          ref={locationDropdownRef}
        >
          <button
            type="button"
            className="ks-training-select__trigger"
            onClick={() => {
              setLocationOpen((open) => !open);
              setCourseOpen(false);
            }}
          >
            <span className="ks-training-select__label">{locationLabel}</span>
            <span className="ks-training-select__chevron" aria-hidden="true" />
          </button>

          {locationOpen && (
            <ul className="ks-training-select__menu" role="listbox">
              <li>
                <button
                  type="button"
                  className={clsx(
                    "ks-training-select__option",
                    !locationFilter && "is-selected",
                  )}
                  onClick={() => {
                    setLocationFilter("");
                    setPage(1);
                    setLocationOpen(false);
                  }}
                >
                  All locations
                </button>
              </li>

              {locations.map((loc) => (
                <li key={loc}>
                  <button
                    type="button"
                    className={clsx(
                      "ks-training-select__option",
                      locationFilter === loc && "is-selected",
                    )}
                    onClick={() => {
                      setLocationFilter(loc);
                      setPage(1);
                      setLocationOpen(false);
                    }}
                  >
                    {loc}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Courses – Custom Dropdown */}
      <div className="filters__field">
        <label className="label">Courses</label>
        <div
          className={clsx(
            "ks-training-select",
            courseOpen && "ks-training-select--open",
          )}
          ref={courseDropdownRef}
        >
          <button
            type="button"
            className="ks-training-select__trigger"
            onClick={() => {
              setCourseOpen((open) => !open);
              setLocationOpen(false);
            }}
          >
            <span className="ks-training-select__label">{courseLabel}</span>
            <span className="ks-training-select__chevron" aria-hidden="true" />
          </button>

          {courseOpen && (
            <div className="ks-training-select__menu ks-training-select__menu--grouped">
              <button
                type="button"
                className={clsx(
                  "ks-training-select__option ks-training-select__option--top",
                  !courseValue && "is-selected",
                )}
                onClick={() => {
                  setCourseValue("");
                  setPage(1);
                  setCourseOpen(false);
                }}
              >
                All courses
              </button>

              {GROUPED_COURSE_OPTIONS.map((group) => (
                <div key={group.label} className="ks-training-select__group">
                  <div className="ks-training-select__group-label">
                    {group.label}
                  </div>
                  {group.items.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={clsx(
                        "ks-training-select__option",
                        courseValue === opt.value && "is-selected",
                      )}
                      onClick={() => {
                        setCourseValue(opt.value);
                        setPage(1);
                        setCourseOpen(false);
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
      </div>
    </section>
  );
}
