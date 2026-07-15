import type { Translate } from "../types";

export function NewsTableHead({ t }: { t: Translate }) {
  return (
    <div className="news-list__head" aria-hidden="true">
      <HeaderCell t={t} name="title" />
      <HeaderCell t={t} name="category" />
      <HeaderCell t={t} name="date" />
      <HeaderCell t={t} name="status" />
      <HeaderCell t={t} name="author" />
      <HeaderCell t={t} name="action" right />
    </div>
  );
}

function HeaderCell({
  t,
  name,
  right,
}: {
  t: Translate;
  name: string;
  right?: boolean;
}) {
  return (
    <div className={`news-list__h ${right ? "news-list__h--right" : ""}`}>
      {t(`common.admin.news.table.${name}`)}
    </div>
  );
}
