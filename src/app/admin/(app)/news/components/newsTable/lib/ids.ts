export function clean(value: unknown) {
  return String(value ?? "").trim();
}

export function idOf(item: unknown) {
  const record = item as Record<string, unknown> | null;
  return clean(record?._id || record?.id || record?.slug);
}
