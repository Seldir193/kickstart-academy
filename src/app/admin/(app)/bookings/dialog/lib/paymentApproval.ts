import type { Translate } from "../types";

type ApiData = Record<string, string | null | undefined> | null;

export async function approvePaymentRequest(id: string, t: Translate) {
  const res = await fetch(`/api/admin/bookings/${id}/approve-payment`, approvalOptions());
  const data = await readData(res);
  if (!res.ok) throw approvalError(data, t);
  return data;
}

function approvalOptions(): RequestInit {
  return { method: "POST", credentials: "include", cache: "no-store" };
}

async function readData(res: Response): Promise<ApiData> {
  return res.json().catch(() => null);
}

function approvalError(data: ApiData, t: Translate) {
  return new Error(data?.error || data?.message || t("common.admin.bookings.dialog.error.actionFailed"));
}
