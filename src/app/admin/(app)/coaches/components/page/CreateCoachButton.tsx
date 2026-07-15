"use client";

import { useTranslation } from "react-i18next";

type Props = { busy: boolean; onOpen: () => void };

export default function CreateCoachButton({ busy, onOpen }: Props) {
  const { t } = useTranslation();
  return (
    <button
      className="btn"
      type="button"
      onClick={() => openWhenReady(busy, onOpen)}
    >
      {renderPlusIcon()}
      {t("common.admin.coaches.page.newCoach")}
    </button>
  );
}

function renderPlusIcon() {
  return (
    <img
      src="/icons/plus.svg"
      alt=""
      aria-hidden="true"
      className="btn__icon"
    />
  );
}

function openWhenReady(busy: boolean, onOpen: () => void) {
  if (busy) return;
  onOpen();
}
