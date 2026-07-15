import type { KeyboardEvent, MouseEvent } from "react";
import type { TFunction } from "i18next";
import type { News } from "../../types";
import { clean, isNewsRejected } from "./newsList.helpers";

type Props = {
  news: News;
  hidden: boolean;
  onOpen: (news: News) => void;
  t: TFunction;
};

function stop(event: MouseEvent) {
  event.stopPropagation();
}

function getLabel(news: News, t: TFunction) {
  const title = clean(news.title) || t("common.admin.news.list.defaultTitle");
  const key = isNewsRejected(news) ? "infoAria" : "editAria";
  return t(`common.admin.news.list.${key}`, { title });
}

export default function NewsActionCell({ news, hidden, onOpen, t }: Props) {
  if (hidden) return <HiddenActionCell />;
  const open = (event: MouseEvent) => {
    event.stopPropagation();
    onOpen(news);
  };
  const openKey = (event: KeyboardEvent) =>
    handleActionKey(event, news, onOpen);
  return (
    <div
      className="list__actions news-list__cell news-list__cell--action"
      onClick={open}
      onMouseDown={stop}
    >
      <span
        className="edit-trigger"
        role="button"
        tabIndex={0}
        aria-label={getLabel(news, t)}
        onClick={open}
        onKeyDown={openKey}
      >
        <img
          src={isNewsRejected(news) ? "/icons/info.svg" : "/icons/edit.svg"}
          alt=""
          aria-hidden="true"
          className="icon-img"
        />
      </span>
    </div>
  );
}

function handleActionKey(
  event: KeyboardEvent,
  news: News,
  onOpen: (news: News) => void,
) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  event.stopPropagation();
  onOpen(news);
}

function HiddenActionCell() {
  return (
    <div
      className="list__actions news-list__cell news-list__cell--action news-list__actions--hidden"
      aria-hidden="true"
    />
  );
}
