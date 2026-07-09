type Props = {
  t: (key: string) => string;
};

export default function LocationsTableEmptyState({ t }: Props) {
  return (
    <section className="card">
      <div className="card__empty">
        {t("common.admin.franchiseLocations.empty")}
      </div>
    </section>
  );
}
