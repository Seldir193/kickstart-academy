import { useTranslation } from "react-i18next";

type Props = {
  active: boolean;
};

export default function FeedbackStatusBadge({ active }: Props) {
  const { t } = useTranslation();

  return (
    <span className={`pill ${active ? "pill--ok" : "pill--muted"}`}>
      {active ? t("admin.feedbacks.active") : t("admin.feedbacks.inactive")}
    </span>
  );
}