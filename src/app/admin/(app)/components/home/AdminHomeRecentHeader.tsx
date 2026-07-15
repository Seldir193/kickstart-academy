import Link from "next/link";

type Props = { t: (key: string) => string };

export default function AdminHomeRecentHeader({ t }: Props) {
  return (
    <div className="card-head">
      <h3 className="card-title">{t("common.admin.home.recent.title")}</h3>
      <Link href="/trainings" className="btn">
        {t("common.admin.home.recent.showAll")}
      </Link>
    </div>
  );
}
