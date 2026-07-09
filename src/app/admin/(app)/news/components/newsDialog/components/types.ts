import type { useNewsDialogState } from "../useNewsDialogState";
import type { NewsDialogProps, Translate } from "../types";

export type NewsDialogState = ReturnType<typeof useNewsDialogState>;

export type DialogComponentProps = {
  state: NewsDialogState;
  t: Translate;
};

export type DialogHeaderProps = DialogComponentProps & {
  props: NewsDialogProps;
};
