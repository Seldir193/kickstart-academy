import type { ReactNode } from "react";
import KsDatePicker from "@/app/admin/(app)/invoices/components/KsDatePicker";
import type { SortOrder } from "../../types";
import { TypeChips } from "../../components/TypeChips";
import type { DocumentsDialogState, SelectboxState } from "../types";
import { nextPage, prevPage, sortLabel } from "../lib/sort";
import { DocumentRow } from "./DocumentRow";
import { openPdf } from "../lib/documentDisplay";

export function DocumentsFiltersSection({
  state,
}: {
  state: DocumentsDialogState;
}) {
  return (
    <section className="dialog-section documents-dialog__filtersSection">
      <FiltersHeader state={state} />
      <FiltersBody state={state} />
    </section>
  );
}

function FiltersHeader({ state }: { state: DocumentsDialogState }) {
  return (
    <div className="dialog-section__head">
      <h4 className="dialog-section__title">
        {state.t("admin.customers.documents.filters.title")}
      </h4>
    </div>
  );
}

function FiltersBody({ state }: { state: DocumentsDialogState }) {
  return (
    <div className="dialog-section__body">
      <PremiumFilters state={state} />
      <DocumentsControls state={state} />
    </div>
  );
}

function PremiumFilters({ state }: { state: DocumentsDialogState }) {
  return (
    <div className="ks-documents-premium">
      <PremiumTopRow state={state} />
      <PremiumTypesRow state={state} />
    </div>
  );
}

function PremiumTopRow({ state }: { state: DocumentsDialogState }) {
  return (
    <div className="ks-documents-premium__topRow">
      <SearchItem state={state} />
      <DateItem
        value={state.filters.from}
        onChange={(value) => updateFrom(state, value)}
        state={state}
      />
      <DateItem
        value={state.filters.to}
        onChange={(value) => updateTo(state, value)}
        state={state}
      />
      <SortItem state={state} />
    </div>
  );
}

function SearchItem({ state }: { state: DocumentsDialogState }) {
  return (
    <div className="ks-documents-premium__searchItem">
      <div className="input-with-icon">
        <img
          src="/icons/search.svg"
          alt=""
          aria-hidden="true"
          className="input-with-icon__icon"
        />
        <input
          className="input input-with-icon__input"
          placeholder={state.t("admin.customers.documents.search.placeholder")}
          aria-label={state.t("admin.customers.documents.search.ariaLabel")}
          value={state.filters.q}
          onChange={(e) => updateSearch(state, e.target.value)}
        />
      </div>
    </div>
  );
}

function DateItem(props: {
  value: string;
  onChange: (value: string) => void;
  state: DocumentsDialogState;
}) {
  return (
    <div className="ks-documents-premium__dateItem">
      <KsDatePicker
        value={props.value}
        onChange={props.onChange}
        placeholder={props.state.t(
          "admin.customers.documents.date.placeholder",
        )}
        disabled={false}
      />
    </div>
  );
}

function SortItem({ state }: { state: DocumentsDialogState }) {
  return (
    <div className="ks-documents-premium__sortItem">
      <SortSelect state={state} />
    </div>
  );
}

function SortSelect({ state }: { state: DocumentsDialogState }) {
  return (
    <div className={anchorClass(state.sortSelect.open)}>
      <SortTrigger state={state} />
      {state.sortSelect.open && <SortPanel state={state} />}
    </div>
  );
}

function SortTrigger({ state }: { state: DocumentsDialogState }) {
  return (
    <SelectTrigger
      select={state.sortSelect}
      label={sortLabel(state.filters.sortOrder, state.t)}
    />
  );
}

function SortPanel({ state }: { state: DocumentsDialogState }) {
  return (
    <SelectPanel
      select={state.sortSelect}
      className="documents-dialog__panel--sort"
    >
      {(["newest", "oldest"] as SortOrder[]).map((value) => (
        <SortOption key={value} value={value} state={state} />
      ))}
    </SelectPanel>
  );
}

function SortOption({
  value,
  state,
}: {
  value: SortOrder;
  state: DocumentsDialogState;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={state.filters.sortOrder === value}
      className={documentsOptionClass(state.filters.sortOrder === value)}
      onClick={() => selectSort(value, state)}
    >
      {sortLabel(value, state.t)}
    </button>
  );
}

function PremiumTypesRow({ state }: { state: DocumentsDialogState }) {
  return (
    <div className="ks-documents-premium__typesRow">
      <TypeChips
        {...state.types}
        onAnyChange={() => state.filters.setPage(1)}
      />
    </div>
  );
}

function DocumentsControls({ state }: { state: DocumentsDialogState }) {
  return (
    <div className="documents-dialog__controls">
      <DocumentsListSelect state={state} />
      <PagerRow state={state} />
      {state.list.err && (
        <div className="documents-dialog__error mt-2">{state.list.err}</div>
      )}
    </div>
  );
}

function DocumentsListSelect({ state }: { state: DocumentsDialogState }) {
  return (
    <div className="documents-dialog__field">
      <label className="dialog-label">
        {state.t("admin.customers.documents.list.label")}
      </label>
      <div className={anchorClass(state.docsSelect.open)}>
        <DocsTrigger state={state} />
        {state.docsSelect.open && !!state.list.pagedItems.length && (
          <DocsPanel state={state} />
        )}
      </div>
    </div>
  );
}

function DocsTrigger({ state }: { state: DocumentsDialogState }) {
  return (
    <SelectTrigger
      select={state.docsSelect}
      label={docsTriggerLabel(state)}
      disabled={!state.list.pagedItems.length}
    />
  );
}

function DocsPanel({ state }: { state: DocumentsDialogState }) {
  return (
    <SelectPanel
      select={state.docsSelect}
      className="documents-dialog__panel--docs"
    >
      {state.list.pagedItems.map((item) => (
        <DocOption key={item.id} item={item} state={state} />
      ))}
    </SelectPanel>
  );
}

function DocOption({
  item,
  state,
}: {
  item: any;
  state: DocumentsDialogState;
}) {
  return (
    <button
      type="button"
      role="option"
      className="ks-selectbox__option ks-documents-option ks-doc-select__option ks-storno__option"
      onClick={() => selectDocument(item, state)}
    >
      <DocumentRow item={item} />
    </button>
  );
}

function PagerRow({ state }: { state: DocumentsDialogState }) {
  return (
    <div className="documents-dialog__pagerRow">
      <Pager state={state} />
      <PerPageSelect state={state} />
    </div>
  );
}

function Pager({ state }: { state: DocumentsDialogState }) {
  return (
    <div className="pager pager--arrows">
      <PagerButton state={state} direction="prev" />
      <PagerCount state={state} />
      <PagerButton state={state} direction="next" />
    </div>
  );
}

function PagerButton({
  state,
  direction,
}: {
  state: DocumentsDialogState;
  direction: "prev" | "next";
}) {
  const disabled =
    direction === "prev"
      ? state.filters.page <= 1
      : state.filters.page >= state.list.totalPages;
  return (
    <button
      type="button"
      className="btn"
      aria-label={pagerLabel(state, direction)}
      title={pagerLabel(state, direction)}
      onClick={() => changePage(state, direction)}
      disabled={disabled}
    >
      <img
        src="/icons/arrow_right_alt.svg"
        alt=""
        aria-hidden="true"
        className={
          direction === "prev" ? "icon-img icon-img--left" : "icon-img"
        }
      />
    </button>
  );
}

function PagerCount({ state }: { state: DocumentsDialogState }) {
  return (
    <div className="pager__count" aria-live="polite" aria-atomic="true">
      {state.t("admin.customers.documents.pagination.page", {
        page: state.filters.page,
        totalPages: state.list.totalPages,
      })}
    </div>
  );
}

function PerPageSelect({ state }: { state: DocumentsDialogState }) {
  return (
    <div className="documents-dialog__perPage">
      <span className="documents-dialog__perPageLabel">
        {state.t("admin.customers.documents.pagination.perPage")}
      </span>
      <div className={anchorClass(state.perPageSelect.open)}>
        <PerPageTrigger state={state} />
        {state.perPageSelect.open && <PerPagePanel state={state} />}
      </div>
    </div>
  );
}

function PerPageTrigger({ state }: { state: DocumentsDialogState }) {
  return (
    <SelectTrigger
      select={state.perPageSelect}
      label={String(state.filters.limit)}
    />
  );
}

function PerPagePanel({ state }: { state: DocumentsDialogState }) {
  return (
    <SelectPanel
      select={state.perPageSelect}
      className="documents-dialog__panel--perpage"
    >
      {[10, 20, 50, 100].map((value) => (
        <PerPageOption key={value} value={value} state={state} />
      ))}
    </SelectPanel>
  );
}

function PerPageOption({
  value,
  state,
}: {
  value: number;
  state: DocumentsDialogState;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={state.filters.limit === value}
      className={documentsOptionClass(state.filters.limit === value)}
      onClick={() => selectLimit(value, state)}
    >
      {value}
    </button>
  );
}

function SelectTrigger(props: {
  select: SelectboxState;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      ref={props.select.triggerRef}
      type="button"
      className="ks-selectbox__trigger"
      onClick={() => toggleSelect(props.select)}
      disabled={props.disabled}
      aria-haspopup="listbox"
      aria-expanded={props.select.open}
    >
      <span className="ks-selectbox__label">{props.label}</span>
      <span className="ks-selectbox__chevron" aria-hidden="true" />
    </button>
  );
}

function SelectPanel(props: {
  select: SelectboxState;
  className: string;
  children: ReactNode;
}) {
  return (
    <div
      ref={props.select.menuRef}
      role="listbox"
      className={`ks-selectbox__panel documents-dialog__panel ${props.className}`}
      onWheel={(e) => e.stopPropagation()}
      onScroll={(e) => e.stopPropagation()}
    >
      {props.children}
    </div>
  );
}

function updateSearch(state: DocumentsDialogState, value: string) {
  state.filters.setQ(value);
  state.filters.setPage(1);
}

function updateFrom(state: DocumentsDialogState, value: string) {
  state.filters.setFrom(value);
  state.filters.setPage(1);
}

function updateTo(state: DocumentsDialogState, value: string) {
  state.filters.setTo(value);
  state.filters.setPage(1);
}

function selectSort(value: SortOrder, state: DocumentsDialogState) {
  state.filters.setSortOrder(value);
  state.filters.setPage(1);
  state.sortSelect.setOpen(false);
}

function selectDocument(item: any, state: DocumentsDialogState) {
  state.docsSelect.setOpen(false);
  openPdf(item);
}

function changePage(state: DocumentsDialogState, direction: "prev" | "next") {
  state.filters.setPage((page) =>
    direction === "prev"
      ? prevPage(page)
      : nextPage(page, state.list.totalPages),
  );
}

function selectLimit(value: number, state: DocumentsDialogState) {
  state.filters.setLimit(value);
  state.filters.setPage(1);
  state.perPageSelect.setOpen(false);
}

function toggleSelect(select: SelectboxState) {
  select.open ? select.setOpen(false) : select.openMenu();
}

function docsTriggerLabel(state: DocumentsDialogState) {
  if (!state.list.hasLoadedOnce && state.list.loading)
    return state.t("admin.customers.documents.loading");
  return state.t("admin.customers.documents.list.itemsOnPage", {
    count: state.list.pagedItems.length,
  });
}

function pagerLabel(state: DocumentsDialogState, direction: "prev" | "next") {
  return state.t(
    `admin.customers.documents.pagination.${direction === "prev" ? "previous" : "next"}`,
  );
}

function anchorClass(open: boolean) {
  return (
    "ks-selectbox documents-dialog__anchor" +
    (open ? " ks-selectbox--open" : "")
  );
}

function documentsOptionClass(active: boolean) {
  return (
    "ks-selectbox__option ks-documents-option" +
    (active ? " ks-selectbox__option--active" : "")
  );
}
