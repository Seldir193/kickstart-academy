import { formatDateOnly } from "../../../utils/dateFormat";

export function fmtDate(value?: string, lang?: string) {
  if (!value) return "—";
  return formatDateOnly(value, lang);
}
