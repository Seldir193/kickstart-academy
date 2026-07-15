import type { ReactNode } from "react";
import type { DocumentsDialogState } from "../types";
import {
  rememberButtonFocusState,
  toggleButtonFocus,
} from "../lib/buttonFocus";

export function DocumentsScopeSection({
  state,
}: {
  state: DocumentsDialogState;
}) {
  return (
    <section className="dialog-section documents-dialog__scopeSection">
      <ScopeHeader state={state} />
      <div className="dialog-section__body documents-dialog__scopeBody">
        <ScopeMessages state={state} />
        <ScopeContent state={state} />
      </div>
    </section>
  );
}

function ScopeHeader({ state }: { state: DocumentsDialogState }) {
  return (
    <div className="dialog-section__head">
      <h4 className="dialog-section__title">
        {state.t("admin.customers.documents.scope.title")}
      </h4>
    </div>
  );
}

function ScopeMessages({ state }: { state: DocumentsDialogState }) {
  return (
    <>
      {state.scope.familyLoading && (
        <div className="documents-dialog__note">
          {state.t("admin.customers.documents.family.loading")}
        </div>
      )}
      {state.scope.familyError && (
        <div className="documents-dialog__error">
          {state.t("admin.customers.documents.family.error")}
        </div>
      )}
    </>
  );
}

function ScopeContent({ state }: { state: DocumentsDialogState }) {
  if (state.scope.family && state.scope.family.length > 0)
    return <FamilyScopeContent state={state} />;
  if (!state.scope.familyLoading)
    return (
      <div className="dialog-value">
        {state.t("admin.customers.documents.scope.currentCustomer")}
      </div>
    );
  return null;
}

function FamilyScopeContent({ state }: { state: DocumentsDialogState }) {
  return (
    <>
      <ParentField state={state} />
      <ScopeButtons state={state} />
      {state.scope.bookingTarget === "child" && <ChildField state={state} />}
      <ScopeSummary state={state} />
    </>
  );
}

function ParentField({ state }: { state: DocumentsDialogState }) {
  return (
    <SelectField label={state.t("admin.customers.documents.parent.label")}>
      <ParentSelect state={state} />
    </SelectField>
  );
}

function ChildField({ state }: { state: DocumentsDialogState }) {
  return (
    <SelectField label={state.t("admin.customers.documents.child.label")}>
      <ChildSelect state={state} />
    </SelectField>
  );
}

function SelectField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="documents-dialog__field">
      <label className="dialog-label">{label}</label>
      {children}
    </div>
  );
}

function ParentSelect({ state }: { state: DocumentsDialogState }) {
  return (
    <div
      className={selectClass(state.scope.isParentDropdownOpen)}
      ref={state.scope.parentDropdownRef}
    >
      <ParentTrigger state={state} />
      {state.scope.isParentDropdownOpen && <ParentOptions state={state} />}
    </div>
  );
}

function ParentTrigger({ state }: { state: DocumentsDialogState }) {
  const label =
    state.scope.selectedParentLabel ||
    state.t("admin.customers.documents.parent.select");
  return (
    <button
      type="button"
      className="ks-selectbox__trigger"
      onClick={() => state.scope.setIsParentDropdownOpen((open) => !open)}
    >
      <span className="ks-selectbox__label">{label}</span>
      <span className="ks-selectbox__chevron" aria-hidden="true" />
    </button>
  );
}

function ParentOptions({ state }: { state: DocumentsDialogState }) {
  return (
    <div className="ks-selectbox__panel" role="listbox">
      {state.scope.parentOptions.map((item) => (
        <ParentOption key={item.id} item={item} state={state} />
      ))}
    </div>
  );
}

function ParentOption({
  item,
  state,
}: {
  item: { id: string; label: string };
  state: DocumentsDialogState;
}) {
  return (
    <button
      type="button"
      className={optionClass(item.id === state.scope.selfMemberId)}
      onClick={() => selectParent(item.id, state)}
    >
      {item.label}
    </button>
  );
}

function selectParent(id: string, state: DocumentsDialogState) {
  state.scope.setSelectedParentId(id);
  state.scope.setIsParentDropdownOpen(false);
}

function ScopeButtons({ state }: { state: DocumentsDialogState }) {
  return (
    <div className="documents-dialog__scopeButtons">
      <ScopeButton
        state={state}
        target="self"
        label={state.t("admin.customers.documents.scope.customerSelf")}
      />
      <ScopeButton
        state={state}
        target="child"
        label={state.t("admin.customers.documents.child.label")}
      />
    </div>
  );
}

function ScopeButton({
  state,
  target,
  label,
}: {
  state: DocumentsDialogState;
  target: "self" | "child";
  label: string;
}) {
  const active = state.scope.bookingTarget === target;
  return (
    <button
      type="button"
      className={scopeButtonClass(active)}
      onMouseDown={rememberButtonFocusState}
      onClick={(e) =>
        toggleButtonFocus(e, () => state.scope.setBookingTarget(target))
      }
    >
      {label}
    </button>
  );
}

function ChildSelect({ state }: { state: DocumentsDialogState }) {
  return (
    <div
      className={selectClass(state.scope.isChildDropdownOpen)}
      ref={state.scope.childDropdownRef}
    >
      <ChildTrigger state={state} />
      {state.scope.isChildDropdownOpen && <ChildOptions state={state} />}
    </div>
  );
}

function ChildTrigger({ state }: { state: DocumentsDialogState }) {
  return (
    <button
      type="button"
      className="ks-selectbox__trigger"
      onClick={() => state.scope.setIsChildDropdownOpen((open) => !open)}
    >
      <span className="ks-selectbox__label">{childTriggerLabel(state)}</span>
      <span className="ks-selectbox__chevron" aria-hidden="true" />
    </button>
  );
}

function ChildOptions({ state }: { state: DocumentsDialogState }) {
  return (
    <div className="ks-selectbox__panel" role="listbox">
      {state.scope.childOptions.map((item) => (
        <ChildOption key={item.uid} item={item} state={state} />
      ))}
    </div>
  );
}

function ChildOption({
  item,
  state,
}: {
  item: { uid: string; label: string };
  state: DocumentsDialogState;
}) {
  return (
    <button
      type="button"
      className={optionClass(item.uid === state.scope.selectedChildUid)}
      onClick={() => selectChild(item.uid, state)}
    >
      {item.label}
    </button>
  );
}

function selectChild(uid: string, state: DocumentsDialogState) {
  state.scope.setSelectedChildUid(uid);
  state.scope.setIsChildDropdownOpen(false);
}

function ScopeSummary({ state }: { state: DocumentsDialogState }) {
  return (
    <div className="documents-dialog__summary">
      <SummaryItem
        label={state.t("admin.customers.documents.parent.label")}
        value={parentSummary(state)}
      />
      <SummaryItem
        label={state.t("admin.customers.documents.child.label")}
        value={childSummary(state)}
      />
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="documents-dialog__summaryItem">
      <span className="dialog-label">{label}</span>
      <span className="dialog-value">{value}</span>
    </div>
  );
}

function childTriggerLabel(state: DocumentsDialogState) {
  if (!state.scope.activeChild)
    return state.t("admin.customers.documents.child.select");
  return `${state.scope.activeChild.firstName} ${state.scope.activeChild.lastName}`.trim();
}

function parentSummary(state: DocumentsDialogState) {
  if (!state.scope.selectedParent)
    return state.t("admin.customers.documents.common.empty");
  return `${state.scope.selectedParent.parent.firstName} ${state.scope.selectedParent.parent.lastName}`.trim();
}

function childSummary(state: DocumentsDialogState) {
  if (state.scope.bookingTarget === "child" && state.scope.activeChild)
    return `${state.scope.activeChild.firstName} ${state.scope.activeChild.lastName}`.trim();
  return state.t("admin.customers.documents.common.empty");
}

function selectClass(open: boolean) {
  return "ks-selectbox" + (open ? " ks-selectbox--open" : "");
}

function optionClass(active: boolean) {
  return (
    "ks-selectbox__option" + (active ? " ks-selectbox__option--active" : "")
  );
}

function scopeButtonClass(active: boolean) {
  return (
    "btn btn-sm documents-dialog__scopeBtn" +
    (active ? " documents-dialog__scopeBtn--active" : "")
  );
}
