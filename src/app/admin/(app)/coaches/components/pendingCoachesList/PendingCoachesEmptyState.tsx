type Props = {
  text: string;
};

export default function PendingCoachesEmptyState({ text }: Props) {
  return (
    <section className="card">
      <div className="card__empty">{text}</div>
    </section>
  );
}
