import type { News, NewsI18n, NewsTranslation } from "../../types";
import { todayIsoDate } from "../../date";
import { ensureNewsDefaults } from "../../news";

function emptyTranslation(): NewsTranslation {
  return { title: "", excerpt: "", content: "" };
}

function mergeTranslation(value?: Partial<NewsTranslation>): NewsTranslation {
  return { ...emptyTranslation(), ...(value || {}) };
}

export function defaultI18n(value?: Partial<NewsI18n>): NewsI18n {
  return {
    en: mergeTranslation(value?.en),
    tr: mergeTranslation(value?.tr),
  };
}

export function withI18nDefaults(news: News): News {
  return { ...news, i18n: defaultI18n(news.i18n) };
}

export function defaultNewsForm() {
  return withI18nDefaults(
    ensureNewsDefaults({ date: todayIsoDate(), published: true }),
  );
}
