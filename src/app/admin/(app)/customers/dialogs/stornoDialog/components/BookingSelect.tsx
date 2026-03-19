//src\app\admin\(app)\customers\dialogs\stornoDialog\components\BookingSelect.tsx
"use client";

import React, { useMemo } from "react";
import type { StatusFilter } from "../constants";
import { bookingDisplay } from "../bookingDisplay";
import { cx } from "../formatters";

type Trigger = {
  title: string;
  invoice: string;
  venue: string;
  status: string;
};

type Props = {
  label: string;

  open: boolean;
  setOpen: (v: boolean) => void;
  openMenu: () => void;

  triggerRef: React.RefObject<HTMLButtonElement | null>;
  menuRef: React.RefObject<HTMLDivElement | null>;

  disabled: boolean;
  trigger: Trigger;

  items: any[];
  selectedId: string;
  onSelect: (id: string) => void;

  statusFilter: StatusFilter;
  isCancelledSelected: boolean;
};

export function BookingSelect({
  label,
  open,
  setOpen,
  openMenu,
  triggerRef,
  menuRef,
  disabled,
  trigger,
  items,
  selectedId,
  onSelect,
  statusFilter,
  isCancelledSelected,
}: Props) {
  const triggerNode = useMemo(
    () => <Row d={trigger} cancelled={false} />,
    [trigger],
  );

  return (
    <div>
      <label className="lbl">{label}</label>

      <div
        className={cx(
          "ks-selectbox",
          open && "ks-selectbox--open",
          disabled && "ks-selectbox--disabled",
        )}
      >
        <button
          ref={triggerRef}
          type="button"
          className={cx(
            "ks-selectbox__trigger",
            isCancelledSelected && "ks-storno__trigger--cancelled",
          )}
          onClick={() => (open ? setOpen(false) : openMenu())}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="ks-selectbox__label ks-booking-select__triggerLabel">
            {triggerNode}
          </span>
          <span className="ks-selectbox__chevron" aria-hidden="true" />
        </button>
      </div>

      {open && items.length > 0 && (
        <div
          ref={menuRef}
          className="ks-selectbox__panel ks-storno__menu"
          role="listbox"
          onWheel={(e) => e.stopPropagation()}
          onScroll={(e) => e.stopPropagation()}
        >
          {items.map((b: any) => {
            const cancelled = String(b.status || "") === "cancelled";
            const active = selectedId === String(b._id);
            const d = bookingDisplay(b, statusFilter);

            return (
              <button
                key={b._id || `${b.offerId}-${b.createdAt}`}
                type="button"
                role="option"
                aria-selected={active}
                aria-disabled={cancelled}
                disabled={cancelled}
                className={cx(
                  "ks-selectbox__option",
                  active && "ks-selectbox__option--active",
                  "ks-storno__option",
                )}
                onClick={() => {
                  if (cancelled) return;
                  onSelect(String(b._id));
                  setOpen(false);
                }}
              >
                <Row d={d} cancelled={cancelled} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Row({ d, cancelled }: { d: Trigger; cancelled: boolean }) {
  return (
    <div className="ks-booking-select__row">
      <div className="ks-booking-select__top">
        <div className="ks-booking-select__title">{d.title}</div>

        {d.invoice ? (
          <div className="ks-booking-select__invoiceCol">
            <span className="ks-booking-select__invoice">{d.invoice}</span>
          </div>
        ) : null}
      </div>

      {renderBottom(d, cancelled)}
    </div>
  );
}

function renderBottom(d: Trigger, cancelled: boolean) {
  const text = [d.venue, d.status].filter(Boolean).join(" · ");
  if (!text) return null;

  return (
    <div
      className={
        "ks-booking-select__bottom" +
        (cancelled ? " ks-booking-select__bottom--cancelled" : "")
      }
    >
      {text}
    </div>
  );
}
