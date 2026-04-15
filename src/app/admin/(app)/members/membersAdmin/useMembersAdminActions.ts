//src\app\admin\(app)\members\membersAdmin\useMembersAdminActions.ts
"use client";

import type { AdminMember, MemberRole } from "../api";
import { useTranslation } from "react-i18next";
import { bulkSetMembersActive, setMemberActive, setMemberRole } from "../api";

export function useMembersAdminActions(args: {
  canEditRoles: boolean;
  canEditActive: boolean;
  setMutating: (v: boolean) => void;
  reload: () => void;
}) {
  const { t } = useTranslation();
  const { canEditRoles, canEditActive, setMutating, reload } = args;

  async function onSetRole(u: AdminMember, next: MemberRole) {
    if (!canEditRoles) return;
    if (u?.isOwner) return;

    setMutating(true);
    try {
      await setMemberRole(t, u.id, next);
      await reload();
    } finally {
      setMutating(false);
    }
  }

  async function onSetActive(u: AdminMember, active: boolean) {
    if (!canEditActive) return;
    if (u?.isOwner) return;

    setMutating(true);
    try {
      await setMemberActive(t, u.id, active);
      await reload();
    } finally {
      setMutating(false);
    }
  }

  async function onBulkSetActive(ids: string[], active: boolean) {
    if (!canEditActive) return;
    if (!ids?.length) return;

    setMutating(true);
    try {
      await bulkSetMembersActive(t, ids, active);
      await reload();
    } finally {
      setMutating(false);
    }
  }

  return { onSetRole, onSetActive, onBulkSetActive };
}
