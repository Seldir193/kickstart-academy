import DocsClient from "./DocsClient";

type SearchParams = Record<string, string | string[] | undefined>;

type Props = {
  searchParams?: Promise<SearchParams>;
};

function safeText(v: unknown) {
  return String(v ?? "").trim();
}

export default async function WeeklyDocsPage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};
  const d = safeText(sp.d);

  return <DocsClient doc={d} />;
}
