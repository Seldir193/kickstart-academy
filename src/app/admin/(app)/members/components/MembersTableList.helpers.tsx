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

type ActionArgs = {
  t: (key: string) => string;
  u: AdminMember;
  busy: boolean;
  canEditRoles: boolean;
  canEditActive: boolean;
  onInfo: (u: AdminMember) => void;
  onEditRole: (u: AdminMember) => void;
  onEditActive: (u: AdminMember) => void;
};

export function actionsFor(args: ActionArgs) {
  return [infoAction(args), roleAction(args), activeAction(args)] as Action[];
}

function infoAction({ t, u, busy, onInfo }: ActionArgs) {
  return {
    key: "info",
    icon: "/icons/info.svg",
    title: t("common.admin.members.actions.info"),
    disabled: busy,
    run: () => onInfo(u),
  };
}

function roleAction({ t, u, busy, canEditRoles, onEditRole }: ActionArgs) {
  const locked = Boolean(u?.isOwner);
  return {
    key: "role",
    icon: "/icons/edit.svg",
    title: t("common.admin.members.actions.changeRole"),
    disabled: busy || !canEditRoles || locked,
    tip: lockTip(t, canEditRoles, locked, "role"),
    run: () => onEditRole(u),
  };
}

function activeAction({ t, u, busy, canEditActive, onEditActive }: ActionArgs) {
  const locked = Boolean(u?.isOwner);
  return {
    key: "active",
    icon: "/icons/block.svg",
    title: activeTitle(t, u),
    disabled: busy || !canEditActive || locked,
    tip: lockTip(t, canEditActive, locked, "active"),
    run: () => onEditActive(u),
  };
}

function activeTitle(t: (key: string) => string, u: AdminMember) {
  return isActive(u)
    ? t("common.admin.members.actions.deactivate")
    : t("common.admin.members.actions.reactivate");
}

function lockTip(
  t: (key: string) => string,
  allowed: boolean,
  locked: boolean,
  kind: "role" | "active",
) {
  if (!allowed) return t(`common.admin.members.locked.${kind}OwnerOnly`);
  if (locked) return t(`common.admin.members.locked.owner${capitalize(kind)}`);
  return undefined;
}

function capitalize(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
