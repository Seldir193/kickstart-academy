import { GROUPED_COURSE_OPTIONS } from "@/app/lib/courseOptions";
import { BookingSelect } from "../../components/BookingSelect";
import { InlineSelect } from "../../components/InlineSelect";
import type { SortOrder, StatusFilter } from "../../constants";
import type {
  CancelBookingsState,
  CancelMenuState,
  CancelSubmitState,
  TFunc,
} from "../types";

type Props = {
  t: TFunc;
  menus: CancelMenuState;
  bookings: CancelBookingsState;
  submit: CancelSubmitState;
};

export default function CancelFiltersSection(props: Props) {
  return (
    <section className="dialog-section cancel-dialog__filtersSection">
      <SectionHead t={props.t} />
      <div className="dialog-section__body">
        <FiltersBody {...props} />
      </div>
    </section>
  );
}

function SectionHead({ t }: { t: TFunc }) {
  return (
    <div className="dialog-section__head">
      <h4 className="dialog-section__title">
        {t("common.admin.customers.cancelDialog.filters")}
      </h4>
    </div>
  );
}

function FiltersBody(props: Props) {
  return (
    <>
      <div className="ks-storno__filters mb-2">
        <CourseFilter {...props} />
        <StatusFilterField {...props} />
        <SortFilterField {...props} />
      </div>
      <BookingFilter {...props} />
    </>
  );
}

function CourseFilter({ t, menus, bookings }: Props) {
  return (
    <div className="ks-storno__filter">
      <label className="dialog-label">
        {t("common.admin.customers.cancelDialog.courses")}
      </label>
      <CourseSelect t={t} menus={menus} bookings={bookings} />
    </div>
  );
}

function CourseSelect({ t, menus, bookings }: Omit<Props, "submit">) {
  return (
    <div
      className={
        "ks-selectbox" +
        (menus.isCourseDropdownOpen ? " ks-selectbox--open" : "")
      }
      ref={menus.courseDropdownRef}
    >
      <CourseTrigger menus={menus} bookings={bookings} />
      {menus.isCourseDropdownOpen && (
        <CoursePanel t={t} menus={menus} bookings={bookings} />
      )}
    </div>
  );
}

function CourseTrigger({ menus, bookings }: Omit<Props, "t" | "submit">) {
  return (
    <button
      type="button"
      className="ks-selectbox__trigger"
      onClick={() => menus.setIsCourseDropdownOpen((o: boolean) => !o)}
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

function CoursePanel({ t, menus, bookings }: Omit<Props, "submit">) {
  return (
    <div className="ks-selectbox__panel ks-storno__menu" role="listbox">
      <AllCoursesOption t={t} menus={menus} bookings={bookings} />
      {GROUPED_COURSE_OPTIONS.map((g: any) =>
        renderCourseGroup(g, menus, bookings),
      )}
    </div>
  );
}

function AllCoursesOption({ t, menus, bookings }: Omit<Props, "submit">) {
  return (
    <button
      type="button"
      className={courseOptionClass(bookings.courseValue, "")}
      onClick={() => selectCourse("", menus, bookings)}
    >
      {t("common.admin.customers.cancelDialog.allCourses")}
    </button>
  );
}

function renderCourseGroup(
  group: any,
  menus: CancelMenuState,
  bookings: CancelBookingsState,
) {
  return (
    <div key={group.label} className="ks-selectbox__group">
      <div className="ks-selectbox__group-label">{group.label}</div>
      {group.items.map((opt: any) => renderCourseOption(opt, menus, bookings))}
    </div>
  );
}

function renderCourseOption(
  opt: any,
  menus: CancelMenuState,
  bookings: CancelBookingsState,
) {
  return (
    <button
      key={opt.value}
      type="button"
      className={courseOptionClass(bookings.courseValue, opt.value)}
      onClick={() => selectCourse(opt.value, menus, bookings)}
    >
      {opt.label}
    </button>
  );
}

function courseOptionClass(active: string, value: string) {
  return (
    "ks-selectbox__option" +
    (active === value ? " ks-selectbox__option--active" : "")
  );
}

function selectCourse(
  value: string,
  menus: CancelMenuState,
  bookings: CancelBookingsState,
) {
  bookings.setCourseValue(value);
  menus.setIsCourseDropdownOpen(false);
}

function StatusFilterField({ t, menus, bookings }: Props) {
  return (
    <div className="ks-storno__filter">
      <InlineSelect
        label={t("common.admin.customers.cancelDialog.status")}
        valueLabel={bookings.statusLabel}
        open={menus.isStatusOpen}
        setOpen={menus.setIsStatusOpen}
        rootRef={menus.statusDropdownRef}
        items={bookings.statusItems}
        activeValue={bookings.statusFilter}
        onSelect={(v) => bookings.setStatusFilter(v as StatusFilter)}
      />
    </div>
  );
}

function SortFilterField({ t, menus, bookings }: Props) {
  return (
    <div className="ks-storno__filter">
      <InlineSelect
        label={t("common.admin.customers.cancelDialog.sort")}
        valueLabel={bookings.sortLabel}
        open={menus.isSortOpen}
        setOpen={menus.setIsSortOpen}
        rootRef={menus.sortDropdownRef}
        items={bookings.sortItems}
        activeValue={bookings.sortOrder}
        onSelect={(v) => bookings.setSortOrder(v as SortOrder)}
      />
    </div>
  );
}

function BookingFilter({ t, menus, bookings }: Props) {
  return (
    <div className="ks-storno__section mb-2">
      <BookingSelect
        label={t("common.admin.customers.cancelDialog.booking")}
        open={menus.isBookingDropdownOpen}
        setOpen={menus.setIsBookingDropdownOpen}
        rootRef={menus.bookingDropdownRef}
        disabled={!bookings.filteredBookings.length}
        title={bookingTitle(t, bookings)}
        trigger={bookings.bookingTrigger}
        items={bookings.filteredBookings}
        selectedId={bookings.selectedId}
        onSelect={(id: string) => bookings.setSelectedId(id)}
        statusFilter={bookings.statusFilter}
      />
    </div>
  );
}

function bookingTitle(t: TFunc, bookings: CancelBookingsState) {
  return bookings.courseValueIsNonCancelable
    ? t("common.admin.customers.cancelDialog.notCancellable")
    : undefined;
}
