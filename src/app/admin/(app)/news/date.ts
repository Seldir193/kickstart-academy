// src/app/admin/news/date.ts
export function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function normalizeIsoDate(value?: string) {
  return (value || todayIsoDate()).slice(0, 10);
}
