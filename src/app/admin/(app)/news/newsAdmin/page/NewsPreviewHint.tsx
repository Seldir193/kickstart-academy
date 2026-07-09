import { useTranslation } from "react-i18next";

export default function NewsPreviewHint({ href }: { href: string }) {
  const { t } = useTranslation();
  if (!href) return null;
  return (
    <div className="news-admin__hint">
      <a className="btn" href={href} target="_blank" rel="noreferrer">
        {t("common.admin.news.page.openWordpressPreview")}
      </a>
    </div>
  );
}
