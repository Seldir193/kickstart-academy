import { useEffect, useRef, useState } from "react";

export function useFilterDropdown() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);
  useOutsideClose(open, setOpen, triggerRef, menuRef);
  return { open, setOpen, triggerRef, menuRef };
}

function useOutsideClose(
  open: boolean,
  setOpen: (value: boolean) => void,
  triggerRef: React.RefObject<HTMLButtonElement | null>,
  menuRef: React.RefObject<HTMLUListElement | null>,
) {
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) =>
      closeOutside(event, setOpen, triggerRef, menuRef);
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [menuRef, open, setOpen, triggerRef]);
}

function closeOutside(
  event: PointerEvent,
  setOpen: (value: boolean) => void,
  triggerRef: React.RefObject<HTMLButtonElement | null>,
  menuRef: React.RefObject<HTMLUListElement | null>,
) {
  const target = event.target as Node;
  if (triggerRef.current?.contains(target)) return;
  if (menuRef.current?.contains(target)) return;
  setOpen(false);
}
