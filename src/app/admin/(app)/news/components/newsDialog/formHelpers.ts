import type { News } from "../../types";
import type { TranslationField } from "./types";
import { MAX_CONTENT_CHARS } from "./constants";
import { defaultI18n } from "./i18nDefaults";

export function tagsFromText(text: string) {
  return text
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function nextContent(value: string) {
  return (value || "").slice(0, MAX_CONTENT_CHARS);
}

export function nextI18n(news: News, field: TranslationField, value: string) {
  const currentI18n = defaultI18n(news.i18n);
  const nextValue = field === "content" ? nextContent(value) : value;
  return { currentI18n, nextValue };
}
