import { useTranslation } from "react-i18next";

type Props = {
  busy: boolean;
  onCreate: () => void;
};

export default function FeedbackPageHeader({ busy, onCreate }: Props) {
  const { t } = useTranslation();

  return (
    <section className="feedback-admin__head">
      <div>
        <h1>{t("admin.feedbacks.title")}</h1>
        <p>{t("admin.feedbacks.subtitle")}</p>
      </div>

      <button className="btn" type="button" onClick={onCreate} disabled={busy}>
        <img src="/icons/plus.svg" alt="" aria-hidden="true" className="btn__icon" />
        {t("admin.feedbacks.create")}
      </button>
    </section>
  );
}