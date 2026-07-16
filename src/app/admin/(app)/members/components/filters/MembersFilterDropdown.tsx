import type { FilterOption } from "./membersFilters.types";
import { useFilterDropdown } from "./useFilterDropdown";

type Props<T extends string> = {
  ariaLabel: string;
  value: T;
  options: FilterOption<T>[];
  className?: string;
  onChange: (value: T) => void;
};

type Dropdown = ReturnType<typeof useFilterDropdown>;

type BoxProps<T extends string> = Props<T> & {
  dropdown: Dropdown;
  label: string;
};

type OptionsProps<T extends string> = Props<T> & {
  close: () => void;
  menuRef: React.RefObject<HTMLUListElement | null>;
};

export default function MembersFilterDropdown<T extends string>(
  props: Props<T>,
) {
  const dropdown = useFilterDropdown();
  const label =
    props.options.find((option) => option.value === props.value)?.label ?? "";
  return (
    <div className={props.className ?? "members-filters__dd"}>
      <SelectBox {...props} dropdown={dropdown} label={label} />
    </div>
  );
}

function SelectBox<T extends string>({
  dropdown,
  label,
  ...props
}: BoxProps<T>) {
  return (
    <div className={selectClass(dropdown.open)}>
      <Trigger label={label} ariaLabel={props.ariaLabel} dropdown={dropdown} />
      {dropdown.open && (
        <Options
          {...props}
          close={() => dropdown.setOpen(false)}
          menuRef={dropdown.menuRef}
        />
      )}
    </div>
  );
}

function Trigger(props: {
  label: string;
  ariaLabel: string;
  dropdown: Dropdown;
}) {
  return (
    <button
      type="button"
      ref={props.dropdown.triggerRef}
      className="ks-training-select__trigger"
      onClick={() => props.dropdown.setOpen((open) => !open)}
      aria-label={props.ariaLabel}
    >
      <span className="ks-training-select__label">{props.label}</span>
      <span className="ks-training-select__chevron" aria-hidden="true" />
    </button>
  );
}

function Options<T extends string>(props: OptionsProps<T>) {
  return (
    <ul
      ref={props.menuRef}
      className="ks-training-select__menu"
      role="listbox"
      aria-label={props.ariaLabel}
    >
      <OptionItems {...props} />
    </ul>
  );
}

function OptionItems<T extends string>(props: OptionsProps<T>) {
  return (
    <>
      {props.options.map((option) => (
        <Option
          key={option.value || "all"}
          option={option}
          selected={props.value === option.value}
          onSelect={() => selectOption(option.value, props)}
        />
      ))}
    </>
  );
}

function Option<T extends string>(props: {
  option: FilterOption<T>;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        className={`ks-training-select__option${props.selected ? " is-selected" : ""}`}
        onClick={props.onSelect}
      >
        {props.option.label}
      </button>
    </li>
  );
}

function selectOption<T extends string>(
  value: T,
  props: Props<T> & { close: () => void },
) {
  props.onChange(value);
  props.close();
}

function selectClass(open: boolean) {
  return `ks-training-select${open ? " ks-training-select--open" : ""}`;
}
