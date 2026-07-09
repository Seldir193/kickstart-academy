type Props = { t: (key: string) => string };

export default function AdminHomeRecentTableHead({ t }: Props) {
  return <div className="news-list__head" aria-hidden="true"><div className="news-list__h">{t("common.admin.home.table.coach")}</div><div className="news-list__h">{t("common.admin.home.table.course")}</div><div className="news-list__h">{t("common.admin.home.table.place")}</div><div className="news-list__h">{t("common.admin.home.table.price")}</div><div className="news-list__h">{t("common.admin.home.table.date")}</div><div className="news-list__h news-list__h--right">{t("common.admin.home.table.action")}</div></div>;
}
