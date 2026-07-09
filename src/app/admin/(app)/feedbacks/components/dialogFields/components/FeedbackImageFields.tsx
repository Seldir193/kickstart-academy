import { useRef, useState } from "react";
import FeedbackImageUrlField from "./FeedbackImageUrlField";
import FeedbackUploadControl from "./FeedbackUploadControl";
import type { FeedbackDialogFieldsProps } from "../types";

export default function FeedbackImageFields(props: FeedbackDialogFieldsProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const onPickFile = useUploadPicker(props.uploadImage, inputRef, setFileName);
  return (
    <>
      <FeedbackImageUrlField {...props} />
      <FeedbackUploadControl inputRef={inputRef} fileName={fileName} onPickFile={onPickFile} />
    </>
  );
}

function useUploadPicker(uploadImage: (file?: File) => Promise<void>, inputRef: React.RefObject<HTMLInputElement | null>, setFileName: (name: string) => void) {
  return async (file?: File) => {
    setFileName(file?.name || "");
    await uploadImage(file);
    if (inputRef.current) inputRef.current.value = "";
  };
}
