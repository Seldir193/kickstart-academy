import type { NewsDialogProps, Translate } from "./types";
import type { useNewsDialogState } from "./useNewsDialogState";
import NewsDialogHeader from "./components/NewsDialogHeader";
import NewsDialogBody from "./components/NewsDialogBody";
import NewsDialogFooter from "./components/NewsDialogFooter";

type Props = {
  props: NewsDialogProps;
  state: ReturnType<typeof useNewsDialogState>;
  t: Translate;
};

export default function NewsDialogView({ props, state, t }: Props) {
  return (
    <div
      className="dialog-backdrop news-dialog"
      role="dialog"
      aria-modal="true"
    >
      <BackdropHit props={props} t={t} />
      <DialogPanel props={props} state={state} t={t} />
    </div>
  );
}

function BackdropHit({ props, t }: Pick<Props, "props" | "t">) {
  return (
    <button
      type="button"
      className="dialog-backdrop-hit news-dialog__backdrop-hit"
      aria-label={t("common.close")}
      onClick={props.onClose}
    />
  );
}

function DialogPanel({ props, state, t }: Props) {
  return (
    <div className="dialog news-dialog__dialog">
      <NewsDialogHeader props={props} state={state} t={t} />
      <NewsDialogBody state={state} t={t} />
      <NewsDialogFooter props={props} state={state} t={t} />
    </div>
  );
}
