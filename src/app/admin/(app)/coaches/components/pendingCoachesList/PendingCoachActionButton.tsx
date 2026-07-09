type Props = {
  label: string;
  danger?: boolean;
  disabled: boolean;
  onClick: () => void;
};

export default function PendingCoachActionButton(p: Props) {
  return (
    <button
      type="button"
      className={p.danger ? "btn btn--danger" : "btn"}
      aria-disabled={p.disabled}
      onClick={p.onClick}
    >
      {p.label}
    </button>
  );
}
