export type Counts = {
  positive?: number[];
  storno?: number[];
};

export type RevenueResponse = {
  ok: boolean;
  year: number;
  total: number;
  monthly: number[];
  counts?: Counts;
};

export type SourceMode = "invoices" | "derived";

export type YearlyRow = {
  name: string;
  total: number;
  count?: number;
  stornoCount?: number;
};

export type MonthRow = {
  index: number;
  name: string;
  revenue: number;
};

export type RevenueDropdownRefs = {
  sourceRef: React.RefObject<HTMLDivElement | null>;
  yearRef: React.RefObject<HTMLDivElement | null>;
  monthRef: React.RefObject<HTMLDivElement | null>;
  yearViewRef: React.RefObject<HTMLDivElement | null>;
};
