import type { Props } from "./NewsTableListProps";
import type { NewsTableState } from "../hooks/useNewsTableState";
import type { NewsWithProvider, Translate } from "../types";

export type RowProps = {
  item: NewsWithProvider;
  props: Props;
  state: NewsTableState;
  t: Translate;
  lang: string;
  showSwitch: boolean;
};
