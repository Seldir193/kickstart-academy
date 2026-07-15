import type { DialogComponentProps } from "./types";
import NewsBasicFields from "./NewsBasicFields";
import NewsCoverFields from "./NewsCoverFields";
import NewsContentField from "./NewsContentField";
import NewsTranslationsSection from "./NewsTranslationsSection";
import NewsMediaSection from "./NewsMediaSection";
import NewsPublishField from "./NewsPublishField";

export default function NewsDialogBody({ state, t }: DialogComponentProps) {
  return (
    <div className="dialog-body news-dialog__body">
      <NewsDialogError state={state} />
      <NewsDialogGrid state={state} t={t} />
    </div>
  );
}

function NewsDialogError({ state }: Pick<DialogComponentProps, "state">) {
  return state.error ? (
    <div className="error news-dialog__error">{state.error}</div>
  ) : null;
}

function NewsDialogGrid({ state, t }: DialogComponentProps) {
  return (
    <div className="news-dialog__grid">
      <NewsBasicFields state={state} t={t} />
      <NewsCoverFields state={state} t={t} />
      <NewsContentField state={state} t={t} />
      <NewsTranslationsSection state={state} t={t} />
      <NewsMediaSection state={state} t={t} />
      <NewsPublishField state={state} t={t} />
    </div>
  );
}
