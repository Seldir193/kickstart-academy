const HEADER_KEYS = [
  "licence",
  "country",
  "city",
  "status",
  "updated",
  "actions",
] as const;

type Props = {
  t: (key: string) => string;
};

function headerClass(key: (typeof HEADER_KEYS)[number]) {
  return key === "actions"
    ? "news-list__h news-list__h--right"
    : "news-list__h";
}

function headerLabel(key: (typeof HEADER_KEYS)[number], t: Props["t"]) {
  return t(`common.admin.franchiseLocations.table.${key}`);
}

export default function LocationsTableHead({ t }: Props) {
  return (
    <div className="news-list__head" aria-hidden="true">
      {HEADER_KEYS.map((key) => (
        <div key={key} className={headerClass(key)}>
          {headerLabel(key, t)}
        </div>
      ))}
    </div>
  );
}
