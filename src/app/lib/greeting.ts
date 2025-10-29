// src/app/lib/greeting.ts
export function dayGreeting(d = new Date(), locale = 'de-DE') {
  const hour = d.getHours();
  if (hour < 11) return 'Guten Morgen';
  if (hour < 17) return 'Guten Tag';
  return 'Guten Abend';
}

export function firstNameOf(fullName: string) {
  const n = (fullName || '').trim();
  if (!n) return '';
  return n.split(/\s+/)[0];
}
