export default function NewsErrorCard({ error }: { error: string }) {
  if (!error) return null;
  return (
    <div className="card" role="alert">
      <div className="text-red-600">{error}</div>
    </div>
  );
}
