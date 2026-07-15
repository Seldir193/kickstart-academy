import type { KeyboardEvent } from "react";
import type { PageState, PageTextProps } from "./types";

function clearOnEscape(e: KeyboardEvent<HTMLInputElement>, p: PageState) {
  if (e.key === "Escape") p.setQ("");
}

export default function FranchiseLocationsSearch({ p, t }: PageTextProps) {
  return (
    <div className="fl-filters__search">
      <div className="input-with-icon">
        <img
          src="/icons/search.svg"
          alt=""
          aria-hidden="true"
          className="input-with-icon__icon"
        />
        <input
          className="input input-with-icon__input"
          placeholder={t("common.admin.franchiseLocations.searchPlaceholder")}
          aria-label={t("common.admin.franchiseLocations.searchAria")}
          value={p.q}
          onChange={(e) => p.setQ(e.target.value)}
          onKeyDown={(e) => clearOnEscape(e, p)}
        />
      </div>
    </div>
  );
}
