import type { Customer } from "../../types";

export async function fetchCustomer(id: string) {
  const response = await fetch(`/api/admin/customers/${id}`, { cache: "no-store", credentials: "include" });
  return response.ok ? ((await response.json()) as Customer) : null;
}
