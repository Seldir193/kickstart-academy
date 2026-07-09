import type { RefObject, ReactNode } from "react";
import type { News } from "../../types";
import type { useNewsAdminViewModel } from "../useNewsAdminViewModel";

export type NewsAdminViewModel = ReturnType<typeof useNewsAdminViewModel>;

export type SelectMode = boolean;

export type NewsSectionProps = {
  titleKey: string;
  meta: string;
  page: number;
  pages: number;
  onPrev: () => void;
  onNext: () => void;
  children: ReactNode;
};

export type NewsTableSectionProps = {
  p: NewsAdminViewModel;
  titleKey: string;
  meta: string;
  page: number;
  pages: number;
  onPrev: () => void;
  onNext: () => void;
  children: ReactNode;
};

export type DeleteDialogState = {
  open: boolean;
  target: News | null;
  openDelete: (item: News) => void;
  closeDelete: () => void;
  confirmDelete: () => Promise<void>;
  deleteName: (item: News | null) => string;
};

export type ToggleRef = RefObject<HTMLButtonElement | null>;
