import Link from "next/link";
import { dayGreeting, firstNameOf } from "@/app/lib/greeting";

type Props = {
  adminName: string;
  t: (key: string) => string;
  onQuickOpen: () => void;
};

export default function AdminHomeHero({ adminName, t, onQuickOpen }: Props) {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>
          {dayGreeting(new Date(), "en-US")}{" "}
          {adminName ? `${firstNameOf(adminName)}` : ""}
          {adminName ? "!" : ""}
        </h1>
        <p>{t("common.admin.home.hero.subtitle")}</p>
        <div className="hero-actions">
          <Link href="/admin/trainings" className="btn">
            {t("common.admin.home.hero.createCourse")}
          </Link>
          <Link href="/admin/orte" className="btn">
            {t("common.admin.home.hero.createPlace")}
          </Link>
          <button className="btn" onClick={onQuickOpen} type="button">
            {t("common.admin.home.hero.createBooking")}
          </button>
        </div>
      </div>
    </section>
  );
}
