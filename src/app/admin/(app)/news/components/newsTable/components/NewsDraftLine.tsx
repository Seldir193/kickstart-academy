import { clean } from "../lib/ids";

export function NewsDraftLine({ label, value }: { label: string; value: string }) {
  const cleaned = clean(value);
  if (!cleaned) return null;
  return <div className="news-list__draft"><span className="news-list__draft-label">{label}:</span> {cleaned}</div>;
}
