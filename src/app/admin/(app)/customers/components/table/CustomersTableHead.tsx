import type { TFunction } from "i18next";

const columns = [
  "id",
  "child",
  "parent",
  "email",
  "address",
  "newsletter",
  "type",
  "status",
  "edit",
];

function headClass(column: string): string {
  return column === "edit" ? "ks-customers-list__h ks-customers-list__h--right" : "ks-customers-list__h";
}

export default function CustomersTableHead({ t }: { t: TFunction }) {
  return (
    <div className="ks-customers-list__head" aria-hidden="true">
      {columns.map((column) => (
        <div key={column} className={headClass(column)}>
          {t(`admin.customers.table.head.${column}`)}
        </div>
      ))}
    </div>
  );
}
