import type React from "react";
import type { Customer } from "../../../../types";

export type CustomerParentFieldsetProps = {
  form: Customer;
  up: (path: string, value: any) => void;
  mode: "create" | "edit";
  saving: boolean;
  newsletterBusy: boolean;
  setNewsletterBusy: (value: boolean) => void;
  setForm: (value: any) => void;
  setErr: (value: string | null) => void;
  salutationOpen: boolean;
  setSalutationOpen: (
    value: boolean | ((previous: boolean) => boolean),
  ) => void;
  salutationDropdownRef: React.RefObject<HTMLDivElement | null>;
  mk: any;
  statusLabel: (status?: string, t?: (key: string) => string) => string;
  fmtDE: (date: any) => string;
};
