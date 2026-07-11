import type { ReactNode } from "react";

type Props = {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
};

export default function RevenueOption({ active, onClick, children }: Props) {
  const activeClass = active ? " ks-selectbox__option--active" : "";
  return (
    <button
      type="button"
      className={`ks-selectbox__option${activeClass}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
