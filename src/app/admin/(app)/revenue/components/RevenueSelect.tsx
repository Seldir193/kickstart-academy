"use client";

import type { ReactNode, RefObject } from "react";
import { clsx } from "../utils";
import styles from "@/app/styles/revenue.module.scss";

type Props = {
  id: string;
  label: string;
  open: boolean;
  value: ReactNode;
  innerRef: RefObject<HTMLDivElement | null>;
  onToggle: () => void;
  children: ReactNode;
  month?: boolean;
};

export default function RevenueSelect({
  id,
  label,
  open,
  value,
  innerRef,
  onToggle,
  children,
  month,
}: Props) {
  return (
    <div className={styles.filter}>
      <label htmlFor={id}>{label}</label>
      <div
        ref={innerRef}
        className={clsx(
          month ? styles.monthDropdown : styles.yearDropdown,
          "ks-selectbox",
          open && "ks-selectbox--open",
        )}
      >
        <button
          id={id}
          type="button"
          className="ks-selectbox__trigger"
          onClick={onToggle}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="ks-selectbox__label">{value}</span>
          <span className="ks-selectbox__chevron" aria-hidden="true" />
        </button>
        {open ? (
          <div className="ks-selectbox__panel" role="listbox">
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
}
