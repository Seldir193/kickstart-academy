//src\app\admin\(app)\datev\page.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toastErrorMessage, toastText } from "@/lib/toast-messages";
import KsDatePicker from "@/app/admin/(app)/invoices/components/KsDatePicker";

function fmtISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}
function firstOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function lastOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function getDownloadIconSrc(isActive: boolean) {
  return isActive ? "/icons/download-light.svg" : "/icons/download-dark.svg";
}
export default function DatevExportPage() {
  const { t } = useTranslation();
  const today = new Date();

  const [from, setFrom] = useState(fmtISO(firstOfMonth(today)));
  const [to, setTo] = useState(fmtISO(lastOfMonth(today)));
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [isDownloadActive, setIsDownloadActive] = useState(false);

  const fileName = useMemo(() => {
    return `datev-export_${from}_bis_${to}.zip`;
  }, [from, to]);

  async function runExport() {
    setLoading(true);
    setErr(null);
    try {
      const url = `/api/admin/datev/export?from=${encodeURIComponent(
        from,
      )}&to=${encodeURIComponent(to)}`;
      const res = await fetch(url, { method: "GET", credentials: "include" });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(
          txt ||
            `${toastText(
              t,
              "common.admin.datev.errors.exportFailed",
              "Export failed",
            )} (${res.status})`,
        );
      }
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    } catch (e: any) {
      setErr(
        toastErrorMessage(t, e, "common.admin.datev.errors.exportFallback"),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 max-w-2xl datev-export-page">
      <h1 className="text-2xl font-bold m-0">
        {t("common.admin.datev.title", {
          defaultValue: "DATEV export (OPOS variant)",
        })}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <label className="block">
          <span className="text-sm text-gray-700">
            {t("common.admin.datev.fromLabel", {
              defaultValue: "From (incl.)",
            })}
          </span>
          <KsDatePicker
            value={from}
            onChange={(nextIso) => setFrom(nextIso)}
            placeholder={t("common.admin.datev.datePlaceholder", {
              defaultValue: "dd.mm.yyyy",
            })}
            disabled={false}
          />
        </label>
        <label className="block">
          <span className="text-sm text-gray-700">
            {t("common.admin.datev.toLabel", {
              defaultValue: "To (incl.)",
            })}
          </span>
          <KsDatePicker
            value={to}
            onChange={(nextIso) => setTo(nextIso)}
            placeholder={t("common.admin.datev.datePlaceholder", {
              defaultValue: "dd.mm.yyyy",
            })}
            disabled={false}
          />
        </label>
      </div>

      <div className="text-sm text-gray-600 mb-4">
        {t("common.admin.datev.description.prefix", {
          defaultValue: "Exports ",
        })}
        <b>
          {t("common.admin.datev.description.invoices", {
            defaultValue: "invoices",
          })}
        </b>{" "}
        &{" "}
        <b>
          {t("common.admin.datev.description.creditNotes", {
            defaultValue: "credit notes",
          })}
        </b>{" "}
        {t("common.admin.datev.description.middle", {
          defaultValue: "as well as ",
        })}
        <b>
          {t("common.admin.datev.description.fees", {
            defaultValue: "dunning/payment reminder fees",
          })}
        </b>{" "}
        {t("common.admin.datev.description.suffix", {
          defaultValue: "as a ZIP with",
        })}
        <code className="mx-1">buchungen_extf.csv</code>
        {t("common.admin.datev.description.and", {
          defaultValue: "and",
        })}
        <code className="mx-1">buchungen_readable.csv</code>.
        <span className="block mt-1">
          {t("common.admin.datev.note", {
            defaultValue:
              "Note: Dunning fees are exported as separate booking lines (RLS/MAHN/BEARB) if the amount is greater than 0.",
          })}
        </span>
      </div>

      {err && <div className="mb-3 text-red-600">{err}</div>}

      <button
        className="btn ks-invoices__downloadBtn"
        onClick={runExport}
        disabled={loading}
        onMouseEnter={() => setIsDownloadActive(true)}
        onMouseLeave={() => setIsDownloadActive(false)}
        onFocus={() => setIsDownloadActive(true)}
        onBlur={() => setIsDownloadActive(false)}
      >
        <img
          src={getDownloadIconSrc(isDownloadActive)}
          alt=""
          aria-hidden="true"
          className="ks-invoices__downloadIcon"
        />
        <span>
          {loading
            ? t("common.admin.datev.exportRunning", {
                defaultValue: "Export running…",
              })
            : t("common.admin.datev.downloadZip", {
                defaultValue: "Download ZIP",
              })}
        </span>
      </button>
    </div>
  );
}
