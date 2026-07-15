import type { Tab } from "../../hooks/useCustomersList";

type Props = {
  tab: Tab;
  current: Tab;
  label: string;
  onClick: (next: Tab) => void;
};

export default function CustomersTabButton({
  tab,
  current,
  label,
  onClick,
}: Props) {
  return (
    <button
      className={`btn ${current === tab ? "btn--tab-active" : ""}`}
      onClick={() => onClick(tab)}
    >
      {label}
    </button>
  );
}
