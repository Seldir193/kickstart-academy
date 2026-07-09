import { safeText } from "./text";

const MESSAGE_BREAKS = [
  "Programm",
  "Ferien",
  "Zeitraum",
  "Ausgewählte Tage",
  "T-Shirt-Größe \\(Kind\\)",
  "Torwartschule \\(Kind\\)",
  "Geschwisterkind",
  "Geschlecht \\(Geschwister\\)",
  "Geburtstag \\(Geschwister\\)",
  "Vorname \\(Geschwister\\)",
  "Nachname \\(Geschwister\\)",
  "T-Shirt-Größe \\(Geschwister\\)",
  "Torwartschule \\(Geschwister\\)",
  "Geschwister Name",
  "Kind",
  "Geburtstag",
  "Kontakt",
  "Adresse",
  "Telefon",
  "Gutschein",
  "Quelle",
];

const BREAKERS = MESSAGE_BREAKS.map(
  (label) => new RegExp(`\\s*,\\s*${label}:`, "gi"),
);

export function messageToLines(msg?: string): string[] {
  const normalized = BREAKERS.reduce(normalizeBreak, safeText(msg));
  return normalized.split("\n").map((s) => s.trim()).filter(Boolean);
}

function normalizeBreak(text: string, regex: RegExp, index: number) {
  return text.replace(regex, `\n${MESSAGE_BREAKS[index].replace(/\\/g, "")}:`);
}

export function splitLabelValue(line: string) {
  const i = line.indexOf(":");
  if (i === -1) return { value: line };
  return { label: line.slice(0, i).trim(), value: line.slice(i + 1).trim() };
}

export function toLabelMap(lines: string[]) {
  return lines.reduce<Record<string, string>>(addLabelValue, {});
}

function addLabelValue(acc: Record<string, string>, line: string) {
  const { label, value } = splitLabelValue(line);
  if (label) acc[label.toLowerCase()] = value || "—";
  return acc;
}
