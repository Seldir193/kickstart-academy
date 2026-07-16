"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import MembersTableList from "./components/MembersTableList";
import Pagination from "./components/Pagination";
import { useMembersAdminState } from "./membersAdmin/useMembersAdminState";
import { useMembersAdminActions } from "./membersAdmin/useMembersAdminActions";
import MembersFilters from "./components/MembersFilters";

type MembersState = ReturnType<typeof useMembersAdminState>;
type MembersActions = ReturnType<typeof useMembersAdminActions>;
type Translate = ReturnType<typeof useTranslation>["t"];

export default function MembersAdminPage() {
  const s = useMembersAdminState();
  const a = useMembersAdminActions(actionArgs(s));
  const { t } = useTranslation();
  const busy = s.mutating || s.list.loading;

  return (
    <div className="news-admin ks members-admin">
      <main className="container">
        <MembersToolbar s={s} t={t} />
        <MembersError error={s.list.error} />
        <MembersSection s={s} a={a} busy={busy} />
      </main>
    </div>
  );
}

function MembersToolbar({ s, t }: { s: MembersState; t: Translate }) {
  return (
    <div className="members-admin__toolbar">
      <MembersFilters {...filterProps(s)} />

      {!s.canEditRoles ? <ReadOnlyBadge t={t} /> : null}
    </div>
  );
}

function ReadOnlyBadge({ t }: { t: Translate }) {
  return (
    <span
      className="members-admin__badge"
      title={t("common.admin.members.readOnly.ownerOnly")}
    >
      <span className="members-admin__badge-text">
        {t("common.admin.members.readOnly.label")}
      </span>
    </span>
  );
}

function MembersError({ error }: { error: MembersState["list"]["error"] }) {
  if (!error) return null;
  return (
    <div className="card" role="alert">
      <div className="card__empty">{error}</div>
    </div>
  );
}

function MembersSection(props: {
  s: MembersState;
  a: MembersActions;
  busy: boolean;
}) {
  const { s, a, busy } = props;
  return (
    <section className="news-admin__section">
      <div className={boxClass(busy, s.list.items.length)}>
        <MembersTableList {...tableProps(s, a, busy)} />
      </div>

      {s.pages > 1 ? <MembersPager s={s} /> : null}
    </section>
  );
}

function MembersPager({ s }: { s: MembersState }) {
  return (
    <div className="mt-3">
      <Pagination
        page={s.page}
        pages={s.pages}
        onPrev={() => s.setPage((p) => Math.max(1, p - 1))}
        onNext={() => s.setPage((p) => Math.min(s.pages, p + 1))}
      />
    </div>
  );
}

function actionArgs(s: MembersState) {
  return {
    canEditRoles: s.canEditRoles,
    canEditActive: s.canEditRoles,
    setMutating: s.setMutating,
    reload: s.list.reload,
  };
}

function filterProps(s: MembersState) {
  return {
    q: s.q,
    role: s.role,
    status: s.status,
    sort: s.sort,
    onChangeQ: s.setQ,
    onChangeRole: s.setRole,
    onChangeStatus: s.setStatus,
    onChangeSort: s.setSort,
  };
}

function tableProps(s: MembersState, a: MembersActions, busy: boolean) {
  return {
    items: s.list.items,
    busy,
    canEditRoles: s.canEditRoles,
    canEditActive: s.canEditRoles,
    onSetRole: a.onSetRole,
    onSetActive: a.onSetActive,
  };
}

function boxClass(busy: boolean, count: number) {
  return (
    "news-admin__box news-admin__box--scroll3" +
    (!busy && !count ? " is-empty" : "")
  );
}
