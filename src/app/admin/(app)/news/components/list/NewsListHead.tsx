import type { TFunction } from "i18next";

const columns = ["title", "category", "date", "status", "author", "action"];

export default function NewsListHead({ t }: { t: TFunction }) {
  return (
    <div className="news-list__head" aria-hidden="true">
      {columns.map((column) => (
        <div
          key={column}
          className={`news-list__h news-list__h--${column === "category" ? "cat" : column}`}
        >
          {t(`common.admin.news.list.${column}`)}
        </div>
      ))}
    </div>
  );
}
