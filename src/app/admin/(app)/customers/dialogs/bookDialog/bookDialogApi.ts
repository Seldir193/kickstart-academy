//src\app\admin\(app)\customers\dialogs\bookDialog\bookDialogApi.ts
import type { Customer } from "../../types";
import type { FamilyResponse } from "./types";

type CampExtras = {
  holidayLabel?: string;
  holidayFrom?: string;
  holidayTo?: string;
  childGender?: string;
  voucher?: string;
  source?: string;
  mainTShirtSize?: string;
  mainGoalkeeperSchool?: boolean;
  hasSibling?: boolean;
  siblingGender?: string;
  siblingBirthDate?: string;
  siblingFirstName?: string;
  siblingLastName?: string;
  siblingTShirtSize?: string;
  siblingGoalkeeperSchool?: boolean;
};

export async function fetchOffers() {
  const res = await fetch(`/api/admin/offers?limit=500`, {
    cache: "no-store",
    credentials: "include",
  });

  if (!res.ok) throw new Error(`Failed to load offers (${res.status})`);
  const data = await res.json();

  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data)) return data;
  return [];
}

export async function fetchFamily(customerId: string) {
  const res = await fetch(
    `/api/admin/customers/${encodeURIComponent(customerId)}/family`,
    { cache: "no-store", credentials: "include" },
  );

  const data: FamilyResponse = await res.json().catch(() => ({}) as any);

  if (!res.ok || data.ok === false) {
    throw new Error(data.error || `Failed to load family (${res.status})`);
  }

  return data;
}

export async function createBooking(
  customerId: string,
  offerId: string,
  date: string,
  child: { uid: string; firstName: string; lastName: string },
  selectedParent: {
    salutation?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    phone2?: string;
  } | null,
  extras: CampExtras = {},
) {
  const res = await fetch(
    `/api/admin/customers/${encodeURIComponent(customerId)}/bookings`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      cache: "no-store",
      body: JSON.stringify({
        offerId,
        date,
        childUid: child.uid,
        childFirstName: child.firstName,
        childLastName: child.lastName,
        invoiceTo: selectedParent
          ? {
              parent: {
                salutation: selectedParent.salutation || "",
                firstName: selectedParent.firstName || "",
                lastName: selectedParent.lastName || "",
                email: selectedParent.email || "",
                phone: selectedParent.phone || "",
                phone2: selectedParent.phone2 || "",
              },
            }
          : undefined,
        ...extras,
      }),
    },
  );

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg =
      data?.message || data?.error || `Create booking failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}

export async function confirmBookingIfPossible(bookingId?: string) {
  if (!bookingId) return;

  const r2 = await fetch(
    `/api/admin/bookings/${encodeURIComponent(bookingId)}/confirm`,
    { method: "POST", credentials: "include", cache: "no-store" },
  );

  const d2 = await r2.json().catch(() => null);

  if (!r2.ok || d2?.ok === false) {
    const txt = d2 || (await r2.text().catch(() => ""));
    console.warn("confirmation (confirm route) failed", r2.status, txt);
  }
}

export async function fetchCustomerById(
  customerId: string,
): Promise<Customer | null> {
  const r3 = await fetch(
    `/api/admin/customers/${encodeURIComponent(customerId)}`,
    { cache: "no-store", credentials: "include" },
  );

  return r3.ok ? await r3.json() : null;
}

// //src\app\admin\(app)\customers\dialogs\bookDialog\bookDialogApi.ts
// import type { Customer } from "../../types";
// import type { FamilyResponse } from "./types";

// type CampExtras = {
//   holidayLabel?: string;
//   holidayFrom?: string;
//   holidayTo?: string;
//   mainTShirtSize?: string;
//   mainGoalkeeperSchool?: boolean;
//   hasSibling?: boolean;
//   siblingGender?: string;
//   siblingBirthDate?: string;
//   siblingFirstName?: string;
//   siblingLastName?: string;
//   siblingTShirtSize?: string;
//   siblingGoalkeeperSchool?: boolean;
// };

// export async function fetchOffers() {
//   const res = await fetch(`/api/admin/offers?limit=500`, {
//     cache: "no-store",
//     credentials: "include",
//   });

//   if (!res.ok) throw new Error(`Failed to load offers (${res.status})`);
//   const data = await res.json();

//   if (Array.isArray(data.items)) return data.items;
//   if (Array.isArray(data)) return data;
//   return [];
// }

// export async function fetchFamily(customerId: string) {
//   const res = await fetch(
//     `/api/admin/customers/${encodeURIComponent(customerId)}/family`,
//     { cache: "no-store", credentials: "include" },
//   );

//   const data: FamilyResponse = await res.json().catch(() => ({}) as any);

//   if (!res.ok || data.ok === false) {
//     throw new Error(data.error || `Failed to load family (${res.status})`);
//   }

//   return data;
// }

// export async function createBooking(
//   customerId: string,
//   offerId: string,
//   date: string,
//   child: { uid: string; firstName: string; lastName: string },
//   extras: CampExtras = {},
// ) {
//   const res = await fetch(
//     `/api/admin/customers/${encodeURIComponent(customerId)}/bookings`,
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       credentials: "include",
//       cache: "no-store",
//       body: JSON.stringify({
//         offerId,
//         date,
//         childUid: child.uid,
//         childFirstName: child.firstName,
//         childLastName: child.lastName,
//         ...extras,
//       }),
//     },
//   );

//   const data = await res.json().catch(() => null);

//   if (!res.ok) {
//     const msg =
//       data?.message || data?.error || `Create booking failed (${res.status})`;
//     throw new Error(msg);
//   }

//   return data;
// }

// export async function confirmBookingIfPossible(bookingId?: string) {
//   if (!bookingId) return;

//   const r2 = await fetch(
//     `/api/admin/bookings/${encodeURIComponent(bookingId)}/confirm`,
//     { method: "POST", credentials: "include", cache: "no-store" },
//   );

//   const d2 = await r2.json().catch(() => null);

//   if (!r2.ok || d2?.ok === false) {
//     const txt = d2 || (await r2.text().catch(() => ""));
//     console.warn("confirmation (confirm route) failed", r2.status, txt);
//   }
// }

// export async function fetchCustomerById(
//   customerId: string,
// ): Promise<Customer | null> {
//   const r3 = await fetch(
//     `/api/admin/customers/${encodeURIComponent(customerId)}`,
//     { cache: "no-store", credentials: "include" },
//   );

//   return r3.ok ? await r3.json() : null;
// }
