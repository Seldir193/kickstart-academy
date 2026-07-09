export function pagesFor(total: number, limit: number) {
  return Math.max(1, Math.ceil(total / limit));
}
