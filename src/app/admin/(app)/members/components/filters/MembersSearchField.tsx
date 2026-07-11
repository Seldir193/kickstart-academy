import type { TFunction } from "i18next";

export default function MembersSearchField(props: { value: string; onChange: (value: string) => void; t: TFunction }) {
  return <div className="members-filters__search"><div className="input-with-icon"><img src="/icons/search.svg" alt="" aria-hidden="true" className="input-with-icon__icon" /><input className="input input-with-icon__input" placeholder={props.t("common.admin.members.filters.searchPlaceholder")} value={props.value} onChange={(event) => props.onChange(event.target.value)} onKeyDown={(event) => clearOnEscape(event, props.onChange)} /></div></div>;
}

function clearOnEscape(event: React.KeyboardEvent<HTMLInputElement>, onChange: (value: string) => void) {
  if (event.key === "Escape") onChange("");
}
