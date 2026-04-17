//src\app\weekly\revoke\revokeApi.ts
function safeText(v: unknown) {
  return String(v ?? "").trim();
}

function apiBaseUrl() {
  const v = safeText(process.env.NEXT_PUBLIC_API_URL);
  if (v) return v.replace(/\/+$/, "");
  return "http://localhost:5000/api";
}

export type RevokeResponse = {
  ok?: boolean;
  code?: string;
  message?: string;
  error?: string;
  mode?: string;
  refundId?: string | null;
  creditNoteNo?: string | null;
  creditNoteEmailSentAt?: string | null;
  stornoNo?: string | null;
};

export async function submitRevokeByToken(
  token: string,
): Promise<RevokeResponse> {
  const base = apiBaseUrl();

  const res = await fetch(`${base}/payments/stripe/revoke-by-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);

  if (data && typeof data === "object") {
    return data as RevokeResponse;
  }

  return {
    ok: false,
    code: "SERVER",
    message: res.ok
      ? "Unbekannte Antwort vom Server."
      : "Der Widerruf konnte nicht verarbeitet werden.",
  };
}
