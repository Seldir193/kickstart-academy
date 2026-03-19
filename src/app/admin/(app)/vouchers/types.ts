"use client";

export type VoucherStatus = "all" | "active" | "inactive";

export type Voucher = {
  _id: string;
  code: string;
  amount: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ListResp = {
  ok?: boolean;
  vouchers?: Voucher[];
  error?: string;
};
