import type { NewsWithProvider } from "../types";
import { providerLabel } from "../lib/status";

export function NewsAuthorCell({ item }: { item: NewsWithProvider }) {
  return <div className="news-list__cell news-list__cell--author"><span className="news-list__author">{providerLabel(item)}</span></div>;
}
