"use client";

import React from "react";
import MembersTableList from "./components/MembersTableList";
import Pagination from "./components/Pagination";
import { useMembersAdminState } from "./membersAdmin/useMembersAdminState";
import { useMembersAdminActions } from "./membersAdmin/useMembersAdminActions";
import MembersFilters from "./components/MembersFilters";

export default function MembersAdminPage() {
  const s = useMembersAdminState();

  const a = useMembersAdminActions({
    canEditRoles: s.canEditRoles,
    canEditActive: s.canEditRoles,
    setMutating: s.setMutating,
    reload: s.list.reload,
  });

  const busy = s.mutating || s.list.loading;

  return (
    <div className="news-admin ks members-admin">
      <main className="container">
        <div className="members-admin__toolbar">
          <MembersFilters
            q={s.q}
            role={s.role}
            status={s.status}
            sort={s.sort}
            onChangeQ={s.setQ}
            onChangeRole={s.setRole}
            onChangeStatus={s.setStatus}
            onChangeSort={s.setSort}
          />

          {!s.canEditRoles ? (
            <span
              className="members-admin__badge"
              title="Only the owner can change roles"
            >
              <span className="members-admin__badge-text">Read only</span>
            </span>
          ) : null}
        </div>

        {s.list.error ? (
          <div className="card" role="alert">
            <div className="card__empty">{s.list.error}</div>
          </div>
        ) : null}

        <section className="news-admin__section">
          <div
            className={
              "news-admin__box news-admin__box--scroll3" +
              (!busy && !s.list.items.length ? " is-empty" : "")
            }
          >
            <MembersTableList
              items={s.list.items}
              busy={busy}
              canEditRoles={s.canEditRoles}
              canEditActive={s.canEditRoles}
              onSetRole={a.onSetRole}
              onSetActive={a.onSetActive}
            />
          </div>

          {s.pages > 1 ? (
            <div className="mt-3">
              <Pagination
                page={s.page}
                pages={s.pages}
                onPrev={() => s.setPage((p) => Math.max(1, p - 1))}
                onNext={() => s.setPage((p) => Math.min(s.pages, p + 1))}
              />
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
