import DocsClient from "./DocsClient";

type SearchParams = Record<string, string | string[] | undefined>;

type Props = {
  searchParams?: Promise<SearchParams> | SearchParams;
};

function safeText(v: unknown) {
  return String(v ?? "").trim();
}

async function resolveSearchParams(sp: Props["searchParams"]) {
  return sp instanceof Promise ? await sp : (sp ?? {});
}

export default async function WeeklyDocsPage({ searchParams }: Props) {
  const sp = await resolveSearchParams(searchParams);
  const d = safeText(sp.d);
  return <DocsClient doc={d} />;
}
