"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import styles from "@/app/styles/revenue.module.scss";
import type { Counts, MonthRow } from "../types";
import { MonthlyTooltip } from "./RevenueTooltip";

type Props = {
  counts?: Counts;
  monthRows: MonthRow[];
  yMaxMonthly: number;
  monthTickCount: number;
};

export default function RevenueMonthlyChart({
  counts,
  monthRows,
  yMaxMonthly,
  monthTickCount,
}: Props) {
  return (
    <div className={styles.chartWideLarge}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={monthRows}
          margin={{ top: 20, right: 16, bottom: 8, left: 36 }}
        >
          <CartesianGrid stroke="#e9eef5" strokeDasharray="2 3" />
          <XAxis dataKey="name" />
          <YAxis
            domain={[0, yMaxMonthly]}
            allowDecimals={false}
            tickCount={monthTickCount}
          />
          <Tooltip content={<MonthlyTooltip counts={counts} />} />
          <Bar dataKey="revenue" fill="#93c5fd" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
