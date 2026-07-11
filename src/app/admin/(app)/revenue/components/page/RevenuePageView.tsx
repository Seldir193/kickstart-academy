import styles from "@/app/styles/revenue.module.scss";
import RevenueFilters from "./RevenueFilters";
import RevenueSections from "./RevenueSections";
import type { RevenuePageProps } from "./revenuePage.types";

export default function RevenuePageView(props: RevenuePageProps) {
  return (
    <div className={styles.pageWrap}>
      <RevenueHeader t={props.t} />
      <div className={styles.container}>
        <RevenueFilters {...props} />
        <RevenueSections {...props} />
      </div>
    </div>
  );
}

function RevenueHeader({ t }: Pick<RevenuePageProps, "t">) {
  return (
    <h1 className="text-2xl font-bold m-0">
      {t("common.admin.revenue.title", { defaultValue: "Revenue overview" })}
    </h1>
  );
}
