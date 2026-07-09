import type React from "react";
import { activeChildLabel } from "../hooks/useStornoFamilyScope";
import { rememberButtonFocusState, toggleButtonFocus } from "../lib/focus";
import type { BookingTarget, FamilyScopeState, TFunc } from "../types";

type Props = { t: TFunc; scope: FamilyScopeState };

export default function StornoScopeSection(props: Props) {
  return (
    <section className="dialog-section storno-dialog__scopeSection">
      <SectionHead t={props.t} />
      <div className="dialog-section__body storno-dialog__scopeBody">
        <FamilyMessages t={props.t} scope={props.scope} />
        <ScopeContent t={props.t} scope={props.scope} />
      </div>
    </section>
  );
}

function SectionHead({ t }: { t: TFunc }) {
  return <div className="dialog-section__head"><h4 className="dialog-section__title">{t("common.admin.customers.stornoDialog.scopeTitle")}</h4></div>;
}

function FamilyMessages({ t, scope }: Props) {
  return <>{scope.familyLoading && <div className="storno-dialog__note">{t("common.admin.customers.stornoDialog.loadingFamily")}</div>}{scope.familyError && <div className="storno-dialog__error">{t("common.admin.customers.stornoDialog.familyLoadError")}</div>}</>;
}

function ScopeContent(props: Props) {
  if (props.scope.family && props.scope.family.length > 0) return <FamilyControls {...props} />;
  if (!props.scope.familyLoading) return <div className="dialog-value">{props.t("common.admin.customers.stornoDialog.currentCustomerInfo")}</div>;
  return null;
}

function FamilyControls(props: Props) {
  return <><ParentSelect {...props} /><ScopeButtons {...props} />{props.scope.bookingTarget === "child" && <ChildSelect {...props} />}<ScopeSummary {...props} /></>;
}

function ParentSelect({ t, scope }: Props) {
  return <SelectField label={t("common.admin.customers.stornoDialog.parent")} open={scope.isParentDropdownOpen} setOpen={scope.setIsParentDropdownOpen} rootRef={scope.parentDropdownRef} value={scope.selectedParentLabel || t("common.admin.customers.stornoDialog.selectParent")} items={scope.parentOptions} activeId={scope.selfMemberId} onSelect={scope.setSelectedParentId} />;
}

function ChildSelect({ t, scope }: Props) {
  const value = activeChildLabel(scope, t("common.admin.customers.stornoDialog.selectChild"));
  return <SelectField label={t("common.admin.customers.stornoDialog.child")} open={scope.isChildDropdownOpen} setOpen={scope.setIsChildDropdownOpen} rootRef={scope.childDropdownRef} value={value} items={scope.childOptions.map((item) => ({ id: item.uid, label: item.label }))} activeId={scope.selectedChildUid} onSelect={scope.setSelectedChildUid} />;
}

function SelectField(props: SelectFieldProps) {
  return <div className="storno-dialog__field"><label className="dialog-label">{props.label}</label><SelectBox {...props} /></div>;
}

type SelectFieldProps = {
  label: string;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  rootRef: React.RefObject<HTMLDivElement | null>;
  value: string;
  items: { id: string; label: string }[];
  activeId: string;
  onSelect: (value: string) => void;
};

function SelectBox(props: SelectFieldProps) {
  return <div className={selectClass(props.open)} ref={props.rootRef}><SelectTrigger {...props} />{props.open && <SelectPanel {...props} />}</div>;
}

function selectClass(open: boolean) {
  return "ks-selectbox" + (open ? " ks-selectbox--open" : "");
}

function SelectTrigger(props: SelectFieldProps) {
  return <button type="button" className="ks-selectbox__trigger" onClick={() => props.setOpen((open) => !open)}><span className="ks-selectbox__label">{props.value}</span><span className="ks-selectbox__chevron" aria-hidden="true" /></button>;
}

function SelectPanel(props: SelectFieldProps) {
  return <div className="ks-selectbox__panel" role="listbox">{props.items.map((item) => <SelectOption key={item.id} item={item} props={props} />)}</div>;
}

function SelectOption({ item, props }: { item: { id: string; label: string }; props: SelectFieldProps }) {
  return <button type="button" className={optionClass(item.id === props.activeId)} onClick={() => selectOption(item.id, props)}>{item.label}</button>;
}

function optionClass(active: boolean) {
  return "ks-selectbox__option" + (active ? " ks-selectbox__option--active" : "");
}

function selectOption(id: string, props: SelectFieldProps) {
  props.onSelect(id);
  props.setOpen(false);
}

function ScopeButtons({ t, scope }: Props) {
  return <div className="storno-dialog__scopeButtons"><ScopeButton t={t} scope={scope} value="self" /><ScopeButton t={t} scope={scope} value="child" /></div>;
}

function ScopeButton({ t, scope, value }: Props & { value: BookingTarget }) {
  return <button type="button" className={scopeButtonClass(scope.bookingTarget === value)} onMouseDown={rememberButtonFocusState} onClick={(e) => toggleButtonFocus(e, () => scope.setBookingTarget(value))}>{scopeButtonLabel(t, value)}</button>;
}

function scopeButtonClass(active: boolean) {
  return "btn btn-sm storno-dialog__scopeBtn" + (active ? " storno-dialog__scopeBtn--active" : "");
}

function scopeButtonLabel(t: TFunc, value: BookingTarget) {
  return t(value === "self" ? "common.admin.customers.stornoDialog.customerSelf" : "common.admin.customers.stornoDialog.child");
}

function ScopeSummary({ t, scope }: Props) {
  return <div className="storno-dialog__summary"><SummaryItem label={t("common.admin.customers.stornoDialog.parent")} value={parentSummary(scope)} /><SummaryItem label={t("common.admin.customers.stornoDialog.child")} value={childSummary(scope)} /></div>;
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return <div className="storno-dialog__summaryItem"><span className="dialog-label">{label}</span><span className="dialog-value">{value}</span></div>;
}

function parentSummary(scope: FamilyScopeState) {
  const parent = scope.selectedParent?.parent;
  return parent ? `${parent.firstName} ${parent.lastName}`.trim() || "—" : "—";
}

function childSummary(scope: FamilyScopeState) {
  if (scope.bookingTarget !== "child" || !scope.activeChild) return "—";
  return `${scope.activeChild.firstName} ${scope.activeChild.lastName}`.trim() || "—";
}
