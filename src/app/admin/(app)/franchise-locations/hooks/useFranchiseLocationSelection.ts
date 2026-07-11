import { useCallback, useRef, useState } from "react";

function useToggleState() {
  const [value, setValue] = useState(false);
  const toggle = useCallback(() => setValue((current) => !current), []);
  return [value, setValue, toggle] as const;
}

export function useFranchiseLocationSelection() {
  const [minePendingSelectMode, setMinePending, toggleMinePendingSelectMode] = useToggleState();
  const [mineApprovedSelectMode, setMineApproved, toggleMineApprovedSelectMode] = useToggleState();
  const [mineRejectedSelectMode, setMineRejected, toggleMineRejectedSelectMode] = useToggleState();
  const [provApprovedSelectMode, setProvApproved, toggleProvApprovedSelectMode] = useToggleState();
  const [provRejectedSelectMode, setProvRejected, toggleProvRejectedSelectMode] = useToggleState();
  const minePendingToggleRef = useRef<HTMLButtonElement | null>(null);
  const mineApprovedToggleRef = useRef<HTMLButtonElement | null>(null);
  const mineRejectedToggleRef = useRef<HTMLButtonElement | null>(null);
  const provApprovedToggleRef = useRef<HTMLButtonElement | null>(null);
  const provRejectedToggleRef = useRef<HTMLButtonElement | null>(null);
  const resetSelection = useCallback(() => {
    setMinePending(false); setMineApproved(false); setMineRejected(false);
    setProvApproved(false); setProvRejected(false);
  }, [setMinePending, setMineApproved, setMineRejected, setProvApproved, setProvRejected]);
  return { minePendingSelectMode, mineApprovedSelectMode, mineRejectedSelectMode,
    provApprovedSelectMode, provRejectedSelectMode, toggleMinePendingSelectMode,
    toggleMineApprovedSelectMode, toggleMineRejectedSelectMode, toggleProvApprovedSelectMode,
    toggleProvRejectedSelectMode, minePendingToggleRef, mineApprovedToggleRef,
    mineRejectedToggleRef, provApprovedToggleRef, provRejectedToggleRef, resetSelection };
}
