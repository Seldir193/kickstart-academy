//src\app\components\offer-create-dialog\utils.ts
export function clsx(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

export const normalizeCoachSrc = (src: string) => {
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith("/api/uploads/coach/")) return src;
  if (/^\/?uploads\/coach\//i.test(src)) {
    return src.startsWith("/") ? `/api${src}` : `/api/${src}`;
  }
  if (/^[\w.\-]+\.(png|jpe?g|webp|gif)$/i.test(src)) {
    return `/api/uploads/coach/${src}`;
  }
  return src;
};
