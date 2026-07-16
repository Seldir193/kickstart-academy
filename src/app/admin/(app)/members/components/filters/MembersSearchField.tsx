import type { TFunction } from "i18next";

type SearchProps = {
  value: string;
  onChange: (value: string) => void;
  t: TFunction;
};

export default function MembersSearchField(props: SearchProps) {
  return (
    <div className="members-filters__search">
      <div className="input-with-icon">
        <SearchIcon />
        <SearchInput {...props} />
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <img
      src="/icons/search.svg"
      alt=""
      aria-hidden="true"
      className="input-with-icon__icon"
    />
  );
}

function SearchInput(props: SearchProps) {
  return (
    <input
      className="input input-with-icon__input"
      placeholder={props.t("common.admin.members.filters.searchPlaceholder")}
      value={props.value}
      onChange={(event) => props.onChange(event.target.value)}
      onKeyDown={(event) => clearOnEscape(event, props.onChange)}
    />
  );
}

function clearOnEscape(
  event: React.KeyboardEvent<HTMLInputElement>,
  onChange: (value: string) => void,
) {
  if (event.key === "Escape") onChange("");
}
