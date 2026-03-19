import { useEffect } from "react";

export function useOutsideClose<T extends HTMLElement>(
  rootRef: React.RefObject<T | null>,
  open: boolean,
  setOpen: (v: boolean) => void,
) {
  useEffect(() => {
    if (!open) return;

    function onDoc(e: MouseEvent) {
      const t = e.target as Node | null;
      if (!t) return;
      const root = rootRef.current;
      if (!root) return;
      if (root.contains(t)) return;
      setOpen(false);
    }

    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, rootRef, setOpen]);
}
