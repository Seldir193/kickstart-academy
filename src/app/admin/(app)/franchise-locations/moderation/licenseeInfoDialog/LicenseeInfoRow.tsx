import { displayValue } from "./licenseeInfoDialog.helpers";

type Props = {
  label: string;
  value: unknown;
  mono?: boolean;
  multiline?: boolean;
};

export default function LicenseeInfoRow({ label, value, mono, multiline }: Props) {
  return (
    <div className={`fl-info__row ${multiline ? "is-multiline" : ""}`}>
      <div className="dialog-label">{label}</div>
      <div className={`dialog-value ${mono ? "is-mono" : ""}`}>
        {displayValue(value)}
      </div>
    </div>
  );
}
