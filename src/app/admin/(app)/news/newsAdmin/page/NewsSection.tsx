import { useTranslation } from "react-i18next";
import Pagination from "../../components/Pagination";
import type { NewsSectionProps } from "./types";

export default function NewsSection(props: NewsSectionProps) {
  const { t } = useTranslation();
  return (
    <section className="news-admin__section">
      <div className="news-admin__section-head">
        <h2 className="news-admin__section-title">{t(props.titleKey)}</h2>
        <span className="news-admin__section-meta">{props.meta}</span>
      </div>
      <div className="news-admin__box news-admin__box--scroll3">
        {props.children}
      </div>
      <Pagination
        page={props.page}
        pages={props.pages}
        onPrev={props.onPrev}
        onNext={props.onNext}
      />
    </section>
  );
}
