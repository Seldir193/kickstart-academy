import Pagination from "../Pagination";
import SectionHead from "./SectionHead";
import type { ShellProps } from "./types";

export default function LocationsSectionShell(props: ShellProps) {
  return (
    <section className="news-admin__section">
      <SectionHead
        title={props.title}
        meta={props.meta}
        pending={props.pending}
      />
      {props.children}
      <Pagination {...props.pagination} />
    </section>
  );
}
