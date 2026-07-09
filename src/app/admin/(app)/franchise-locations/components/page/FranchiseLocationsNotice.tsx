import type { PageState } from "./types";

export default function FranchiseLocationsNotice({ p }: { p: PageState }) {
  if (!p.notice) return null;
  return <div className={`toast ${p.notice.type}`}>{p.notice.text}</div>;
}
