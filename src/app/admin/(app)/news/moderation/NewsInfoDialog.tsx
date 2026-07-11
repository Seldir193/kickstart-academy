"use client";

import NewsInfoDialogContent from "./newsInfoDialog/NewsInfoDialogContent";
import type { NewsInfoDialogProps } from "./newsInfoDialog/newsInfoDialog.types";

export default function NewsInfoDialog(props: NewsInfoDialogProps) {
  return <NewsInfoDialogContent {...props} />;
}
