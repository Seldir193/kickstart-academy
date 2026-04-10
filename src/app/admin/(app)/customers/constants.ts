//src\app\admin\(app)\customers\constants.ts
export const CANCEL_ALLOWED = new Set([
  "Kindergarten",
  "Foerdertraining",
  "Athletiktraining",
  "AthleticTraining",
]);

export const API_ENDPOINTS = {
  createBooking: (customerId: string) =>
    `/api/admin/customers/${encodeURIComponent(customerId)}/bookings`,

  cancelBooking: (customerId: string, bookingId: string) => [
    `/api/admin/customers/${encodeURIComponent(
      customerId,
    )}/bookings/${encodeURIComponent(bookingId)}/cancel`,
  ],

  generateCancellationInvoice: (customerId: string, bookingId: string) => [
    `/api/admin/customers/${encodeURIComponent(
      customerId,
    )}/bookings/${encodeURIComponent(bookingId)}/invoice/cancellation`,
  ],

  sendCancellationEmail: (customerId: string, bookingId: string) => [
    `/api/admin/customers/${encodeURIComponent(
      customerId,
    )}/bookings/${encodeURIComponent(bookingId)}/email/cancellation`,
  ],

  stornoBooking: (customerId: string, bookingId: string) => [
    `/api/admin/customers/${encodeURIComponent(
      customerId,
    )}/bookings/${encodeURIComponent(bookingId)}/storno`,
  ],

  generateStornoInvoice: (customerId: string, bookingId: string) => [
    `/api/admin/customers/${encodeURIComponent(
      customerId,
    )}/bookings/${encodeURIComponent(bookingId)}/invoice/storno`,
  ],

  sendStornoEmail: (customerId: string, bookingId: string) => [
    `/api/admin/customers/${encodeURIComponent(
      customerId,
    )}/bookings/${encodeURIComponent(bookingId)}/email/storno`,
  ],

  listDocuments: (customerId: string, qs: string) =>
    `/api/admin/customers/${encodeURIComponent(customerId)}/documents${
      qs ? `?${qs}` : ""
    }`,

  exportDocumentsCsv: (customerId: string, qs: string) =>
    `/api/admin/customers/${encodeURIComponent(customerId)}/documents.csv${
      qs ? `?${qs}` : ""
    }`,

  listCustomers: (qs: string) => `/api/admin/customers${qs ? `?${qs}` : ""}`,

  getCustomer: (customerId: string) =>
    `/api/admin/customers/${encodeURIComponent(customerId)}`,

  createCustomer: `/api/admin/customers`,

  updateCustomer: (customerId: string) =>
    `/api/admin/customers/${encodeURIComponent(customerId)}`,

  deleteCustomer: (customerId: string) =>
    `/api/admin/customers/${encodeURIComponent(customerId)}`,

  toggleNewsletter: (customerId: string) =>
    `/api/admin/customers/${encodeURIComponent(customerId)}/newsletter`,
};
