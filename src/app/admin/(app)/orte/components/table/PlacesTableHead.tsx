"use client";

import type { TFunction } from "i18next";

const COLUMNS = [
  ["id", "ID", ""],
  ["name", "Name", ""],
  ["address", "Address", ""],
  ["zip", "ZIP", ""],
  ["city", "City", ""],
  ["action", "Action", " news-list__h--right"],
] as const;

type Props = {
  t: TFunction;
};

export default function PlacesTableHead({ t }: Props) {
  return (
    <div className="news-list__head" aria-hidden="true">
      {COLUMNS.map(([key, label, classSuffix]) => (
        <div key={key} className={"news-list__h" + classSuffix}>
          {t(`common.admin.places.table.${key}`, { defaultValue: label })}
        </div>
      ))}
    </div>
  );
}
