"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import styles from "@/app/styles/revenue.module.scss";
import type { YearlyRow } from "../types";
import { YearlyTooltip } from "./RevenueTooltip";

type Props = {
  name: string;
  yMaxYearly: number;
  yearTickCount: number;
  yearlyRows: YearlyRow[];
  highlightedYearLabel: string;
};

export default function RevenueYearlyChart({
  name,
  yMaxYearly,
  yearTickCount,
  yearlyRows,
  highlightedYearLabel,
}: Props) {
  return (
    <div className={styles.chartWideLarge}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={yearlyRows}
          margin={{ top: 20, right: 16, bottom: 8, left: 36 }}
        >
          <CartesianGrid stroke="#e9eef5" strokeDasharray="2 3" />
          <XAxis dataKey="name" />
          <YAxis
            domain={[0, yMaxYearly]}
            allowDecimals={false}
            tickCount={yearTickCount}
          />
          <Tooltip content={<YearlyTooltip />} />
          <Bar dataKey="total" name={name}>
            {yearlyRows.map((r, idx) => (
              <Cell
                key={`cell-${idx}`}
                fill={r.name === highlightedYearLabel ? "#2563eb" : "#cfe1ff"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
