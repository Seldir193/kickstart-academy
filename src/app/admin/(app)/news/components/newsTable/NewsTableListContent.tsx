"use client";

import { useTranslation } from "react-i18next";
import type { Props } from "./components/NewsTableListProps";
import type { NewsTableState } from "./hooks/useNewsTableState";
import type { Translate } from "./types";
import { NewsBulkActions } from "./components/NewsBulkActions";
import { NewsTableSection } from "./components/NewsTableSection";
import { useNewsTableState } from "./hooks/useNewsTableState";
import { canShowSwitch } from "./lib/status";

export default function NewsTableListContent(props: Props) {
  const { t, i18n } = useTranslation();
  const state = useNewsTableState(
    props.items,
    props.rowMode,
    props.selectMode,
    props.toggleBtnRef,
  );
  if (!state.viewItems.length)
    return <NewsEmptyCard text={t("common.admin.news.table.empty")} />;
  return (
    <NewsTableLoaded props={props} state={state} t={t} lang={i18n.language} />
  );
}

function NewsEmptyCard({ text }: { text: string }) {
  return (
    <section className="card">
      <div className="card__empty">{text}</div>
    </section>
  );
}

function NewsTableLoaded(args: LoadedProps) {
  const showSwitch = canShowSwitch(args.props.rowMode);
  return (
    <>
      <NewsBulkActions props={args.props} state={args.state} t={args.t} />
      <NewsTableSection {...args} showSwitch={showSwitch} />
    </>
  );
}

type LoadedProps = {
  props: Props;
  state: NewsTableState;
  t: Translate;
  lang: string;
};
