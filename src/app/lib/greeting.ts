export function dayGreeting(d = new Date(), locale = "en-US") {
  const hour = d.getHours();
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function firstNameOf(fullName: string) {
  const n = (fullName || "").trim();
  if (!n) return "";
  return n.split(/\s+/)[0];
}

// export function dayGreeting(d = new Date(), locale = "en-US") {
//   const hour = d.getHours();
//   if (hour < 11) return "Good morning";
//   if (hour < 17) return "Good afternoon";
//   return "Good evening";
// }

// export function firstNameOf(fullName: string) {
//   const n = (fullName || "").trim();
//   if (!n) return "";
//   return n.split(/\s+/)[0];
// }
