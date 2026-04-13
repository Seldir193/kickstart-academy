"use client";

import { useTranslation } from "react-i18next";
import type { Coach } from "../types";
import { fullName } from "../utils";

type Props = {
  open: boolean;
  coach: Coach | null;
  onClose: () => void;
};

function cleanStr(v: unknown) {
  return String(v ?? "").trim();
}

function valOrDash(v: unknown, fallback: string) {
  const s = cleanStr(v);
  return s ? s : fallback;
}

export default function CoachInfoDialog({ open, coach, onClose }: Props) {
  const { t } = useTranslation();
  if (!open || !coach) return null;

  const reason = valOrDash(
    (coach as any).rejectionReason,
    t("common.values.emptyDash"),
  );

  return (
    <div className="dialog-backdrop coach-info" role="dialog" aria-modal="true">
      <button
        type="button"
        className="dialog-backdrop-hit coach-info__backdrop-hit"
        aria-label={t("common.actions.close")}
        onClick={onClose}
      />

      <div className="dialog coach-info__dialog">
        <div className="dialog-head coach-info__head">
          <div className="coach-info__head-left">
            <div className="dialog-title coach-info__title">
              {t("common.admin.coaches.infoDialog.coachPrefix")}:{" "}
              {fullName(coach)}
            </div>

            <div className="dialog-subtitle coach-info__subtitle">
              {t("common.admin.coaches.infoDialog.viewOnly")}
            </div>
          </div>

          <div className="coach-info__head-right">
            <div className="dialog-head__actions">
              <button
                type="button"
                className="dialog-close modal__close"
                aria-label={t("common.actions.close")}
                onClick={onClose}
              >
                <img
                  src="/icons/close.svg"
                  alt=""
                  aria-hidden="true"
                  className="icon-img"
                />
              </button>
            </div>
          </div>
        </div>

        <div className="dialog-body coach-info__body">
          <div className="coach-info__grid">
            <section className="dialog-section coach-info__section coach-info__section--danger">
              <div className="dialog-section__head">
                <div className="dialog-section__title">
                  {t("common.admin.coaches.infoDialog.rejectionReason")}
                </div>
              </div>

              <div className="dialog-section__body coach-info__list">
                <div className="coach-info__row is-multiline">
                  <div className="dialog-label">
                    {t("common.admin.coaches.infoDialog.reason")}
                  </div>
                  <div className="dialog-value">{reason}</div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
