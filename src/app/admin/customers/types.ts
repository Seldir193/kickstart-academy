// app/admin/customers/types.ts
export type Address = { street?: string; houseNo?: string; zip?: string; city?: string };
export type ParentInfo = { salutation?: 'Frau'|'Herr'|''; firstName?: string; lastName?: string; email?: string; phone?: string; phone2?: string };
export type ChildInfo  = { firstName?: string; lastName?: string; gender?: 'weiblich'|'männlich'|''; birthDate?: string|null; club?: string };

export type BookingRef = {
  _id?: string;
  offerId?: string;
  offerTitle?: string;
  type?: string;
  date?: string|null; // start/wish date
  status?: 'active'|'cancelled'|'completed'|'pending';
  createdAt?: string;
  cancelDate?: string;
  cancelReason?: string;
};

export type Customer = {
  _id: string;
  userId?: number;
  newsletter?: boolean;
  address?: Address;
  child?: ChildInfo;
  parent?: ParentInfo;
  notes?: string;
  canceledAt?: string|null;
  createdAt?: string;
  bookings?: BookingRef[];
};

export type ListResponse = { items: Customer[]; total: number; page: number; limit: number };

export type Offer = {
  _id: string;
  title?: string;
  type?: 'Kindergarten'|'Foerdertraining'|'PersonalTraining'|'AthleticTraining'|'Athletiktraining'|'Camp'|string;
  location?: string;
  price?: number;       // monthly price
  days?: string[];
  timeFrom?: string;
  timeTo?: string;
  ageFrom?: number;
  ageTo?: number;
  onlineActive?: boolean;

  // ---- added to match backend fields (used by Book/Cancel/Storno) ----
  category?: string;     // e.g. 'Weekly' | 'Holiday' | 'Individual' | 'ClubPrograms' | 'RentACoach'
  sub_type?: string;     // e.g. 'Torwarttraining', 'Foerdertraining_Athletik', ...
  legacy_type?: string;  // mirrors old 'type' if present
};

export type DocumentItem = {
  id: string;                    // bookingId:type
  bookingId: string;
  type: 'participation'|'cancellation'|'storno';
  title: string;
  issuedAt?: string;
  status?: string;
  offerTitle?: string;
  offerType?: string;
  href?: string;                 // Next proxy to open PDF (POST behind the scenes)
};

export const CANCEL_ALLOWED = new Set(['Kindergarten', 'Foerdertraining', 'Athletiktraining', 'AthleticTraining']);

/** Centralized API endpoints */
export const API_ENDPOINTS = {
  // Bookings
  createBooking: (customerId: string) =>
    `/api/admin/customers/${encodeURIComponent(customerId)}/bookings`,

  // Cancel
  cancelBooking: (customerId: string, bookingId: string) => ([
    `/api/admin/customers/${encodeURIComponent(customerId)}/bookings/${encodeURIComponent(bookingId)}/cancel`,
  ]),
  generateCancellationInvoice: (customerId: string, bookingId: string) => ([
    `/api/admin/customers/${encodeURIComponent(customerId)}/bookings/${encodeURIComponent(bookingId)}/invoice/cancellation`,
  ]),
  sendCancellationEmail: (customerId: string, bookingId: string) => ([
    `/api/admin/customers/${encodeURIComponent(customerId)}/bookings/${encodeURIComponent(bookingId)}/email/cancellation`,
  ]),

  // Storno
  stornoBooking: (customerId: string, bookingId: string) => ([
    `/api/admin/customers/${encodeURIComponent(customerId)}/bookings/${encodeURIComponent(bookingId)}/storno`,
  ]),
  generateStornoInvoice: (customerId: string, bookingId: string) => ([
    `/api/admin/customers/${encodeURIComponent(customerId)}/bookings/${encodeURIComponent(bookingId)}/invoice/storno`,
  ]),
  sendStornoEmail: (customerId: string, bookingId: string) => ([
    `/api/admin/customers/${encodeURIComponent(customerId)}/bookings/${encodeURIComponent(bookingId)}/email/storno`,
  ]),

  // Documents (paginated + csv)
  listDocuments: (customerId: string, qs: string) =>
    `/api/admin/customers/${encodeURIComponent(customerId)}/documents${qs ? `?${qs}` : ''}`,
  exportDocumentsCsv: (customerId: string, qs: string) =>
    `/api/admin/customers/${encodeURIComponent(customerId)}/documents.csv${qs ? `?${qs}` : ''}`,
};

















