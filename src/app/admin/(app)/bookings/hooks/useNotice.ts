"use client";

import { useCallback, useState } from "react";

type Notice = { type: "ok" | "error"; text: string } | null;

export function useNotice(timeoutMs = 5000) {
  const [notice, setNotice] = useState<Notice>(null);

  const push = useCallback(
    (type: "ok" | "error", text: string) => {
      setNotice({ type, text });
      window.setTimeout(() => setNotice(null), timeoutMs);
    },
    [timeoutMs],
  );

  const showOk = useCallback((text: string) => push("ok", text), [push]);
  const showError = useCallback((text: string) => push("error", text), [push]);

  return { notice, showOk, showError };
}
