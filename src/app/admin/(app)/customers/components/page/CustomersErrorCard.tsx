type Props = { error: string | null; t: (key: string) => string };

export default function CustomersErrorCard({ error, t }: Props) {
  if (!error) return null;
  return (
    <div
      className="card text-red-600"
      role="alert"
      aria-label={t("admin.customers.page.error.ariaLabel")}
    >
      {error}
    </div>
  );
}
