function isPlainObject(value: unknown) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function toObject(value: unknown) {
  return isPlainObject(value) ? { ...(value as Record<string, unknown>) } : {};
}

export function hasOwn(obj: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function normalizeAbsoluteAdminUploadUrl(url: string) {
  return url.replace(
    /^https?:\/\/[^/]+\/api\/admin\/upload\//i,
    "/uploads/news/",
  );
}

function normalizeNewsImageUrl(value: unknown) {
  const url = String(value || "")
    .trim()
    .replaceAll("\\", "/");
  const normalizedUrl = normalizeAbsoluteAdminUploadUrl(url);

  if (!normalizedUrl || normalizedUrl.startsWith("data:image/")) return "";

  if (normalizedUrl.startsWith("/api/admin/upload/")) {
    return normalizedUrl.replace("/api/admin/upload/", "/uploads/news/");
  }

  if (normalizedUrl.startsWith("api/admin/upload/")) {
    return `/${normalizedUrl}`.replace("/api/admin/upload/", "/uploads/news/");
  }

  if (normalizedUrl.startsWith("uploads/news/")) return `/${normalizedUrl}`;

  return normalizedUrl;
}

export function normalizeNewsImages(body: unknown) {
  const next = toObject(body);
  const keys = ["imageUrl", "image", "coverImage", "thumbnail"];

  keys.forEach((key) => {
    if (key in next) next[key] = normalizeNewsImageUrl(next[key]);
  });

  return next;
}

export function stripProviderFields(body: unknown) {
  const next = normalizeNewsImages(body);

  delete next.submitForReview;
  delete next.published;
  delete next.rejectionReason;
  delete next.rejectedAt;
  delete next.rejectedBy;
  delete next.rejectedById;
  delete next.status;

  return next;
}
