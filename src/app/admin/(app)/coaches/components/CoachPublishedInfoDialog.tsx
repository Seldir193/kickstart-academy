"use client";

import { useTranslation } from "react-i18next";
import type { Coach } from "../types";
import { fullName } from "../utils";

function cleanStr(v: unknown) {
  return String(v ?? "").trim();
}

function val(v: any) {
  const s = cleanStr(v);
  return s ? s : "—";
}

export default function CoachPublishedInfoDialog({
  open,
  coach,
  onClose,
}: {
  open: boolean;
  coach: Coach | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  if (!open || !coach) return null;

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
            <div className="coach-info__title-row">
              <div className="dialog-title coach-info__title">
                {t("common.admin.coaches.publishedInfoDialog.coachPrefix")}:{" "}
                {fullName(coach)}
              </div>

              <span className="dialog-status dialog-status--success">
                {t("common.admin.coaches.publishedInfoDialog.published")}
              </span>
            </div>

            <div className="dialog-subtitle coach-info__subtitle">
              {t("common.admin.coaches.publishedInfoDialog.viewOnlyPublished")}
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
          <div className="coach-info__grid coach-info__grid--two">
            <section className="dialog-section coach-info__section">
              <div className="dialog-section__head">
                <div className="dialog-section__title">
                  {t("common.admin.coaches.publishedInfoDialog.details")}
                </div>
              </div>

              <div className="dialog-section__body coach-info__list">
                <div className="coach-info__row">
                  <div className="dialog-label">
                    {t("common.admin.coaches.publishedInfoDialog.slug")}
                  </div>
                  <div className="dialog-value">{val((coach as any).slug)}</div>
                </div>

                <div className="coach-info__row">
                  <div className="dialog-label">
                    {t("common.admin.coaches.publishedInfoDialog.firstName")}
                  </div>
                  <div className="dialog-value">
                    {val((coach as any).firstName)}
                  </div>
                </div>

                <div className="coach-info__row">
                  <div className="dialog-label">
                    {t("common.admin.coaches.publishedInfoDialog.lastName")}
                  </div>
                  <div className="dialog-value">
                    {val((coach as any).lastName)}
                  </div>
                </div>

                <div className="coach-info__row">
                  <div className="dialog-label">
                    {t("common.admin.coaches.publishedInfoDialog.position")}
                  </div>
                  <div className="dialog-value">
                    {val((coach as any).position)}
                  </div>
                </div>

                <div className="coach-info__row">
                  <div className="dialog-label">
                    {t("common.admin.coaches.publishedInfoDialog.since")}
                  </div>
                  <div className="dialog-value">
                    {val((coach as any).since)}
                  </div>
                </div>

                <div className="coach-info__row is-multiline">
                  <div className="dialog-label">
                    {t("common.admin.coaches.publishedInfoDialog.degree")}
                  </div>
                  <div className="dialog-value">
                    {val((coach as any).degree)}
                  </div>
                </div>
              </div>
            </section>

            <section className="dialog-section coach-info__section">
              <div className="dialog-section__head">
                <div className="dialog-section__title">
                  {t("common.admin.coaches.publishedInfoDialog.favorites")}
                </div>
              </div>

              <div className="dialog-section__body coach-info__list">
                <div className="coach-info__row">
                  <div className="dialog-label">
                    {t("common.admin.coaches.publishedInfoDialog.favoriteClub")}
                  </div>
                  <div className="dialog-value">
                    {val((coach as any).favClub)}
                  </div>
                </div>

                <div className="coach-info__row">
                  <div className="dialog-label">
                    {t(
                      "common.admin.coaches.publishedInfoDialog.favoriteCoach",
                    )}
                  </div>
                  <div className="dialog-value">
                    {val((coach as any).favCoach)}
                  </div>
                </div>

                <div className="coach-info__row">
                  <div className="dialog-label">
                    {t(
                      "common.admin.coaches.publishedInfoDialog.favoriteTrick",
                    )}
                  </div>
                  <div className="dialog-value">
                    {val((coach as any).favTrick)}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
