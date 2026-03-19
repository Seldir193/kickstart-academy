//src\app\admin\(app)\members\membersAdmin\useMembersAdminState.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import type { MemberRole } from "../api";
import { useMembersList } from "../hooks/useMembersList";

export type MembersSort =
  | "newest"
  | "oldest"
  | "name_az"
  | "name_za"
  | "email_az"
  | "email_za";

function clean(v: unknown) {
  return String(v ?? "").trim();
}

function timeOf(v: unknown) {
  const s = clean(v);
  if (!s) return 0;
  const t = new Date(s).getTime();
  return Number.isFinite(t) ? t : 0;
}

function toBool(v: unknown) {
  if (v === true) return true;
  const s = clean(v).toLowerCase();
  return s === "true" || s === "1" || s === "yes";
}

function pickUser(data: any) {
  return data?.user || data?.me || data?.data?.user || data?.data?.me || {};
}

export function useMembersAdminState() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState<MemberRole | "">("");
  const [status, setStatus] = useState<"active" | "inactive" | "">("");
  const [sort, setSort] = useState<MembersSort>("name_az");
  const [page, setPage] = useState(1);
  const [mutating, setMutating] = useState(false);
  const [canEditRoles, setCanEditRoles] = useState(false);

  const list = useMembersList(true, q, role, status);

  useEffect(() => {
    setPage(1);
  }, [q, role, status, sort]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/admin/auth/me", {
          cache: "no-store",
          credentials: "include",
        });

        const data = await r.json().catch(() => null);
        const u = pickUser(data);

        setCanEditRoles(
          toBool(u?.isOwner) || toBool(u?.owner) || toBool(u?.is_owner),
        );
      } catch {
        setCanEditRoles(false);
      }
    })();
  }, []);

  const sorted = useMemo(() => {
    const arr = [...list.items];

    if (sort === "newest" || sort === "oldest") {
      arr.sort((a, b) => {
        const da = timeOf((a as any)?.createdAt);
        const db = timeOf((b as any)?.createdAt);
        return sort === "newest" ? db - da : da - db;
      });
      return arr;
    }

    const dir = sort.endsWith("_za") ? -1 : 1;
    const key = sort.startsWith("email_") ? "email" : "fullName";

    arr.sort(
      (a, b) =>
        dir *
        String((a as any)?.[key] || "").localeCompare(
          String((b as any)?.[key] || ""),
          "de",
          { sensitivity: "base" },
        ),
    );

    return arr;
  }, [list.items, sort]);

  const PAGE_SIZE = 10;
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), pages);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [safePage, sorted]);

  return {
    q,
    setQ,
    role,
    setRole,
    status,
    setStatus,
    sort,
    setSort,
    page: safePage,
    setPage,
    pages,
    mutating,
    setMutating,
    canEditRoles,
    list: { ...list, items: pageItems, total: sorted.length },
  };
}
