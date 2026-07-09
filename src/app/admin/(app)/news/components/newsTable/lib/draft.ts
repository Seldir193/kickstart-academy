import { clean } from "./ids";
import { getDraftDelta } from "./status";

export function draftLine(label: string, value: string) {
  const cleaned = clean(value);
  if (!cleaned) return null;
  return {
    label,
    value: cleaned,
  };
}

export function titleDraftChanged(item: Record<string, unknown>, label: string) {
  const { draftTitle } = getDraftDelta(item);
  if (!draftTitle || draftTitle === clean(item.title)) return null;
  return draftLine(label, draftTitle);
}

export function excerptDraftChanged(item: Record<string, unknown>, label: string) {
  const { draftExcerpt } = getDraftDelta(item);
  if (!draftExcerpt || draftExcerpt === clean(item.excerpt)) return null;
  return draftLine(label, draftExcerpt);
}

export function categoryDraftChanged(item: Record<string, unknown>) {
  const { draftCategory } = getDraftDelta(item);
  if (!draftCategory || draftCategory === clean(item.category)) return "";
  return draftCategory;
}
