import type { TFunc } from "../types";

type BooleanProps = {
  t: TFunc;
  value: boolean;
  setValue: (value: boolean) => void;
};
type GenderProps = {
  t: TFunc;
  value: string;
  setValue: (value: string) => void;
};

export function GoalkeeperToggle({ t, value, setValue }: BooleanProps) {
  return (
    <div className="camp-toggle-row camp-toggle-row--full">
      <ToggleButton
        active={!value}
        onClick={() => setValue(false)}
        label={t("common.admin.customers.bookDialog.no")}
      />
      <ToggleButton
        active={value}
        onClick={() => setValue(true)}
        label={t("common.admin.customers.bookDialog.yesPlus40")}
      />
    </div>
  );
}

export function GenderToggle({ t, value, setValue }: GenderProps) {
  return (
    <div className="camp-toggle-row camp-toggle-row--full">
      <ToggleButton
        active={value === "weiblich"}
        onClick={() => setValue("weiblich")}
        label={t("common.admin.customers.bookDialog.female")}
      />
      <ToggleButton
        active={value === "männlich"}
        onClick={() => setValue("männlich")}
        label={t("common.admin.customers.bookDialog.male")}
      />
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button type="button" className={toggleClass(active)} onClick={onClick}>
      {label}
    </button>
  );
}

function toggleClass(active: boolean) {
  return `camp-toggle-btn ${active ? "is-active" : ""}`;
}
