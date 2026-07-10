"use client";

type Props = {
  error: string | null;
};

export default function PlacesError({ error }: Props) {
  if (!error) return null;

  return (
    <div className="card" role="alert">
      <div className="text-red-600">{error}</div>
    </div>
  );
}
