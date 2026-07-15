import { createPortal } from "react-dom";
import type { ReactNode } from "react";

export default function BookingDialogPortal({
  children,
}: {
  children: ReactNode;
}) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}
