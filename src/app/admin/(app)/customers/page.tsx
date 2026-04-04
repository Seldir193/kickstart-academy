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
      <div className="ks-customers-toolbar mb-3">
        <div className="ks-customers-toolbar__tabs">
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

        <div className="ks-customers-toolbar__search">
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

        <div className="ks-customers-toolbar__filter">
          <NewsletterSelect
            value={newsletter}
            onChange={setNewsletter}
            onAnyChange={() => setPage(1)}
          />
        </div>

        <div className="ks-customers-toolbar__action">
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
      </div>

      {list.err && <div className="card text-red-600">{list.err}</div>}

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
// //src\app\admin\(app)\customers\page.tsx
// "use client";

// import React, { useMemo, useState } from "react";
// import CustomerDialog from "./dialogs/CustomerDialog";
// import CustomersTable from "./components/CustomersTable";
// import NewsletterSelect from "./components/NewsletterSelect";

// import { useCustomersList } from "./hooks/useCustomersList";

// import type { Customer } from "./types";
// import type { NewsletterFilter, Tab } from "./hooks/useCustomersList";

// function pagesFor(total: number, limit: number) {
//   return Math.max(1, Math.ceil(total / limit));
// }

// async function fetchCustomer(id: string) {
//   const r = await fetch(`/api/admin/customers/${id}`, {
//     cache: "no-store",
//     credentials: "include",
//   });
//   return r.ok ? ((await r.json()) as Customer) : null;
// }

// export default function CustomersPage() {
//   const [limit] = useState(10);
//   const [q, setQ] = useState("");
//   const [newsletter, setNewsletter] = useState<NewsletterFilter>("all");
//   const [tab, setTab] = useState<Tab>("customers");
//   const [page, setPage] = useState(1);

//   const [editing, setEditing] = useState<Customer | null>(null);
//   const [createOpen, setCreateOpen] = useState(false);

//   const list = useCustomersList({ q, tab, newsletter, page, limit });

//   const pages = useMemo(() => pagesFor(list.total, limit), [list.total, limit]);

//   function switchTab(next: Tab) {
//     setTab(next);
//     setNewsletter("all");
//     setPage(1);
//   }

//   async function openEditCustomer(c: Customer) {
//     const full = await fetchCustomer(c._id);
//     setEditing(full || c);
//   }

//   function onQueryChange(next: string) {
//     setPage(1);
//     setQ(next);
//   }

//   function resetSearch() {
//     setQ("");
//     setPage(1);
//   }

//   function goPrev() {
//     setPage((p) => Math.max(1, p - 1));
//   }

//   function goNext() {
//     setPage((p) => Math.min(pages, p + 1));
//   }

//   function closeCreate() {
//     setCreateOpen(false);
//   }

//   async function afterCreate() {
//     closeCreate();
//     await list.reload();
//   }

//   function closeEdit() {
//     setEditing(null);
//   }

//   async function afterEditClose() {
//     closeEdit();
//     await list.reload();
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
//               onChange={(e) => onQueryChange(e.target.value)}
//               onKeyDown={(e) => {
//                 if (e.key === "Escape") resetSearch();
//               }}
//             />
//           </div>
//         </div>

//         <NewsletterSelect
//           value={newsletter}
//           onChange={setNewsletter}
//           onAnyChange={() => setPage(1)}
//         />
//       </div>

//       {list.err && <div className="card text-red-600">{list.err}</div>}

//       {/* <CustomersTable
//         items={list.items}
//         listLoading={list.listLoading}
//         showListLoading={list.showListLoading}
//         onOpenEdit={openEditCustomer}
//       /> */}

//       <CustomersTable
//         items={list.items}
//         listLoading={list.listLoading}
//         showListLoading={list.showListLoading}
//         onOpenEdit={openEditCustomer}
//         disableTooltips={!!editing || createOpen}
//       />

//       <div className="pager pager--arrows">
//         <button
//           type="button"
//           className="btn"
//           aria-label="Previous page"
//           disabled={page <= 1}
//           onClick={goPrev}
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
//           onClick={goNext}
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
//           onClose={closeCreate}
//           onCreated={afterCreate}
//         />
//       )}

//       {editing && (
//         <CustomerDialog
//           mode="edit"
//           customer={editing}
//           onClose={closeEdit}
//           onSaved={afterEditClose}
//           onDeleted={afterEditClose}
//         />
//       )}
//     </div>
//   );
// }
