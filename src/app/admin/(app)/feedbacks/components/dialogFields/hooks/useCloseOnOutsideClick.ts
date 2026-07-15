import { useEffect, type RefObject } from "react";

function containsTarget(ref: RefObject<HTMLDivElement | null>, target: Node) {
  return Boolean(ref.current?.contains(target));
}

function isOutside(
  ref: RefObject<HTMLDivElement | null>,
  target: EventTarget | null,
) {
  return target instanceof Node && !containsTarget(ref, target);
}

export function useCloseOnOutsideClick(
  ref: RefObject<HTMLDivElement | null>,
  close: () => void,
) {
  useEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (isOutside(ref, event.target)) close();
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => removeListeners(handlePointerDown);
  }, [ref, close]);
}

function removeListeners(listener: (event: MouseEvent | TouchEvent) => void) {
  document.removeEventListener("mousedown", listener);
  document.removeEventListener("touchstart", listener);
}
