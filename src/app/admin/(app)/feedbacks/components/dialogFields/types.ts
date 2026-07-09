import type { RefObject } from "react";
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

export type FeedbackDialogFieldsProps = {
  draft: Feedback;
  updateFeedback: UpdateFeedback;
  updateLocalizedText: UpdateLocalizedText;
  uploadImage: (file?: File) => Promise<void>;
};

export type BaseFieldProps = Pick<
  FeedbackDialogFieldsProps,
  "draft" | "updateFeedback"
>;

export type UploadControlProps = {
  inputRef: RefObject<HTMLInputElement | null>;
  fileName: string;
  onPickFile: (file?: File) => Promise<void>;
};

export type TextFieldProps = {
  labelKey: string;
  value: string;
  required?: boolean;
  onChange: (value: string) => void;
};
