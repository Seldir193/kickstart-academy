"use client";

import type { KeyboardEvent, MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import type { Partner } from "../types";
import { getPartnerId } from "../helpers";
import { formatDateOnly } from "../../feedbacks/utils";

import PartnerStatusBadge from "./PartnerStatusBadge";

type Props = {
  item: Partner;
  busyItemId: string;
  onEdit: (item: Partner) => void;
  onDelete: (item: Partner) => void;
  onToggle: (item: Partner) => void;
};

type ActionProps = {
  item: Partner;
  isBusy: boolean;
  onEdit: (item: Partner) => void;
  onDelete: (item: Partner) => void;
  onToggle: (item: Partner) => void;
};

export default function PartnerCard(props: Props) {
  const id = getPartnerId(props.item);
  const isBusy = props.busyItemId === id;

  return (
    <li
      className="list__item chip news-list__row partner-admin__row-item is-fullhover is-interactive"
      role="button"
      tabIndex={0}
      aria-label={props.item.name || "Partner"}
      onClick={() => props.onEdit(props.item)}
      onKeyDown={(event) => activateRow(event, () => props.onEdit(props.item))}
    >
      <PartnerPreview logoUrl={props.item.logoUrl} />
      <PartnerName item={props.item} />
      <PartnerUrl item={props.item} />
      <PartnerOrder item={props.item} />
      <PartnerStatusBadge active={props.item.isActive} />
      <PartnerUpdated item={props.item} />
      <PartnerCardActions
        item={props.item}
        isBusy={isBusy}
        onEdit={props.onEdit}
        onDelete={props.onDelete}
        onToggle={props.onToggle}
      />
    </li>
  );
}

function PartnerPreview({ logoUrl }: { logoUrl: string }) {
  return (
    <div className="news-list__cell">
      <img
        src={logoUrl || "/assets/img/avatar.png"}
        alt=""
        aria-hidden="true"
        className="list__avatar partner-admin__avatar"
      />
    </div>
  );
}

function PartnerName({ item }: { item: Partner }) {
  return (
    <div className="news-list__cell partner-admin__name">
      <strong>{item.name || "—"}</strong>
      <span>{item.logoUrl || "—"}</span>
    </div>
  );
}

function PartnerUrl({ item }: { item: Partner }) {
  return (
    <div className="news-list__cell partner-admin__url">{item.url || "—"}</div>
  );
}

function PartnerOrder({ item }: { item: Partner }) {
  return (
    <div className="news-list__cell partner-admin__order">{item.sortOrder}</div>
  );
}

function PartnerUpdated({ item }: { item: Partner }) {
  const { i18n } = useTranslation();
  const value = item.updatedAt || item.createdAt;

  return (
    <div className="news-list__cell partner-admin__date">
      {formatDateOnly(value, i18n.language)}
    </div>
  );
}

function PartnerCardActions(props: ActionProps) {
  return (
    <div className="news-list__cell partner-admin__actions">
      <PartnerEditButton {...props} />
      <PartnerToggleButton {...props} />
      <PartnerDeleteButton {...props} />
    </div>
  );
}

function PartnerEditButton(props: ActionProps) {
  const { t } = useTranslation();

  return (
    <button
      className="edit-trigger"
      type="button"
      aria-label={t("admin.partners.editAction")}
      aria-disabled={props.isBusy}
      onClick={(event) => runAction(event, () => openPartnerEdit(props))}
    >
      <img
        src="/icons/edit.svg"
        alt=""
        aria-hidden="true"
        className="icon-img"
      />
    </button>
  );
}

function PartnerToggleButton(props: ActionProps) {
  const { t } = useTranslation();
  const label = props.item.isActive
    ? t("admin.partners.inactive")
    : t("admin.partners.active");

  function handleClick() {
    if (props.isBusy) return;
    props.onToggle(props.item);
  }

  return (
    <button
      className="btn-ghost"
      type="button"
      aria-disabled={props.isBusy}
      onClick={(event) => runAction(event, handleClick)}
    >
      {label}
    </button>
  );
}

function PartnerDeleteButton(props: ActionProps) {
  const { t } = useTranslation();

  function handleClick() {
    if (props.isBusy) return;
    props.onDelete(props.item);
  }

  return (
    <button
      className="btn btn--danger"
      type="button"
      aria-disabled={props.isBusy}
      onClick={(event) => runAction(event, handleClick)}
    >
      {t("admin.partners.delete")}
    </button>
  );
}

function openPartnerEdit(props: ActionProps) {
  if (props.isBusy) return;
  props.onEdit(props.item);
}

function activateRow(event: KeyboardEvent, run: () => void) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  run();
}

function runAction(event: MouseEvent, run: () => void) {
  event.stopPropagation();
  run();
}
