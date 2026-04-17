"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
//import { docsHtml } from "../contract/docsContent";

function safeText(v: unknown) {
  return String(v ?? "").trim();
}

type Props = { doc: string };

export default function DocsClient({ doc }: Props) {
  const { t } = useTranslation();
  const key = useMemo(() => safeText(doc), [doc]);
  //const html = (docsHtml as any)[key] || "<h2>Dokument nicht gefunden</h2>";

  const html = useMemo(() => {
    if (key === "agb") return t("common.weeklyContract.docs.agbHtml");
    if (key === "privacy") return t("common.weeklyContract.docs.privacyHtml");
    if (key === "photo") return t("common.weeklyContract.docs.photoHtml");
    return t("common.weeklyContract.docs.notFoundHtml");
  }, [key, t]);

  return (
    <main className="weekly-docs-page">
      <section
        className="weekly-docs-card"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </main>
  );
}
