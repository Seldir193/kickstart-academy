import type { TFunction } from "i18next";

export function formatIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getInitialDateRange(date = new Date()) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { from: formatIsoDate(firstDay), to: formatIsoDate(lastDay) };
}

export function getDownloadIconSrc(isActive: boolean) {
  return isActive ? "/icons/download-light.svg" : "/icons/download-dark.svg";
}

export function getExportFileName(from: string, to: string) {
  return `datev-export_${from}_bis_${to}.zip`;
}

function getExportUrl(from: string, to: string) {
  const fromParam = encodeURIComponent(from);
  const toParam = encodeURIComponent(to);
  return `/api/admin/datev/export?from=${fromParam}&to=${toParam}`;
}

async function getResponseError(response: Response, t: TFunction) {
  const text = await response.text().catch(() => "");
  const fallback = t("common.admin.datev.errors.exportFailed", {
    defaultValue: "Export failed",
  });
  return new Error(text || `${fallback} (${response.status})`);
}

export async function fetchDatevExport(from: string, to: string, t: TFunction) {
  const response = await fetch(getExportUrl(from, to), {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) throw await getResponseError(response, t);
  return response.blob();
}

export function downloadDatevExport(blob: Blob, fileName: string) {
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(blob);
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(anchor.href);
}
