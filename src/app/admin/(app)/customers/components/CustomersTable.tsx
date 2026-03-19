"use client";

import React from "react";
import type { Customer } from "../types";

type Props = {
  items: Customer[];
  listLoading: boolean;
  showListLoading: boolean;

  onOpenEdit: (c: Customer) => void;
  disableTooltips: boolean;
};

function rowType(c: Customer) {
  const bookings = c.bookings || [];
  const hasBookings = bookings.length > 0;
  const hasActive = bookings.some(
    (b: any) =>
      !["cancelled", "deleted", "storno"].includes(
        ((b?.status as string) || "") as string,
      ),
  );
  return { isCustomer: hasBookings, hasActive };
}

function childEntries(c: Customer): string[] {
  const children = Array.isArray((c as any).children)
    ? (c as any).children
    : [];

  const rawNames: string[] = children
    .map((child: any) =>
      [child?.firstName, child?.lastName].filter(Boolean).join(" ").trim(),
    )
    .filter(Boolean);

  const uniqueNames = Array.from(
    new Map(
      rawNames.map((name: string) => [name.toLowerCase(), name]),
    ).values(),
  ) as string[];

  if (uniqueNames.length > 0) return uniqueNames;

  const legacy = [c.child?.firstName, c.child?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return legacy ? [legacy] : [];
}

function childCell(c: Customer, disableTooltips: boolean): React.ReactNode {
  const names = childEntries(c);

  if (names.length === 0) return "—";
  if (names.length === 1) return names[0];

  const label = `${names.length} Kinder`;
  const previewCount = 8;
  const preview = names.slice(0, previewCount).join("\n");
  const hiddenCount = names.length - previewCount;
  const tip =
    hiddenCount > 0 ? `${preview}\n… und ${hiddenCount} weitere` : preview;

  if (disableTooltips) {
    return (
      <span className="ks-children-tip">
        <span className="ks-children-tip__label">{label}</span>
      </span>
    );
  }

  return (
    <span className="ks-children-tip" data-ks-tip={tip} tabIndex={0}>
      <span className="ks-children-tip__label">{label}</span>
    </span>
  );
}
function parentName(c: Customer) {
  return (
    [c.parent?.firstName, c.parent?.lastName].filter(Boolean).join(" ") || "—"
  );
}

function addressText(c: Customer) {
  const street = c.address?.street
    ? `${c.address.street} ${c.address.houseNo || ""}`
    : "";
  return (
    [street, c.address?.zip, c.address?.city].filter(Boolean).join(", ") || "—"
  );
}

function emailText(c: Customer) {
  const anyC = c as any;
  return c.parent?.email || anyC?.email || anyC?.emailLower || "—";
}

function newsletterLabel(c: Customer) {
  const anyC = c as any;
  if (c.newsletter) return "Yes";
  if (anyC?.marketingStatus === "pending" || !!anyC?.confirmToken) {
    return "Pending";
  }
  return "No";
}

export default function CustomersTable({
  items,
  listLoading,
  showListLoading,
  onOpenEdit,
  disableTooltips,
}: Props) {
  return (
    <div className="ks-customers-table-scroll">
      <div
        className={
          "card admin-card p-0 overflow-hidden ks-customers-card" +
          (showListLoading ? " is-loading" : "")
        }
      >
        <div className="ks-customers-loading-pill" aria-hidden="true">
          Loading…
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="th">ID</th>
              <th className="th">Child</th>
              <th className="th">Parent</th>
              <th className="th">Email</th>
              <th className="th">Address</th>
              <th className="th">Newsletter</th>
              <th className="th">Type</th>
              <th className="th">Status</th>
              <th className="th">Edit</th>
            </tr>
          </thead>

          <tbody>
            {items.map((c) => {
              const t = rowType(c);

              return (
                <tr
                  key={c._id}
                  className="tr hover:bg-gray-50 cursor-pointer"
                  onClick={() => onOpenEdit(c)}
                >
                  <td className="td font-mono">{c.userId ?? "—"}</td>
                  <td className="td">{childCell(c, disableTooltips)}</td>

                  <td className="td">{parentName(c)}</td>
                  <td className="td">{emailText(c)}</td>
                  <td className="td">{addressText(c)}</td>
                  <td className="td">{newsletterLabel(c)}</td>
                  <td className="td">{t.isCustomer ? "Customer" : "Lead"}</td>
                  <td className="td">{t.hasActive ? "Active" : "No active"}</td>

                  <td
                    className="td ks-row-actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span
                      className="edit-trigger"
                      role="button"
                      tabIndex={0}
                      title="Edit"
                      aria-label="Edit"
                      onClick={() => onOpenEdit(c)}
                      onKeyDown={(e) => {
                        if (e.key !== "Enter" && e.key !== " ") return;
                        e.preventDefault();
                        onOpenEdit(c);
                      }}
                    >
                      <img
                        src="/icons/edit.svg"
                        alt=""
                        aria-hidden="true"
                        className="icon-img"
                      />
                    </span>
                  </td>
                </tr>
              );
            })}

            {!items.length && !listLoading && (
              <tr>
                <td className="td" colSpan={9}>
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
// //src\app\admin\(app)\customers\components\CustomersTable.tsx
// "use client";

// import React from "react";
// import type { Customer } from "../types";

// type Props = {
//   items: Customer[];
//   listLoading: boolean;
//   showListLoading: boolean;
//   onOpenEdit: (c: Customer) => void;
// };

// function rowType(c: Customer) {
//   const bookings = c.bookings || [];
//   const hasBookings = bookings.length > 0;
//   const hasActive = bookings.some(
//     (b: any) =>
//       !["cancelled", "deleted", "storno"].includes(
//         ((b?.status as string) || "") as string,
//       ),
//   );
//   return { isCustomer: hasBookings, hasActive };
// }

// function childName(c: Customer) {
//   return (
//     [c.child?.firstName, c.child?.lastName].filter(Boolean).join(" ") || "—"
//   );
// }

// function parentName(c: Customer) {
//   return (
//     [c.parent?.firstName, c.parent?.lastName].filter(Boolean).join(" ") || "—"
//   );
// }

// function addressText(c: Customer) {
//   const street = c.address?.street
//     ? `${c.address.street} ${c.address.houseNo || ""}`
//     : "";
//   return (
//     [street, c.address?.zip, c.address?.city].filter(Boolean).join(", ") || "—"
//   );
// }

// function emailText(c: Customer) {
//   const anyC = c as any;
//   return c.parent?.email || anyC?.email || anyC?.emailLower || "—";
// }

// function newsletterLabel(c: Customer) {
//   const anyC = c as any;
//   if (c.newsletter) return "Yes";
//   if (anyC?.marketingStatus === "pending" || !!anyC?.confirmToken) {
//     return "Pending";
//   }
//   return "No";
// }

// export default function CustomersTable({
//   items,
//   listLoading,
//   showListLoading,
//   onOpenEdit,
// }: Props) {
//   return (
//     <div className="ks-customers-table-scroll">
//       <div
//         className={
//           "card admin-card p-0 overflow-hidden ks-customers-card" +
//           (showListLoading ? " is-loading" : "")
//         }
//       >
//         <div className="ks-customers-loading-pill" aria-hidden="true">
//           Loading…
//         </div>

//         <table className="w-full text-sm">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="th">ID</th>
//               <th className="th">Child</th>
//               <th className="th">Parent</th>
//               <th className="th">Email</th>
//               <th className="th">Address</th>
//               <th className="th">Newsletter</th>
//               <th className="th">Type</th>
//               <th className="th">Status</th>
//               <th className="th">Edit</th>
//             </tr>
//           </thead>

//           <tbody>
//             {items.map((c) => {
//               const t = rowType(c);

//               return (
//                 <tr
//                   key={c._id}
//                   className="tr hover:bg-gray-50 cursor-pointer"
//                   onClick={() => onOpenEdit(c)}
//                 >
//                   <td className="td font-mono">{c.userId ?? "—"}</td>
//                   <td className="td">{childName(c)}</td>
//                   <td className="td">{parentName(c)}</td>
//                   <td className="td">{emailText(c)}</td>
//                   <td className="td">{addressText(c)}</td>
//                   <td className="td">{newsletterLabel(c)}</td>
//                   <td className="td">{t.isCustomer ? "Customer" : "Lead"}</td>
//                   <td className="td">{t.hasActive ? "Active" : "No active"}</td>

//                   <td
//                     className="td ks-row-actions"
//                     onClick={(e) => e.stopPropagation()}
//                   >
//                     <span
//                       className="edit-trigger"
//                       role="button"
//                       tabIndex={0}
//                       title="Edit"
//                       aria-label="Edit"
//                       onClick={() => onOpenEdit(c)}
//                       onKeyDown={(e) => {
//                         if (e.key !== "Enter" && e.key !== " ") return;
//                         e.preventDefault();
//                         onOpenEdit(c);
//                       }}
//                     >
//                       <img
//                         src="/icons/edit.svg"
//                         alt=""
//                         aria-hidden="true"
//                         className="icon-img"
//                       />
//                     </span>
//                   </td>
//                 </tr>
//               );
//             })}

//             {!items.length && !listLoading && (
//               <tr>
//                 <td className="td" colSpan={9}>
//                   No customers found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
