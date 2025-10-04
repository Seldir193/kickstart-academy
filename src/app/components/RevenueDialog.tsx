// src/app/admin/revenue/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import styles from '@/app/styles/revenue.module.css';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

type RevenueResponse = {
  ok: boolean;
  year: number;
  total: number;
  monthly: number[]; // Index 0 = Jan
};

export default function RevenuePage() {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [data, setData] = useState<RevenueResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        // ❌ kein x-provider-id mehr aus dem Browser mitsenden!
        const r = await fetch(`/api/admin/revenue?year=${year}`, {
          credentials: 'include',
          cache: 'no-store',
        });

        if (r.status === 401) {
          if (!cancelled) {
            setData(null);
            setError('Nicht autorisiert. Bitte erneut einloggen.');
          }
          return;
        }

        const json: RevenueResponse = await r.json();
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) {
          setError('Abruf fehlgeschlagen.');
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [year]);

  const chartData = useMemo(() => {
    const months = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
    const monthly = Array.isArray(data?.monthly) ? data!.monthly : [];
    return months.map((m, i) => ({
      name: m,
      Umsatz: Number(monthly[i] ?? 0) || 0,
    }));
  }, [data]);

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '2rem' }}>
      <h1 style={{ marginBottom: '0.75rem' }}>Umsatzübersicht</h1>

      <div className={styles.container}>
        <div className={styles.yearSelect}>
          <label htmlFor="rev-year">Jahr:</label>
          <select
            id="rev-year"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className={styles.yearDropdown}
          >
            {Array.from({ length: 7 }, (_, i) => {
              const y = new Date().getFullYear() - i;
              return (
                <option key={y} value={y}>{y}</option>
              );
            })}
          </select>
        </div>

        {loading && <p className={styles.loading}>Lade Umsätze …</p>}
        {!loading && error && <p className={styles.loading}>{error}</p>}

        {!loading && !error && data && (
          <>
            <p className={styles.total}>
              Gesamtumsatz: {Number(data.total || 0).toFixed(2)} €
            </p>

            <div className={styles.chartWrapper}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="Umsatz" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}













