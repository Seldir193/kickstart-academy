"use client";

import type { ReactNode } from "react";
import Pagination from "../Pagination";

type Props = {
  title: ReactNode;
  meta?: ReactNode;
  page: number;
  pages: number;
  onPrev: () => void;
  onNext: () => void;
  children?: ReactNode;
};

export default function CoachesSection(props: Props) {
  return (
    <section className="coach-admin__section">
      <SectionHead title={props.title} meta={props.meta} />
      <SectionBody>{props.children}</SectionBody>
      <Pagination
        page={props.page}
        pages={props.pages}
        onPrev={props.onPrev}
        onNext={props.onNext}
      />
    </section>
  );
}

function SectionBody({ children }: { children?: ReactNode }) {
  return (
    <div className="coach-admin__box coach-admin__box--scroll3">{children}</div>
  );
}

function SectionHead({ title, meta }: { title: ReactNode; meta?: ReactNode }) {
  return (
    <div className="coach-admin__section-head">
      <h2 className="coach-admin__section-title">{title}</h2>
      <span className="coach-admin__section-meta">{meta || ""}</span>
    </div>
  );
}
