import type { Feedback, LocalizedText } from "../../types";

export type UpdateFeedback = <K extends keyof Feedback>(
  key: K,
  value: Feedback[K],
) => void;

export type UpdateLocalizedText = (
  field: "quote" | "meta",
  lang: keyof LocalizedText,
  value: string,
) => void;

export type FeedbackDialogTextFieldsProps = {
  draft: Feedback;
  updateFeedback: UpdateFeedback;
  updateLocalizedText: UpdateLocalizedText;
  uploadImage: (file?: File) => Promise<void>;
};

export type FeedbackBaseFieldsProps = Pick<
  FeedbackDialogTextFieldsProps,
  "draft" | "updateFeedback"
>;
