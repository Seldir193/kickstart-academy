//src\app\admin\(app)\customers\page.tsx
"use client";

import React, { useMemo, useState } from "react";
import CustomerDialog from "./dialogs/CustomerDialog";
import CustomersTable from "./components/CustomersTable";
import NewsletterSelect from "./components/NewsletterSelect";

import { useCustomersList } from "./hooks/useCustomersList";

import type { Customer } from "./types";
import type { NewsletterFilter, Tab } from "./hooks/useCustomersList";

function pagesFor(total: number, limit: number) {
  return Math.max(1, Math.ceil(total / limit));
}

async function fetchCustomer(id: string) {
  const r = await fetch(`/api/admin/customers/${id}`, {
    cache: "no-store",
    credentials: "include",
  });
  return r.ok ? ((await r.json()) as Customer) : null;
}

export default function CustomersPage() {
  const [limit] = useState(10);
  const [q, setQ] = useState("");
  const [newsletter, setNewsletter] = useState<NewsletterFilter>("all");
  const [tab, setTab] = useState<Tab>("customers");
  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState<Customer | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const list = useCustomersList({ q, tab, newsletter, page, limit });

  const pages = useMemo(() => pagesFor(list.total, limit), [list.total, limit]);

  function switchTab(next: Tab) {
    setTab(next);
    setNewsletter("all");
    setPage(1);
  }

  async function openEditCustomer(c: Customer) {
    const full = await fetchCustomer(c._id);
    setEditing(full || c);
  }

  function onQueryChange(next: string) {
    setPage(1);
    setQ(next);
  }

  function resetSearch() {
    setQ("");
    setPage(1);
  }

  function goPrev() {
    setPage((p) => Math.max(1, p - 1));
  }

  function goNext() {
    setPage((p) => Math.min(pages, p + 1));
  }

  function closeCreate() {
    setCreateOpen(false);
  }

  async function afterCreate() {
    closeCreate();
    await list.reload();
  }

  function closeEdit() {
    setEditing(null);
  }

  async function afterEditClose() {
    closeEdit();
    await list.reload();
  }

  return (
    <div className="ks-customers-admin admin-scope p-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Customers</h1>

        <button className="btn" onClick={() => setCreateOpen(true)}>
          <img
            src="/icons/plus.svg"
            alt=""
            aria-hidden="true"
            className="btn__icon"
          />
          New customer
        </button>
      </div>

      <div className="flex gap-2 mb-3">
        <button
          className={`btn ${tab === "customers" ? "btn--tab-active" : ""}`}
          onClick={() => switchTab("customers")}
        >
          Customers
        </button>
        <button
          className={`btn ${tab === "newsletter" ? "btn--tab-active" : ""}`}
          onClick={() => switchTab("newsletter")}
        >
          Newsletter-Leads
        </button>
        <button
          className={`btn ${tab === "all" ? "btn--tab-active" : ""}`}
          onClick={() => switchTab("all")}
        >
          All
        </button>
      </div>

      <div className="flex gap-2 items-end mb-3 ks-customers-filter-row">
        <div className="flex-1">
          <label className="lbl">Suche</label>

          <div className="input-with-icon">
            <img
              src="/icons/search.svg"
              alt=""
              aria-hidden="true"
              className="input-with-icon__icon"
            />
            <input
              className="input input-with-icon__input"
              placeholder="Name, email, city, userId… (child & parent)"
              value={q}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") resetSearch();
              }}
            />
          </div>
        </div>

        <NewsletterSelect
          value={newsletter}
          onChange={setNewsletter}
          onAnyChange={() => setPage(1)}
        />
      </div>

      {list.err && <div className="card text-red-600">{list.err}</div>}

      {/* <CustomersTable
        items={list.items}
        listLoading={list.listLoading}
        showListLoading={list.showListLoading}
        onOpenEdit={openEditCustomer}
      /> */}

      <CustomersTable
        items={list.items}
        listLoading={list.listLoading}
        showListLoading={list.showListLoading}
        onOpenEdit={openEditCustomer}
        disableTooltips={!!editing || createOpen}
      />

      <div className="pager pager--arrows">
        <button
          type="button"
          className="btn"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={goPrev}
        >
          <img
            src="/icons/arrow_right_alt.svg"
            alt=""
            aria-hidden="true"
            className="icon-img icon-img--left"
          />
        </button>

        <div className="pager__count" aria-live="polite" aria-atomic="true">
          {page} / {pages}
        </div>

        <button
          type="button"
          className="btn"
          aria-label="Next page"
          disabled={page >= pages}
          onClick={goNext}
        >
          <img
            src="/icons/arrow_right_alt.svg"
            alt=""
            aria-hidden="true"
            className="icon-img"
          />
        </button>
      </div>

      {createOpen && (
        <CustomerDialog
          mode="create"
          onClose={closeCreate}
          onCreated={afterCreate}
        />
      )}

      {editing && (
        <CustomerDialog
          mode="edit"
          customer={editing}
          onClose={closeEdit}
          onSaved={afterEditClose}
          onDeleted={afterEditClose}
        />
      )}
    </div>
  );
}

// "use client";

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import type { Customer, ListResponse } from "./types";
// import CustomerDialog from "./dialogs/CustomerDialog";

// type Tab = "customers" | "newsletter" | "all";
// type NewsletterFilter = "all" | "true" | "false";

// const NEWSLETTER_OPTIONS: { value: NewsletterFilter; label: string }[] = [
//   { value: "all", label: "All" },
//   { value: "true", label: "Yes" },
//   { value: "false", label: "No" },
// ];

// export default function CustomersPage() {
//   const [items, setItems] = useState<Customer[]>([]);
//   const [total, setTotal] = useState(0);
//   const [page, setPage] = useState(1);
//   const [limit] = useState(10);

//   const [q, setQ] = useState("");
//   const [newsletter, setNewsletter] = useState<NewsletterFilter>("all");
//   const [tab, setTab] = useState<Tab>("customers");

//   const [listLoading, setListLoading] = useState(true);
//   const [showListLoading, setShowListLoading] = useState(false);
//   const [err, setErr] = useState<string | null>(null);

//   const [editing, setEditing] = useState<Customer | null>(null);
//   const [createOpen, setCreateOpen] = useState(false);

//   const [newsletterOpen, setNewsletterOpen] = useState(false);
//   const newsletterRef = useRef<HTMLDivElement | null>(null);

//   const reqIdRef = useRef(0);
//   const abortRef = useRef<AbortController | null>(null);
//   const loaderTimerRef = useRef<number | null>(null);

//   const newsletterLabel = useMemo(() => {
//     if (newsletter === "true") return "Yes";
//     if (newsletter === "false") return "No";
//     return "All";
//   }, [newsletter]);

//   useEffect(() => {
//     if (!newsletterOpen) return;

//     function handleClickOutside(ev: MouseEvent) {
//       if (!newsletterRef.current) return;
//       if (!newsletterRef.current.contains(ev.target as Node)) {
//         setNewsletterOpen(false);
//       }
//     }

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [newsletterOpen]);

//   const query = useMemo(() => {
//     const p = new URLSearchParams();
//     const qq = q.trim();
//     if (qq) p.set("q", qq);
//     if (newsletter !== "all") p.set("newsletter", newsletter);
//     if (tab !== "all") p.set("tab", tab);
//     p.set("page", String(page));
//     p.set("limit", String(limit));
//     p.set("sort", "createdAt:desc");
//     return p.toString();
//   }, [q, newsletter, tab, page, limit]);

//   function clearLoaderTimer() {
//     if (loaderTimerRef.current) window.clearTimeout(loaderTimerRef.current);
//     loaderTimerRef.current = null;
//   }

//   function startDelayedLoader() {
//     clearLoaderTimer();
//     setShowListLoading(false);
//     loaderTimerRef.current = window.setTimeout(() => {
//       setShowListLoading(true);
//     }, 300);
//   }

//   async function load() {
//     const id = ++reqIdRef.current;
//     abortRef.current?.abort();
//     const ac = new AbortController();
//     abortRef.current = ac;

//     setListLoading(true);
//     startDelayedLoader();
//     setErr(null);

//     try {
//       const res = await fetch(`/api/admin/customers?${query}`, {
//         credentials: "include",
//         cache: "no-store",
//         signal: ac.signal,
//       });
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       const data: ListResponse = await res.json();
//       if (reqIdRef.current !== id) return;
//       setItems(data.items || []);
//       setTotal(data.total || 0);
//     } catch (e: any) {
//       if (e?.name === "AbortError") return;
//       if (reqIdRef.current !== id) return;
//       setErr(e?.message || "Load failed");
//     } finally {
//       if (reqIdRef.current === id) setListLoading(false);
//       clearLoaderTimer();
//       setShowListLoading(false);
//     }
//   }

//   useEffect(() => {
//     load();
//     return () => clearLoaderTimer();
//   }, [query]);

//   const pages = Math.max(1, Math.ceil(total / limit));

//   function switchTab(next: Tab) {
//     setTab(next);
//     setNewsletter("all");
//     setPage(1);
//   }

//   async function openEditCustomer(c: Customer) {
//     const r = await fetch(`/api/admin/customers/${c._id}`, {
//       cache: "no-store",
//       credentials: "include",
//     });
//     const full = r.ok ? await r.json() : c;
//     setEditing(full);
//   }

//   return (
//     <div className="ks-customers-admin admin-scope p-4 max-w-6xl mx-auto">
//       <div className="flex items-center justify-between mb-4">
//         <h1 className="text-2xl font-bold">Customers</h1>

//         <button className="btn" onClick={() => setCreateOpen(true)}>
//           <img
//             src="/icons/plus.svg"
//             alt=""
//             aria-hidden="true"
//             className="btn__icon"
//           />
//           New customer
//         </button>
//       </div>

//       <div className="flex gap-2 mb-3">
//         <button
//           className={`btn ${tab === "customers" ? "btn--tab-active" : ""}`}
//           onClick={() => switchTab("customers")}
//         >
//           Customers
//         </button>
//         <button
//           className={`btn ${tab === "newsletter" ? "btn--tab-active" : ""}`}
//           onClick={() => switchTab("newsletter")}
//         >
//           Newsletter-Leads
//         </button>
//         <button
//           className={`btn ${tab === "all" ? "btn--tab-active" : ""}`}
//           onClick={() => switchTab("all")}
//         >
//           All
//         </button>
//       </div>

//       <div className="flex gap-2 items-end mb-3 ks-customers-filter-row">
//         <div className="flex-1">
//           <label className="lbl">Suche</label>

//           <div className="input-with-icon">
//             <img
//               src="/icons/search.svg"
//               alt=""
//               aria-hidden="true"
//               className="input-with-icon__icon"
//             />
//             <input
//               className="input input-with-icon__input"
//               placeholder="Name, email, city, userId… (child & parent)"
//               value={q}
//               onChange={(e) => {
//                 setPage(1);
//                 setQ(e.target.value);
//               }}
//               onKeyDown={(e) => {
//                 if (e.key === "Escape") {
//                   setQ("");
//                   setPage(1);
//                 }
//               }}
//             />
//           </div>
//         </div>

//         <div>
//           <label className="block text-sm text-gray-600">Newsletter</label>

//           <div
//             ref={newsletterRef}
//             className={`ks-filter-select ${
//               newsletterOpen ? "ks-filter-select--open" : ""
//             }`}
//           >
//             <button
//               type="button"
//               className="ks-filter-select__trigger"
//               onClick={() => setNewsletterOpen((open) => !open)}
//             >
//               <span className="ks-filter-select__label">{newsletterLabel}</span>
//               <span className="ks-filter-select__chevron" aria-hidden="true" />
//             </button>

//             {newsletterOpen && (
//               <ul className="ks-filter-select__menu">
//                 {NEWSLETTER_OPTIONS.map((opt) => (
//                   <li key={`${opt.value}-${opt.label}`}>
//                     <button
//                       type="button"
//                       className={
//                         "ks-filter-select__option" +
//                         (newsletter === opt.value ? " is-selected" : "")
//                       }
//                       onClick={() => {
//                         setPage(1);
//                         setNewsletter(opt.value);
//                         setNewsletterOpen(false);
//                       }}
//                     >
//                       {opt.label}
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>
//         </div>
//       </div>

//       {err && <div className="card text-red-600">{err}</div>}

//       {/* <div className="card admin-card p-0 overflow-hidden ks-customers-card">
//         {showListLoading && (
//           <div className="ks-customers-loading-pill" aria-hidden="true">
//             Loading…
//           </div>
//         )} */}
//       <div className="ks-customers-table-scroll">
//         <div
//           className={
//             "card admin-card p-0 overflow-hidden ks-customers-card" +
//             (showListLoading ? " is-loading" : "")
//           }
//         >
//           <div className="ks-customers-loading-pill" aria-hidden="true">
//             Loading…
//           </div>

//           <table className="w-full text-sm">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="th">ID</th>
//                 <th className="th">Child</th>
//                 <th className="th">Parent</th>
//                 <th className="th">Email</th>
//                 <th className="th">Address</th>
//                 <th className="th">Newsletter</th>
//                 <th className="th">Type</th>
//                 <th className="th">Status</th>
//                 <th className="th">Edit</th>
//               </tr>
//             </thead>

//             <tbody>
//               {items.map((c) => {
//                 const bookings = c.bookings || [];
//                 const hasBookings = bookings.length > 0;
//                 const hasActive = bookings.some(
//                   (b: any) =>
//                     !["cancelled", "deleted", "storno"].includes(
//                       ((b?.status as string) || "") as string,
//                     ),
//                 );
//                 const isCustomer = hasBookings;

//                 return (
//                   <tr
//                     key={c._id}
//                     className="tr hover:bg-gray-50 cursor-pointer"
//                     onClick={() => openEditCustomer(c)}
//                   >
//                     <td className="td font-mono">{c.userId ?? "—"}</td>
//                     <td className="td">
//                       {[c.child?.firstName, c.child?.lastName]
//                         .filter(Boolean)
//                         .join(" ") || "—"}
//                     </td>
//                     <td className="td">
//                       {[c.parent?.firstName, c.parent?.lastName]
//                         .filter(Boolean)
//                         .join(" ") || "—"}
//                     </td>
//                     <td className="td">{c.parent?.email || "—"}</td>
//                     <td className="td">
//                       {[
//                         c.address?.street &&
//                           `${c.address.street} ${c.address.houseNo || ""}`,
//                         c.address?.zip,
//                         c.address?.city,
//                       ]
//                         .filter(Boolean)
//                         .join(", ") || "—"}
//                     </td>
//                     <td className="td">{c.newsletter ? "Yes" : "No"}</td>
//                     <td className="td">{isCustomer ? "Customer" : "Lead"}</td>
//                     <td className="td">{hasActive ? "Active" : "No active"}</td>

//                     <td
//                       className="td ks-row-actions"
//                       onClick={(e) => e.stopPropagation()}
//                     >
//                       <span
//                         className="edit-trigger"
//                         role="button"
//                         tabIndex={0}
//                         title="Edit"
//                         aria-label="Edit"
//                         onClick={() => openEditCustomer(c)}
//                         onKeyDown={(e) => {
//                           if (e.key === "Enter" || e.key === " ") {
//                             e.preventDefault();
//                             openEditCustomer(c);
//                           }
//                         }}
//                       >
//                         <img
//                           src="/icons/edit.svg"
//                           alt=""
//                           aria-hidden="true"
//                           className="icon-img"
//                         />
//                       </span>
//                     </td>
//                   </tr>
//                 );
//               })}

//               {!items.length && !listLoading && (
//                 <tr>
//                   <td className="td" colSpan={9}>
//                     No customers found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       <div className="pager pager--arrows">
//         <button
//           type="button"
//           className="btn"
//           aria-label="Previous page"
//           disabled={page <= 1}
//           onClick={() => setPage((p) => Math.max(1, p - 1))}
//         >
//           <img
//             src="/icons/arrow_right_alt.svg"
//             alt=""
//             aria-hidden="true"
//             className="icon-img icon-img--left"
//           />
//         </button>

//         <div className="pager__count" aria-live="polite" aria-atomic="true">
//           {page} / {pages}
//         </div>

//         <button
//           type="button"
//           className="btn"
//           aria-label="Next page"
//           disabled={page >= pages}
//           onClick={() => setPage((p) => Math.min(pages, p + 1))}
//         >
//           <img
//             src="/icons/arrow_right_alt.svg"
//             alt=""
//             aria-hidden="true"
//             className="icon-img"
//           />
//         </button>
//       </div>

//       {createOpen && (
//         <CustomerDialog
//           mode="create"
//           onClose={() => setCreateOpen(false)}
//           onCreated={() => {
//             setCreateOpen(false);
//             load();
//           }}
//         />
//       )}

//       {editing && (
//         <CustomerDialog
//           mode="edit"
//           customer={editing}
//           onClose={() => setEditing(null)}
//           onSaved={() => {
//             setEditing(null);
//             load();
//           }}
//           onDeleted={() => {
//             setEditing(null);
//             load();
//           }}
//         />
//       )}
//     </div>
//   );
// }

// "use client";

// import React, { useEffect, useMemo, useState, useRef } from "react";
// import type { Customer, ListResponse } from "./types";
// import CustomerDialog from "./dialogs/CustomerDialog";

// type Tab = "customers" | "newsletter" | "all";

// const NEWSLETTER_OPTIONS: { value: "all" | "true" | "false"; label: string }[] =
//   [
//     { value: "all", label: "All" },
//     { value: "true", label: "Yes" },
//     { value: "false", label: "No" },
//   ];

// export default function CustomersPage() {
//   const [items, setItems] = useState<Customer[]>([]);
//   const [total, setTotal] = useState(0);
//   const [page, setPage] = useState(1);
//   const [limit] = useState(20);

//   const [q, setQ] = useState("");
//   const [newsletter, setNewsletter] = useState<"all" | "true" | "false">("all");
//   const [tab, setTab] = useState<Tab>("customers");

//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState<string | null>(null);

//   const [editing, setEditing] = useState<Customer | null>(null);
//   const [createOpen, setCreateOpen] = useState(false);

//   // Newsletter-Custom-Dropdown State
//   const [newsletterOpen, setNewsletterOpen] = useState(false);
//   const newsletterRef = useRef<HTMLDivElement | null>(null);

//   const newsletterLabel = useMemo(() => {
//     switch (newsletter) {
//       case "true":
//         return "Yes";
//       case "false":
//         return "No";
//       default:
//         return "All";
//     }
//   }, [newsletter]);

//   // ✅ Click outside schließt Newsletter-Dropdown (nur EINMAL, nicht doppelt)
//   useEffect(() => {
//     if (!newsletterOpen) return;

//     function handleClickOutside(ev: MouseEvent) {
//       if (!newsletterRef.current) return;
//       if (!newsletterRef.current.contains(ev.target as Node)) {
//         setNewsletterOpen(false);
//       }
//     }

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [newsletterOpen]);

//   // Build query for backend
//   const query = useMemo(() => {
//     const p = new URLSearchParams();
//     if (q.trim()) p.set("q", q.trim());
//     if (newsletter !== "all") p.set("newsletter", newsletter);
//     if (tab !== "all") p.set("tab", tab); // customers | newsletter
//     p.set("page", String(page));
//     p.set("limit", String(limit));
//     p.set("sort", "createdAt:desc");
//     return p.toString();
//   }, [q, newsletter, tab, page, limit]);

//   async function load() {
//     setLoading(true);
//     setErr(null);
//     try {
//       const res = await fetch(`/api/admin/customers?${query}`, {
//         credentials: "include",
//         cache: "no-store",
//       });
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       const data: ListResponse = await res.json();
//       setItems(data.items || []);
//       setTotal(data.total || 0);
//     } catch (e: any) {
//       setErr(e?.message || "Load failed");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     load();
//   }, [query]);

//   const pages = Math.max(1, Math.ceil(total / limit));

//   function switchTab(next: Tab) {
//     setTab(next);
//     setNewsletter("all"); // Dropdown neutralisieren
//     setPage(1);
//   }

//   async function openEditCustomer(c: Customer) {
//     const r = await fetch(`/api/admin/customers/${c._id}`, {
//       cache: "no-store",
//       credentials: "include",
//     });
//     const full = r.ok ? await r.json() : c;
//     setEditing(full);
//   }

//   return (
//     <div className="ks-customers-admin p-4 max-w-6xl mx-auto">
//       <div className="flex items-center justify-between mb-4">
//         <h1 className="text-2xl font-bold">Customers</h1>

//         <button className="btn" onClick={() => setCreateOpen(true)}>
//           <img
//             src="/icons/plus.svg"
//             alt=""
//             aria-hidden="true"
//             className="btn__icon"
//           />
//           New customer
//         </button>
//       </div>

//       {/* Tabs */}
//       <div className="flex gap-2 mb-3">
//         <button
//           className={`btn ${tab === "customers" ? "btn--tab-active" : ""}`}
//           onClick={() => switchTab("customers")}
//         >
//           Customers
//         </button>
//         <button
//           className={`btn ${tab === "newsletter" ? "btn--tab-active" : ""}`}
//           onClick={() => switchTab("newsletter")}
//         >
//           Newsletter-Leads
//         </button>
//         <button
//           className={`btn ${tab === "all" ? "btn--tab-active" : ""}`}
//           onClick={() => switchTab("all")}
//         >
//           All
//         </button>
//       </div>

//       {/* Filters */}
//       <div className="flex gap-2 items-end mb-3 ks-customers-filter-row">
//         <div className="flex-1">
//           <label className="lbl">Suche</label>

//           <div className="input-with-icon">
//             <img
//               src="/icons/search.svg"
//               alt=""
//               aria-hidden="true"
//               className="input-with-icon__icon"
//             />
//             <input
//               className="input input-with-icon__input"
//               placeholder="Name, email, city, userId… (child & parent)"
//               value={q}
//               onChange={(e) => {
//                 setPage(1);
//                 setQ(e.target.value);
//               }}
//               onKeyDown={(e) => {
//                 if (e.key === "Escape") {
//                   setQ("");
//                   setPage(1);
//                 }
//               }}
//             />
//           </div>
//         </div>

//         <div>
//           <label className="block text-sm text-gray-600">Newsletter</label>

//           <div
//             ref={newsletterRef}
//             className={`ks-filter-select ${
//               newsletterOpen ? "ks-filter-select--open" : ""
//             }`}
//           >
//             <button
//               type="button"
//               className="ks-filter-select__trigger"
//               onClick={() => setNewsletterOpen((open) => !open)}
//             >
//               <span className="ks-filter-select__label">{newsletterLabel}</span>
//               <span className="ks-filter-select__chevron" aria-hidden="true" />
//             </button>

//             {newsletterOpen && (
//               <ul className="ks-filter-select__menu">
//                 {NEWSLETTER_OPTIONS.map((opt) => (
//                   <li key={opt.value}>
//                     <button
//                       type="button"
//                       className={
//                         "ks-filter-select__option" +
//                         (newsletter === opt.value ? " is-selected" : "")
//                       }
//                       onClick={() => {
//                         setPage(1);
//                         setNewsletter(opt.value);
//                         setNewsletterOpen(false);
//                       }}
//                     >
//                       {opt.label}
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>
//         </div>
//       </div>

//       {loading && <div className="card">Loading…</div>}
//       {err && <div className="card text-red-600">{err}</div>}

//       {!loading && !err && (
//         <div className="card p-0 overflow-hidden">
//           <table className="w-full text-sm">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="th">ID</th>
//                 <th className="th">Child</th>
//                 <th className="th">Parent</th>
//                 <th className="th">Email</th>
//                 <th className="th">Address</th>
//                 <th className="th">Newsletter</th>
//                 <th className="th">Type</th>
//                 <th className="th">Status</th>
//                 <th className="th">Edit</th>
//               </tr>
//             </thead>

//             <tbody>
//               {items.map((c) => {
//                 const bookings = c.bookings || [];
//                 const hasBookings = bookings.length > 0;
//                 const hasActive = bookings.some(
//                   (b: any) =>
//                     !["cancelled", "deleted", "storno"].includes(
//                       ((b?.status as string) || "") as string,
//                     ),
//                 );
//                 const isCustomer = hasBookings;

//                 return (
//                   <tr
//                     key={c._id}
//                     className="tr hover:bg-gray-50 cursor-pointer"
//                     onClick={() => openEditCustomer(c)}
//                   >
//                     <td className="td font-mono">{c.userId ?? "—"}</td>
//                     <td className="td">
//                       {[c.child?.firstName, c.child?.lastName]
//                         .filter(Boolean)
//                         .join(" ") || "—"}
//                     </td>
//                     <td className="td">
//                       {[c.parent?.firstName, c.parent?.lastName]
//                         .filter(Boolean)
//                         .join(" ") || "—"}
//                     </td>
//                     <td className="td">{c.parent?.email || "—"}</td>
//                     <td className="td">
//                       {[
//                         c.address?.street &&
//                           `${c.address.street} ${c.address.houseNo || ""}`,
//                         c.address?.zip,
//                         c.address?.city,
//                       ]
//                         .filter(Boolean)
//                         .join(", ") || "—"}
//                     </td>
//                     <td className="td">{c.newsletter ? "Yes" : "No"}</td>
//                     <td className="td">{isCustomer ? "Customer" : "Lead"}</td>
//                     <td className="td">{hasActive ? "Active" : "No active"}</td>

//                     {/* ✅ Action-Icon (wie Coaches/Trainings) */}
//                     <td
//                       className="td ks-row-actions"
//                       onClick={(e) => e.stopPropagation()}
//                     >
//                       <span
//                         className="edit-trigger"
//                         role="button"
//                         tabIndex={0}
//                         title="Edit"
//                         aria-label="Edit"
//                         onClick={() => openEditCustomer(c)}
//                         onKeyDown={(e) => {
//                           if (e.key === "Enter" || e.key === " ") {
//                             e.preventDefault();
//                             openEditCustomer(c);
//                           }
//                         }}
//                       >
//                         <img
//                           src="/icons/edit.svg"
//                           alt=""
//                           aria-hidden="true"
//                           className="icon-img"
//                         />
//                       </span>
//                     </td>
//                   </tr>
//                 );
//               })}

//               {!items.length && (
//                 <tr>
//                   <td className="td" colSpan={9}>
//                     No customers yet.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Pagination */}
//       <div className="pager pager--arrows">
//         <button
//           type="button"
//           className="btn"
//           aria-label="Previous page"
//           disabled={page <= 1}
//           onClick={() => setPage((p) => Math.max(1, p - 1))}
//         >
//           <img
//             src="/icons/arrow_right_alt.svg"
//             alt=""
//             aria-hidden="true"
//             className="icon-img icon-img--left"
//           />
//         </button>

//         <div className="pager__count" aria-live="polite" aria-atomic="true">
//           {page} / {pages}
//         </div>

//         <button
//           type="button"
//           className="btn"
//           aria-label="Next page"
//           disabled={page >= pages}
//           onClick={() => setPage((p) => Math.min(pages, p + 1))}
//         >
//           <img
//             src="/icons/arrow_right_alt.svg"
//             alt=""
//             aria-hidden="true"
//             className="icon-img"
//           />
//         </button>
//       </div>

//       {createOpen && (
//         <CustomerDialog
//           mode="create"
//           onClose={() => setCreateOpen(false)}
//           onCreated={() => {
//             setCreateOpen(false);
//             load();
//           }}
//         />
//       )}

//       {editing && (
//         <CustomerDialog
//           mode="edit"
//           customer={editing}
//           onClose={() => setEditing(null)}
//           onSaved={() => {
//             setEditing(null);
//             load();
//           }}
//           onDeleted={() => {
//             setEditing(null);
//             load();
//           }}
//         />
//       )}
//     </div>
//   );
// }
