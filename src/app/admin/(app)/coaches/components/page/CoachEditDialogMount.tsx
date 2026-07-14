"use client";

import CoachDialog from "@/app/components/CoachDialog";
import type { Coach } from "../../types";
import { cleanStr } from "../../pageHelpers";
import type { CoachPageModel } from "./types";

export default function CoachEditDialogMount({
  model,
}: {
  model: CoachPageModel;
}) {
  return (
    <CoachDialog
      open={!!model.dialogs.editItem}
      mode="edit"
      initial={model.dialogs.editItem || undefined}
      onClose={() => model.dialogs.setEditItem(null)}
      onSubmit={(values) => submitEdit(model, values)}
    />
  );
}

async function submitEdit(model: CoachPageModel, values: Partial<Coach>) {
  if (!model.dialogs.editItem) return;
  const slug = cleanStr(model.dialogs.editItem.slug);
  const updated = await model.muts.handleSave(slug, values);
  if (updated) model.dialogs.setEditItem(null);
}
