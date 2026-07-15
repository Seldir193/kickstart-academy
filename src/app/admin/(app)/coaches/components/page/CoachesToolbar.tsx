"use client";

import CoachesFilters from "../CoachesFilters";
import type { SortKey } from "../../types";
import CreateCoachButton from "./CreateCoachButton";
import type { CoachPageModel } from "./types";

export default function CoachesToolbar({ model }: { model: CoachPageModel }) {
  return (
    <CoachesFilters
      q={model.state.q}
      sort={model.state.sort}
      onChangeQ={(value) => changeQuery(model, value)}
      onChangeSort={(value) => changeSort(model, value)}
      actionSlot={
        <CreateCoachButton
          busy={model.muts.mutating}
          onOpen={() => model.dialogs.setCreateOpen(true)}
        />
      }
    />
  );
}

function changeQuery(model: CoachPageModel, value: string) {
  model.state.setQ(value);
  model.state.resetPages();
}

function changeSort(model: CoachPageModel, value: SortKey) {
  model.state.setSort(value);
  model.state.resetPages();
}
