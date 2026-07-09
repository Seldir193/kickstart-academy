import type { MessageLine, Translate } from "../types";

const replacements = [
  [/\s*,\s*Geburtstag:/gi, "birthday"],
  [/\s*,\s*Kontakt:/gi, "contact"],
  [/\s*,\s*Adresse:/gi, "address"],
  [/\s*,\s*Telefon:/gi, "phone"],
  [/\s*,\s*Gutschein:/gi, "voucher"],
  [/\s*,\s*Quelle:/gi, "source"],
  [/\s*,\s*Kind:/gi, "child"],
] as const;

export function safeText(v: unknown) {
  return String(v ?? "").trim();
}

export function regularCourseLineFromSchedule(value: unknown) {
  return safeText(value).replace(/^jeden\s+/i, "");
}

export function splitLabelValue(line: string) {
  const i = line.indexOf(":");
  if (i === -1) return { value: line };
  return { label: line.slice(0, i).trim(), value: line.slice(i + 1).trim() };
}

export function toMessageLine(raw: string): MessageLine {
  const { label, value } = splitLabelValue(raw);
  return { label, value, raw };
}

export function messageToLines(msg: string | undefined, t: Translate) {
  if (!msg) return [];
  return normalizeMessage(msg, t).split("\n").map((s) => s.trim()).filter(Boolean);
}

export function normalizeMessage(msg: string, t: Translate) {
  return withRegistrationText(withFieldBreaks(msg.trim(), t), t);
}

function withFieldBreaks(text: string, t: Translate) {
  return replacements.reduce((value, [pattern, key]) => {
    return value.replace(pattern, `\n${messageKey(key, t)}:`);
  }, text);
}

function withRegistrationText(text: string, t: Translate) {
  return text.replace(/^\s*Anmeldung\b/i, messageKey("registration", t));
}

function messageKey(key: string, t: Translate) {
  return t(`common.admin.bookings.dialog.message.${key}`);
}
