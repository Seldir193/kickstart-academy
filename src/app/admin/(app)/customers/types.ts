// app/admin/customers/types.ts
export type Address = {
  street?: string;
  houseNo?: string;
  zip?: string;
  city?: string;
};

export type ParentInfo = {
  salutation?: "Frau" | "Herr" | "";
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  phone2?: string;
};

export type ChildInfo = {
  uid?: string;
  firstName?: string;
  lastName?: string;
  gender?: "weiblich" | "männlich" | "";
  birthDate?: string | null;
  club?: string;
};

export type BookingRef = {
  _id?: string;
  bookingId?: string;
  offerId?: string;
  offerTitle?: string;
  offerType?: string;
  venue?: string;
  type?: string;
  date?: string | null;
  status?: "active" | "cancelled" | "completed" | "pending";
  createdAt?: string;
  cancelDate?: string;
  cancelReason?: string;

  invoiceNumber?: string;
  invoiceNo?: string;
  invoiceDate?: string | null;
  cancellationNo?: string;
  stornoNo?: string;

  childUid?: string;
  childFirstName?: string;
  childLastName?: string;

  currency?: string;
  priceAtBooking?: number;
  priceMonthly?: number;
  returnBankFee?: number;
};

export type Customer = {
  _id: string;
  userId?: number;
  newsletter?: boolean;
  address?: Address;
  child?: ChildInfo;
  children?: ChildInfo[];
  parent?: ParentInfo;
  parents?: ParentInfo[];
  notes?: string;
  canceledAt?: string | null;
  createdAt?: string;
  bookings?: BookingRef[];
  marketingProvider?: "mailchimp" | "brevo" | "sendgrid" | null;
  marketingStatus?: "subscribed" | "pending" | "unsubscribed" | "error" | null;
  marketingContactId?: string | null;
  marketingLastSyncedAt?: string | null;
  marketingLastError?: string | null;
  marketingConsentAt?: string | null;

  __activeChildIdx?: number;
  __activeChildUid?: string;
  __familyCreateMode?: string;
};

export type ListResponse = {
  items: Customer[];
  total: number;
  page: number;
  limit: number;
};

export type Offer = {
  _id: string;
  title?: string;
  type?:
    | "Kindergarten"
    | "Foerdertraining"
    | "PersonalTraining"
    | "AthleticTraining"
    | "Athletiktraining"
    | "Camp"
    | string;
  location?: string;
  price?: number;
  days?: string[];
  timeFrom?: string;
  timeTo?: string;
  ageFrom?: number;
  ageTo?: number;
  onlineActive?: boolean;
  category?: string;
  sub_type?: string;
  legacy_type?: string;
};

export type DocumentItem = {
  id: string;
  bookingId: string;
  type: "participation" | "cancellation" | "storno" | "dunning" | string;
  title: string;
  issuedAt?: string;
  status?: string;
  offerTitle?: string;
  offerType?: string;
  href?: string;
  invoiceNo?: string;
  invoiceNumber?: string;
  childUid?: string;
  childFirstName?: string;
  childLastName?: string;
};
