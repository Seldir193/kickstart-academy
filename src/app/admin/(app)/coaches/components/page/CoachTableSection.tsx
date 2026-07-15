"use client";

import CoachTableList from "../CoachTableList";
import CoachesSection from "./CoachesSection";
import type { CoachTableProps } from "./types";

type Props = {
  title: string;
  count: number;
  page: number;
  pages: number;
  onPrev: () => void;
  onNext: () => void;
  tableProps: CoachTableProps;
};

export default function CoachTableSection(props: Props) {
  return (
    <CoachesSection
      title={props.title}
      meta={props.count ? `(${props.count})` : ""}
      page={props.page}
      pages={props.pages}
      onPrev={props.onPrev}
      onNext={props.onNext}
    >
      <CoachTableList {...props.tableProps} />
    </CoachesSection>
  );
}
