import type { FranchiseLocation, LocationPayload } from "../types";

export type FranchiseLocationDialogProps = {
  open: boolean;
  initial?: Partial<FranchiseLocation> | null;
  onClose: () => void;
  onSave: (payload: LocationPayload) => Promise<void>;
  onDelete?: (() => Promise<void> | void) | undefined;
};

export type LocationForm = {
  licenseeFirstName: string;
  licenseeLastName: string;
  country: string;
  city: string;
  state: string;
  address: string;
  zip: string;
  website: string;
  emailPublic: string;
  phonePublic: string;
};

export type LocationFieldKey = keyof LocationForm;

export type LocationFieldConfig = {
  name: LocationFieldKey;
  labelKey: string;
  full?: boolean;
};
