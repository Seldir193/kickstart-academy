import ContractClient from "./ContractClient";

type SearchParams = Record<string, string | string[] | undefined>;

type Props = {
  searchParams?: Promise<SearchParams> | SearchParams;
};

function pickToken(v: string | string[] | undefined) {
  if (typeof v === "string") return v.trim();
  if (Array.isArray(v)) return String(v[0] || "").trim();
  return "";
}

async function resolveSearchParams(
  sp: Props["searchParams"],
): Promise<SearchParams> {
  if (!sp) return {};
  return sp instanceof Promise ? await sp : sp;
}

export default async function WeeklyContractPage({ searchParams }: Props) {
  const sp = await resolveSearchParams(searchParams);
  const token = pickToken(sp.token);
  return <ContractClient token={token} />;
}
