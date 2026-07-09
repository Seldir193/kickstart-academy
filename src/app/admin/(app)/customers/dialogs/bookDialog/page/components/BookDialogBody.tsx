import BookDialogDynamicSections from "./BookDialogDynamicSections";
import BookDialogFamilySection from "./BookDialogFamilySection";
import BookDialogSelectionSection from "./BookDialogSelectionSection";
import BookDialogStatusSection from "./BookDialogStatusSection";
import type { BookDialogController } from "../types";

type Props = { controller: BookDialogController };

export default function BookDialogBody({ controller }: Props) {
  return <div className="dialog-body book-dialog__body book-form"><BookDialogStatusSection controller={controller} /><BookDialogFamilySection controller={controller} /><BookDialogSelectionSection controller={controller} /><BookDialogDynamicSections controller={controller} /></div>;
}
