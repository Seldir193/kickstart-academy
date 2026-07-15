import SelectBox from "../SelectBox";
import SelectOption from "../SelectOption";
import FilterBox from "./FilterBox";
import { statusOptions } from "./filtersBar.options";
import type { FilterOptionsProps } from "./filtersBar.types";
import type { StatusOrAll } from "../../types";

export default function StatusFilterBox(props: FilterOptionsProps) {
  return (
    <FilterBox kind="booking-select">
      <SelectBox
        dd={props.statusDd}
        label={props.statusLabel}
        disabled={false}
        ariaLabel={props.t("common.admin.bookings.filters.statusAria")}
      >
        <StatusOptions {...props} />
      </SelectBox>
    </FilterBox>
  );
}

function StatusOptions(props: FilterOptionsProps) {
  return (
    <>
      {statusOptions.map((status) => (
        <SelectOption
          key={status}
          active={props.status === status}
          onClick={() => props.onStatus(status)}
          text={statusText(props, status)}
        />
      ))}
    </>
  );
}

function statusText(props: FilterOptionsProps, status: StatusOrAll) {
  const count =
    status === "all"
      ? (props.list.totalAll ?? props.list.total)
      : props.list.counts[status];
  return `${props.t(`common.admin.bookings.filters.status.${status}`)} (${count ?? 0})`;
}
