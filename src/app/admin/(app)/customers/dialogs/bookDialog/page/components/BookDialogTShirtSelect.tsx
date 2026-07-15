import type React from "react";
import { T_SHIRT_OPTIONS } from "../lib/tShirtOptions";
import type { TFunc } from "../types";

type Props = {
  t: TFunc;
  value: string;
  setValue: (value: string) => void;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  rootRef: React.RefObject<HTMLDivElement | null>;
};

export default function BookDialogTShirtSelect(props: Props) {
  return (
    <div className={selectClass(props.open)} ref={props.rootRef}>
      <Trigger {...props} />
      {props.open && <Panel {...props} />}
    </div>
  );
}

function selectClass(open: boolean) {
  return "ks-training-select" + (open ? " ks-training-select--open" : "");
}

function Trigger(props: Props) {
  return (
    <button
      type="button"
      className="ks-training-select__trigger"
      onClick={() => props.setOpen((open) => !open)}
      aria-haspopup="listbox"
      aria-expanded={props.open}
    >
      <span className="ks-training-select__label">
        {props.value ||
          props.t("common.admin.customers.bookDialog.pleaseSelect")}
      </span>
      <span className="ks-training-select__chevron" aria-hidden="true" />
    </button>
  );
}

function Panel(props: Props) {
  return (
    <ul className="ks-training-select__menu" role="listbox">
      <li>
        <Option
          label={props.t("common.admin.customers.bookDialog.pleaseSelect")}
          selected={!props.value}
          onSelect={() => selectValue("", props)}
        />
      </li>
      {T_SHIRT_OPTIONS.map((item) => (
        <li key={item}>
          <Option
            label={item}
            selected={props.value === item}
            onSelect={() => selectValue(item, props)}
          />
        </li>
      ))}
    </ul>
  );
}

function Option({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button type="button" className={optionClass(selected)} onClick={onSelect}>
      {label}
    </button>
  );
}

function optionClass(selected: boolean) {
  return "ks-training-select__option" + (selected ? " is-selected" : "");
}

function selectValue(value: string, props: Props) {
  props.setValue(value);
  props.setOpen(false);
}
