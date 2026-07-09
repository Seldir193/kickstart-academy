import type { Props } from "./NewsTableListProps";
import type { Translate } from "../types";
import type { NewsTableState } from "../hooks/useNewsTableState";
import { NewsTableHead } from "./NewsTableHead";
import { idOf } from "../lib/ids";
import { NewsTableRow } from "./NewsTableRow";

type SectionProps = {
  props: Props;
  state: NewsTableState;
  t: Translate;
  lang: string;
  showSwitch: boolean;
};

export function NewsTableSection({ props, state, t, lang, showSwitch }: SectionProps) {
  return <section className={sectionClass(props.busy)}><div className="news-list__table"><NewsTableHead t={t} /><NewsRows props={props} state={state} t={t} lang={lang} showSwitch={showSwitch} /></div></section>;
}

function NewsRows({ props, state, t, lang, showSwitch }: SectionProps) {
  return <ul className="list list--bleed">{state.viewItems.map((item) => <NewsTableRow key={rowKey(item)} item={item} props={props} state={state} t={t} lang={lang} showSwitch={showSwitch} />)}</ul>;
}

function rowKey(item: unknown) {
  return idOf(item);
}

function sectionClass(busy: boolean) {
  return `card news-list ${busy ? "is-busy" : ""}`;
}
