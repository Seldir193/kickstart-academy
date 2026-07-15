type Props = {
  label: string;
  value: string | number;
  full?: boolean;
};

export default function BookingDetailRow({ label, value, full }: Props) {
  const className = full
    ? "booking-dialog__row booking-dialog__row--full"
    : "booking-dialog__row";
  return (
    <div className={className}>
      <div className="dialog-label">{label}</div>
      <div className="dialog-value">{value}</div>
    </div>
  );
}
