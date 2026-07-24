function isPlainObject(v: unknown) {
  return Boolean(v) && typeof v === "object" && !Array.isArray(v);
}

export function toObject(v: unknown) {
  return isPlainObject(v) ? { ...(v as Record<string, unknown>) } : {};
}

export function hasOwn(obj: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

export function toBool(v: unknown) {
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "true" || s === "1") return true;
    if (s === "false" || s === "0") return false;
  }
  return Boolean(v);
}

export function stripProviderFields(body: unknown) {
  const next = toObject(body);

  delete next.submitForReview;
  delete next.published;

  delete next.status;
  delete next.rejectionReason;
  delete next.rejectedAt;
  delete next.approvedAt;
  delete next.liveUpdatedAt;
  delete next.draftUpdatedAt;
  delete next.submittedAt;
  delete next.moderatedAt;
  delete next.owner;

  delete next.hasDraft;
  delete next.draft;
  delete next.lastProviderEditAt;
  delete next.lastSuperEditAt;

  return next;
}
