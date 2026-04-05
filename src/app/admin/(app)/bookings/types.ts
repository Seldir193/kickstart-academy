//src\app\admin\(app)\bookings\types.ts
"use client";

export type Status =
  | "pending"
  | "processing"
  | "confirmed"
  | "cancelled"
  | "deleted";
export type StatusOrAll = Status | "all";

export type ProgramFilter =
  | "all"
  | "weekly_foerdertraining"
  | "weekly_kindergarten"
  | "weekly_goalkeeper"
  | "weekly_development_athletik"
  | "ind_1to1"
  | "ind_1to1_athletik"
  | "ind_1to1_goalkeeper"
  | "club_rentacoach"
  | "club_trainingcamps"
  | "club_coacheducation";

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
  offerId?: string;

  offerTitle?: string;
  offerType?: string;
  venue?: string;
  source?: string;
  invoiceNumber?: string;
  invoiceNo?: string;
  invoiceDate?: string | null;
  detail?: BookingDetail;

  paymentStatus?: "open" | "paid" | "returned";
  paidAt?: string | null;
  returnedAt?: string | null;
  meta?: {
    subscriptionEligible?: boolean;
    subscriptionEligibleAt?: string | null;

    paymentApprovalRequired?: boolean;
    paymentApprovedAt?: string | null;
    paymentApprovalReason?: string;
    paymentApprovedEmailSentAt?: string | null;
  };
};

export type BookingDetail = {
  child?: {
    firstName?: string;
    lastName?: string;
    gender?: string;
    birthDate?: string | null;
  } | null;
  parent?: {
    salutation?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  } | null;
  contact?: string;
  address?: string;
} | null;

export type ListResp = {
  ok?: boolean;
  items?: Booking[];
  bookings?: Booking[];
  total?: number;
  page?: number;
  limit?: number;
  pages?: number;
  counts?: Partial<Record<Status, number>>;
  error?: string;
};
