import FeedbackBaseFields from "./components/FeedbackBaseFields";
import FeedbackImageFields from "./components/FeedbackImageFields";
import FeedbackLocalizedFields from "./components/FeedbackLocalizedFields";
import type { FeedbackDialogFieldsProps } from "./types";

export default function FeedbackDialogFieldsContent(props: FeedbackDialogFieldsProps) {
  return (
    <div className="feedback-dialog__grid">
      <FeedbackBaseFields {...props} />
      <FeedbackImageFields {...props} />
      <FeedbackLocalizedFields {...props} />
    </div>
  );
}
