import { useMemo, useState } from "react";
import type { TFunction } from "i18next";
import { toastErrorMessage } from "@/lib/toast-messages";
import {
  downloadDatevExport,
  fetchDatevExport,
  getExportFileName,
  getInitialDateRange,
} from "../datev.helpers";

function useDatevRange() {
  const initialRange = getInitialDateRange();
  const [from, setFrom] = useState(initialRange.from);
  const [to, setTo] = useState(initialRange.to);
  return { from, setFrom, to, setTo };
}

function useDownloadActivity() {
  const [isDownloadActive, setIsDownloadActive] = useState(false);
  const activateDownload = () => setIsDownloadActive(true);
  const deactivateDownload = () => setIsDownloadActive(false);
  return { isDownloadActive, activateDownload, deactivateDownload };
}

function useDatevDownload(from: string, to: string, t: TFunction) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileName = useMemo(() => getExportFileName(from, to), [from, to]);
  const runExport = () => executeExport(from, to, fileName, t, setLoading, setErr);
  return { loading, err, runExport };
}

type LoadingSetter = (loading: boolean) => void;
type ErrorSetter = (error: string | null) => void;

async function performExport(from: string, to: string, fileName: string, t: TFunction) {
  const blob = await fetchDatevExport(from, to, t);
  downloadDatevExport(blob, fileName);
}

async function executeExport(
  from: string,
  to: string,
  fileName: string,
  t: TFunction,
  setLoading: LoadingSetter,
  setErr: ErrorSetter,
) {
  setLoading(true);
  setErr(null);
  try {
    await performExport(from, to, fileName, t);
  } catch (error: unknown) {
    setErr(toastErrorMessage(t, error, "common.admin.datev.errors.exportFallback"));
  } finally {
    setLoading(false);
  }
}

export function useDatevExportPage(t: TFunction) {
  const range = useDatevRange();
  const download = useDatevDownload(range.from, range.to, t);
  const activity = useDownloadActivity();
  return { ...range, ...download, ...activity };
}
