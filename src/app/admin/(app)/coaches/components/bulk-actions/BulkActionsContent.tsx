"use client";

import { useTranslation } from "react-i18next";
import BulkActionsActive from "./BulkActionsActive";
import BulkActionsInactive from "./BulkActionsInactive";
import type { BulkActionsProps } from "./types";

export default function BulkActionsContent(props: BulkActionsProps) {
  const { t } = useTranslation();
  if (!props.selectMode) return <BulkActionsInactive {...props} t={t} />;
  return <BulkActionsActive {...props} t={t} />;
}
