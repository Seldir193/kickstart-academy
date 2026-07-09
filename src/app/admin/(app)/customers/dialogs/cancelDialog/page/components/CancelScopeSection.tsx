import type React from "react";
import { childName } from "../lib/familyOptions";
import { rememberButtonFocusState, toggleButtonFocus } from "../lib/focus";
import type { BookingTarget, FamilyScopeState, TFunc } from "../types";

type Props = { t: TFunc; scope: FamilyScopeState };

export default function CancelScopeSection(props: Props) {
  return (
    <section className="dialog-section cancel-dialog__scopeSection">
      <SectionHead t={props.t} />
      <div className="dialog-section__body cancel-dialog__scopeBody">
        <FamilyMessages t={props.t} scope={props.scope} />
        <ScopeContent t={props.t} scope={props.scope} />
      </div>
    </section>
  );
}

function SectionHead({ t }: { t: TFunc }) {
  return <div className="dialog-section__head"><h4 className="dialog-section__title">{t("common.admin.customers.cancelDialog.scopeTitle")}</h4></div>;
}

function FamilyMessages({ t, scope }: Props) {
  return (
    <>
      {scope.familyLoading && <div className="cancel-dialog__note">{t("common.admin.customers.cancelDialog.loadingFamily")}</div>}
      {scope.familyError && <div className="cancel-dialog__error">{t("common.admin.customers.cancelDialog.familyError")}</div>}
    </>
  );
}

function ScopeContent(props: Props) {
  if (props.scope.family && props.scope.family.length > 0) return <FamilyControls {...props} />;
  if (!props.scope.familyLoading) return <div className="dialog-value">{props.t("common.admin.customers.cancelDialog.currentCustomer")}</div>;
  return null;
}

function FamilyControls(props: Props) {
  return (
    <>
      <ParentSelect {...props} />
      <ScopeButtons {...props} />
      {props.scope.bookingTarget === "child" && <ChildSelect {...props} />}
      <ScopeSummary {...props} />
    </>
  );
}

function ParentSelect({ t, scope }: Props) {
  return <SelectField label={t("common.admin.customers.cancelDialog.parent")} open={scope.isParentDropdownOpen} setOpen={scope.setIsParentDropdownOpen} rootRef={scope.parentDropdownRef} value={scope.selectedParentLabel} items={scope.parentOptions} activeId={scope.selfMemberId} onSelect={scope.setSelectedParentId} />;
}

function ChildSelect({ t, scope }: Props) {
  const value = scope.activeChild ? childName(scope.activeChild, t("common.admin.customers.cancelDialog.selectChild")) : t("common.admin.customers.cancelDialog.selectChild");
  return <SelectField label={t("common.admin.customers.cancelDialog.child")} open={scope.isChildDropdownOpen} setOpen={scope.setIsChildDropdownOpen} rootRef={scope.childDropdownRef} value={value} items={scope.childOptions.map((item) => ({ id: item.uid, label: item.label }))} activeId={scope.selectedChildUid} onSelect={scope.setSelectedChildUid} />;
}

function SelectField(props: SelectFieldProps) {
  return (
    <div className="cancel-dialog__field">
      <label className="dialog-label">{props.label}</label>
      <SelectBox {...props} />
    </div>
  );
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
  return (
    <div className={"ks-selectbox" + (props.open ? " ks-selectbox--open" : "")} ref={props.rootRef}>
      <SelectTrigger value={props.value} setOpen={props.setOpen} />
      {props.open && <SelectPanel {...props} />}
    </div>
  );
}

function SelectTrigger({ value, setOpen }: { value: string; setOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
  return (
    <button type="button" className="ks-selectbox__trigger" onClick={() => setOpen((o: boolean) => !o)}>
      <span className="ks-selectbox__label">{value}</span>
      <span className="ks-selectbox__chevron" aria-hidden="true" />
    </button>
  );
}

function SelectPanel(props: SelectFieldProps) {
  return <div className="ks-selectbox__panel" role="listbox">{props.items.map((item) => renderSelectOption(item, props))}</div>;
}

function renderSelectOption(item: { id: string; label: string }, props: SelectFieldProps) {
  return <button key={item.id} type="button" className={optionClass(item.id, props.activeId)} onClick={() => selectOption(item.id, props)}>{item.label}</button>;
}

function optionClass(id: string, activeId: string) {
  return "ks-selectbox__option" + (id === activeId ? " ks-selectbox__option--active" : "");
}

function selectOption(id: string, props: SelectFieldProps) {
  props.onSelect(id);
  props.setOpen(false);
}

function ScopeButtons({ t, scope }: Props) {
  return <div className="cancel-dialog__scopeButtons"><ScopeButton t={t} scope={scope} target="self" /><ScopeButton t={t} scope={scope} target="child" /></div>;
}

function ScopeButton({ t, scope, target }: Props & { target: BookingTarget }) {
  return <button type="button" className={scopeButtonClass(scope.bookingTarget, target)} onMouseDown={rememberButtonFocusState} onClick={(e: React.MouseEvent<HTMLButtonElement>) => toggleButtonFocus(e, () => scope.setBookingTarget(target))}>{scopeButtonLabel(t, target)}</button>;
}

function scopeButtonClass(activeTarget: BookingTarget, target: BookingTarget) {
  return "btn btn-sm cancel-dialog__scopeBtn" + (activeTarget === target ? " cancel-dialog__scopeBtn--active" : "");
}

function scopeButtonLabel(t: TFunc, target: BookingTarget) {
  return target === "self" ? t("common.admin.customers.cancelDialog.customerSelf") : t("common.admin.customers.cancelDialog.child");
}

function ScopeSummary({ t, scope }: Props) {
  return <div className="cancel-dialog__summary"><SummaryItem label={t("common.admin.customers.cancelDialog.parent")} value={summaryParentName(t, scope)} /><SummaryItem label={t("common.admin.customers.cancelDialog.child")} value={summaryChildName(t, scope)} /></div>;
}

function summaryParentName(t: TFunc, scope: FamilyScopeState) {
  if (!scope.selectedParent) return t("common.admin.customers.cancelDialog.empty");
  return `${scope.selectedParent.parent.firstName} ${scope.selectedParent.parent.lastName}`.trim();
}

function summaryChildName(t: TFunc, scope: FamilyScopeState) {
  return scope.bookingTarget === "child" && scope.activeChild ? childName(scope.activeChild, t("common.admin.customers.cancelDialog.empty")) : t("common.admin.customers.cancelDialog.empty");
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return <div className="cancel-dialog__summaryItem"><span className="dialog-label">{label}</span><span className="dialog-value">{value}</span></div>;
}
