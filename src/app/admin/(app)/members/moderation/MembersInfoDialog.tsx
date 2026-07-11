"use client";

import MembersInfoDialogContent from "./membersInfoDialog/MembersInfoDialogContent";
import type { MembersInfoDialogProps } from "./membersInfoDialog/membersInfoDialog.types";

export default function MembersInfoDialog(props: MembersInfoDialogProps) {
  return <MembersInfoDialogContent {...props} />;
}
