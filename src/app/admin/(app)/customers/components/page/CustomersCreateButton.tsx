type Props = { label: string; onClick: () => void };

export default function CustomersCreateButton({ label, onClick }: Props) {
  return <div className="ks-customers-toolbar__action"><button className="btn" onClick={onClick}><img src="/icons/plus.svg" alt="" aria-hidden="true" className="btn__icon" />{label}</button></div>;
}
