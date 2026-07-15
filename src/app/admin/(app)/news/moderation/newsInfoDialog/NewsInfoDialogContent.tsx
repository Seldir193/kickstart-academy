"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import NewsInfoSections from "./NewsInfoSections";
import { buildNewsInfoData, getStatusClass } from "./newsInfoDialog.helpers";
import type { NewsInfoDialogProps } from "./newsInfoDialog.types";

function CloseButton({
  label,
  onClose,
}: {
  label: string;
  onClose: () => void;
}) {
  return (
    <button
      type="button"
      className="dialog-close modal__close"
      aria-label={label}
      onClick={onClose}
    >
      <img
        src="/icons/close.svg"
        alt=""
        aria-hidden="true"
        className="icon-img"
      />
    </button>
  );
}

export default function NewsInfoDialogContent({
  open,
  item,
  onClose,
}: NewsInfoDialogProps) {
  const { t, i18n } = useTranslation();
  const data = useMemo(
    () => (item ? buildNewsInfoData(item, t, i18n.language) : null),
    [i18n.language, item, t],
  );
  if (!open || !item || !data) return null;
  return (
    <div className="dialog-backdrop news-info" role="dialog" aria-modal="true">
      <div className="dialog news-info__dialog">
        <div className="dialog-head news-info__head">
          <div className="news-info__head-left">
            <div className="dialog-title news-info__title">{data.title}</div>
            <div className="dialog-subtitle news-info__subtitle">
              {t("common.admin.news.infoDialog.readOnly")}
            </div>
          </div>
          <div className="news-info__head-right">
            <span className={`dialog-status ${getStatusClass(data.status)}`}>
              {t(data.status)}
            </span>
            <div className="dialog-head__actions">
              <CloseButton label={t("common.close")} onClose={onClose} />
            </div>
          </div>
        </div>
        <div className="dialog-body news-info__body">
          <NewsInfoSections data={data} t={t} />
        </div>
      </div>
      <button
        type="button"
        className="dialog-backdrop-hit news-info__backdrop-hit"
        aria-label={t("common.close")}
        onClick={onClose}
      />
    </div>
  );
}
