import type { Dispatch, SetStateAction } from "react";

export type DatevExportModel = {
  from: string;
  to: string;
  setFrom: Dispatch<SetStateAction<string>>;
  setTo: Dispatch<SetStateAction<string>>;
  loading: boolean;
  err: string | null;
  isDownloadActive: boolean;
  runExport: () => Promise<void>;
  activateDownload: () => void;
  deactivateDownload: () => void;
};
