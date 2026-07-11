export type RowMode =
  | "mine_pending"
  | "mine_approved"
  | "mine_rejected"
  | "provider_pending"
  | "provider_approved"
  | "provider_rejected";

export type Action = {
  key: string;
  icon: string;
  title: string;
  left?: boolean;
  disabled: boolean;
  tip?: string;
  run: () => void | Promise<void>;
};

export type TFn = (key: string) => string;

export type StatusParts = {
  main: string;
  sub: string;
  hint: string;
};
