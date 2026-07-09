import LocationsTableList from "../LocationsTableList";
import LocationsSectionShell from "./LocationsSectionShell";
import type { TableSectionProps } from "./types";

export default function TableLocationsSection(props: TableSectionProps) {
  return (
    <LocationsSectionShell title={props.title} meta={props.meta} pagination={props.pagination}>
      <div className="fl-admin__box fl-admin__box--scroll3">
        <LocationsTableList {...tableProps(props)} />
      </div>
    </LocationsSectionShell>
  );
}

function tableProps(props: TableSectionProps) {
  const { title, meta, pagination, p, ...rest } = props;
  void title;
  void meta;
  void pagination;
  return rest;
}
