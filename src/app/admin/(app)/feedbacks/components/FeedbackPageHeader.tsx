"use client";

import { useTranslation } from "react-i18next";

type Props = {
  busy: boolean;
  onCreate: () => void;
};

export default function FeedbackPageHeader(props: Props) {
  const { t } = useTranslation();

  return (
    <button
      className="btn feedback-admin__create"
      type="button"
      aria-disabled={props.busy}
      onClick={() => handleCreate(props)}
    >
      <img
        src="/icons/plus.svg"
        alt=""
        aria-hidden="true"
        className="btn__icon"
      />
      {t("admin.feedbacks.create")}
    </button>
  );
}

function handleCreate(props: Props) {
  if (props.busy) return;
  props.onCreate();
}