//src\app\admin\(app)\news\newsAdmin\useNewsAdminState.ts
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { News, SortKey } from "../types";
import { useNewsList } from "../hooks/useNewsList";
import type { Me, ReloadKey } from "./helpers";
import { fetchMe } from "./helpers";

export function useNewsAdminState() {
  const [me, setMe] = useState<Me | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<News | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<News | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [infoTarget, setInfoTarget] = useState<News | null>(null);
  const [mutating, setMutating] = useState(false);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [publishedBusyId, setPublishedBusyId] = useState<string | null>(null);

  const [minePendingSelectMode, setMinePendingSelectMode] = useState(false);
  const [mineApprovedSelectMode, setMineApprovedSelectMode] = useState(false);
  const [mineRejectedSelectMode, setMineRejectedSelectMode] = useState(false);
  const [provApprovedSelectMode, setProvApprovedSelectMode] = useState(false);
  const [provRejectedSelectMode, setProvRejectedSelectMode] = useState(false);

  const minePendingToggleRef = useRef<HTMLButtonElement | null>(null);
  const mineApprovedToggleRef = useRef<HTMLButtonElement | null>(null);
  const mineRejectedToggleRef = useRef<HTMLButtonElement | null>(null);
  const provApprovedToggleRef = useRef<HTMLButtonElement | null>(null);
  const provRejectedToggleRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    fetchMe().then(setMe);
  }, []);

  const ready = me !== null;

  const isSuper = Boolean(me?.isSuperAdmin);

  const mine = useNewsList("mine", true, q, sort, ready);
  const providerPending = useNewsList(
    "provider_pending",
    isSuper,
    q,
    sort,
    ready,
  );
  const providerApproved = useNewsList(
    "provider_approved",
    isSuper,
    q,
    sort,
    ready,
  );
  const providerRejected = useNewsList(
    "provider_rejected",
    isSuper,
    q,
    sort,
    ready,
  );

  const minePending = useNewsList("mine_pending", !isSuper, q, sort, ready);
  const mineApproved = useNewsList("mine_approved", !isSuper, q, sort, ready);
  const mineRejected = useNewsList("mine_rejected", !isSuper, q, sort, ready);

  const reloadMap = useMemo(() => {
    return {
      mine,
      provider_pending: providerPending,
      provider_approved: providerApproved,
      provider_rejected: providerRejected,
      mine_pending: minePending,
      mine_approved: mineApproved,
      mine_rejected: mineRejected,
    } satisfies Record<ReloadKey, { reload: () => Promise<void> }>;
  }, [
    mine,
    providerPending,
    providerApproved,
    providerRejected,
    minePending,
    mineApproved,
    mineRejected,
  ]);

  return {
    me,
    isSuper,
    busy: mutating,

    createOpen,
    setCreateOpen,
    editItem,
    setEditItem,

    rejectOpen,
    setRejectOpen,
    rejectTarget,
    setRejectTarget,

    infoOpen,
    setInfoOpen,
    infoTarget,
    setInfoTarget,

    mutating,
    setMutating,

    q,
    setQ,
    sort,
    setSort,

    publishedBusyId,
    setPublishedBusyId,

    minePendingSelectMode,
    setMinePendingSelectMode,
    mineApprovedSelectMode,
    setMineApprovedSelectMode,
    mineRejectedSelectMode,
    setMineRejectedSelectMode,
    provApprovedSelectMode,
    setProvApprovedSelectMode,
    provRejectedSelectMode,
    setProvRejectedSelectMode,

    minePendingToggleRef,
    mineApprovedToggleRef,
    mineRejectedToggleRef,
    provApprovedToggleRef,
    provRejectedToggleRef,

    mine,
    providerPending,
    providerApproved,
    providerRejected,
    minePending,
    mineApproved,
    mineRejected,

    reloadMap,
  };
}

// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import type { News, SortKey } from "../types";
// import { useNewsList } from "../hooks/useNewsList";
// import type { Me, ReloadKey } from "./helpers";
// import { fetchMe } from "./helpers";

// export function useNewsAdminState() {
//   const [me, setMe] = useState<Me | null>(null);
//   const [createOpen, setCreateOpen] = useState(false);
//   const [editItem, setEditItem] = useState<News | null>(null);
//   const [rejectOpen, setRejectOpen] = useState(false);
//   const [rejectTarget, setRejectTarget] = useState<News | null>(null);
//   const [infoOpen, setInfoOpen] = useState(false);
//   const [infoTarget, setInfoTarget] = useState<News | null>(null);
//   const [mutating, setMutating] = useState(false);
//   const [q, setQ] = useState("");
//   const [sort, setSort] = useState<SortKey>("newest");
//   const [publishedBusyId, setPublishedBusyId] = useState<string | null>(null);

//   const [minePendingSelectMode, setMinePendingSelectMode] = useState(false);
//   const [mineApprovedSelectMode, setMineApprovedSelectMode] = useState(false);
//   const [mineRejectedSelectMode, setMineRejectedSelectMode] = useState(false);
//   const [provApprovedSelectMode, setProvApprovedSelectMode] = useState(false);
//   const [provRejectedSelectMode, setProvRejectedSelectMode] = useState(false);

//   const minePendingToggleRef = useRef<HTMLButtonElement | null>(null);
//   const mineApprovedToggleRef = useRef<HTMLButtonElement | null>(null);
//   const mineRejectedToggleRef = useRef<HTMLButtonElement | null>(null);
//   const provApprovedToggleRef = useRef<HTMLButtonElement | null>(null);
//   const provRejectedToggleRef = useRef<HTMLButtonElement | null>(null);

//   useEffect(() => {
//     fetchMe().then(setMe);
//   }, []);

//   const isSuper = Boolean(me?.isSuperAdmin);

//   const mine = useNewsList("mine", true, q, sort);
//   const providerPending = useNewsList("provider_pending", isSuper, q, sort);
//   const providerApproved = useNewsList("provider_approved", isSuper, q, sort);
//   const providerRejected = useNewsList("provider_rejected", isSuper, q, sort);

//   const minePending = useNewsList("mine_pending", !isSuper, q, sort);
//   const mineApproved = useNewsList("mine_approved", !isSuper, q, sort);
//   const mineRejected = useNewsList("mine_rejected", !isSuper, q, sort);

//   const reloadMap = useMemo(() => {
//     return {
//       mine,
//       provider_pending: providerPending,
//       provider_approved: providerApproved,
//       provider_rejected: providerRejected,
//       mine_pending: minePending,
//       mine_approved: mineApproved,
//       mine_rejected: mineRejected,
//     } satisfies Record<ReloadKey, { reload: () => Promise<void> }>;
//   }, [
//     mine,
//     providerPending,
//     providerApproved,
//     providerRejected,
//     minePending,
//     mineApproved,
//     mineRejected,
//   ]);

//   return {
//     me,
//     isSuper,
//     busy: mutating,

//     createOpen,
//     setCreateOpen,
//     editItem,
//     setEditItem,

//     rejectOpen,
//     setRejectOpen,
//     rejectTarget,
//     setRejectTarget,

//     infoOpen,
//     setInfoOpen,
//     infoTarget,
//     setInfoTarget,

//     mutating,
//     setMutating,

//     q,
//     setQ,
//     sort,
//     setSort,

//     publishedBusyId,
//     setPublishedBusyId,

//     minePendingSelectMode,
//     setMinePendingSelectMode,
//     mineApprovedSelectMode,
//     setMineApprovedSelectMode,
//     mineRejectedSelectMode,
//     setMineRejectedSelectMode,
//     provApprovedSelectMode,
//     setProvApprovedSelectMode,
//     provRejectedSelectMode,
//     setProvRejectedSelectMode,

//     minePendingToggleRef,
//     mineApprovedToggleRef,
//     mineRejectedToggleRef,
//     provApprovedToggleRef,
//     provRejectedToggleRef,

//     mine,
//     providerPending,
//     providerApproved,
//     providerRejected,
//     minePending,
//     mineApproved,
//     mineRejected,

//     reloadMap,
//   };
// }
