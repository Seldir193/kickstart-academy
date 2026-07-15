import { useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { DocItem } from "../../types";
import type { TypeChipState, TypeFlags } from "../types";

const initialFlags: TypeFlags = {
  participation: true,
  invoice: true,
  cancellation: true,
  storno: true,
  dunning: true,
  contract: true,
  creditNote: true,
};

export function useDocumentTypes() {
  const [flags, setFlags] = useState<TypeFlags>(initialFlags);
  const selectedTypes = useMemo(() => selectedTypesFrom(flags), [flags]);
  return {
    flags,
    selectedTypes,
    chipState: chipStateFrom(flags, setFlags),
    filterItems: (items: DocItem[]) => filterItems(items, flags),
  };
}

function chipStateFrom(
  flags: TypeFlags,
  setFlags: Dispatch<SetStateAction<TypeFlags>>,
): TypeChipState {
  return { ...flags, ...typeSetters(setFlags) };
}

function typeSetters(setFlags: Dispatch<SetStateAction<TypeFlags>>) {
  return {
    setParticipation: (value: boolean) =>
      setFlag(setFlags, "participation", value),
    setInvoice: (value: boolean) => setFlag(setFlags, "invoice", value),
    setCancellation: (value: boolean) =>
      setFlag(setFlags, "cancellation", value),
    setStorno: (value: boolean) => setFlag(setFlags, "storno", value),
    setDunning: (value: boolean) => setFlag(setFlags, "dunning", value),
    setContract: (value: boolean) => setFlag(setFlags, "contract", value),
    setCreditNote: (value: boolean) => setFlag(setFlags, "creditNote", value),
  };
}

function setFlag(
  setFlags: Dispatch<SetStateAction<TypeFlags>>,
  key: keyof TypeFlags,
  value: boolean,
) {
  setFlags((current) => ({ ...current, [key]: value }));
}

function selectedTypesFrom(flags: TypeFlags) {
  const selected: string[] = ["invoice"];
  if (flags.participation) selected.push("participation");
  if (flags.invoice) selected.push("invoice");
  if (flags.cancellation) selected.push("cancellation");
  if (flags.storno) selected.push("storno");
  return selectedTypesTail(selected, flags);
}

function selectedTypesTail(selected: string[], flags: TypeFlags) {
  if (flags.dunning) selected.push("dunning");
  if (flags.creditNote) selected.push("creditnote");
  if (flags.contract) selected.push("contract");
  return selected;
}

function filterItems(items: DocItem[], flags: TypeFlags) {
  return items.filter((item) =>
    isTypeVisible(String(item.type || "").toLowerCase(), flags),
  );
}

function isTypeVisible(type: string, flags: TypeFlags) {
  if (type === "invoice") return flags.invoice;
  if (type === "participation") return flags.participation;
  if (type === "cancellation") return flags.cancellation;
  if (type === "storno") return flags.storno;
  return isSecondaryTypeVisible(type, flags);
}

function isSecondaryTypeVisible(type: string, flags: TypeFlags) {
  if (type === "dunning") return flags.dunning;
  if (type === "creditnote") return flags.creditNote;
  if (type === "contract") return flags.contract;
  return false;
}
