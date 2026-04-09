// src/app/admin/(app)/franchise-locations/components/LocationsTableList.tsx
"use client";

import type { RefObject } from "react";
import React, { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { FranchiseLocation } from "../types";
import { useSelection } from "../hooks/useSelection";
import BulkActions from "./BulkActions";
import LocationSwitch from "./LocationSwitch";
import { canTogglePublished } from "../franchise_locations.utils";

import {
  actionsFor,
  blurTarget,
  clean,
  fmtDateDe,
  fullName,
  idOf,
  onActionKey,
  statusClass,
  statusParts,
  stop,
  type RowMode,
  type StatusParts,
} from "./LocationsTableList.helpers";

type Props = {
  items: FranchiseLocation[];
  rowMode: RowMode;

  selectMode: boolean;
  onToggleSelectMode: () => void;

  busy: boolean;

  onOpen: (it: FranchiseLocation) => void;
  onInfo?: (it: FranchiseLocation) => void;

  onResubmit?: (it: FranchiseLocation) => void;
  onSubmitForReview?: (it: FranchiseLocation) => void;

  onAskReject?: (it: FranchiseLocation) => void;

  onDeleteOne?: (it: FranchiseLocation) => void;
  onDeleteMany?: (ids: string[]) => Promise<void>;

  publishedBusyId?: string | null;
  onTogglePublished?: (
    it: FranchiseLocation,
    next: boolean,
  ) => void | Promise<void>;

  toggleBtnRef?: RefObject<HTMLButtonElement | null>;
};

function canShowSwitch(rowMode: RowMode) {
  return rowMode === "mine_approved" || rowMode === "provider_approved";
}

function isMineRow(rowMode: RowMode) {
  return rowMode.startsWith("mine_");
}

function isSwitchBusy(publishedBusyId: string | null | undefined, id: string) {
  return Boolean(publishedBusyId && publishedBusyId === id);
}

function getPublished(it: FranchiseLocation) {
  return Boolean((it as any)?.published);
}

function getCanToggle(it: FranchiseLocation, mineRow: boolean) {
  return mineRow ? canTogglePublished(it) : true;
}

function EmptyState({ t }: { t: (key: string) => string }) {
  return (
    <section className="card">
      <div className="card__empty">{t("common.admin.franchiseLocations.empty")}</div>
    </section>
  );
}

function HeadRow({ t }: { t: (key: string) => string }) {
  return (
    <div className="news-list__head" aria-hidden="true">
      <div className="news-list__h">{t("common.admin.franchiseLocations.table.licence")}</div>
      <div className="news-list__h">{t("common.admin.franchiseLocations.table.country")}</div>
      <div className="news-list__h">{t("common.admin.franchiseLocations.table.city")}</div>
      <div className="news-list__h">{t("common.admin.franchiseLocations.table.status")}</div>
      <div className="news-list__h">{t("common.admin.franchiseLocations.table.updated")}</div>
      <div className="news-list__h news-list__h--right">{t("common.admin.franchiseLocations.table.actions")}</div>
    </div>
  );
}

function TitleCell(it: FranchiseLocation, showHint: boolean, hint: string) {
  const addr = clean((it as any).address);
  return (
    <div className="news-list__cell news-list__cell--title">
      <div className="news-list__title">{fullName(it) || "—"}</div>
      {showHint && hint ? (
        <div className="news-list__draft-wrap">
          <span className="news-list__draft-label">{hint}</span>
        </div>
      ) : null}
      <div className={`news-list__excerpt ${addr ? "" : "is-empty"}`}>
        {addr || "—"}
      </div>
    </div>
  );
}

function CountryCell(it: FranchiseLocation) {
  return (
    <div className="news-list__cell news-list__cell--cat">
      <span className="news-list__pill">
        {clean((it as any).country) || "—"}
      </span>
    </div>
  );
}

function CityCell(it: FranchiseLocation) {
  return (
    <div className="news-list__cell news-list__cell--date">
      {clean((it as any).city) || "—"}
    </div>
  );
}

function UpdatedCell(it: FranchiseLocation) {
  return (
    <div className="news-list__cell news-list__cell--author">
      {fmtDateDe((it as any).updatedAt)}
    </div>
  );
}

function StatusCell(opts: {
  it: FranchiseLocation;
  st: StatusParts;
  showSwitch: boolean;
  published: boolean;
  switchDisabled: boolean;
  switchBusy: boolean;
  onTogglePublished?: (
    it: FranchiseLocation,
    next: boolean,
  ) => void | Promise<void>;
}) {
  const wrapClass = `news-switch-wrap ${opts.switchBusy ? "is-busy" : ""} ${opts.switchDisabled ? "is-disabled" : ""}`;
  return (
    <div className="news-list__cell news-list__cell--status">
      <div className="coach-statusline">
        <span className={`news-list__status ${statusClass(opts.it)}`}>
          <span className="news-list__status-main">{opts.st.main}</span>
          {opts.st.sub ? (
            <span className="news-list__status-sub">{opts.st.sub}</span>
          ) : null}
        </span>

        {opts.showSwitch && opts.onTogglePublished ? (
          <span
            className={wrapClass}
            onClick={stop}
            onMouseDown={stop}
            onPointerDown={stop}
          >
            <LocationSwitch
              checked={opts.published}
              busy={opts.switchBusy}
              disabled={opts.switchDisabled}
              onToggle={() => {
                if (opts.switchDisabled) return;
                opts.onTogglePublished?.(opts.it, !opts.published);
              }}
            />
          </span>
        ) : null}
      </div>
    </div>
  );
}

function ActionsCell(opts: {
  hideActions: boolean;
  acts: ReturnType<typeof actionsFor>;
}) {
  if (opts.hideActions) {
    return (
      <div
        className="news-list__cell news-list__cell--action news-list__actions--hidden"
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className="news-list__cell news-list__cell--action"
      onClick={stop}
      onMouseDown={stop}
      onPointerDown={stop}
    >
      {opts.acts.map((a) => (
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
          onKeyDown={(e) => onActionKey(e, () => void a.run(), a.disabled)}
        >
          <img
            src={a.icon}
            alt=""
            aria-hidden="true"
            className={"icon-img" + (a.left ? " icon-img--left" : "")}
          />
        </span>
      ))}
    </div>
  );
}

function RowItem(opts: {
  it: FranchiseLocation;
  rowMode: RowMode;
  busy: boolean;
  selectMode: boolean;
  checked: boolean;
  showHint: boolean;
  showSwitch: boolean;
  publishedBusyId?: string | null;
  onTogglePublished?: (
    it: FranchiseLocation,
    next: boolean,
  ) => void | Promise<void>;
  onOpen: (it: FranchiseLocation) => void;
  onInfo?: (it: FranchiseLocation) => void;
  onResubmit?: (it: FranchiseLocation) => void;
  onSubmitForReview?: (it: FranchiseLocation) => void;
  onAskReject?: (it: FranchiseLocation) => void;
  onDeleteOne?: (it: FranchiseLocation) => void;
  sel: ReturnType<typeof useSelection>;
}) {
  const id = idOf(opts.it);
  const hideActions = opts.selectMode || opts.checked;
  const swBusy = isSwitchBusy(opts.publishedBusyId, id);
  const published = getPublished(opts.it);
  const canT = getCanToggle(opts.it, isMineRow(opts.rowMode));
  const swDisabled = opts.busy || swBusy || !canT;
  const st = statusParts(opts.it, opts.rowMode);
  const acts = actionsFor({ ...opts, it: opts.it, rowMode: opts.rowMode });

  return (
    <li
      key={id}
      className={`list__item chip news-list__row is-fullhover is-interactive ${opts.checked ? "is-selected" : ""}`}
      onPointerDown={(e) => {
        if (!opts.selectMode) return;
        e.preventDefault();
      }}
      onClick={() => {
        if (!id) return;
        if (opts.selectMode) return void opts.sel.toggleOne(id);
        opts.onOpen(opts.it);
      }}
      onKeyDown={(e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        if (!id) return;
        if (opts.selectMode) return void opts.sel.toggleOne(id);
        opts.onOpen(opts.it);
      }}
      tabIndex={0}
      role="button"
      aria-pressed={opts.selectMode ? opts.checked : undefined}
    >
      {TitleCell(opts.it, opts.showHint, st.hint)}
      {CountryCell(opts.it)}
      {CityCell(opts.it)}
      {StatusCell({
        it: opts.it,
        st,
        showSwitch: opts.showSwitch,
        published,
        switchBusy: swBusy,
        switchDisabled: swDisabled,
        onTogglePublished: opts.onTogglePublished,
      })}
      {UpdatedCell(opts.it)}
      {ActionsCell({ hideActions, acts })}
    </li>
  );
}

export default function LocationsTableList(p: Props) {
  const { t } = useTranslation();
  const idsOnPage = useMemo(
    () => p.items.map((it) => idOf(it)).filter(Boolean),
    [p.items],
  );
  const sel = useSelection(idsOnPage);

  const cancelBtnRef = useRef<HTMLButtonElement | null>(null);
  const clearBtnRef = useRef<HTMLButtonElement | null>(null);

  const count = sel.selected.size;
  const showClear = p.selectMode && count >= 2;
  const showSwitch = canShowSwitch(p.rowMode);
  const mineRow = isMineRow(p.rowMode);
  const showHint = !mineRow;

  useEffect(() => {
    if (!p.selectMode) return;
    requestAnimationFrame(() => cancelBtnRef.current?.focus());
  }, [p.selectMode]);

  async function deleteSelected() {
    if (!p.onDeleteMany) return;
    const ids = Array.from(sel.selected);
    if (!ids.length) return;
    await p.onDeleteMany(ids);
    sel.clear();
    p.onToggleSelectMode();
  }

  if (!p.items.length) return <EmptyState t={t}/>;

  return (
    <>
      <div className="news-admin__top-actions">
        <BulkActions
          toggleRef={p.toggleBtnRef as RefObject<HTMLButtonElement | null>}
          cancelRef={cancelBtnRef}
          clearRef={clearBtnRef}
          selectMode={p.selectMode}
          onToggleSelectMode={() => {
            sel.clear();
            p.onToggleSelectMode();
          }}
          count={count}
          isAllSelected={sel.isAllSelected}
          disabled={p.busy || p.items.length === 0}
          onToggleAll={() =>
            sel.isAllSelected ? sel.removeAll() : sel.selectAll()
          }
          onClear={() => {
            sel.clear();
            requestAnimationFrame(() => cancelBtnRef.current?.focus());
          }}
          showClear={showClear}
          onDelete={() => void deleteSelected()}
        />
      </div>

      <section className={`card news-list ${p.busy ? "is-busy" : ""}`}>
        <div className="news-list__table">
          <HeadRow t={t}/>
          <ul className="list list--bleed">
            {p.items.map((it) => {
              const id = idOf(it);
              const checked = sel.selected.has(id);
              return (
                <RowItem
                  key={id}
                  it={it}
                  rowMode={p.rowMode}
                  busy={p.busy}
                  selectMode={p.selectMode}
                  checked={checked}
                  showHint={showHint}
                  showSwitch={showSwitch}
                  publishedBusyId={p.publishedBusyId}
                  onTogglePublished={p.onTogglePublished}
                  onOpen={p.onOpen}
                  onInfo={p.onInfo}
                  onResubmit={p.onResubmit}
                  onSubmitForReview={p.onSubmitForReview}
                  onAskReject={p.onAskReject}
                  onDeleteOne={p.onDeleteOne}
                  sel={sel}
                />
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
}
