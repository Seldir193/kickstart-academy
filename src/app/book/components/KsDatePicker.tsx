//src\app\book\components\KsDatePicker.tsx
"use client";

import React, { useEffect, useRef } from "react";
import InvoicesKsDatePicker from "@/app/admin/(app)/invoices/components/KsDatePicker";

type Props = {
  id?: string;
  name: string;
  value: string;
  min?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => void;
};

function emit_date_change(
  onChange: Props["onChange"],
  name: string,
  value: string,
) {
  onChange({ target: { name, value, type: "date" } } as any);
}

export function KsDatePicker({
  name,
  value,
  min,
  placeholder,
  disabled,
  onChange,
}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const clampPanel = () => {
      const panel = host.querySelector(
        ".ks-datepicker__panel",
      ) as HTMLElement | null;
      if (!panel) return;

      panel.style.transform = "";

      const panelRect = panel.getBoundingClientRect();

      const modalPanel = host.closest(".ks-panel") as HTMLElement | null;

      const boundsRect = modalPanel
        ? modalPanel.getBoundingClientRect()
        : ({ left: 12, right: window.innerWidth - 12 } as DOMRect);

      const pad = 12;
      const leftLimit = boundsRect.left + pad;
      const rightLimit = boundsRect.right - pad;

      let dx = 0;

      if (panelRect.right > rightLimit) {
        dx = rightLimit - panelRect.right;
      }

      if (panelRect.left + dx < leftLimit) {
        dx += leftLimit - (panelRect.left + dx);
      }

      if (dx !== 0) {
        panel.style.transform = `translateX(${Math.round(dx)}px)`;
      }
    };

    const mo = new MutationObserver(() => clampPanel());
    mo.observe(host, { childList: true, subtree: true });

    const onResize = () => clampPanel();
    window.addEventListener("resize", onResize);

    window.addEventListener("scroll", onResize, true);

    return () => {
      mo.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, []);

  return (
    <div ref={hostRef}>
      <InvoicesKsDatePicker
        value={value}
        onChange={(nextIso) => {
          if (min && nextIso && nextIso < min) return;
          emit_date_change(onChange, name, nextIso);
        }}
        placeholder={placeholder}
        disabled={!!disabled}
      />
    </div>
  );
}
