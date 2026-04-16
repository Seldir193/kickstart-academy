"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatDateOnly } from "./utils/dateFormat";
import { useRouter } from "next/navigation";
import { dayGreeting, firstNameOf } from "@/app/lib/greeting";

type Offer = {
  _id: string;
  title?: string;
  type?: string;
  sub_type?: string;
  category?: string;
  location?: string;
  price?: number;
  updatedAt?: string;
  coachImage?: string;
  coachName?: string;
};

type OffersResponse = { items: Offer[]; total: number };

function safeText(value: unknown) {
  return String(value ?? "").trim();
}

// function formatDateDe(value?: string) {
//   if (!value) return "—";
//   const date = new Date(value);
//   if (Number.isNaN(date.getTime())) return "—";
//   return date.toLocaleDateString("de-DE", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//   });
// }

function formatPrice(value?: number) {
  if (typeof value !== "number") return "—";
  return `${value} €`;
}

function courseTitle(t: (key: string) => string, offer: Offer) {
  const raw = safeText(offer.title);
  if (!raw) return t("common.admin.home.courseFallback");
  const dash = raw.split(" — ")[0];
  const dot = dash.split(" • ")[0];
  return safeText(dot) || t("common.admin.home.courseFallback");
}

function courseMeta(offer: Offer) {
  const titleLower = safeText(offer.title).toLowerCase();
  const course = safeText(offer.sub_type || offer.type);
  if (!course) return "\u00A0";
  if (titleLower.includes(course.toLowerCase())) return "\u00A0";
  return course;
}

function sortByUpdatedDesc(items: Offer[]) {
  return [...items].sort((a, b) => {
    const ta = (a.updatedAt && Date.parse(a.updatedAt)) || 0;
    const tb = (b.updatedAt && Date.parse(b.updatedAt)) || 0;
    return tb - ta;
  });
}

export default function AdminHomePage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [placesCount, setPlacesCount] = useState<number>(0);
  const [newsletterLeads, setNewsletterLeads] = useState<number>(0);
  const [openBookingsCount, setOpenBookingsCount] = useState<number>(0);

  const [page, setPage] = useState(1);
  const limit = 10;
  const [items, setItems] = useState<Offer[]>([]);
  const [total, setTotal] = useState(0);
  const [loadingList, setLoadingList] = useState(true);

  const [quickOpen, setQuickOpen] = useState(false);
  const [adminName, setAdminName] = useState<string>("");

  useEffect(() => {
    let abort = false;

    async function loadCounts() {
      try {
        const r = await fetch("/api/admin/offers?onlineActive=true&limit=1", {
          cache: "no-store",
          credentials: "include",
        });
        const j: OffersResponse = await r
          .json()
          .catch(() => ({ items: [], total: 0 }));
        if (!abort) setOnlineCount(Number(j?.total || 0));
      } catch {
        if (!abort) setOnlineCount(0);
      }

      try {
        const r = await fetch("/api/admin/places?limit=1", {
          cache: "no-store",
          credentials: "include",
        });
        const j = await r.json().catch(() => ({}));
        if (!abort) setPlacesCount(Number(j?.total || 0));
      } catch {
        if (!abort) setPlacesCount(0);
      }

      try {
        const r = await fetch("/api/admin/customers?tab=newsletter&limit=1", {
          cache: "no-store",
          credentials: "include",
        });
        const j = await r.json().catch(() => ({}));
        if (!abort) setNewsletterLeads(Number(j?.total || 0));
      } catch {
        if (!abort) setNewsletterLeads(0);
      }

      try {
        const r = await fetch("/api/admin/bookings?status=pending&limit=1", {
          cache: "no-store",
          credentials: "include",
        });
        const j = await r.json().catch(() => ({ total: 0 }));
        if (!abort) setOpenBookingsCount(Number(j?.total || 0));
      } catch {
        if (!abort) setOpenBookingsCount(0);
      }
    }

    loadCounts();
    return () => {
      abort = true;
    };
  }, []);

  useEffect(() => {
    let abort = false;

    async function loadAdminName() {
      try {
        const r = await fetch("/api/admin/auth/me", {
          cache: "no-store",
          credentials: "include",
        });
        const j = await r.json().catch(() => ({}));
        if (abort || !j?.ok || !j?.user) return;
        const dn = j.user.fullName || j.user.displayName || j.user.email || "";
        setAdminName(dn);
      } catch {}
    }

    loadAdminName();
    return () => {
      abort = true;
    };
  }, []);

  useEffect(() => {
    let abort = false;

    async function loadRecent() {
      try {
        setLoadingList(true);
        const r = await fetch(`/api/admin/offers?page=${page}&limit=${limit}`, {
          cache: "no-store",
          credentials: "include",
        });
        const j: OffersResponse = await r
          .json()
          .catch(() => ({ items: [], total: 0 }));
        const list = Array.isArray(j?.items) ? j.items : [];
        const sorted = sortByUpdatedDesc(list);
        if (!abort) {
          setItems(sorted);
          setTotal(Number(j?.total || sorted.length));
        }
      } finally {
        if (!abort) setLoadingList(false);
      }
    }

    loadRecent();
    return () => {
      abort = true;
    };
  }, [page]);

  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(total / limit)),
    [total, limit],
  );

  return (
    <div className="ks admin-home">
      <main className="container">
        <section className="hero">
          <div className="hero-content">
            <h1>
              {dayGreeting(new Date(), "en-US")}{" "}
              {adminName ? `${firstNameOf(adminName)}` : ""}
              {adminName ? "!" : ""}
            </h1>
            <p>{t("common.admin.home.hero.subtitle")}</p>
            <div className="hero-actions">
              <Link href="/admin/trainings" className="btn">
                {t("common.admin.home.hero.createCourse")}
              </Link>
              <Link href="/admin/orte" className="btn">
                {t("common.admin.home.hero.createPlace")}
              </Link>
              <button
                className="btn"
                onClick={() => setQuickOpen(true)}
                type="button"
              >
                {t("common.admin.home.hero.createBooking")}
              </button>
            </div>
          </div>
        </section>

        <section className="grid">
          <div className="card">
            <div className="card-head">
              <h3 className="card-title">
                {t("common.admin.home.cards.coursesOnline")}
              </h3>
            </div>
            <div className="text-xl font-bold">{onlineCount}</div>
            <div className="card-actions">
              <Link href="/trainings" className="btn">
                {t("common.admin.home.cards.allCourses")}
              </Link>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <h3 className="card-title">
                {t("common.admin.home.cards.places")}
              </h3>
            </div>
            <div className="text-xl font-bold">{placesCount}</div>
            <div className="card-actions">
              <Link href="/orte" className="btn">
                {t("common.admin.home.cards.managePlaces")}
              </Link>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <h3 className="card-title">
                {t("common.admin.home.cards.newsletterLeads")}
              </h3>
            </div>
            <div className="text-xl font-bold">{newsletterLeads}</div>
            <div className="card-actions">
              <Link href="/customers?tab=newsletter" className="btn">
                {t("common.admin.home.cards.viewLeads")}
              </Link>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <h3 className="card-title">
                {t("common.admin.home.cards.openRequests")}
              </h3>
            </div>
            <div className="text-xl font-bold">{openBookingsCount}</div>
            <div className="card-actions">
              <Link href="/admin/bookings" className="btn">
                {t("common.admin.home.cards.goToBookings")}
              </Link>
            </div>
          </div>
        </section>

        <section className="card news-list admin-home__recent">
          <div className="card-head">
            <h3 className="card-title">
              {t("common.admin.home.recent.title")}
            </h3>
            <Link href="/trainings" className="btn">
              {t("common.admin.home.recent.showAll")}
            </Link>
          </div>

          {loadingList ? (
            <div className="card__empty">
              {t("common.admin.home.recent.loading")}
            </div>
          ) : items.length === 0 ? (
            <div className="card__empty">
              {t("common.admin.home.recent.empty")}
            </div>
          ) : (
            <div className="news-list__table">
              <div className="news-list__head" aria-hidden="true">
                <div className="news-list__h">
                  {t("common.admin.home.table.coach")}
                </div>
                <div className="news-list__h">
                  {t("common.admin.home.table.course")}
                </div>
                <div className="news-list__h">
                  {t("common.admin.home.table.place")}
                </div>
                <div className="news-list__h">
                  {t("common.admin.home.table.price")}
                </div>
                <div className="news-list__h">
                  {t("common.admin.home.table.date")}
                </div>
                <div className="news-list__h news-list__h--right">
                  {t("common.admin.home.table.action")}
                </div>
              </div>

              <ul className="list list--bleed">
                {items.map((offer, index) => {
                  const courseValue = safeText(offer.sub_type || offer.type);
                  const filterHref = courseValue
                    ? `/trainings?course=${encodeURIComponent(courseValue)}`
                    : "/trainings";
                  const isLatest = page === 1 && index === 0;

                  return (
                    <li
                      key={offer._id}
                      className="list__item chip news-list__row is-fullhover is-interactive"
                      onClick={() => router.push(filterHref)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          router.push(filterHref);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`${t("common.admin.home.actions.filterByCourse")}: ${courseValue || courseTitle(t, offer)}`}
                    >
                      <div className="news-list__cell">
                        <img
                          src={offer.coachImage || "/assets/img/avatar.png"}
                          alt={
                            offer.coachName
                              ? `${t("common.admin.home.table.coach")} ${offer.coachName}`
                              : t("common.admin.home.table.coach")
                          }
                          className="list__avatar"
                          onError={(e) => {
                            e.currentTarget.src = "/assets/img/avatar.png";
                          }}
                        />
                      </div>

                      <div className="news-list__cell">
                        <div className="news-list__title">
                          {courseTitle(t, offer)}{" "}
                          {isLatest ? (
                            <span className="badge">
                              {t("common.admin.home.recent.lastUpdated")}
                            </span>
                          ) : null}
                        </div>
                        <div className="news-list__excerpt">
                          {courseMeta(offer)}
                        </div>
                      </div>

                      <div className="news-list__cell">
                        <div className="news-list__title">
                          {safeText(offer.location) ||
                            t("common.admin.common.emptyValue")}
                        </div>
                        <div className="news-list__excerpt is-empty">
                          {"\u00A0"}
                        </div>
                      </div>

                      <div className="news-list__cell">
                        <div className="news-list__title">
                          {formatPrice(offer.price)}
                        </div>
                        <div className="news-list__excerpt is-empty">
                          {"\u00A0"}
                        </div>
                      </div>

                      <div className="news-list__cell">
                        <div className="news-list__title">
                          {formatDateOnly(offer.updatedAt, i18n.language)}
                        </div>
                        <div className="news-list__excerpt is-empty">
                          {"\u00A0"}
                        </div>
                      </div>

                      <div
                        className="news-list__cell news-list__cell--action"
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <span
                          className="edit-trigger ks-filter-open"
                          role="button"
                          tabIndex={0}
                          title={t(
                            "common.admin.home.actions.filterByThisCourse",
                          )}
                          aria-label={t(
                            "common.admin.home.actions.filterByThisCourse",
                          )}
                          onClick={() => router.push(filterHref)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              router.push(filterHref);
                            }
                          }}
                        >
                          <img
                            src="/icons/filter.svg"
                            alt=""
                            aria-hidden="true"
                            className="icon-img"
                          />
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>
      </main>

      <div className="pager pager--arrows">
        <button
          type="button"
          className="btn"
          aria-label={t("common.admin.home.pagination.previous")}
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          <img
            src="/icons/arrow_right_alt.svg"
            alt=""
            aria-hidden="true"
            className="icon-img icon-img--left"
          />
        </button>

        <div className="pager__count" aria-live="polite" aria-atomic="true">
          {page} / {pageCount}
        </div>

        <button
          type="button"
          className="btn"
          aria-label={t("common.admin.home.pagination.next")}
          disabled={page >= pageCount}
          onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
        >
          <img
            src="/icons/arrow_right_alt.svg"
            alt=""
            aria-hidden="true"
            className="icon-img"
          />
        </button>
      </div>

      {quickOpen ? null : null}
    </div>
  );
}
