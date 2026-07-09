import type { News } from "../../types";

export type ProviderInfo = {
  id?: string;
  fullName?: string;
  email?: string;
} | null;

export type NewsWithProvider = News & {
  provider?: ProviderInfo;
  providerId?: unknown;
};

export type RowMode =
  | "mine_pending"
  | "mine_approved"
  | "mine_rejected"
  | "provider_approved"
  | "provider_rejected";

export type NewsAction = {
  key: string;
  icon: string;
  title: string;
  left?: boolean;
  disabled: boolean;
  tip?: string;
  run: () => void | Promise<void>;
};

export type StatusParts = {
  main: string;
  sub: string;
  hint: string;
  changeAt: string;
};

export type Translate = (
  key: string,
  options?: Record<string, unknown>,
) => string;
