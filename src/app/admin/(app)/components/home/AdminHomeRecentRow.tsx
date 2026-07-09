import AdminHomeRecentRowAction from "./AdminHomeRecentRowAction";
import AdminHomeRecentRowCells from "./AdminHomeRecentRowCells";
import { courseTitle, handleActivation, offerFilterHref, safeText } from "./homeHelpers";
import type { Offer } from "./types";

type Props = { offer: Offer; index: number; page: number; language: string; t: (key: string) => string; onNavigate: (href: string) => void };

export default function AdminHomeRecentRow({ offer, index, page, language, t, onNavigate }: Props) {
  const href = offerFilterHref(offer);
  const go = () => onNavigate(href);
  return <li key={offer._id} className="list__item chip news-list__row is-fullhover is-interactive" onClick={go} onKeyDown={(e) => handleActivation(e, go)} tabIndex={0} role="button" aria-label={rowLabel(offer, t)}><AdminHomeRecentRowCells offer={offer} isLatest={page === 1 && index === 0} language={language} t={t} /><AdminHomeRecentRowAction onNavigate={go} t={t} /></li>;
}

function rowLabel(offer: Offer, t: (key: string) => string) {
  const course = safeText(offer.sub_type || offer.type);
  return `${t("common.admin.home.actions.filterByCourse")}: ${course || courseTitle(t, offer)}`;
}
