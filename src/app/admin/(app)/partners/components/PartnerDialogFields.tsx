"use client";

import {
  PartnerLogoUrlField,
  PartnerNameField,
  PartnerSortField,
  PartnerUrlField,
} from "./partnerDialogFields/PartnerBasicFields";
import PartnerStatusField from "./partnerDialogFields/PartnerStatusField";
import PartnerUploadField from "./partnerDialogFields/PartnerUploadField";
import type { PartnerDialogFieldsProps } from "./partnerDialogFields/partnerDialogFields.types";

export default function PartnerDialogFields(props: PartnerDialogFieldsProps) {
  return (
    <div className="partner-dialog__grid">
      <PartnerNameField {...props} />
      <PartnerSortField {...props} />
      <PartnerUrlField {...props} />
      <PartnerStatusField {...props} />
      <PartnerLogoUrlField {...props} />
      <PartnerUploadField uploadLogo={props.uploadLogo} />
    </div>
  );
}
