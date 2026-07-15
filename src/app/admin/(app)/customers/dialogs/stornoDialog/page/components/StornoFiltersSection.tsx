import { GROUPED_COURSE_OPTIONS } from "@/app/lib/courseOptions";
import { cx } from "../../formatters";
import { BookingSelect } from "../../components/BookingSelect";
import InlineSelect from "../../components/InlineSelect";
import type { SortOrder, StatusFilter } from "../../constants";
import type { StornoBookingsState, StornoMenuState, TFunc } from "../types";

type Props = {
  t: TFunc;
  menus: StornoMenuState;
  bookings: StornoBookingsState;
};

export default function StornoFiltersSection(props: Props) {
  return (
    <section className="dialog-section storno-dialog__filtersSection">
      <SectionHead t={props.t} />
      <div className="dialog-section__body">
        <FiltersRow {...props} />
        <BookingRow {...props} />
      </div>
    </section>
  );
}

function SectionHead({ t }: { t: TFunc }) {
  return (
    <div className="dialog-section__head">
      <h4 className="dialog-section__title">
        {t("common.admin.customers.stornoDialog.filtersTitle")}
      </h4>
    </div>
  );
}

function FiltersRow(props: Props) {
  return (
    <div className="ks-storno__filters mb-2">
      <CourseFilter {...props} />
      <StatusFilter {...props} />
      <SortFilter {...props} />
    </div>
  );
}

function CourseFilter({ t, menus, bookings }: Props) {
  return (
    <div className="ks-storno__filter">
      <label className="dialog-label">
        {t("common.admin.customers.stornoDialog.courses")}
      </label>
      <CourseSelect t={t} menus={menus} bookings={bookings} />
    </div>
  );
}

function CourseSelect({ t, menus, bookings }: Props) {
  return (
    <div
      ref={menus.courseDropdownRef}
      className={cx(
        "ks-selectbox",
        menus.isCourseDropdownOpen && "ks-selectbox--open",
      )}
    >
      <CourseTrigger menus={menus} bookings={bookings} />
      {menus.isCourseDropdownOpen && (
        <CoursePanel t={t} menus={menus} bookings={bookings} />
      )}
    </div>
  );
}

function CourseTrigger({ menus, bookings }: Pick<Props, "menus" | "bookings">) {
  return (
    <button
      type="button"
      className="ks-selectbox__trigger"
      onClick={() => menus.setIsCourseDropdownOpen((open) => !open)}
      aria-haspopup="listbox"
      aria-expanded={menus.isCourseDropdownOpen}
    >
      <span className="ks-selectbox__label">
        {bookings.selectedCourseLabel}
      </span>
      <span className="ks-selectbox__chevron" aria-hidden="true" />
    </button>
  );
}

function CoursePanel({ t, menus, bookings }: Props) {
  return (
    <div className="ks-selectbox__panel" role="listbox">
      <AllCoursesOption t={t} menus={menus} bookings={bookings} />
      {GROUPED_COURSE_OPTIONS.map((group) => (
        <CourseGroup
          key={group.label}
          group={group}
          menus={menus}
          bookings={bookings}
        />
      ))}
    </div>
  );
}

function AllCoursesOption({ t, menus, bookings }: Props) {
  return (
    <button
      type="button"
      className={cx(
        "ks-selectbox__option",
        !bookings.courseValue && "ks-selectbox__option--active",
      )}
      onClick={() => selectCourse("", menus, bookings)}
    >
      {t("common.admin.customers.stornoDialog.allCourses")}
    </button>
  );
}

function CourseGroup({
  group,
  menus,
  bookings,
}: {
  group: any;
  menus: StornoMenuState;
  bookings: StornoBookingsState;
}) {
  return (
    <div className="ks-selectbox__group">
      <div className="ks-selectbox__group-label">{group.label}</div>
      {group.items.map((opt: any) => (
        <CourseOption
          key={opt.value}
          opt={opt}
          menus={menus}
          bookings={bookings}
        />
      ))}
    </div>
  );
}

function CourseOption({
  opt,
  menus,
  bookings,
}: {
  opt: any;
  menus: StornoMenuState;
  bookings: StornoBookingsState;
}) {
  return (
    <button
      type="button"
      className={cx(
        "ks-selectbox__option",
        bookings.courseValue === opt.value && "ks-selectbox__option--active",
      )}
      onClick={() => selectCourse(opt.value, menus, bookings)}
    >
      {opt.label}
    </button>
  );
}

function selectCourse(
  value: string,
  menus: StornoMenuState,
  bookings: StornoBookingsState,
) {
  bookings.setCourseValue(value);
  menus.setIsCourseDropdownOpen(false);
}

function StatusFilter({ t, menus, bookings }: Props) {
  return (
    <div className="ks-storno__filter">
      <InlineSelect
        label={t("common.admin.customers.stornoDialog.status")}
        value={bookings.statusFilter}
        displayLabel={bookings.statusLabel}
        options={bookings.statusItems}
        rootRef={menus.statusDropdownRef}
        open={menus.isStatusOpen}
        setOpen={menus.setIsStatusOpen}
        onChange={(v) => bookings.setStatusFilter(v as StatusFilter)}
      />
    </div>
  );
}

function SortFilter({ t, menus, bookings }: Props) {
  return (
    <div className="ks-storno__filter">
      <InlineSelect
        label={t("common.admin.customers.stornoDialog.sort")}
        value={bookings.sortOrder}
        displayLabel={bookings.sortLabel}
        options={bookings.sortItems}
        rootRef={menus.sortDropdownRef}
        open={menus.isSortOpen}
        setOpen={menus.setIsSortOpen}
        onChange={(v) => bookings.setSortOrder(v as SortOrder)}
      />
    </div>
  );
}

function BookingRow({ t, menus, bookings }: Props) {
  return (
    <div className="ks-storno__section mb-2">
      <BookingSelect
        label={t("common.admin.customers.stornoDialog.booking")}
        open={menus.menuOpen}
        setOpen={menus.setMenuOpen}
        triggerRef={menus.triggerRef}
        menuRef={menus.menuRef}
        disabled={!bookings.filtered.length}
        trigger={bookings.bookingTrigger}
        items={bookings.filtered}
        selectedId={bookings.selectedId}
        onSelect={bookings.setSelectedId}
        statusFilter={bookings.statusFilter}
        isCancelledSelected={bookings.isCancelled}
      />
    </div>
  );
}
