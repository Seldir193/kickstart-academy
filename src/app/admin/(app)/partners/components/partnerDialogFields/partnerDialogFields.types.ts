import type { RefObject } from "react";
import type { Partner } from "../../types";

export type UpdatePartner = <K extends keyof Partner>(
  key: K,
  value: Partner[K],
) => void;

export type PartnerDialogFieldsProps = {
  draft: Partner;
  updatePartner: UpdatePartner;
  uploadLogo: (file?: File) => Promise<void>;
};

export type PartnerFieldProps = Pick<
  PartnerDialogFieldsProps,
  "draft" | "updatePartner"
>;

export type PartnerUploadProps = {
  inputRef: RefObject<HTMLInputElement | null>;
  fileName: string;
  onPickFile: (file?: File) => Promise<void>;
};
