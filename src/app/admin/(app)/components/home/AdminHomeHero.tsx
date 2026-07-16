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
        {renderGreeting(adminName)}
        <p>{t("common.admin.home.hero.subtitle")}</p>
        {renderHeroActions(t, onQuickOpen)}
      </div>
    </section>
  );
}

function renderGreeting(adminName: string) {
  return (
    <h1>
      {dayGreeting(new Date(), "en-US")}{" "}
      {adminName ? `${firstNameOf(adminName)}` : ""}
      {adminName ? "!" : ""}
    </h1>
  );
}

function renderHeroActions(t: Props["t"], onQuickOpen: Props["onQuickOpen"]) {
  return (
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
  );
}
