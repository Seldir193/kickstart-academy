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

export function statusLabel(u: AdminMember) {
  return Boolean(u?.isActive) ? "Aktiv" : "Deaktiviert";
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

export function roleLabel(u: AdminMember) {
  if (u?.isOwner) return "Owner";
  const r = clean(u?.role).toLowerCase();
  if (r === "super") return "Superadmin";
  return "Provider";
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
  u: AdminMember;
  busy: boolean;
  canEditRoles: boolean;
  canEditActive: boolean;
  onInfo: (u: AdminMember) => void;
  onEditRole: (u: AdminMember) => void;
  onEditActive: (u: AdminMember) => void;
}) {
  const {
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
    ? "Nur Owner darf Rollen vergeben"
    : locked
      ? "Owner kann nicht geändert werden"
      : undefined;

  const tipActive = !canEditActive
    ? "Nur Owner darf aktiv/deaktivieren"
    : locked
      ? "Owner kann nicht deaktiviert werden"
      : undefined;

  const titleActive = isActive(u) ? "Deaktivieren" : "Reaktivieren";

  return [
    {
      key: "info",
      icon: "/icons/info.svg",
      title: "Info",
      disabled: busy,
      run: () => onInfo(u),
    },
    {
      key: "role",
      icon: "/icons/edit.svg",
      title: "Rolle ändern",
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
