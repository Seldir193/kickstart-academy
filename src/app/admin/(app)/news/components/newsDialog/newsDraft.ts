import type { News } from "../../types";

type DraftNews = News & {
  hasDraft?: boolean;
  draft?: Partial<News>;
};

function hasDraftValue(news: DraftNews) {
  return news.hasDraft && news.draft && typeof news.draft === "object";
}

export function mergeDraftIntoItem(news: News) {
  const item = news as DraftNews;
  return hasDraftValue(item) ? ({ ...news, ...item.draft } as News) : news;
}
