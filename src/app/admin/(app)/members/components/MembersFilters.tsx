"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { MemberRole } from "../api";
import type { MembersSort } from "../membersAdmin/useMembersAdminState";

type Status = "active" | "inactive" | "";

type Props = {
  q: string;
  onChangeQ: (v: string) => void;
  role: MemberRole | "";
  onChangeRole: (v: MemberRole | "") => void;
  status: Status;
  onChangeStatus: (v: Status) => void;
  sort: MembersSort;
  onChangeSort: (v: MembersSort) => void;
};

type Opt<T extends string> = { value: T; label: string };

function useDropdown() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(ev: PointerEvent) {
      const t = ev.target as Node;
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) {
        return;
      }
      setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return { open, setOpen, triggerRef, menuRef };
}

export default function MembersFilters(props: Props) {
  const { t } = useTranslation();
  const roleDd = useDropdown();
  const statusDd = useDropdown();
  const sortDd = useDropdown();

  const roleOptions: Opt<MemberRole | "">[] = useMemo(
    () => [
      { value: "", label: t("common.admin.members.filters.all") },
      { value: "provider", label: t("common.admin.members.roles.provider") },
      { value: "super", label: t("common.admin.members.roles.superadmin") },
    ],
    [t],
  );

  const statusOptions: Opt<Status>[] = useMemo(
    () => [
      { value: "", label: t("common.admin.members.filters.all") },
      { value: "active", label: t("common.admin.members.status.active") },
      { value: "inactive", label: t("common.admin.members.status.inactive") },
    ],
    [t],
  );

  const sortOptions: Opt<MembersSort>[] = useMemo(
    () => [
      { value: "newest", label: t("common.admin.members.sort.newest") },
      { value: "oldest", label: t("common.admin.members.sort.oldest") },
      { value: "name_az", label: t("common.admin.members.sort.nameAz") },
      { value: "name_za", label: t("common.admin.members.sort.nameZa") },
      { value: "email_az", label: t("common.admin.members.sort.emailAz") },
      { value: "email_za", label: t("common.admin.members.sort.emailZa") },
    ],
    [t],
  );

  const roleLabel = useMemo(() => {
    const hit = roleOptions.find((o) => o.value === props.role);
    return hit?.label || t("common.admin.members.filters.all");
  }, [props.role, roleOptions, t]);

  const statusLabel = useMemo(() => {
    const hit = statusOptions.find((o) => o.value === props.status);
    return hit?.label || t("common.admin.members.filters.all");
  }, [props.status, statusOptions, t]);

  const sortLabel = useMemo(() => {
    const hit = sortOptions.find((o) => o.value === props.sort);
    return hit?.label || t("common.admin.members.sort.nameAz");
  }, [props.sort, sortOptions, t]);

  return (
    <div className="members-filters">
      <div className="members-filters__search">
        <div className="input-with-icon">
          <img
            src="/icons/search.svg"
            alt=""
            aria-hidden="true"
            className="input-with-icon__icon"
          />
          <input
            className="input input-with-icon__input"
            placeholder={t("common.admin.members.filters.searchPlaceholder")}
            value={props.q}
            onChange={(e) => props.onChangeQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") props.onChangeQ("");
            }}
          />
        </div>
      </div>

      <div className="members-filters__dd">
        <div
          className={
            "ks-training-select" +
            (roleDd.open ? " ks-training-select--open" : "")
          }
        >
          <button
            type="button"
            ref={roleDd.triggerRef}
            className="ks-training-select__trigger"
            onClick={() => roleDd.setOpen((o) => !o)}
            aria-label={t("common.admin.members.filters.role")}
          >
            <span className="ks-training-select__label">{roleLabel}</span>
            <span className="ks-training-select__chevron" aria-hidden="true" />
          </button>

          {roleDd.open ? (
            <ul
              ref={roleDd.menuRef}
              className="ks-training-select__menu"
              role="listbox"
              aria-label={t("common.admin.members.filters.role")}
            >
              {roleOptions.map((o) => (
                <li key={o.value || "all"}>
                  <button
                    type="button"
                    className={
                      "ks-training-select__option" +
                      (props.role === o.value ? " is-selected" : "")
                    }
                    onClick={() => {
                      props.onChangeRole(o.value as any);
                      roleDd.setOpen(false);
                    }}
                  >
                    {o.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="members-filters__dd">
        <div
          className={
            "ks-training-select" +
            (statusDd.open ? " ks-training-select--open" : "")
          }
        >
          <button
            type="button"
            ref={statusDd.triggerRef}
            className="ks-training-select__trigger"
            onClick={() => statusDd.setOpen((o) => !o)}
            aria-label={t("common.admin.members.table.status")}
          >
            <span className="ks-training-select__label">{statusLabel}</span>
            <span className="ks-training-select__chevron" aria-hidden="true" />
          </button>

          {statusDd.open ? (
            <ul
              ref={statusDd.menuRef}
              className="ks-training-select__menu"
              role="listbox"
              aria-label={t("common.admin.members.table.status")}
            >
              {statusOptions.map((o) => (
                <li key={o.value || "all"}>
                  <button
                    type="button"
                    className={
                      "ks-training-select__option" +
                      (props.status === o.value ? " is-selected" : "")
                    }
                    onClick={() => {
                      props.onChangeStatus(o.value as any);
                      statusDd.setOpen(false);
                    }}
                  >
                    {o.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="members-filters__dd members-filters__dd--sort">
        <div
          className={
            "ks-training-select" +
            (sortDd.open ? " ks-training-select--open" : "")
          }
        >
          <button
            type="button"
            ref={sortDd.triggerRef}
            className="ks-training-select__trigger"
            onClick={() => sortDd.setOpen((o) => !o)}
            aria-label={t("common.admin.members.filters.sortOrder")}
          >
            <span className="ks-training-select__label">{sortLabel}</span>
            <span className="ks-training-select__chevron" aria-hidden="true" />
          </button>

          {sortDd.open ? (
            <ul
              ref={sortDd.menuRef}
              className="ks-training-select__menu"
              role="listbox"
              aria-label={t("common.admin.members.filters.sortOrder")}
            >
              {sortOptions.map((o) => (
                <li key={o.value}>
                  <button
                    type="button"
                    className={
                      "ks-training-select__option" +
                      (props.sort === o.value ? " is-selected" : "")
                    }
                    onClick={() => {
                      props.onChangeSort(o.value);
                      sortDd.setOpen(false);
                    }}
                  >
                    {o.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
