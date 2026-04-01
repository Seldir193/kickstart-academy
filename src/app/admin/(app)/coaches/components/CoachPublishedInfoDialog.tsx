"use client";

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
  if (!open || !coach) return null;

  return (
    <div className="dialog-backdrop coach-info" role="dialog" aria-modal="true">
      <button
        type="button"
        className="dialog-backdrop-hit coach-info__backdrop-hit"
        aria-label="Close"
        onClick={onClose}
      />

      <div className="dialog coach-info__dialog">
        <div className="dialog-head coach-info__head">
          <div className="coach-info__head-left">
            <div className="coach-info__title-row">
              <div className="dialog-title coach-info__title">
                Coach: {fullName(coach)}
              </div>

              <span className="dialog-status dialog-status--success">
                Published
              </span>
            </div>

            <div className="dialog-subtitle coach-info__subtitle">
              View only (published)
            </div>
          </div>

          <div className="coach-info__head-right">
            <div className="dialog-head__actions">
              <button
                type="button"
                className="dialog-close modal__close"
                aria-label="Close"
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

        {/* <div className="dialog coach-info__dialog">
        <div className="dialog-head coach-info__head">
          <div className="coach-info__head-left">
            <div className="dialog-title coach-info__title">
              Coach: {fullName(coach)}
            </div>

           

            <div className="dialog-subtitle coach-info__subtitle">
              View only (published)
            </div>
          </div>

          <div className="coach-info__head-right">
             <span className="dialog-status dialog-status--success">
              Published
            </span>
            <div className="dialog-head__actions">
              <button
                type="button"
                className="dialog-close modal__close"
                aria-label="Close"
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
        </div> */}

        <div className="dialog-body coach-info__body">
          <div className="coach-info__grid coach-info__grid--two">
            <section className="dialog-section coach-info__section">
              <div className="dialog-section__head">
                <div className="dialog-section__title">Details</div>
              </div>

              <div className="dialog-section__body coach-info__list">
                <div className="coach-info__row">
                  <div className="dialog-label">Slug</div>
                  <div className="dialog-value">{val((coach as any).slug)}</div>
                </div>

                <div className="coach-info__row">
                  <div className="dialog-label">First name</div>
                  <div className="dialog-value">
                    {val((coach as any).firstName)}
                  </div>
                </div>

                <div className="coach-info__row">
                  <div className="dialog-label">Last name</div>
                  <div className="dialog-value">
                    {val((coach as any).lastName)}
                  </div>
                </div>

                <div className="coach-info__row">
                  <div className="dialog-label">Position</div>
                  <div className="dialog-value">
                    {val((coach as any).position)}
                  </div>
                </div>

                <div className="coach-info__row">
                  <div className="dialog-label">Since</div>
                  <div className="dialog-value">
                    {val((coach as any).since)}
                  </div>
                </div>

                <div className="coach-info__row is-multiline">
                  <div className="dialog-label">Degree</div>
                  <div className="dialog-value">
                    {val((coach as any).degree)}
                  </div>
                </div>
              </div>
            </section>

            <section className="dialog-section coach-info__section">
              <div className="dialog-section__head">
                <div className="dialog-section__title">Favorites</div>
              </div>

              <div className="dialog-section__body coach-info__list">
                <div className="coach-info__row">
                  <div className="dialog-label">Favorite club</div>
                  <div className="dialog-value">
                    {val((coach as any).favClub)}
                  </div>
                </div>

                <div className="coach-info__row">
                  <div className="dialog-label">Favorite coach</div>
                  <div className="dialog-value">
                    {val((coach as any).favCoach)}
                  </div>
                </div>

                <div className="coach-info__row">
                  <div className="dialog-label">Favorite trick</div>
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
