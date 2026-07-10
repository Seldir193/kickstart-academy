"use client";

import PlaceDialog from "@/app/components/places/PlaceDialog";
import type { useOrtePageState } from "./useOrtePageState";

type Props = {
  model: ReturnType<typeof useOrtePageState>;
};

export default function PlacesDialogMount({ model }: Props) {
  return (
    <PlaceDialog
      open={model.dialog.open}
      initial={model.dialog.editing || undefined}
      onClose={model.dialog.close}
      onSaved={() => handleSaved(model)}
    />
  );
}

function handleSaved(model: ReturnType<typeof useOrtePageState>) {
  model.dialog.close();
  model.list.reload();
}
