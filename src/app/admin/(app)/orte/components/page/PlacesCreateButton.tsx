"use client";

import type { TFunction } from "i18next";

type Props = {
  busy: boolean;
  onCreate: () => void;
  t: TFunction;
};

export default function PlacesCreateButton({ busy, onCreate, t }: Props) {
  return (
    <div className="ks-places-toolbar__action">
      <button className="btn" onClick={onCreate} type="button" disabled={busy}>
        <img src="/icons/plus.svg" alt="" aria-hidden="true" className="btn__icon" />
        {t("common.admin.places.newLocation", { defaultValue: "New location" })}
      </button>
    </div>
  );
}
