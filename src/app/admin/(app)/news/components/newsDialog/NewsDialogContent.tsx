import { useTranslation } from "react-i18next";
import type { NewsDialogProps } from "./types";
import { useNewsDialogState } from "./useNewsDialogState";
import NewsDialogView from "./NewsDialogView";

export default function NewsDialogContent(props: NewsDialogProps) {
  const { t } = useTranslation();
  const state = useNewsDialogState(props, t);

  return <NewsDialogView props={props} state={state} t={t} />;
}
