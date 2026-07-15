"use client";

import CoachPublishedInfoDialog from "../CoachPublishedInfoDialog";
import CoachInfoDialog from "../../moderation/CoachInfoDialog";
import type { CoachPageModel } from "./types";

export default function CoachInfoDialogsMount({
  model,
}: {
  model: CoachPageModel;
}) {
  return (
    <>
      <CoachInfoDialog
        open={model.dialogs.rejectInfoOpen}
        coach={model.dialogs.rejectInfoTarget}
        onClose={() => closeRejectInfo(model)}
      />
      <CoachPublishedInfoDialog
        open={model.dialogs.publishedInfoOpen}
        coach={model.dialogs.publishedInfoTarget}
        onClose={() => closePublishedInfo(model)}
      />
    </>
  );
}

function closeRejectInfo(model: CoachPageModel) {
  model.dialogs.setRejectInfoOpen(false);
  model.dialogs.setRejectInfoTarget(null);
}

function closePublishedInfo(model: CoachPageModel) {
  model.dialogs.setPublishedInfoOpen(false);
  model.dialogs.setPublishedInfoTarget(null);
}
