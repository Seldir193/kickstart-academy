// app/book/bookUtils.ts
import type { Offer } from './bookTypes';

export const DAY_ALIASES: Record<string, string> = {
  m: 'Mo',
  mo: 'Mo',
  montag: 'Mo',
  monday: 'Mo',
  mon: 'Mo',
  di: 'Di',
  dienstag: 'Di',
  tuesday: 'Di',
  tue: 'Di',
  mi: 'Mi',
  mittwoch: 'Mi',
  wednesday: 'Mi',
  wed: 'Mi',
  do: 'Do',
  donnerstag: 'Do',
  thursday: 'Do',
  thu: 'Do',
  fr: 'Fr',
  freitag: 'Fr',
  friday: 'Fr',
  fri: 'Fr',
  sa: 'Sa',
  samstag: 'Sa',
  saturday: 'Sa',
  sat: 'Sa',
  so: 'So',
  sonntag: 'So',
  sunday: 'So',
};

export const DAY_LONG: Record<string, string> = {
  Mo: 'Montag',
  Di: 'Dienstag',
  Mi: 'Mittwoch',
  Do: 'Donnerstag',
  Fr: 'Freitag',
  Sa: 'Samstag',
  So: 'Sonntag',
};

export const normDay = (v?: string) =>
  v ? DAY_ALIASES[String(v).trim().toLowerCase()] || v : '';

export const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;

export function calcAge(y?: string, m?: string, d?: string): number | null {
  const yy = parseInt(String(y || ''), 10);
  const mm = parseInt(String(m || ''), 10);
  const dd = parseInt(String(d || ''), 10);
  if (!yy || !mm || !dd) return null;
  const birth = new Date(yy, mm - 1, dd);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - yy;
  const mdiff = today.getMonth() - (mm - 1);
  if (mdiff < 0 || (mdiff === 0 && today.getDate() < dd)) age--;
  return age;
}

export function parseISODate(v?: string) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

export function formatDE(d: Date) {
  return d.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function buildRangeText(
  offerFrom?: string,
  offerTo?: string,
  urlFrom?: string,
  urlTo?: string,
) {
  const from = parseISODate(offerFrom || urlFrom || '');
  const to = parseISODate(offerTo || urlTo || '');
  if (!from && !to) return '';
  if (from && to) return `${formatDE(from)} – ${formatDE(to)}`;
  if (from) return formatDE(from);
  return formatDE(to!);
}

export function extractEmail(s?: string) {
  const m = String(s || '').match(EMAIL_RE);
  return m ? m[0] : '';
}

export function splitName(s?: string) {
  const t = String(s || '').trim();
  if (!t) return { first: '—', last: '' };
  const parts = t.split(/\s+/);
  return { first: parts[0], last: parts.slice(1).join(' ') };
}

export function normalizeCoachSrc(src?: string) {
  if (!src) return '';
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith('/api/uploads/coach/')) return src;
  if (/^\/?uploads\/coach\//i.test(src))
    return src.startsWith('/') ? `/api${src}` : `/api/${src}`;
  if (/^[\w.\-]+\.(png|jpe?g|webp|gif)$/i.test(src))
    return `/api/uploads/coach/${src}`;
  return src;
}

export function getCoachAvatar(o?: Offer) {
  const direct =
    o?.coachImage ||
    o?.coachPhoto ||
    o?.coachAvatar ||
    o?.coachPic ||
    o?.coachImg;
  return normalizeCoachSrc(direct);
}

export function deriveCoach(o?: Offer) {
  const full =
    o?.coachName ||
    o?.coach ||
    [o?.coachFirst, o?.coachLast].filter(Boolean).join(' ');
  const { first, last } = splitName(full);
  const email =
    o?.coachEmail || o?.contactEmail || o?.email || extractEmail(o?.info) || '';
  const avatar = getCoachAvatar(o);
  return { first, last, email, avatar };
}

export function normCategory(o?: Offer | null) {
  return (o?.category || '').replace(/\s+/g, '').toLowerCase();
}

export function isWeeklyCourse(o?: Offer | null) {
  const cat = normCategory(o);
  return cat === 'weekly' || cat === 'weeklycourses';
}

export function isHolidayProgram(o?: Offer | null) {
  const cat = normCategory(o);
  return cat === 'holiday' || cat === 'holidayprograms';
}

export function isIndividualCourse(o?: Offer | null) {
  const cat = normCategory(o);
  return cat === 'individual' || cat === 'individualcourses';
}

export function isNonTrialProgram(o?: Offer | null) {
  const t = (o?.type || '').toLowerCase();
  const c = (o?.category || '').toLowerCase();
  const isRentACoach = t.startsWith('rentacoach') || c === 'rentacoach';
  const isClubProgram = t.startsWith('clubprogram') || c === 'clubprograms';
  const isCoachEducation =
    t.startsWith('coacheducation') || c === 'coacheducation';
  return isRentACoach || isClubProgram || isCoachEducation;
}

export function isPowertraining(o?: Offer | null) {
  const cat = normCategory(o);
  const st = (o?.sub_type || '').toLowerCase();
  return cat === 'holiday' && st === 'powertraining';
}
