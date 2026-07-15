import type { FranchiseLocation } from "../../types";

export function clean(value: unknown) {
  return String(value ?? "").trim();
}

export function displayValue(value: unknown) {
  const text = clean(value);
  return text || "—";
}

export function ownerLabel(item: FranchiseLocation) {
  const name =
    `${clean(item.licenseeFirstName)} ${clean(item.licenseeLastName)}`.trim();
  return (
    name ||
    displayValue(item.ownerName) ||
    displayValue(item.ownerEmail) ||
    displayValue(item.ownerId || item.owner)
  );
}

export function statusClass(status: string) {
  const value = clean(status).toLowerCase();
  if (value === "approved") return "dialog-status--success";
  if (value === "pending") return "dialog-status--warning";
  if (value === "rejected") return "dialog-status--danger";
  return "dialog-status--neutral";
}
