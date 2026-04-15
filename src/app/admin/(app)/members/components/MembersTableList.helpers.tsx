//src\app\admin\(app)\members\components\MembersTableList.helpers.tsx
"use client";

import type React from "react";
import type { AdminMember } from "../api";

export type Action = {
  key: string;
  icon: string;
  title: string;
  disabled: boolean;
  tip?: string;
  run: () => void | Promise<void>;
};

function clean(v: unknown) {
  return String(v ?? "").trim();
}

export function statusLabel(t: (key: string) => string, u: AdminMember) {
  return Boolean(u?.isActive)
    ? t("common.admin.members.status.active")
    : t("common.admin.members.status.inactive");
}

export function statusClass(u: AdminMember) {
  return Boolean(u?.isActive) ? "is-active" : "is-inactive";
}

export function blurTarget(t: EventTarget | null) {
  const el = t as any;
  if (el && typeof el.blur === "function") el.blur();
}

export function stop(e: React.SyntheticEvent) {
  e.preventDefault();
  e.stopPropagation();
}

export function onActionKey(
  e: React.KeyboardEvent,
  run: () => void,
  disabled: boolean,
) {
  if (disabled) return;
  if (e.key !== "Enter" && e.key !== " ") return;
  e.preventDefault();
  e.stopPropagation();
  blurTarget(e.currentTarget);
  run();
}

export function roleLabel(t: (key: string) => string, u: AdminMember) {
  if (u?.isOwner) return t("common.admin.members.roles.owner");
  const r = clean(u?.role).toLowerCase();
  if (r === "super") return t("common.admin.members.roles.superadmin");
  return t("common.admin.members.roles.provider");
}

export function roleClass(u: AdminMember) {
  if (u?.isOwner) return "is-owner";
  const r = clean(u?.role).toLowerCase();
  if (r === "super") return "is-super";
  return "is-provider";
}

function isActive(u: AdminMember) {
  return Boolean((u as any)?.isActive);
}

export function actionsFor(args: {
  t: (key: string) => string;
  u: AdminMember;
  busy: boolean;
  canEditRoles: boolean;
  canEditActive: boolean;
  onInfo: (u: AdminMember) => void;
  onEditRole: (u: AdminMember) => void;
  onEditActive: (u: AdminMember) => void;
}) {
  const {
    t,
    u,
    busy,
    canEditRoles,
    canEditActive,
    onInfo,
    onEditRole,
    onEditActive,
  } = args;

  const locked = Boolean(u?.isOwner);
  const disabledRole = busy || !canEditRoles || locked;
  const disabledActive = busy || !canEditActive || locked;

  const tipRole = !canEditRoles
    ? t("common.admin.members.locked.roleOwnerOnly")
    : locked
      ? t("common.admin.members.locked.ownerRole")
      : undefined;

  const tipActive = !canEditActive
    ? t("common.admin.members.locked.activeOwnerOnly")
    : locked
      ? t("common.admin.members.locked.ownerActive")
      : undefined;

  const titleActive = isActive(u)
    ? t("common.admin.members.actions.deactivate")
    : t("common.admin.members.actions.reactivate");

  return [
    {
      key: "info",
      icon: "/icons/info.svg",
      title: t("common.admin.members.actions.info"),
      disabled: busy,
      run: () => onInfo(u),
    },
    {
      key: "role",
      icon: "/icons/edit.svg",
      title: t("common.admin.members.actions.changeRole"),
      disabled: disabledRole,
      tip: tipRole,
      run: () => onEditRole(u),
    },
    {
      key: "active",
      icon: "/icons/block.svg",
      title: titleActive,
      disabled: disabledActive,
      tip: tipActive,
      run: () => onEditActive(u),
    },
  ] as Action[];
}
