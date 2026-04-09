"use client";

import { useTranslation } from "react-i18next";
import type { News } from "../types";
import { toDisplayDate } from "../news";

type ProviderInfo = { id: string; fullName: string; email: string } | null;

type NewsWithProvider = News & {
  provider?: ProviderInfo;
  providerId?: string;
};

type Props = {
  items: NewsWithProvider[];
  selected: Set<string>;
  isSelectMode: boolean;
  onOpen: (n: News) => void;
  onToggle: (id: string) => void;
};

function clean(v: unknown) {
  return String(v ?? "").trim();
}

function getId(n: NewsWithProvider) {
  return clean(n._id);
}

function isRejected(n: NewsWithProvider) {
  return n.status === "rejected" || clean(n.rejectionReason).length > 0;
}

function isApproved(n: NewsWithProvider) {
  return n.status === "approved" || n.published === true;
}

function statusLabel(
  n: NewsWithProvider,
  t: (key: string, options?: Record<string, unknown>) => string,
) {
  if (isApproved(n)) return t("common.admin.news.list.statusApproved");
  if (isRejected(n)) return t("common.admin.news.list.statusRejected");
  return t("common.admin.news.list.statusToReview");
}

function statusClass(n: NewsWithProvider) {
  if (isApproved(n)) return "is-on";
  if (isRejected(n)) return "is-rejected";
  return "is-off";
}

function providerLabel(n: NewsWithProvider) {
  const p = n.provider;
  const name = clean(p?.fullName);
  if (name) return name;
  const mail = clean(p?.email);
  if (mail) return mail;
  const pid = clean(n.providerId);
  return pid || "";
}

export default function NewsList({
  items,
  selected,
  isSelectMode,
  onOpen,
  onToggle,
}: Props) {
  const { t, i18n } = useTranslation();
  if (!items.length) {
    return (
      <section className="card">
        <div className="card__empty">{t("common.admin.news.list.empty")}</div>
      </section>
    );
  }

  return (
    <section className="card news-list">
      <div className="news-list__table">
        <div className="news-list__head" aria-hidden="true">
          <div className="news-list__h news-list__h--title">
            {t("common.admin.news.list.title")}
          </div>
          <div className="news-list__h news-list__h--cat">
            {" "}
            {t("common.admin.news.list.category")}
          </div>
          <div className="news-list__h news-list__h--date">
            {t("common.admin.news.list.date")}
          </div>
          <div className="news-list__h news-list__h--status">
            {t("common.admin.news.list.status")}
          </div>
          <div className="news-list__h news-list__h--author">
            {t("common.admin.news.list.author")}
          </div>
          <div className="news-list__h news-list__h--action">
            {t("common.admin.news.list.action")}
          </div>
        </div>

        <ul className="list list--bleed">
          {items.map((n) => {
            const id = getId(n);
            const checked = selected.has(id);
            const author = providerLabel(n);
            const rejected = isRejected(n);
            const hideAction = isSelectMode || checked;

            function handleRowClick() {
              if (!id) return;
              if (isSelectMode) onToggle(id);
              else onOpen(n);
            }

            function openFromAction(e: React.MouseEvent) {
              e.stopPropagation();
              onOpen(n);
            }

            function openFromActionKey(e: React.KeyboardEvent) {
              if (e.key !== "Enter" && e.key !== " ") return;
              e.preventDefault();
              e.stopPropagation();
              onOpen(n);
            }

            return (
              <li
                key={id}
                className={`list__item chip is-fullhover is-interactive news-list__row ${
                  checked ? "is-selected" : ""
                } ${isSelectMode ? "is-selectmode" : ""}`}
                onClick={handleRowClick}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleRowClick();
                  }
                }}
                tabIndex={0}
                role="button"
                aria-pressed={isSelectMode ? checked : undefined}
                aria-label={
                  isSelectMode
                    ? t("common.admin.news.list.selectAria", {
                        title:
                          clean(n.title) ||
                          t("common.admin.news.list.defaultTitle"),
                      })
                    : t("common.admin.news.list.openAria", {
                        title:
                          clean(n.title) ||
                          t("common.admin.news.list.defaultTitle"),
                      })
                }
              >
                <div className="news-list__cell news-list__cell--title">
                  <div className="news-list__title">
                    {clean(n.title) || t("common.emptyDash")}
                  </div>
                  <div
                    className={`news-list__excerpt ${
                      clean(n.excerpt) ? "" : "is-empty"
                    }`}
                  >
                    {clean(n.excerpt) || t("common.emptyDash")}
                  </div>
                </div>

                <div className="news-list__cell news-list__cell--cat">
                  <span className="news-list__pill">
                    {clean(n.category) ||
                      t("common.admin.news.list.defaultTitle")}
                  </span>
                </div>

                <div className="news-list__cell news-list__cell--date">
                  {toDisplayDate(n.date, i18n.language)}
                </div>

                <div className="news-list__cell news-list__cell--status">
                  <span className={`news-list__status ${statusClass(n)}`}>
                    {statusLabel(n, t)}
                  </span>
                </div>

                <div className="news-list__cell news-list__cell--author">
                  {author || (
                    <span className="news-list__muted">
                      {t("common.admin.news.list.authorEmpty")}
                    </span>
                  )}
                </div>

                {!hideAction ? (
                  <div
                    className="list__actions news-list__cell news-list__cell--action"
                    onClick={openFromAction}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <span
                      className="edit-trigger"
                      role="button"
                      tabIndex={0}
                      aria-label={
                        rejected
                          ? t("common.admin.news.list.infoAria", {
                              title:
                                clean(n.title) ||
                                t("common.admin.news.list.defaultTitle"),
                            })
                          : t("common.admin.news.list.editAria", {
                              title:
                                clean(n.title) ||
                                t("common.admin.news.list.defaultTitle"),
                            })
                      }
                      onClick={openFromAction}
                      onKeyDown={openFromActionKey}
                    >
                      <img
                        src={rejected ? "/icons/info.svg" : "/icons/edit.svg"}
                        alt=""
                        aria-hidden="true"
                        className="icon-img"
                      />
                    </span>
                  </div>
                ) : (
                  <div
                    className="list__actions news-list__cell news-list__cell--action news-list__actions--hidden"
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
