import { clean, draftOf } from "./pendingNewsList.helpers";
import type { PendingNews } from "./pendingNewsList.types";

type Props = {
  news: PendingNews;
  baseTitle: string;
  baseExcerpt: string;
  baseCategory: string;
  t: (key: string) => string;
};

function DraftLine({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="news-list__draft">
      <span className="news-list__draft-label">{label}:</span> {value}
    </div>
  );
}

export default function PendingNewsDraft(props: Props) {
  const draft = draftOf(props.news);
  if (!draft) return null;
  const title = clean(draft.title);
  const excerpt = clean(draft.excerpt);
  const category = clean(draft.category);
  return (
    <div className="news-list__draft-wrap">
      <DraftLine
        label={props.t("common.admin.news.pendingList.titleChange")}
        value={title !== props.baseTitle ? title : ""}
      />
      <DraftLine
        label={props.t("common.admin.news.pendingList.leadChange")}
        value={excerpt !== props.baseExcerpt ? excerpt : ""}
      />
      <DraftLine
        label={props.t("common.admin.news.pendingList.categoryChange")}
        value={category !== props.baseCategory ? category : ""}
      />
    </div>
  );
}
