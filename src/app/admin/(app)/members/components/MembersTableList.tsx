// src/app/admin/(app)/members/components/MembersTableList.tsx
"use client";

import React, { useMemo, useState } from "react";
import type { AdminMember, MemberRole } from "../api";
import MembersInfoDialog from "../moderation/MembersInfoDialog";
import ConfirmRoleDialog from "../moderation/ConfirmRoleDialog";
import ConfirmActiveDialog from "../moderation/ConfirmActiveDialog";
import {
  actionsFor,
  blurTarget,
  onActionKey,
  roleClass,
  roleLabel,
  stop,
  statusClass,
  statusLabel,
} from "./MembersTableList.helpers";

type Props = {
  items: AdminMember[];
  busy: boolean;
  canEditRoles: boolean;
  canEditActive: boolean;
  onSetRole: (u: AdminMember, next: MemberRole) => void | Promise<void>;
  onSetActive: (u: AdminMember, active: boolean) => void | Promise<void>;
};

function clean(v: unknown) {
  return String(v ?? "").trim();
}

function nextRoleOf(u: AdminMember): MemberRole {
  return clean(u?.role).toLowerCase() === "super" ? "provider" : "super";
}

function isActive(u: AdminMember) {
  return (u as any)?.isActive !== false;
}

export default function MembersTableList({
  items,
  busy,
  canEditRoles,
  canEditActive,
  onSetRole,
  onSetActive,
}: Props) {
  const viewItems = useMemo(() => items, [items]);

  const [infoOpen, setInfoOpen] = useState(false);
  const [infoItem, setInfoItem] = useState<AdminMember | null>(null);

  const [roleOpen, setRoleOpen] = useState(false);
  const [roleItem, setRoleItem] = useState<AdminMember | null>(null);
  const [roleNext, setRoleNext] = useState<MemberRole | null>(null);

  const [activeOpen, setActiveOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<AdminMember | null>(null);
  const [activeNext, setActiveNext] = useState<boolean | null>(null);

  function openInfo(u: AdminMember) {
    setInfoItem(u);
    setInfoOpen(true);
  }

  function openRole(u: AdminMember) {
    setRoleItem(u);
    setRoleNext(nextRoleOf(u));
    setRoleOpen(true);
  }

  function openActive(u: AdminMember) {
    setActiveItem(u);
    setActiveNext(!isActive(u));
    setActiveOpen(true);
  }

  function closeInfo() {
    setInfoOpen(false);
    setInfoItem(null);
  }

  function closeRole() {
    setRoleOpen(false);
    setRoleItem(null);
    setRoleNext(null);
  }

  function closeActive() {
    setActiveOpen(false);
    setActiveItem(null);
    setActiveNext(null);
  }

  function canEditRole(u: AdminMember) {
    if (busy) return false;
    if (!canEditRoles) return false;
    if (u?.isOwner) return false;
    return true;
  }

  function canEditAct(u: AdminMember) {
    if (busy) return false;
    if (!canEditActive) return false;
    if (u?.isOwner) return false;
    return true;
  }

  function roleLockedReason(u: AdminMember) {
    if (!canEditRoles) return "Nur Owner darf Rollen ändern.";
    if (u?.isOwner) return "Owner kann nicht geändert werden.";
    if (busy) return "Bitte warten…";
    return "";
  }

  function activeLockedReason(u: AdminMember) {
    if (!canEditActive) return "Nur Owner darf aktiv/deaktivieren.";
    if (u?.isOwner) return "Owner kann nicht deaktiviert werden.";
    if (busy) return "Bitte warten…";
    return "";
  }

  if (!viewItems.length) {
    return (
      <section className="card">
        <div className="card__empty">Keine Einträge.</div>
      </section>
    );
  }

  return (
    <>
      <section className={`card members-list ${busy ? "is-busy" : ""}`}>
        <div className="ks-customers-table-scroll">
          <div className="members-list__table">
            <div className="members-list__head" aria-hidden="true">
              <div className="members-list__h">Name</div>
              <div className="members-list__h">E-Mail</div>
              <div className="members-list__h">Status</div>

              <div className="members-list__h">Rolle</div>
              <div className="members-list__h members-list__h--right">
                Aktion
              </div>
            </div>

            <ul className="list list--bleed">
              {viewItems.map((u) => {
                const id = clean(u.id);
                const acts = actionsFor({
                  u,
                  busy,
                  canEditRoles,
                  canEditActive,
                  onInfo: openInfo,
                  onEditRole: openRole,
                  onEditActive: openActive,
                });

                return (
                  <li
                    key={id}
                    className="list__item chip members-list__row is-fullhover is-interactive"
                    tabIndex={0}
                    role="button"
                    onClick={() => openRole(u)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") openRole(u);
                    }}
                  >
                    <div className="members-list__cell members-list__cell--name">
                      <div className="members-list__title">
                        {clean(u.fullName) || "—"}
                      </div>
                    </div>

                    <div className="members-list__cell members-list__cell--email">
                      <span className="members-list__mono">
                        {clean(u.email) || "—"}
                      </span>
                    </div>

                    <div className="members-list__cell members-list__cell--status">
                      <span
                        className={`members-list__status ${statusClass(u)}`}
                      >
                        {statusLabel(u)}
                      </span>
                    </div>

                    <div className="members-list__cell members-list__cell--role">
                      <span className={`members-list__status ${roleClass(u)}`}>
                        {roleLabel(u)}
                      </span>
                    </div>

                    <div
                      className="members-list__cell members-list__cell--action"
                      onClick={stop}
                      onMouseDown={stop}
                      onPointerDown={stop}
                    >
                      {acts.map((a) => (
                        <span
                          key={a.key}
                          className={`edit-trigger ${a.disabled ? "is-disabled" : ""}`}
                          role="button"
                          tabIndex={a.disabled ? -1 : 0}
                          {...(!a.tip ? { title: a.title } : {})}
                          aria-label={a.title}
                          aria-disabled={a.disabled ? true : undefined}
                          {...(a.tip ? { "data-ks-tip": a.tip } : {})}
                          onClick={(e) => {
                            stop(e);
                            blurTarget(e.currentTarget);
                            if (a.disabled) return;
                            a.run();
                          }}
                          onKeyDown={(e) =>
                            onActionKey(e, () => void a.run(), a.disabled)
                          }
                        >
                          <img
                            src={a.icon}
                            alt=""
                            aria-hidden="true"
                            className="icon-img"
                          />
                        </span>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      <MembersInfoDialog open={infoOpen} item={infoItem} onClose={closeInfo} />

      <ConfirmRoleDialog
        open={roleOpen}
        item={roleItem as any}
        nextRole={roleNext as any}
        onClose={closeRole}
        canEdit={roleItem ? canEditRole(roleItem) : false}
        lockedReason={roleItem ? roleLockedReason(roleItem) : ""}
        onConfirm={async () => {
          if (!roleItem || !roleNext) return;
          await onSetRole(roleItem, roleNext);
        }}
      />

      <ConfirmActiveDialog
        open={activeOpen}
        item={activeItem}
        nextActive={activeNext}
        onClose={closeActive}
        canEdit={activeItem ? canEditAct(activeItem) : false}
        lockedReason={activeItem ? activeLockedReason(activeItem) : ""}
        onConfirm={async () => {
          if (!activeItem || typeof activeNext !== "boolean") return;
          await onSetActive(activeItem, activeNext);
        }}
      />
    </>
  );
}
