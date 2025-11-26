// src/app/admin/revenue/page.tsx
'use client';


import React, { useEffect, useMemo, useRef, useState } from 'react';

import styles from '@/app/styles/revenue.module.scss';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';

type Counts = {
  positive?: number[]; // Anzahl positiver Buchungen (Monat addiert)
  storno?: number[];   // Anzahl Stornos im Monat
};

type RevenueResponse = {
  ok: boolean;
  year: number;
  total: number;
  monthly: number[]; // Index 0 = Jan
  counts?: Counts;
};

type SourceMode = 'invoices' | 'derived';

const MONTHS = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAI',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OKT',
  'NOV',
  'DEZ',
];

/** kleines clsx-Helper wie in anderen Files */
function clsx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}

/** Nächstes 2000er-Intervall nach oben runden */
function ceilToStep(n: number, step = 2000) {
  const x = Math.max(0, n || 0);
  return Math.max(step, Math.ceil(x / step) * step);
}

/** Provider-ID aus LocalStorage lesen (Fallback auf ks_user_id) */
function getProviderId(): string {
  if (typeof window === 'undefined') return '';
  return (
    localStorage.getItem('providerId') ||
    localStorage.getItem('ks_user_id') ||
    ''
  );
}

/** Custom Tooltip für Monats-Chart */
function MonthlyTooltip({
  active,
  payload,
  label,
  counts,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
  counts?: Counts;
}) {
  if (!active || !payload || !payload.length) return null;

  const monthIdx = MONTHS.findIndex((m) => m === label);
  const value = Number(payload[0]?.value || 0);
  const pos = counts?.positive?.[monthIdx] || 0;
  const sto = counts?.storno?.[monthIdx] || 0;

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: '8px 10px',
        boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
        fontSize: 12,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
      <div>
        Umsatz: <strong>{value.toFixed(2)} €</strong>
      </div>
      <div>
        Buchungen: <strong>{pos}</strong>
        {sto ? ` (Stornos: ${sto})` : ''}
      </div>
    </div>
  );
}

/** Custom Tooltip für Jahres-Chart */
function YearlyTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: any[];
}) {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0].payload as {
    name: string;
    total: number;
    count?: number;
    stornoCount?: number;
  };
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: '8px 10px',
        boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
        fontSize: 12,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{row.name}</div>
      <div>
        Umsatz: <strong>{(row.total || 0).toFixed(2)} €</strong>
      </div>
      {'count' in row && (
        <div>
          Buchungen:{' '}
          <strong>{row.count || 0}</strong>
          {row.stornoCount ? ` (Stornos: ${row.stornoCount})` : ''}
        </div>
      )}
    </div>
  );
}

export default function RevenuePage() {
  const [source, setSource] = useState<SourceMode>('invoices'); // Umschalter
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(-1); // -1 = alle
  const [data, setData] = useState<RevenueResponse | null>(null);
  const [loading, setLoading] = useState(false);


  // Jahres-Übersicht (Totals + Counts) für die letzten 5 Jahre
  const [yearlyTotals, setYearlyTotals] = useState<
    Array<{ name: string; total: number; count?: number; stornoCount?: number }>
  >([]);
  const [yearView, setYearView] = useState<'all' | number>('all');

  // NEU: Open-State für die Dropdowns (nur UI)
  const [sourceOpen, setSourceOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);
  const [yearViewOpen, setYearViewOpen] = useState(false);

  const sourceRef = useRef<HTMLDivElement | null>(null);
const yearRef = useRef<HTMLDivElement | null>(null);
const monthRef = useRef<HTMLDivElement | null>(null);
const yearViewRef = useRef<HTMLDivElement | null>(null);

  const endpointBase =
    source === 'derived'
      ? '/api/admin/revenue-derived'
      : '/api/admin/revenue';

  // Daten für aktuelles Jahr laden
  useEffect(() => {
    setLoading(true);
    const pid = getProviderId();
    const url = `${endpointBase}?year=${year}${
      pid ? `&providerId=${encodeURIComponent(pid)}` : ''
    }`;

    fetch(url, {
      credentials: 'include',
      headers: pid ? { 'x-provider-id': pid } : undefined,
    })
      .then((r) => r.json())
      .then((json: RevenueResponse) => setData(json))
      .catch((err) => console.error('Revenue fetch failed', err))
      .finally(() => setLoading(false));
  }, [year, source, endpointBase]);

  useEffect(() => {
  function handlePointerDown(e: PointerEvent) {
    const target = e.target as Node | null;
    if (!target) return;

    // Wenn der Klick IN einem der Dropdown-Container war → nichts schließen
    if (sourceRef.current?.contains(target)) return;
    if (yearRef.current?.contains(target)) return;
    if (monthRef.current?.contains(target)) return;
    if (yearViewRef.current?.contains(target)) return;

    // Sonst alle Dropdowns schließen
    if (sourceOpen) setSourceOpen(false);
    if (yearOpen) setYearOpen(false);
    if (monthOpen) setMonthOpen(false);
    if (yearViewOpen) setYearViewOpen(false);
  }

  document.addEventListener('pointerdown', handlePointerDown);
  return () => {
    document.removeEventListener('pointerdown', handlePointerDown);
  };
}, [sourceOpen, yearOpen, monthOpen, yearViewOpen]);


  // Jahres-Totals (letzte 5 Jahre) neu laden, wenn Quelle wechselt
  useEffect(() => {
    const thisYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => thisYear - (4 - i)); // z.B. 2021..2025
    const pid = getProviderId();

    Promise.all(
      years.map((y) => {
        const url = `${endpointBase}?year=${y}${
          pid ? `&providerId=${encodeURIComponent(pid)}` : ''
        }`;
        return fetch(url, {
          credentials: 'include',
          headers: pid ? { 'x-provider-id': pid } : undefined,
        })
          .then((r) => r.json())
          .catch(() => ({ total: 0, counts: { positive: [], storno: [] } }));
      }),
    ).then((resArr: RevenueResponse[]) => {
      const out = years.map((y, idx) => {
        const totals = Number(resArr[idx]?.total || 0);
        const pos = (resArr[idx]?.counts?.positive || []) as number[];
        const sto = (resArr[idx]?.counts?.storno || []) as number[];
        const count = pos.reduce((a, b) => a + (Number(b) || 0), 0);
        const stornoCount = sto.reduce(
          (a, b) => a + (Number(b) || 0),
          0,
        );
        return { name: String(y), total: totals, count, stornoCount };
      });
      setYearlyTotals(out);
    });
  }, [source, endpointBase]);

  // Monats-rows: robust gegen null/undefined
  const monthRows = useMemo(() => {
    const arr = Array.isArray(data?.monthly)
      ? data!.monthly
      : Array(12).fill(0);
    const base = MONTHS.map((m, i) => ({
      name: m,
      Umsatz: Number(arr[i] || 0),
    }));
    return month >= 0 ? base.filter((_, i) => i === month) : base;
  }, [data, month]);

  const monthMaxValue = useMemo(() => {
    const arr = Array.isArray(data?.monthly)
      ? data!.monthly
      : Array(12).fill(0);
    return Math.max(
      0,
      ...(month >= 0
        ? [Number(arr[month] || 0)]
        : arr.map((n) => Number(n) || 0)),
    );
  }, [data, month]);

  const totalDisplayed = useMemo(() => {
    if (!Array.isArray(data?.monthly)) return 0;
    return month >= 0
      ? Number(data!.monthly[month] || 0)
      : Number(data!.total || 0);
  }, [data, month]);

  // Jahresdiagramm (Totals): alle Jahre oder fokussiertes Jahr
  const yearlyRows = useMemo(() => {
    if (!yearlyTotals.length) return [];
    if (yearView === 'all') return yearlyTotals;
    const hit = yearlyTotals.find((r) => r.name === String(yearView));
    return hit ? [hit] : [];
  }, [yearlyTotals, yearView]);

  // Für Balken-Farben im Jahresdiagramm:
  const highlightedYearLabel = useMemo(
    () => (yearView === 'all' ? String(year) : String(yearView)),
    [yearView, year],
  );

  const yearMaxValue = useMemo(() => {
    if (!yearlyRows.length) return 0;
    return Math.max(
      0,
      ...yearlyRows.map((r) => Number(r.total) || 0),
    );
  }, [yearlyRows]);

  const MAX_Y = 12000;
  const STEP = 2000;
  const yMaxMonthly = Math.max(MAX_Y, ceilToStep(monthMaxValue, STEP));
  const yMaxYearly = Math.max(MAX_Y, ceilToStep(yearMaxValue, STEP));

  const monthTickCount = Math.min(
    8,
    Math.max(4, Math.ceil(yMaxMonthly / 2000) + 1),
  );
  const yearTickCount = Math.min(
    8,
    Math.max(4, Math.ceil(yMaxYearly / 2000) + 1),
  );

  // Helper: Label für Monat
  const monthLabel = month >= 0 ? MONTHS[month] : 'Alle Monate';

  return (
    <div className={styles.pageWrap}>
      <h1 className="text-2xl font-bold m-0">Umsatzübersicht</h1>

      <div className={styles.container}>
        {/* Source-Umschalter + Jahres-/Monatsfilter */}
        <div className={styles.filtersRow}>
          {/* Quelle */}
          <div className={styles.filter}>
            <label htmlFor="rev-source">Quelle:</label>
            <div
             

                ref={sourceRef}
    className={clsx(
      styles.yearDropdown,
      'ks-selectbox',
      sourceOpen && 'ks-selectbox--open',
              )}
            >
              <button
                id="rev-source"
                type="button"
                className="ks-selectbox__trigger"
                onClick={() => setSourceOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={sourceOpen}
              >
                <span className="ks-selectbox__label">
                  {source === 'invoices'
                    ? 'Rechnungen (Ist)'
                    : 'Abo (abgeleitet)'}
                </span>
                <span
                  className="ks-selectbox__chevron"
                  aria-hidden="true"
                />
              </button>

              {sourceOpen && (
                <div className="ks-selectbox__panel" role="listbox">
                  <button
                    type="button"
                    className={clsx(
                      'ks-selectbox__option',
                      source === 'invoices' &&
                        'ks-selectbox__option--active',
                    )}
                    onClick={() => {
                      setSource('invoices');
                      setSourceOpen(false);
                    }}
                  >
                    Rechnungen (Ist)
                  </button>
                  <button
                    type="button"
                    className={clsx(
                      'ks-selectbox__option',
                      source === 'derived' &&
                        'ks-selectbox__option--active',
                    )}
                    onClick={() => {
                      setSource('derived');
                      setSourceOpen(false);
                    }}
                  >
                    Abo (abgeleitet)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Jahr */}
          <div className={styles.filter}>
            <label htmlFor="rev-year">Jahr:</label>
            <div
            ref={yearRef}
    className={clsx(
      styles.yearDropdown,
      'ks-selectbox',
      yearOpen && 'ks-selectbox--open',
    )}
            >
              <button
                id="rev-year"
                type="button"
                className="ks-selectbox__trigger"
                onClick={() => setYearOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={yearOpen}
              >
                <span className="ks-selectbox__label">
                  {String(year)}
                </span>
                <span
                  className="ks-selectbox__chevron"
                  aria-hidden="true"
                />
              </button>

              {yearOpen && (
                <div className="ks-selectbox__panel" role="listbox">
                  {Array.from({ length: 7 }, (_, i) => {
                    const y = new Date().getFullYear() - i;
                    return (
                      <button
                        key={y}
                        type="button"
                        className={clsx(
                          'ks-selectbox__option',
                          year === y &&
                            'ks-selectbox__option--active',
                        )}
                        onClick={() => {
                          setYear(y);
                          setYearOpen(false);
                        }}
                      >
                        {y}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Monat */}
          <div className={styles.filter}>
            <label htmlFor="rev-month">Monat:</label>
            <div
               ref={monthRef}
    className={clsx(
      styles.monthDropdown,
      'ks-selectbox',
      monthOpen && 'ks-selectbox--open',
    )}
            >
              <button
                id="rev-month"
                type="button"
                className="ks-selectbox__trigger"
                onClick={() => setMonthOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={monthOpen}
              >
                <span className="ks-selectbox__label">
                  {monthLabel}
                </span>
                <span
                  className="ks-selectbox__chevron"
                  aria-hidden="true"
                />
              </button>

              {monthOpen && (
                <div className="ks-selectbox__panel" role="listbox">
                  <button
                    type="button"
                    className={clsx(
                      'ks-selectbox__option',
                      month === -1 &&
                        'ks-selectbox__option--active',
                    )}
                    onClick={() => {
                      setMonth(-1);
                      setMonthOpen(false);
                    }}
                  >
                    Alle Monate
                  </button>
                  {MONTHS.map((m, i) => (
                    <button
                      key={m}
                      type="button"
                      className={clsx(
                        'ks-selectbox__option',
                        month === i &&
                          'ks-selectbox__option--active',
                      )}
                      onClick={() => {
                        setMonth(i);
                        setMonthOpen(false);
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {loading && (
          <p className={styles.loading}>Lade Umsätze …</p>
        )}

        {!loading && data && (
          <>
            <p className={styles.total}>
              {month >= 0 ? 'Monatsumsatz' : 'Gesamtumsatz'}:{' '}
              {totalDisplayed.toFixed(2)} €
            </p>

            {/* Monatsdiagramm */}
            <div className={styles.chartWideLarge}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthRows}>
                  <CartesianGrid
                    stroke="#e9eef5"
                    strokeDasharray="2 3"
                  />
                  <XAxis dataKey="name" />
                  <YAxis
                    domain={[0, yMaxMonthly]}
                    allowDecimals={false}
                    tickCount={monthTickCount}
                  />
                  <Tooltip
                    content={
                      <MonthlyTooltip counts={data.counts} />
                    }
                  />
                  <Bar dataKey="Umsatz" fill="#93c5fd" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* Jahresdiagramm (Totals) */}
        <h2 className={styles.sectionTitle}>
          Jahresumsätze (Totals)
        </h2>

        <div className={styles.filtersRow}>
          <div className={styles.filter}>
            <label htmlFor="rev-year-view">Ansicht:</label>
            <div
             ref={yearViewRef}
    className={clsx(
      styles.yearDropdown,
      'ks-selectbox',
      yearViewOpen && 'ks-selectbox--open',
    )}
            >
              <button
                id="rev-year-view"
                type="button"
                className="ks-selectbox__trigger"
                onClick={() => setYearViewOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={yearViewOpen}
              >
                <span className="ks-selectbox__label">
                  {yearView === 'all'
                    ? 'Alle Jahre'
                    : String(yearView)}
                </span>
                <span
                  className="ks-selectbox__chevron"
                  aria-hidden="true"
                />
              </button>

              {yearViewOpen && (
                <div className="ks-selectbox__panel" role="listbox">
                  <button
                    type="button"
                    className={clsx(
                      'ks-selectbox__option',
                      yearView === 'all' &&
                        'ks-selectbox__option--active',
                    )}
                    onClick={() => {
                      setYearView('all');
                      setYearViewOpen(false);
                    }}
                  >
                    Alle Jahre
                  </button>
                  {yearlyTotals.map((r) => (
                    <button
                      key={r.name}
                      type="button"
                      className={clsx(
                        'ks-selectbox__option',
                        yearView !== 'all' &&
                          String(yearView) === r.name &&
                          'ks-selectbox__option--active',
                      )}
                      onClick={() => {
                        setYearView(Number(r.name));
                        setYearViewOpen(false);
                      }}
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.chartWideLarge}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yearlyRows}>
              <CartesianGrid
                stroke="#e9eef5"
                strokeDasharray="2 3"
              />
              <XAxis dataKey="name" />
              <YAxis
                domain={[0, yMaxYearly]}
                allowDecimals={false}
                tickCount={yearTickCount}
              />
              <Tooltip content={<YearlyTooltip />} />
              <Bar dataKey="total" name="Umsatz">
                {yearlyRows.map((r, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={
                      r.name === highlightedYearLabel
                        ? '#2563eb'
                        : '#cfe1ff'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}








