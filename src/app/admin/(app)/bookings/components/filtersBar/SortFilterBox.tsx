import SelectBox from "../SelectBox";
import SelectOption from "../SelectOption";
import FilterBox from "./FilterBox";
import { sortOptions } from "./filtersBar.options";
import type { FilterOptionsProps } from "./filtersBar.types";

export default function SortFilterBox(props: FilterOptionsProps) {
  return (
    <FilterBox kind="booking-sort">
      <SelectBox
        dd={props.sortDd}
        label={props.sortLabel}
        disabled={false}
        ariaLabel={props.t("common.admin.bookings.filters.sortAria")}
      >
        <SortOptions {...props} />
      </SelectBox>
    </FilterBox>
  );
}

function SortOptions(props: FilterOptionsProps) {
  return (
    <>
      {sortOptions.map((sort) => (
        <SelectOption
          key={sort}
          active={props.sort === sort}
          onClick={() => props.onSort(sort)}
          text={props.t(`common.admin.bookings.sort.${sort}`)}
        />
      ))}
    </>
  );
}
