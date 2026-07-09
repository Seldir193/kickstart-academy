"use client";

import BookDialogView from "./components/BookDialogView";
import { useBookDialogController } from "./hooks/useBookDialogController";
import type { BookDialogProps } from "./types";

export default function BookDialogContent(props: BookDialogProps) {
  const controller = useBookDialogController(props);
  return <BookDialogView controller={controller} onClose={props.onClose} />;
}
