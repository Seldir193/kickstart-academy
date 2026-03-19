//src\app\components\training-card\hooks\useBootstrapFromURL.ts
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

export function useBootstrapFromURL(args: {
  setQ: (v: string) => void;
  setLocationFilter: (v: string) => void;
  setCourseValue: (v: string) => void;
}) {
  const { setQ, setLocationFilter, setCourseValue } = args;

  const searchParams = useSearchParams();
  const [bootstrappedFromURL, setBootstrappedFromURL] = useState(false);
  const pendingOpenIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (bootstrappedFromURL) return;
    if (!searchParams) return;

    const sp = searchParams;

    const qParam = sp.get("q");
    const locParam = sp.get("location") || sp.get("city");
    const course = sp.get("course");
    const type = sp.get("type");
    const cat = sp.get("category");
    const sub = sp.get("sub_type");
    const openId = sp.get("open");

    if (qParam) setQ(qParam);
    if (locParam) setLocationFilter(locParam);

    if (course) {
      setCourseValue(course);
    } else if (type) {
      setCourseValue(type);
    } else if (cat && sub) {
      setCourseValue(sub);
    }

    if (openId) pendingOpenIdRef.current = openId;

    setBootstrappedFromURL(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, bootstrappedFromURL]);

  return { bootstrappedFromURL, pendingOpenIdRef };
}
