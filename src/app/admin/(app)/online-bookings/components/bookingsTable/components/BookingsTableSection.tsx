import type { Booking } from "../../../types";
import BookingsTableHead from "./BookingsTableHead";
import BookingTableRow from "./BookingTableRow";
import type { Translator } from "../types";

type Props = {
  items: Booking[];
  selectMode: boolean;
  selected: Set<string>;
  onOpen: (b: Booking) => void;
  onRowClick: (b: Booking) => void;
  t: Translator;
  language: string;
};

export default function BookingsTableSection(props: Props) {
  return (
    <div className="news-table__scroll">
      <section className="card news-list">
        <div className="news-list__table">
          <BookingsTableHead t={props.t} />
          <ul className="list list--bleed">
            {props.items.map((b) => renderRow(props, b))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function renderRow(props: Props, b: Booking) {
  return <BookingTableRow key={b._id} booking={b} {...props} />;
}
