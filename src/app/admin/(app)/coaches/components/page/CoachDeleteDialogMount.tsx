"use client";

import DeleteCoachDialog from "../../moderation/DeleteCoachDialog";
import { cleanStr } from "../../pageHelpers";
import { fullName } from "../../utils";
import type { CoachPageModel } from "./types";

export default function CoachDeleteDialogMount({ model }: { model: CoachPageModel }) {
  return <DeleteCoachDialog open={model.dialogs.deleteOpen} coachName={coachName(model)} onClose={() => closeDelete(model)} onConfirm={() => confirmDelete(model)} />;
}

function coachName(model: CoachPageModel) {
  return model.dialogs.deleteTarget ? fullName(model.dialogs.deleteTarget) : "";
}

function closeDelete(model: CoachPageModel) {
  model.dialogs.setDeleteOpen(false);
  model.dialogs.setDeleteTarget(null);
}

async function confirmDelete(model: CoachPageModel) {
  if (!model.dialogs.deleteTarget) return;
  await model.muts.handleDelete(cleanStr((model.dialogs.deleteTarget as any).slug));
  closeDelete(model);
}
