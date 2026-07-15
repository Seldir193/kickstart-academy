"use client";

import { useCallback } from "react";
import { useDropdownOutsideClose } from "@/app/admin/(app)/shared/hooks/useDropdownOutsideClose";
import { getPlaceSortLabel, PLACE_SORT_OPTIONS } from "./placeSort";
import type { PlacesSortSelectProps } from "./types";
import PlacesSortOption from "./PlacesSortOption";

export default function PlacesSortSelect(props: PlacesSortSelectProps) {
  const { setOpen } = props;
  const close = useCallback(() => setOpen(false), [setOpen]);
  useDropdownOutsideClose(props.open, props.triggerRef, props.menuRef, close);

  return (
    <div
      className={
        "ks-training-select" + (props.open ? " ks-training-select--open" : "")
      }
    >
      <SortTrigger {...props} />
      {props.open ? <SortMenu {...props} /> : null}
    </div>
  );
}

function SortTrigger(props: PlacesSortSelectProps) {
  return (
    <button
      type="button"
      ref={props.triggerRef}
      className="ks-training-select__trigger"
      onClick={() => props.setOpen((open) => !open)}
      disabled={props.busy}
      aria-label={sortAria(props)}
    >
      <span className="ks-training-select__label">
        {getPlaceSortLabel(props.sort, props.t)}
      </span>
      <span className="ks-training-select__chevron" aria-hidden="true" />
    </button>
  );
}

function SortMenu(props: PlacesSortSelectProps) {
  return (
    <ul
      ref={props.menuRef}
      className="ks-training-select__menu"
      role="listbox"
      aria-label={sortAria(props)}
    >
      {PLACE_SORT_OPTIONS.map((option) => (
        <PlacesSortOption
          key={option.value}
          option={option}
          active={props.sort === option.value}
          t={props.t}
          onSelect={props.onSortChange}
        />
      ))}
    </ul>
  );
}

function sortAria({ t }: PlacesSortSelectProps) {
  return t("common.admin.places.sort.ariaLabel", {
    defaultValue: "Sort order",
  });
}
