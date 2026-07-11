import SelectBox from "../SelectBox";
import SelectGroup from "../SelectGroup";
import SelectOption from "../SelectOption";
import FilterBox from "./FilterBox";
import { clubOptions, individualOptions, weeklyOptions } from "./filtersBar.options";
import type { FilterOptionsProps, ProgramOption } from "./filtersBar.types";

export default function ProgramFilterBox(props: FilterOptionsProps) {
  return <FilterBox kind="booking-select"><SelectBox dd={props.programDd} label={props.programLabel} disabled={false} ariaLabel={props.t("common.admin.bookings.filters.programAria")}><ProgramOptions {...props} /></SelectBox></FilterBox>;
}

function ProgramOptions(props: FilterOptionsProps) {
  return <><ProgramOptionRow value="all" labelKey="all" props={props} /><ProgramGroup labelKey="weeklyGroup" options={weeklyOptions} props={props} /><ProgramGroup labelKey="individualGroup" options={individualOptions} props={props} /><ProgramGroup labelKey="clubGroup" options={clubOptions} props={props} /></>;
}

function ProgramGroup(args: { labelKey: string; options: ProgramOption[]; props: FilterOptionsProps }) {
  return <SelectGroup label={programText(args.props, args.labelKey)}>{args.options.map(([value, labelKey]) => <ProgramOptionRow key={value} value={value} labelKey={labelKey} props={args.props} />)}</SelectGroup>;
}

function ProgramOptionRow(args: { value: FilterOptionsProps["program"]; labelKey: string; props: FilterOptionsProps }) {
  return <SelectOption active={args.props.program === args.value} onClick={() => args.props.onProgram(args.value)} text={programText(args.props, args.labelKey)} />;
}

function programText(props: FilterOptionsProps, key: string) {
  return props.t(`common.admin.bookings.filters.program.${key}`);
}
