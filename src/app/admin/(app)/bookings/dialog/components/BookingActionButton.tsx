type Props = {
  busy: string;
  action: string;
  label: string;
  waitLabel: string;
  onClick: () => void;
  className?: string;
};

export default function BookingActionButton({
  busy,
  action,
  label,
  waitLabel,
  onClick,
  className = "btn",
}: Props) {
  return (
    <button
      type="button"
      className={className}
      aria-disabled={busy ? true : undefined}
      onClick={onClick}
    >
      {busy === action ? waitLabel : label}
    </button>
  );
}
