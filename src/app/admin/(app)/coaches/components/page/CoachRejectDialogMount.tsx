"use client";

import RejectDialog from "../../moderation/RejectDialog";
import { cleanStr } from "../../pageHelpers";
import type { CoachPageModel } from "./types";

export default function CoachRejectDialogMount({ model }: { model: CoachPageModel }) {
  return <RejectDialog open={model.dialogs.rejectOpen} onClose={() => closeReject(model)} onSubmit={(reason) => submitReject(model, reason)} />;
}

function closeReject(model: CoachPageModel) {
  model.dialogs.setRejectOpen(false);
  model.dialogs.setRejectTarget(null);
  model.busy.setPendingBusySlug(null);
}

async function submitReject(model: CoachPageModel, reason: string) {
  if (!model.dialogs.rejectTarget) return;
  try {
    await model.muts.handleReject(cleanStr((model.dialogs.rejectTarget as any).slug), reason);
  } finally {
    closeReject(model);
  }
}
