import { clean } from "./ids";

const DRAFT_FIELDS = [
  "title",
  "excerpt",
  "content",
  "category",
  "tags",
  "media",
  "date",
  "slug",
];

export function isSubmitted(item: unknown) {
  const record = item as Record<string, unknown> | null;
  return Boolean(clean(record?.submittedAt));
}

export function hasDraftObject(item: unknown) {
  const record = item as Record<string, unknown> | null;
  return record?.hasDraft === true && isRecord(record?.draft);
}

export function draftOf(item: unknown) {
  return hasDraftObject(item) ? getRecord(item)?.draft : null;
}

export function hasDraftAnyField(item: unknown) {
  return hasDraftChanges(item);
}

export function canSubmitForReview(item: unknown) {
  return backendCanSubmitForReview(item);
}

function getRecord(item: unknown) {
  return item as Record<string, unknown> | null;
}

function isRecord(value: unknown) {
  return Boolean(value && typeof value === "object");
}

function statusOf(item: unknown) {
  const status = clean(getRecord(item)?.status);
  return validStatus(status) ? status : "";
}

function validStatus(status: string) {
  return status === "pending" || status === "approved" || status === "rejected";
}

function timeOf(value: unknown) {
  const stamp = clean(value);
  if (!stamp) return 0;
  const time = new Date(stamp).getTime();
  return Number.isFinite(time) ? time : 0;
}

function backendCanSubmitForReview(item: unknown) {
  const record = getRecord(item);
  const status = clean(record?.status);
  if (status === "rejected") return canAfterReject(record);
  if (status === "approved") return canAfterApproval(record);
  return canAfterApproval(record) || Boolean(record?.hasDraft);
}

function canAfterReject(record: Record<string, unknown> | null) {
  const draftUpdatedAt = timeOf(record?.draftUpdatedAt);
  const rejectedAt = timeOf(record?.rejectedAt);
  return Boolean(draftUpdatedAt && rejectedAt && draftUpdatedAt > rejectedAt);
}

function canAfterApproval(record: Record<string, unknown> | null) {
  const draftUpdatedAt = timeOf(record?.draftUpdatedAt);
  const liveUpdatedAt = timeOf(record?.liveUpdatedAt);
  return Boolean(draftUpdatedAt && (!liveUpdatedAt || draftUpdatedAt > liveUpdatedAt));
}

function normStr(value: unknown) {
  const text = clean(value);
  return text.length ? text : null;
}

function normTags(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map(normStr).filter(Boolean).sort();
}

function normMedia(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map(normMediaItem).filter(Boolean).sort(compareMedia);
}

function normMediaItem(item: unknown) {
  if (!isRecord(item)) return null;
  const record = item as Record<string, unknown>;
  const out = buildMediaOut(record);
  return out.url ? out : null;
}

function buildMediaOut(record: Record<string, unknown>) {
  const out: Record<string, unknown> = { url: normStr(record.url) };
  addMediaMeta(out, "type", record.type);
  addMediaMeta(out, "name", record.name);
  addMediaMeta(out, "mime", record.mime);
  return out;
}

function addMediaMeta(out: Record<string, unknown>, key: string, value: unknown) {
  const cleanValue = normStr(value);
  if (cleanValue) out[key] = cleanValue;
}

function compareMedia(a: unknown, b: unknown) {
  const left = String((a as Record<string, unknown>).url);
  const right = String((b as Record<string, unknown>).url);
  return left.localeCompare(right);
}

function normComparableByField(field: string, value: unknown) {
  if (field === "tags") return normTags(value);
  if (field === "media") return normMedia(value);
  if (field === "date") return normStr(value);
  if (typeof value === "string") return normStr(value);
  return value == null ? null : value;
}

function hasDraftChanges(item: unknown) {
  const draft = draftOf(item) as Record<string, unknown> | null;
  if (!draft) return false;
  return DRAFT_FIELDS.some((field) => changedField(item, draft, field));
}

function changedField(item: unknown, draft: Record<string, unknown>, field: string) {
  const live = getRecord(item);
  const left = normComparableByField(field, draft[field]);
  const right = normComparableByField(field, live?.[field]);
  return JSON.stringify(left) !== JSON.stringify(right);
}

export function getReviewStatus(item: unknown) {
  return statusOf(item);
}

export function wasEverApproved(item: unknown) {
  return Boolean(clean(getRecord(item)?.approvedAt));
}
