import type { FranchiseLocation } from "../../types";

export type LicenseeInfoDialogProps = {
  open: boolean;
  item: FranchiseLocation | null;
  onClose: () => void;
};

export type LicenseeInfoSections = {
  header: { title: string };
  location: Record<string, unknown>;
  contact: Record<string, unknown>;
  meta: { status: string; updated: string };
  reject: { reason: unknown } | null;
};
