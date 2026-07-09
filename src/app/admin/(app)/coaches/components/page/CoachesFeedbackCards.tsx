"use client";

export default function CoachesFeedbackCards({
  error,
  notice,
}: {
  error?: string | null;
  notice?: string | null;
}) {
  return (
    <>
      {error ? <FeedbackCard message={error} role="alert" /> : null}
      {notice ? <FeedbackCard message={notice} role="status" /> : null}
    </>
  );
}

function FeedbackCard({ message, role }: { message: string; role: "alert" | "status" }) {
  return (
    <div className="card" role={role}>
      <div className="text-red-600">{message}</div>
    </div>
  );
}
