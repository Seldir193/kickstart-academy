"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import RevokeClient from "./RevokeClient";

export default function WeeklyRevokePage() {
  const searchParams = useSearchParams();

  const token = useMemo(() => {
    return String(searchParams.get("token") || "").trim();
  }, [searchParams]);

  return <RevokeClient token={token} />;
}
