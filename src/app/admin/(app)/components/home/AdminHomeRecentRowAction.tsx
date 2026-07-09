import { handleActivation } from "./homeHelpers";

type Props = { onNavigate: () => void; t: (key: string) => string };

export default function AdminHomeRecentRowAction({ onNavigate, t }: Props) {
  return <div className="news-list__cell news-list__cell--action" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}><span className="edit-trigger ks-filter-open" role="button" tabIndex={0} title={t("common.admin.home.actions.filterByThisCourse")} aria-label={t("common.admin.home.actions.filterByThisCourse")} onClick={onNavigate} onKeyDown={(e) => handleActivation(e, onNavigate)}><img src="/icons/filter.svg" alt="" aria-hidden="true" className="icon-img" /></span></div>;
}
