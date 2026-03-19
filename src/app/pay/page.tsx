// import PayClient from "./PayClient";

import PayClient from "./PayClient";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type Props = {
  searchParams?: SearchParams;
};

function pick(v: string | string[] | undefined) {
  if (typeof v === "string") return v.trim();
  if (Array.isArray(v)) return String(v[0] || "").trim();
  return "";
}

export default async function PayPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {};
  const bookingId = pick(params?.bookingId);
  return <PayClient bookingId={bookingId} />;
}
