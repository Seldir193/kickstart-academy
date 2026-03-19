//src\app\admin\(app)\online-bookings\types.ts
"use client";

export type Status =
  | "pending"
  | "processing"
  | "confirmed"
  | "cancelled"
  | "deleted";

export type StatusOrAll = Status | "all";
export type ProgramFilter = "all" | "camp" | "power";

export type Booking = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  date: string;
  level: string;
  message?: string;
  createdAt: string;
  status?: Status;
  confirmationCode?: string;
  source?: string;
  offerTitle?: string;
  offerType?: string;
  venue?: string;
  paymentStatus?: "open" | "paid" | "returned";
  paidAt?: string | null;
  returnedAt?: string | null;
  invoiceNumber?: string;
  invoiceNo?: string;
  invoiceDate?: string | null;
  meta?: {
    subscriptionEligible?: boolean;
    subscriptionEligibleAt?: string | null;
    paymentApprovalRequired?: boolean;
    paymentApprovedAt?: string | null;
    paymentApprovalReason?: string;
    paymentApprovedEmailSentAt?: string | null;
  };
};

export type ListResp = {
  ok?: boolean;
  bookings?: Booking[];
  total?: number;
  page?: number;
  limit?: number;
  pages?: number;
  counts?: Partial<Record<Status, number>>;
  error?: string;
};

// //src\app\admin\(app)\online-bookings\types.ts
// "use client";

// export type Status = "confirmed" | "cancelled" | "deleted";
// export type StatusOrAll = Status | "all";
// export type ProgramFilter = "all" | "camp" | "power";

// export type Booking = {
//   _id: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   age: number;
//   date: string;
//   level: string;
//   message?: string;
//   createdAt: string;
//   status?: Status;
//   confirmationCode?: string;

//   source?: string;
//   offerTitle?: string;
//   offerType?: string;
//   venue?: string;
//   paymentStatus?: "open" | "paid" | "returned";
//   meta?: {
//     subscriptionEligible?: boolean;
//     subscriptionEligibleAt?: string | null;
//     paymentApprovalRequired?: boolean;
//     paymentApprovedAt?: string | null;
//     paymentApprovalReason?: string;
//     paymentApprovedEmailSentAt?: string | null;
//   };
// };

// export type ListResp = {
//   ok?: boolean;
//   bookings?: Booking[];
//   total?: number;
//   page?: number;
//   limit?: number;
//   pages?: number;
//   counts?: Partial<Record<Status, number>>;
//   error?: string;
// };
