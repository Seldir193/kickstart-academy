import BookDialogBody from "./BookDialogBody";
import BookDialogFooter from "./BookDialogFooter";
import BookDialogHeader from "./BookDialogHeader";
import type { BookDialogController } from "../types";

type Props = { controller: BookDialogController; onClose: () => void };

export default function BookDialogView({ controller, onClose }: Props) {
  return (
    <div
      className="dialog-backdrop book-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-dialog-title"
    >
      <button
        type="button"
        className="dialog-backdrop-hit"
        aria-label={controller.t("common.actions.close")}
        onClick={onClose}
      />
      <div
        className="dialog book-dialog__dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <BookDialogHeader t={controller.t} onClose={onClose} />
        <BookDialogBody controller={controller} />
        <BookDialogFooter controller={controller} />
      </div>
    </div>
  );
}
