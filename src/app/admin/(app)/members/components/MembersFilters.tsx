"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const roleDd = useDropdown();
  const statusDd = useDropdown();
  const sortDd = useDropdown();

  const roleOptions: Opt<MemberRole | "">[] = useMemo(
    () => [
      { value: "", label: "All" },
      { value: "provider", label: "Provider" },
      { value: "super", label: "Superadmin" },
    ],
    [],
  );

  const statusOptions: Opt<Status>[] = useMemo(
    () => [
      { value: "", label: "All" },
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
    [],
  );

  const sortOptions: Opt<MembersSort>[] = useMemo(
    () => [
      { value: "newest", label: "Newest first" },
      { value: "oldest", label: "Oldest first" },
      { value: "name_az", label: "Name A–Z" },
      { value: "name_za", label: "Name Z–A" },
      { value: "email_az", label: "Email A–Z" },
      { value: "email_za", label: "Email Z–A" },
    ],
    [],
  );

  const roleLabel = useMemo(() => {
    const hit = roleOptions.find((o) => o.value === props.role);
    return hit?.label || "All";
  }, [props.role, roleOptions]);

  const statusLabel = useMemo(() => {
    const hit = statusOptions.find((o) => o.value === props.status);
    return hit?.label || "All";
  }, [props.status, statusOptions]);

  const sortLabel = useMemo(() => {
    const hit = sortOptions.find((o) => o.value === props.sort);
    return hit?.label || "Name A–Z";
  }, [props.sort, sortOptions]);

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
            placeholder="Name or email"
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
            aria-label="Role"
          >
            <span className="ks-training-select__label">{roleLabel}</span>
            <span className="ks-training-select__chevron" aria-hidden="true" />
          </button>

          {roleDd.open ? (
            <ul
              ref={roleDd.menuRef}
              className="ks-training-select__menu"
              role="listbox"
              aria-label="Role"
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
            aria-label="Status"
          >
            <span className="ks-training-select__label">{statusLabel}</span>
            <span className="ks-training-select__chevron" aria-hidden="true" />
          </button>

          {statusDd.open ? (
            <ul
              ref={statusDd.menuRef}
              className="ks-training-select__menu"
              role="listbox"
              aria-label="Status"
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
            aria-label="Sort order"
          >
            <span className="ks-training-select__label">{sortLabel}</span>
            <span className="ks-training-select__chevron" aria-hidden="true" />
          </button>

          {sortDd.open ? (
            <ul
              ref={sortDd.menuRef}
              className="ks-training-select__menu"
              role="listbox"
              aria-label="Sort order"
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
