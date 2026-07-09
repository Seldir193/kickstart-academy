import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  onClick: () => void;
};

export default function SelectTrigger({ children, onClick }: Props) {
  return (
    <button type="button" className="ks-selectbox__trigger" onClick={onClick}>
      <span className="ks-selectbox__label">{children}</span>
      <span className="ks-selectbox__chevron" aria-hidden="true" />
    </button>
  );
}
