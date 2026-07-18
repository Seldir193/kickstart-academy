"use client";

import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import type { FeedbackCategory } from "../../types";
import { FEEDBACK_CATEGORIES } from "../../constants";
import { getFeedbackCategoryKey } from "../../helpers";
import type { FeedbackBaseFieldsProps } from "./feedbackDialogTextFields.types";

export default function FeedbackBaseFields(props: FeedbackBaseFieldsProps) {
  return <>{renderBaseFields(props)}</>;
}

function renderBaseFields(props: FeedbackBaseFieldsProps) {
  return [
    <FeedbackCategoryField key="category" {...props} />,
    <FeedbackSortField key="sort" {...props} />,
    <FeedbackAuthorField key="author" {...props} />,
    <FeedbackStatusField key="status" {...props} />,
  ];
}

function FeedbackCategoryField(props: FeedbackBaseFieldsProps) {
  const { t } = useTranslation();
  const onChange = (value: string) =>
    props.updateFeedback("category", value as FeedbackCategory);
  return (
    <div className="field">
      <label className="dialog-label">{t("admin.feedbacks.category")}</label>
      {renderCategorySelect(props.draft.category, onChange, t)}
    </div>
  );
}

function renderCategorySelect(
  value: FeedbackCategory,
  onChange: (value: string) => void,
  t: TFunction,
) {
  return (
    <select
      className="input"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {FEEDBACK_CATEGORIES.map((category) => (
        <option key={category} value={category}>
          {t(getFeedbackCategoryKey(category))}
        </option>
      ))}
    </select>
  );
}

function FeedbackSortField(props: FeedbackBaseFieldsProps) {
  const { t } = useTranslation();
  const onChange = (value: string) =>
    props.updateFeedback("sortOrder", Number(value || 100));
  return (
    <div className="field">
      <label className="dialog-label">{t("admin.feedbacks.sortOrder")}</label>
      <input
        className="input"
        type="number"
        value={props.draft.sortOrder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function FeedbackAuthorField(props: FeedbackBaseFieldsProps) {
  const { t } = useTranslation();
  return (
    <div className="field">
      <label className="dialog-label">{t("admin.feedbacks.author")}</label>
      <input
        className="input"
        value={props.draft.author}
        onChange={(event) => props.updateFeedback("author", event.target.value)}
        required
      />
    </div>
  );
}

function FeedbackStatusField(props: FeedbackBaseFieldsProps) {
  const { t } = useTranslation();
  const value = props.draft.isActive ? "active" : "inactive";
  return (
    <div className="field">
      <label className="dialog-label">{t("admin.feedbacks.status")}</label>
      {renderStatusSelect(value, props.updateFeedback, t)}
    </div>
  );
}

function renderStatusSelect(
  value: string,
  updateFeedback: FeedbackBaseFieldsProps["updateFeedback"],
  t: TFunction,
) {
  return (
    <select
      className="input"
      value={value}
      onChange={(event) =>
        updateFeedback("isActive", event.target.value === "active")
      }
    >
      <option value="active">{t("admin.feedbacks.active")}</option>
      <option value="inactive">{t("admin.feedbacks.inactive")}</option>
    </select>
  );
}
