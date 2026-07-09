"use client";

import type { DocumentsDialogProps } from "./types";
import { useDocumentsDialogState } from "./hooks/useDocumentsDialogState";
import { DocumentsDialogView } from "./components/DocumentsDialogView";

export default function DocumentsDialogContent(props: DocumentsDialogProps) {
  return <DocumentsDialogView state={useDocumentsDialogState(props)} />;
}
