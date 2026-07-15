import Editor from "../../Editor";
import { MAX_CONTENT_CHARS } from "../constants";
import {
  boldSnippet,
  bulletSnippet,
  headingSnippet,
  orderedSnippet,
  quoteSnippet,
} from "../snippets";
import type { DialogComponentProps } from "./types";

export default function NewsContentField({ state, t }: DialogComponentProps) {
  return (
    <div className="field field--full">
      <ContentLabel t={t} />
      <ContentMeta count={state.metrics.contentLen} t={t} />
      <NewsEditor state={state} t={t} />
    </div>
  );
}

function ContentLabel({ t }: Pick<DialogComponentProps, "t">) {
  return (
    <label className="dialog-label">
      {t("common.admin.news.dialog.articleContent")}
    </label>
  );
}

function NewsEditor({ state, t }: DialogComponentProps) {
  return (
    <Editor
      value={state.form.content || ""}
      onChange={state.actions.setContent}
      onInsertTemplate={state.actions.insertTemplate}
      onBold={() => state.actions.insertSnippet(boldSnippet(t))}
      onH2={() => state.actions.insertSnippet(headingSnippet(t))}
      onUl={() => state.actions.insertSnippet(bulletSnippet(t))}
      onOl={() => state.actions.insertSnippet(orderedSnippet(t))}
      onQuote={() => state.actions.insertSnippet(quoteSnippet(t))}
    />
  );
}

export function ContentMeta({
  count,
  t,
}: {
  count: number;
  t: DialogComponentProps["t"];
}) {
  return (
    <div className="news-dialog__content-meta">
      {count.toLocaleString()} / {MAX_CONTENT_CHARS.toLocaleString()}{" "}
      {t("common.admin.news.dialog.characters")}
    </div>
  );
}
