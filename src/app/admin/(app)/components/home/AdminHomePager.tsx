type Props = { page: number; pageCount: number; setPage: (next: (page: number) => number) => void; t: (key: string) => string };

export default function AdminHomePager({ page, pageCount, setPage, t }: Props) {
  return <div className="pager pager--arrows"><button type="button" className="btn" aria-label={t("common.admin.home.pagination.previous")} disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}><img src="/icons/arrow_right_alt.svg" alt="" aria-hidden="true" className="icon-img icon-img--left" /></button><div className="pager__count" aria-live="polite" aria-atomic="true">{page} / {pageCount}</div><button type="button" className="btn" aria-label={t("common.admin.home.pagination.next")} disabled={page >= pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))}><img src="/icons/arrow_right_alt.svg" alt="" aria-hidden="true" className="icon-img" /></button></div>;
}
