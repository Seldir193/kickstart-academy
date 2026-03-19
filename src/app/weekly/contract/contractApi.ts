//src\app\weekly\contract\contractApi.ts
import type {
  ContractDraft,
  ContractInitErr,
  ContractInitOk,
  ContractSubmitErr,
  ContractSubmitOk,
} from "./contractTypes";

function safeText(v: unknown) {
  return String(v ?? "").trim();
}

function apiBaseUrl() {
  const v = safeText(process.env.NEXT_PUBLIC_API_URL);
  if (v) return v.replace(/\/+$/, "");
  return "http://localhost:5000/api";
}

export async function fetchContractInit(
  token: string,
): Promise<ContractInitOk | ContractInitErr> {
  const base = apiBaseUrl();
  const res = await fetch(
    `${base}/public/weekly/contract-init?token=${encodeURIComponent(token)}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );
  const data = await res.json().catch(() => null);
  return data && typeof data === "object"
    ? data
    : { ok: false, code: "SERVER" };
}

export async function submitContractAndCheckout(params: {
  token: string;
  draft: ContractDraft;
  returnTo: string;
  contractDoc: { version: string; contentHtml: string };
}): Promise<ContractSubmitOk | ContractSubmitErr> {
  const base = apiBaseUrl();
  const res = await fetch(
    `${base}/public/weekly/contract-submit-and-checkout`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: params.token,
        contract: params.draft,
        returnTo: params.returnTo,
        contractDoc: params.contractDoc,
      }),
    },
  );

  const data = await res.json().catch(() => null);
  return data && typeof data === "object"
    ? data
    : { ok: false, code: "SERVER" };
}
