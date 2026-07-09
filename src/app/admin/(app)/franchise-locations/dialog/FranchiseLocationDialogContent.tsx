import { useTranslation } from "react-i18next";
import FranchiseLocationDialogView from "./components/FranchiseLocationDialogView";
import { useFranchiseLocationDialogState } from "./hooks/useFranchiseLocationDialogState";
import type { FranchiseLocationDialogProps } from "./types";

export default function FranchiseLocationDialogContent(
  props: FranchiseLocationDialogProps,
) {
  const { t } = useTranslation();
  const model = useFranchiseLocationDialogState(props, t);
  if (!props.open) return null;
  return <FranchiseLocationDialogView props={props} model={model} t={t} />;
}
