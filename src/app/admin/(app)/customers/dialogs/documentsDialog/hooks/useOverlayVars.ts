//src\app\admin\(app)\customers\dialogs\documentsDialog\hooks\useOverlayVars.ts
import { useEffect } from "react";

type SelectboxLike = {
  open: boolean;
  pos: { left: number; top: number; width: number };
  menuRef: React.RefObject<HTMLDivElement | null>;
};

function px(n: number) {
  return `${Math.max(0, Math.round(n))}px`;
}

export function useOverlayVars(select: SelectboxLike) {
  useEffect(() => {
    if (!select.open) return;
    const el = select.menuRef.current;
    if (!el) return;
    el.style.setProperty("--sb-left", px(select.pos.left));
    el.style.setProperty("--sb-top", px(select.pos.top));
    el.style.setProperty("--sb-width", px(select.pos.width));
  }, [
    select.open,
    select.pos.left,
    select.pos.top,
    select.pos.width,
    select.menuRef,
  ]);
}
