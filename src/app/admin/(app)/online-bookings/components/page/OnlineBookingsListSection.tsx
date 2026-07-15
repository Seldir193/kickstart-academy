"use client";

import type { RefObject } from "react";
import BookingsTableList from "../BookingsTableList";
import type { Booking } from "../../types";
import type { Translate } from "./onlineBookingOptions";

type OnlineBookingsListSectionProps = {
  t: Translate;
  total: number;
  items: Booking[];
  page: number;
  pages: number;
  mutating: boolean;
  selectMode: boolean;
  toggleBtnRef: RefObject<HTMLButtonElement | null>;
  setPage: (updater: (page: number) => number) => void;
  setSelectMode: (updater: (selectMode: boolean) => boolean) => void;
  setSel: (booking: Booking) => void;
  onDeleteMany: (ids: string[]) => Promise<void>;
  onRestoreMany: (ids: string[]) => Promise<void>;
};

export default function OnlineBookingsListSection(
  props: OnlineBookingsListSectionProps,
) {
  return (
    <section className="news-admin__section">
      <ListCount total={props.total} />
      <TableBox {...props} />
      <Pager {...props} />
    </section>
  );
}

function ListCount({ total }: { total: number }) {
  return (
    <div className="news-admin__section-head-number">
      <span className="news-admin__section-meta">
        {total ? `(${total})` : ""}
      </span>
    </div>
  );
}

function TableBox(props: OnlineBookingsListSectionProps) {
  const className =
    "news-admin__box news-admin__box--scroll3" +
    (!props.mutating && !props.items.length ? " is-empty" : "");
  return (
    <div className={className}>
      <BookingsTableList
        items={props.items}
        selectMode={props.selectMode}
        busy={props.mutating}
        onToggleSelectMode={() => props.setSelectMode((prev) => !prev)}
        onOpen={props.setSel}
        onDeleteMany={props.onDeleteMany}
        onRestoreMany={props.onRestoreMany}
        toggleBtnRef={props.toggleBtnRef}
      />
    </div>
  );
}

function Pager(props: OnlineBookingsListSectionProps) {
  return (
    <div className="pager pager--arrows mt-3">
      <PagerButton direction="prev" {...props} />
      <div className="pager__count" aria-live="polite" aria-atomic="true">
        {props.page} / {props.pages}
      </div>
      <PagerButton direction="next" {...props} />
    </div>
  );
}

function PagerButton(
  props: OnlineBookingsListSectionProps & { direction: "prev" | "next" },
) {
  const prev = props.direction === "prev";
  const disabled =
    props.mutating || (prev ? props.page <= 1 : props.page >= props.pages);
  const label = props.t(
    `common.admin.onlineBookings.pagination.${prev ? "previousPage" : "nextPage"}`,
  );
  return (
    <button
      type="button"
      className="btn"
      aria-label={label}
      disabled={disabled}
      onClick={() => changePage(props)}
    >
      <PagerIcon prev={prev} />
    </button>
  );
}

function PagerIcon({ prev }: { prev: boolean }) {
  const className = "icon-img" + (prev ? " icon-img--left" : "");
  return (
    <img
      src="/icons/arrow_right_alt.svg"
      alt=""
      aria-hidden="true"
      className={className}
    />
  );
}

function changePage(
  props: OnlineBookingsListSectionProps & { direction: "prev" | "next" },
) {
  if (props.direction === "prev")
    props.setPage((page) => Math.max(1, page - 1));
  if (props.direction === "next")
    props.setPage((page) => Math.min(props.pages, page + 1));
}
