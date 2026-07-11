import SearchInput from "../SearchInput";
import FilterBox from "./FilterBox";
import type { FiltersBarProps } from "./filtersBar.types";

export default function SearchFilter(props: FiltersBarProps) {
  return <FilterBox kind="booking-search"><SearchInput value={props.q} onChange={props.onSearchChange} onKeyDown={props.onSearchKeyDown} /></FilterBox>;
}
