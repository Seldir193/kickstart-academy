"use client";

import type { KeyboardEvent, MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import type { Feedback } from "../types";
import { getFeedbackCategoryKey, getFeedbackId } from "../helpers";
import { formatDateOnly } from "../utils";
import FeedbackStatusBadge from "./FeedbackStatusBadge";

type Props = {
  item: Feedback;
  busyItemId: string;
  selectMode: boolean;
  selected: boolean;
  onEdit: (item: Feedback) => void;
  onDelete: (item: Feedback) => void;
  onToggle: (item: Feedback) => void;
  onSelect: (id: string) => void;
};

type ActionProps = {
  item: Feedback;
  isBusy: boolean;
  onEdit: (item: Feedback) => void;
};

export default function FeedbackCard(props: Props) {
  const id = getFeedbackId(props.item);
  const isBusy = props.busyItemId === id;

  return (
    <li
      className={getRowClass(props)}
      role="button"
      tabIndex={0}
      aria-label={props.item.author || "Feedback"}
      onMouseDown={(event) =>
        preventRowFocusInSelectMode(event, props.selectMode)
      }
      aria-pressed={props.selectMode ? props.selected : undefined}
      onClick={() => handleRowClick(props, id)}
      onKeyDown={(event) => activateRow(event, () => handleRowClick(props, id))}
    >
      <FeedbackPreview imageUrl={props.item.imageUrl} />
      <FeedbackAuthor item={props.item} />
      <FeedbackCategory item={props.item} />
      <FeedbackOrder item={props.item} />
      <FeedbackStatusBadge active={props.item.isActive} />
      <FeedbackUpdated item={props.item} />
      <FeedbackCardActions
        item={props.item}
        isBusy={isBusy}
        onEdit={props.onEdit}
      />
    </li>
  );
}

function FeedbackPreview({ imageUrl }: { imageUrl: string }) {
  return (
    <div className="news-list__cell">
      <img
        src={imageUrl || "/assets/img/avatar.png"}
        alt=""
        aria-hidden="true"
        className="list__avatar feedback-admin__avatar"
      />
    </div>
  );
}
function FeedbackAuthor({ item }: { item: Feedback }) {
  return (
    <div className="news-list__cell feedback-admin__author">
      <strong>{item.author || "—"}</strong>
      <span>{item.meta.de || "—"}</span>
    </div>
  );
}

function FeedbackCategory({ item }: { item: Feedback }) {
  const { t } = useTranslation();

  return (
    <div className="news-list__cell feedback-admin__category">
      {t(getFeedbackCategoryKey(item.category))}
    </div>
  );
}

function FeedbackOrder({ item }: { item: Feedback }) {
  return (
    <div className="news-list__cell feedback-admin__order">
      {item.sortOrder}
    </div>
  );
}

function FeedbackUpdated({ item }: { item: Feedback }) {
  const { i18n } = useTranslation();
  const value = item.updatedAt || item.createdAt;

  return (
    <div className="news-list__cell feedback-admin__date">
      {formatDateOnly(value, i18n.language)}
    </div>
  );
}

function FeedbackCardActions(props: ActionProps) {
  return (
    <div className="news-list__cell feedback-admin__actions">
      <FeedbackEditButton {...props} />
    </div>
  );
}

function FeedbackEditButton(props: ActionProps) {
  const { t } = useTranslation();

  return (
    <button
      className="edit-trigger"
      type="button"
      aria-label={t("admin.feedbacks.editAction")}
      aria-disabled={props.isBusy}
      onClick={(event) => runAction(event, () => openFeedbackEdit(props))}
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

function getRowClass(props: Props) {
  const selected = props.selected ? " is-selected" : "";
  const selectMode = props.selectMode ? " is-selectmode" : "";

  return `list__item chip news-list__row feedback-admin__row-item is-fullhover is-interactive${selected}${selectMode}`;
}

function handleRowClick(props: Props, id: string) {
  if (props.selectMode) {
    props.onSelect(id);
    return;
  }

  props.onEdit(props.item);
}

function preventRowFocusInSelectMode(
  event: MouseEvent<HTMLLIElement>,
  selectMode: boolean,
) {
  if (!selectMode) return;
  event.preventDefault();
}

function openFeedbackEdit(props: ActionProps) {
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
