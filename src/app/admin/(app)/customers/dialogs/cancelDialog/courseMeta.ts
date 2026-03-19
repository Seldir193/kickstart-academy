//src\app\admin\(app)\customers\dialogs\cancelDialog\courseMeta.ts

type CourseMeta = {
  mode: "type" | "subtype";
  value: string;
  label: string;
  category?: string;
};

export function buildCourseMeta(grouped: any[]) {
  const m = new Map<string, CourseMeta>();
  for (const g of grouped) for (const it of g.items) m.set(it.value, it as any);
  return m;
}

export function isNonCancelableCourseValue(
  courseValue: string,
  meta: Map<string, CourseMeta>,
) {
  if (!courseValue) return false;
  const opt = meta.get(courseValue);
  if (!opt) return false;
  if (opt.value === "CoachEducation") return true;
  if (opt.category === "RentACoach") return true;
  return looksLikeRentACoach(opt.label);
}

function norm(s: string) {
  return (s || "")
    .replace(/[Ää]/g, "ae")
    .replace(/[Öö]/g, "oe")
    .replace(/[Üü]/g, "ue")
    .replace(/ß/g, "ss")
    .toLowerCase();
}

function softNorm(s: string) {
  return norm(s).replace(/[\s\-\._]/g, "");
}

function looksLikeRentACoach(s: string) {
  const n = softNorm(s);
  return n.includes("rent") && n.includes("coach");
}
