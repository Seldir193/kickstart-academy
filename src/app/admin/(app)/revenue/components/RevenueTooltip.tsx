"use client";

import { useTranslation } from "react-i18next";
import styles from "@/app/styles/revenue.module.scss";
import type { Counts, YearlyRow } from "../types";

export function MonthlyTooltip({
  active,
  payload,
  label,
  counts,
}: MonthlyTooltipProps) {
  const { t } = useTranslation();
  if (!active || !payload || !payload.length) return null;
  const monthIdx = Number(payload[0]?.payload?.index ?? -1);
  const value = Number(payload[0]?.value || 0);
  const pos = counts?.positive?.[monthIdx] || 0;
  const sto = counts?.storno?.[monthIdx] || 0;
  return (
    <TooltipBox
      title={label}
      revenue={value}
      count={pos}
      stornoCount={sto}
      t={t}
    />
  );
}

export function YearlyTooltip({ active, payload }: YearlyTooltipProps) {
  const { t } = useTranslation();
  if (!active || !payload || !payload.length) return null;
  const row = payload[0].payload as YearlyRow;
  return (
    <TooltipBox
      title={row.name}
      revenue={row.total}
      count={row.count}
      stornoCount={row.stornoCount}
      t={t}
    />
  );
}

function TooltipBox({
  title,
  revenue,
  count,
  stornoCount,
  t,
}: TooltipBoxProps) {
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipTitle}>{title}</div>
      <div className={styles.tooltipLine}>
        {t("common.admin.revenue.tooltip.revenue", { defaultValue: "Revenue" })}
        : <strong>{Number(revenue || 0).toFixed(2)} €</strong>
      </div>
      {count !== undefined ? (
        <div className={styles.tooltipLine}>
          {t("common.admin.revenue.tooltip.bookings", {
            defaultValue: "Bookings",
          })}
          : <strong>{count || 0}</strong>
          {stornoCount
            ? ` (${t("common.admin.revenue.tooltip.cancellations", { defaultValue: "Cancellations" })}: ${stornoCount})`
            : ""}
        </div>
      ) : null}
    </div>
  );
}

type MonthlyTooltipProps = {
  active?: boolean;
  payload?: any[];
  label?: string;
  counts?: Counts;
};

type YearlyTooltipProps = {
  active?: boolean;
  payload?: any[];
};

type TooltipBoxProps = {
  title?: string;
  revenue?: number;
  count?: number;
  stornoCount?: number;
  t: any;
};
