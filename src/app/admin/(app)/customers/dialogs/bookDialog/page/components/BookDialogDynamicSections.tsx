import BookDialogCampSection from "./BookDialogCampSection";
import BookDialogOneTimeSection from "./BookDialogOneTimeSection";
import BookDialogPowertrainingSection from "./BookDialogPowertrainingSection";
import BookDialogWeeklySection from "./BookDialogWeeklySection";
import type { BookDialogController } from "../types";

type Props = { controller: BookDialogController };

export default function BookDialogDynamicSections({ controller }: Props) {
  return <div className="book-dialog__dynamic"><BookDialogCampSection controller={controller} /><BookDialogPowertrainingSection controller={controller} /><BookDialogOneTimeSection controller={controller} /><BookDialogWeeklySection controller={controller} /></div>;
}
