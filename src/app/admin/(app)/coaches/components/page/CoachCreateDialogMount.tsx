"use client";

import CoachDialog from "@/app/components/CoachDialog";
import type { Coach } from "../../types";
import type { CoachPageModel } from "./types";

export default function CoachCreateDialogMount({ model }: { model: CoachPageModel }) {
  return <CoachDialog open={model.dialogs.createOpen} mode="create" onClose={() => model.dialogs.setCreateOpen(false)} onSubmit={(values) => submitCreate(model, values)} />;
}

async function submitCreate(model: CoachPageModel, values: Partial<Coach>) {
  const created = await model.muts.handleCreate(values);
  if (created) model.dialogs.setCreateOpen(false);
}
