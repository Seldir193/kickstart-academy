import { formatDateOnly } from "../../utils/dateFormat";
import { courseMeta, courseTitle, formatPrice, safeText } from "./homeHelpers";
import type { Offer } from "./types";

type Props = {
  offer: Offer;
  isLatest: boolean;
  language: string;
  t: (key: string) => string;
};

export default function AdminHomeRecentRowCells({
  offer,
  isLatest,
  language,
  t,
}: Props) {
  return (
    <>
      <CoachCell offer={offer} t={t} />
      <CourseCell offer={offer} isLatest={isLatest} t={t} />
      <TextCell
        title={safeText(offer.location) || t("common.admin.common.emptyValue")}
      />
      <TextCell title={formatPrice(offer.price)} />
      <TextCell title={formatDateOnly(offer.updatedAt, language)} />
    </>
  );
}

function CoachCell({ offer, t }: { offer: Offer; t: (key: string) => string }) {
  return (
    <div className="news-list__cell">
      <img
        src={offer.coachImage || "/assets/img/avatar.png"}
        alt={coachAlt(offer, t)}
        className="list__avatar"
        onError={(e) => {
          e.currentTarget.src = "/assets/img/avatar.png";
        }}
      />
    </div>
  );
}

function CourseCell({
  offer,
  isLatest,
  t,
}: {
  offer: Offer;
  isLatest: boolean;
  t: (key: string) => string;
}) {
  return (
    <div className="news-list__cell">
      <div className="news-list__title">
        {courseTitle(t, offer)}{" "}
        {isLatest ? (
          <span className="badge">
            {t("common.admin.home.recent.lastUpdated")}
          </span>
        ) : null}
      </div>
      <div className="news-list__excerpt">{courseMeta(offer)}</div>
    </div>
  );
}

function TextCell({ title }: { title: string }) {
  return (
    <div className="news-list__cell">
      <div className="news-list__title">{title}</div>
      <div className="news-list__excerpt is-empty">{"\u00A0"}</div>
    </div>
  );
}

function coachAlt(offer: Offer, t: (key: string) => string) {
  return offer.coachName
    ? `${t("common.admin.home.table.coach")} ${offer.coachName}`
    : t("common.admin.home.table.coach");
}
