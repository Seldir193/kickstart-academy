"use client";

import CoachCreateDialogMount from "./CoachCreateDialogMount";
import CoachDeleteDialogMount from "./CoachDeleteDialogMount";
import CoachEditDialogMount from "./CoachEditDialogMount";
import CoachInfoDialogsMount from "./CoachInfoDialogsMount";
import CoachRejectDialogMount from "./CoachRejectDialogMount";
import type { CoachPageModel } from "./types";

export default function CoachesDialogMount({ model }: { model: CoachPageModel }) {
  return (
    <>
      <CoachCreateDialogMount model={model} />
      <CoachEditDialogMount model={model} />
      <CoachDeleteDialogMount model={model} />
      <CoachRejectDialogMount model={model} />
      <CoachInfoDialogsMount model={model} />
    </>
  );
}
