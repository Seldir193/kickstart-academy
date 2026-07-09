import ContractClient from "./ContractClient";

type SearchParams = Record<string, string | string[] | undefined>;

type Props = {
  searchParams?: Promise<SearchParams>;
};

function pickToken(v: string | string[] | undefined) {
  if (typeof v === "string") return v.trim();
  if (Array.isArray(v)) return String(v[0] || "").trim();
  return "";
}

export default async function WeeklyContractPage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};
  const token = pickToken(sp.token);

  return <ContractClient token={token} />;
}
