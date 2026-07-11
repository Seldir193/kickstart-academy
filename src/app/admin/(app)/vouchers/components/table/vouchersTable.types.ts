import type { RefObject } from "react";
import type { Voucher } from "../../types";

export type VouchersTableListProps = {
  items: Voucher[];
  selectMode: boolean;
  busy: boolean;
  onToggleSelectMode: () => void;
  onOpen: (item: Voucher) => void;
  onDeleteMany: (ids: string[]) => Promise<void>;
  onActivateMany: (ids: string[]) => Promise<void>;
  onDeactivateMany: (ids: string[]) => Promise<void>;
  toggleBtnRef?: RefObject<HTMLButtonElement | null>;
};
