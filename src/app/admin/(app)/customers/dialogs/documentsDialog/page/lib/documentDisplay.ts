import type { DocItem } from "../types";
import { docNoFrom, normalizePdfHref } from "../../helpers";

export function openPdf(item: DocItem) {
  window.open(normalizePdfHref(item.href), "_blank", "noopener,noreferrer");
}

export function iconForType(value: string) {
  const type = String(value || "").toLowerCase();
  return iconMap()[type] || "/icons/invoice.svg";
}

export function badgeTextFrom(item: DocItem) {
  return docNoFrom(item) || "";
}

export function trimTitle(item: DocItem) {
  const full = String(item.title || "").trim();
  if (!full) return "";
  return removeAddressPart(removeTypePart(full)).trim();
}

export function getDownloadIconSrc(isActive: boolean) {
  return isActive ? "/icons/download-light.svg" : "/icons/download-dark.svg";
}

function removeTypePart(value: string) {
  return value.split(" – ")[0] || value;
}

function removeAddressPart(value: string) {
  return value.split(" — ")[0] || value;
}

function iconMap() {
  return {
    invoice: "/icons/invoice.svg",
    participation: "/icons/participation.svg",
    cancellation: "/icons/cancellation.svg",
    storno: "/icons/storno.svg",
    dunning: "/icons/warning.svg",
    creditnote: "/icons/credit_note.svg",
    contract: "/icons/contract.svg",
  } as Record<string, string>;
}
