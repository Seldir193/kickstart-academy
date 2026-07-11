import type { ReactNode } from "react";
import type { FilterKind } from "./filtersBar.types";

function filterClass(kind: FilterKind) {
  return `news-admin__filter news-admin__filter--${kind}`;
}

export default function FilterBox(props: { kind: FilterKind; children: ReactNode }) {
  return <div className={filterClass(props.kind)}>{props.children}</div>;
}
