import { redirect } from "next/navigation";

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

export default async function WeeklyStartPage({ searchParams }: Props) {
  const sp = await resolveSearchParams(searchParams);
  const token = pickToken(sp.token);
  const qs = token ? `?token=${encodeURIComponent(token)}` : "";
  redirect(`/weekly/contract${qs}`);
}

// // src/app/weekly/start/page.tsx
// import StartClient from "./StartClient";

// type Props = {
//   searchParams?: Record<string, string | string[] | undefined>;
// };

// function pickToken(v: string | string[] | undefined) {
//   if (typeof v === "string") return v.trim();
//   if (Array.isArray(v)) return String(v[0] || "").trim();
//   return "";
// }

// export default function WeeklyStartPage({ searchParams }: Props) {
//   const token = pickToken(searchParams?.token);
//   return <StartClient token={token} />;
// }
