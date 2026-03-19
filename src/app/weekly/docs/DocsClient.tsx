"use client";

import { useMemo } from "react";
import { docsHtml } from "../contract/docsContent";

function safeText(v: unknown) {
  return String(v ?? "").trim();
}

type Props = { doc: string };

export default function DocsClient({ doc }: Props) {
  const key = useMemo(() => safeText(doc), [doc]);
  const html = (docsHtml as any)[key] || "<h2>Dokument nicht gefunden</h2>";

  return (
    <main className="weekly-docs-page">
      <section
        className="weekly-docs-card"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </main>
  );
}
