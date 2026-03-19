//src\app\admin\(app)\members\membersAdmin\useMembersAdminActions.ts
"use client";

import type { AdminMember, MemberRole } from "../api";
import { bulkSetMembersActive, setMemberActive, setMemberRole } from "../api";

export function useMembersAdminActions(args: {
  canEditRoles: boolean;
  canEditActive: boolean;
  setMutating: (v: boolean) => void;
  reload: () => void;
}) {
  const { canEditRoles, canEditActive, setMutating, reload } = args;

  async function onSetRole(u: AdminMember, next: MemberRole) {
    if (!canEditRoles) return;
    if (u?.isOwner) return;

    setMutating(true);
    try {
      await setMemberRole(u.id, next);
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
      await setMemberActive(u.id, active);
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
      await bulkSetMembersActive(ids, active);
      await reload();
    } finally {
      setMutating(false);
    }
  }

  return { onSetRole, onSetActive, onBulkSetActive };
}
