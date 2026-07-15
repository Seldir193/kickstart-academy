import type { News, NewsTranslation, NewsUploadPurpose } from "../../types";

export type UploadResult = { url: string; mimetype: string };

export type NewsDialogProps = {
  mode: "create" | "edit";
  initial?: News | null;
  onClose: () => void;
  upload: (file: File, purpose: NewsUploadPurpose) => Promise<UploadResult>;
  save: (news: News) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

export type NewsLanguage = "en" | "tr";
export type TranslationField = keyof NewsTranslation;
export type Translate = (key: string) => string;
