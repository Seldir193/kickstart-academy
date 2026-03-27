"use client";

import type { ReactNode } from "react";
import type { News } from "./types";
import Pagination from "./components/Pagination";
import NewsDialog from "./components/NewsDialog";
import NewsFilters from "./components/NewsFilters";
import PendingNewsList from "./components/PendingNewsList";
import NewsTableList from "./components/NewsTableList";
import RejectDialog from "./moderation/RejectDialog";
import NewsInfoDialog from "./moderation/NewsInfoDialog";
import { getId } from "./newsAdmin/helpers";
import { useNewsAdminViewModel } from "./newsAdmin/useNewsAdminViewModel";

function CreateButton({ busy, onOpen }: { busy: boolean; onOpen: () => void }) {
  return (
    <button
      className="btn"
      type="button"
      onClick={() => {
        if (busy) return;
        onOpen();
      }}
    >
      <img
        src="/icons/plus.svg"
        alt=""
        aria-hidden="true"
        className="btn__icon"
      />
      Neuer Beitrag
    </button>
  );
}

export default function NewsAdminPage() {
  const p = useNewsAdminViewModel();

  return (
    <div className="news-admin ks">
      <main className="container">
        <NewsFilters
          q={p.q}
          onChangeQ={p.setQ}
          sort={p.sort}
          onChangeSort={p.setSort}
          actionSlot={<CreateButton busy={p.busy} onOpen={p.onOpenCreate} />}
        />

        {p.isSuper ? (
          <section className="news-admin__section">
            <div className="news-admin__section-head">
              <h2 className="news-admin__section-title">
                Lizenznehmer – Zu prüfen
              </h2>
              <span className="news-admin__section-meta">
                {p.providerPendingMeta}
              </span>
            </div>

            <div className="news-admin__box news-admin__box--scroll3">
              <PendingNewsList
                items={p.providerPending.items as any}
                loading={p.providerPending.loading || p.busy}
                onApprove={p.onApprove}
                onReject={() => {}}
                onAskReject={p.onAskReject}
                onOpen={(n) => p.onOpenEdit(n as any)}
              />
            </div>

            <Pagination
              page={p.providerPending.page}
              pages={p.providerPending.pages}
              onPrev={p.providerPendingPrev}
              onNext={p.providerPendingNext}
            />
          </section>
        ) : null}

        {p.isSuper ? (
          <section className="news-admin__section">
            <div className="news-admin__section-head">
              <h2 className="news-admin__section-title">
                Lizenznehmer – Freigegeben
              </h2>
              <span className="news-admin__section-meta">
                {p.providerApprovedMeta}
              </span>
            </div>

            <div className="news-admin__box news-admin__box--scroll3">
              <NewsTableList
                items={p.providerApproved.items as any}
                rowMode="provider_approved"
                selectMode={p.provApprovedSelectMode}
                onToggleSelectMode={p.toggleProvApprovedSelectMode}
                busy={p.busy}
                onOpen={(n: News) => p.onOpenEdit(n)}
                onInfo={p.onInfo}
                onAskReject={p.onAskReject}
                onDeleteOne={p.onDeleteOne}
                onDeleteMany={p.onDeleteMany}
                onTogglePublished={p.onTogglePublished}
                publishedBusyId={p.publishedBusyId}
                toggleBtnRef={p.provApprovedToggleRef}
              />
            </div>

            <Pagination
              page={p.providerApproved.page}
              pages={p.providerApproved.pages}
              onPrev={p.providerApprovedPrev}
              onNext={p.providerApprovedNext}
            />
          </section>
        ) : null}

        {p.isSuper ? (
          <section className="news-admin__section">
            <div className="news-admin__section-head">
              <h2 className="news-admin__section-title">
                Lizenznehmer – Abgelehnt
              </h2>
              <span className="news-admin__section-meta">
                {p.providerRejectedMeta}
              </span>
            </div>

            <div className="news-admin__box news-admin__box--scroll3">
              <NewsTableList
                items={p.providerRejected.items as any}
                rowMode="provider_rejected"
                selectMode={p.provRejectedSelectMode}
                onToggleSelectMode={p.toggleProvRejectedSelectMode}
                busy={p.busy}
                onOpen={(n: News) => p.onOpenEdit(n)}
                onInfo={p.onInfo}
                onDeleteOne={p.onDeleteOne}
                onDeleteMany={p.onDeleteMany}
                toggleBtnRef={p.provRejectedToggleRef}
              />
            </div>

            <Pagination
              page={p.providerRejected.page}
              pages={p.providerRejected.pages}
              onPrev={p.providerRejectedPrev}
              onNext={p.providerRejectedNext}
            />
          </section>
        ) : null}

        {p.anyError ? (
          <div className="card" role="alert">
            <div className="text-red-600">{p.anyError}</div>
          </div>
        ) : null}

        {!p.isSuper ? (
          <section className="news-admin__section">
            <div className="news-admin__section-head">
              <h2 className="news-admin__section-title">
                Meine News – Zu prüfen
              </h2>
              <span className="news-admin__section-meta">
                {p.myPendingMeta}
              </span>
            </div>

            <div className="news-admin__box news-admin__box--scroll3">
              <NewsTableList
                items={p.myPendingItems as any}
                rowMode="mine_pending"
                selectMode={p.minePendingSelectMode}
                onToggleSelectMode={p.toggleMinePendingSelectMode}
                busy={p.busy}
                onOpen={(n: News) => p.onOpenEdit(n)}
                onInfo={p.onInfo}
                onDeleteOne={p.onDeleteOne}
                onDeleteMany={p.onDeleteMany}
                toggleBtnRef={p.minePendingToggleRef}
              />
            </div>

            <Pagination
              page={p.minePending.page}
              pages={p.minePending.pages}
              onPrev={p.minePendingPrev}
              onNext={p.minePendingNext}
            />
          </section>
        ) : null}

        <section className="news-admin__section">
          <div className="news-admin__section-head">
            <h2 className="news-admin__section-title">
              Meine News – Freigegeben
            </h2>
            <span className="news-admin__section-meta">{p.myApprovedMeta}</span>
          </div>

          <div className="news-admin__box news-admin__box--scroll3">
            <NewsTableList
              items={p.myApprovedItemsEffective as any}
              rowMode="mine_approved"
              selectMode={p.mineApprovedSelectMode}
              onToggleSelectMode={p.toggleMineApprovedSelectMode}
              busy={p.busy}
              onOpen={(n: News) => p.onOpenEdit(n)}
              onInfo={p.onInfo}
              onAskReject={p.isSuper ? p.onAskReject : undefined}
              onSubmitForReview={
                !p.isSuper ? p.onSubmitForReviewApprovedMine : undefined
              }
              onDeleteOne={p.onDeleteOne}
              onDeleteMany={p.onDeleteMany}
              onTogglePublished={p.onTogglePublished}
              publishedBusyId={p.publishedBusyId}
              toggleBtnRef={p.mineApprovedToggleRef}
            />
          </div>

          <Pagination
            page={p.mineApprovedPage}
            pages={p.mineApprovedPages}
            onPrev={p.mineApprovedPrevEffective}
            onNext={p.mineApprovedNextEffective}
          />
        </section>

        {!p.isSuper ? (
          <section className="news-admin__section">
            <div className="news-admin__section-head">
              <h2 className="news-admin__section-title">
                Meine News – Abgelehnt
              </h2>
              <span className="news-admin__section-meta">
                {p.myRejectedMeta}
              </span>
            </div>

            <div className="news-admin__box news-admin__box--scroll3">
              <NewsTableList
                items={p.myRejectedItems as any}
                rowMode="mine_rejected"
                selectMode={p.mineRejectedSelectMode}
                onToggleSelectMode={p.toggleMineRejectedSelectMode}
                busy={p.busy}
                onOpen={(n: News) => p.onOpenEdit(n)}
                onInfo={p.onInfo}
                onResubmit={p.onResubmitMine}
                onDeleteOne={p.onDeleteOne}
                onDeleteMany={p.onDeleteMany}
                toggleBtnRef={p.mineRejectedToggleRef}
              />
            </div>

            <Pagination
              page={p.mineRejected.page}
              pages={p.mineRejected.pages}
              onPrev={p.mineRejectedPrev}
              onNext={p.mineRejectedNext}
            />
          </section>
        ) : null}
      </main>

      {p.createOpen ? (
        <NewsDialog
          mode="create"
          initial={null}
          onClose={p.onCloseCreate}
          upload={p.upload}
          save={p.onSave}
          remove={p.onDeleteById}
        />
      ) : null}

      {p.editItem ? (
        <NewsDialog
          mode="edit"
          initial={p.editItem}
          onClose={p.onCloseEdit}
          upload={p.upload}
          save={p.onSave}
          remove={async (id: string) => {
            const nextId = id || getId(p.editItem) || "";
            if (!nextId) return;
            await p.onDeleteById(nextId);
            p.onCloseEdit();
          }}
        />
      ) : null}

      {p.rejectOpen ? (
        <RejectDialog
          open={p.rejectOpen}
          title={p.rejectTitle}
          onClose={p.onCloseReject}
          onSubmit={p.onSubmitReject}
        />
      ) : null}

      {p.infoOpen ? (
        <NewsInfoDialog
          open={p.infoOpen}
          item={p.infoTarget}
          onClose={p.onCloseInfo}
        />
      ) : null}

      {p.previewHref ? (
        <div className="news-admin__hint">
          <a
            className="btn"
            href={p.previewHref}
            target="_blank"
            rel="noreferrer"
          >
            Open WordPress preview
          </a>
        </div>
      ) : null}
    </div>
  );
}

// ("use client");

// import { useEffect, useMemo, useRef, useState } from "react";
// import type { News, SortKey } from "./types";
// import {
//   approveNews,
//   createNews,
//   deleteNewsRecord,
//   rejectNews,
//   submitNewsForReview,
//   toggleNewsPublished,
//   updateNews,
//   uploadNewsFile,
// } from "./api";
// import { WP_DETAIL_BASE } from "./constants";
// import { useNewsList } from "./hooks/useNewsList";
// import NewsDialog from "./components/NewsDialog";
// import Pagination from "./components/Pagination";
// import PendingNewsList from "./components/PendingNewsList";
// import NewsTableList from "./components/NewsTableList";
// import RejectDialog from "./moderation/RejectDialog";
// import NewsInfoDialog from "./moderation/NewsInfoDialog";
// import NewsFilters from "./components/NewsFilters";

// type Me = { id: string; isSuperAdmin: boolean };

// function clean(v: unknown) {
//   return String(v ?? "").trim();
// }

// function buildPreview(slug: string) {
//   return `${WP_DETAIL_BASE}${encodeURIComponent(slug || "")}`;
// }

// async function fetchMe(): Promise<Me | null> {
//   const r = await fetch("/api/admin/auth/me", { cache: "no-store" }).catch(
//     () => null,
//   );
//   if (!r) return null;

//   const js = await r.json().catch(() => null);
//   if (!js?.ok || !js?.user?.id) return null;

//   return {
//     id: String(js.user.id),
//     isSuperAdmin: Boolean(js.user.isSuperAdmin),
//   };
// }

// function getId(n: News | null) {
//   return clean((n as any)?._id);
// }

// async function runMutating(setBusy: (v: boolean) => void, fn: () => any) {
//   setBusy(true);
//   try {
//     await fn();
//   } finally {
//     setBusy(false);
//   }
// }

// async function saveOne(n: News) {
//   const id = getId(n);
//   if (id) return await updateNews(id, n as any);
//   return await createNews(n as any);
// }

// function hasDraftForReview(n: News) {
//   const anyN = n as any;
//   if (anyN?.hasDraft === true) return true;
//   const d = anyN?.draft;
//   return Boolean(d && typeof d === "object" && Object.keys(d).length > 0);
// }

// type ReloadKey =
//   | "mine"
//   | "provider_pending"
//   | "provider_approved"
//   | "provider_rejected"
//   | "mine_pending"
//   | "mine_approved"
//   | "mine_rejected";

// export default function NewsAdminPage() {
//   const [me, setMe] = useState<Me | null>(null);

//   const [createOpen, setCreateOpen] = useState(false);
//   const [editItem, setEditItem] = useState<News | null>(null);

//   const [rejectOpen, setRejectOpen] = useState(false);
//   const [rejectTarget, setRejectTarget] = useState<News | null>(null);

//   const [infoOpen, setInfoOpen] = useState(false);
//   const [infoTarget, setInfoTarget] = useState<News | null>(null);

//   const [mutating, setMutating] = useState(false);

//   const [q, setQ] = useState("");
//   const [sort, setSort] = useState<SortKey>("newest");

//   const [minePendingSelectMode, setMinePendingSelectMode] = useState(false);
//   const [mineApprovedSelectMode, setMineApprovedSelectMode] = useState(false);
//   const [mineRejectedSelectMode, setMineRejectedSelectMode] = useState(false);

//   const [provApprovedSelectMode, setProvApprovedSelectMode] = useState(false);
//   const [provRejectedSelectMode, setProvRejectedSelectMode] = useState(false);

//   const minePendingToggleRef = useRef<HTMLButtonElement | null>(null);
//   const mineApprovedToggleRef = useRef<HTMLButtonElement | null>(null);
//   const mineRejectedToggleRef = useRef<HTMLButtonElement | null>(null);

//   const provApprovedToggleRef = useRef<HTMLButtonElement | null>(null);
//   const provRejectedToggleRef = useRef<HTMLButtonElement | null>(null);

//   const [publishedBusyId, setPublishedBusyId] = useState<string | null>(null);

//   useEffect(() => {
//     fetchMe().then(setMe);
//   }, []);

//   const isSuper = Boolean(me?.isSuperAdmin);
//   const busy = mutating;

//   const mine = useNewsList("mine", true, q, sort);
//   const providerPending = useNewsList("provider_pending", isSuper, q, sort);
//   const providerApproved = useNewsList("provider_approved", isSuper, q, sort);
//   const providerRejected = useNewsList("provider_rejected", isSuper, q, sort);

//   const minePending = useNewsList("mine_pending", !isSuper, q, sort);
//   const mineApproved = useNewsList("mine_approved", !isSuper, q, sort);
//   const mineRejected = useNewsList("mine_rejected", !isSuper, q, sort);

//   async function reloadViews(keys: ReloadKey[]) {
//     const map: Record<ReloadKey, { reload: () => Promise<void> }> = {
//       mine,
//       provider_pending: providerPending,
//       provider_approved: providerApproved,
//       provider_rejected: providerRejected,
//       mine_pending: minePending,
//       mine_approved: mineApproved,
//       mine_rejected: mineRejected,
//     };

//     await Promise.all(keys.map((k) => map[k].reload()));
//   }

//   function resetSelections() {
//     setMinePendingSelectMode(false);
//     setMineApprovedSelectMode(false);
//     setMineRejectedSelectMode(false);
//     setProvApprovedSelectMode(false);
//     setProvRejectedSelectMode(false);
//   }

//   async function handleSave(n: News) {
//     await runMutating(setMutating, async () => {
//       await saveOne(n);

//       if (isSuper) {
//         await reloadViews([
//           "mine",
//           "provider_pending",
//           "provider_approved",
//           "provider_rejected",
//         ]);
//       } else {
//         await reloadViews(["mine_pending", "mine_approved", "mine_rejected"]);
//       }

//       resetSelections();
//     });
//   }

//   async function handleDeleteById(id: string) {
//     await runMutating(setMutating, async () => {
//       await deleteNewsRecord(id);

//       if (isSuper) {
//         await reloadViews([
//           "mine",
//           "provider_pending",
//           "provider_approved",
//           "provider_rejected",
//         ]);
//       } else {
//         await reloadViews(["mine_pending", "mine_approved", "mine_rejected"]);
//       }
//     });
//   }

//   async function handleDeleteOne(n: News) {
//     const id = getId(n);
//     if (!id) return;
//     await handleDeleteById(id);
//   }

//   async function handleApprove(n: News) {
//     const id = getId(n);
//     if (!id) return;

//     await runMutating(setMutating, async () => {
//       await approveNews(id);
//       await reloadViews(["provider_pending", "provider_approved"]);
//     });
//   }

//   function handleRejectOpen(n: News) {
//     setRejectTarget(n);
//     setRejectOpen(true);
//   }

//   async function submitReject(reason: string) {
//     const id = getId(rejectTarget);
//     if (!id) return;

//     await runMutating(setMutating, async () => {
//       await rejectNews(id, reason);
//       await reloadViews(["provider_pending", "provider_rejected"]);
//       setRejectOpen(false);
//       setRejectTarget(null);
//     });
//   }

//   function openInfo(n: News) {
//     setInfoTarget(n);
//     setInfoOpen(true);
//   }

//   async function resubmitMine(n: News) {
//     const id = getId(n);
//     if (!id) return;

//     await runMutating(setMutating, async () => {
//       await submitNewsForReview(id);
//       await reloadViews(["mine_rejected", "mine_pending"]);
//     });
//   }

//   async function resubmitApprovedMine(n: News) {
//     const id = getId(n);
//     if (!id || !hasDraftForReview(n)) return;

//     await runMutating(setMutating, async () => {
//       await submitNewsForReview(id);
//       await reloadViews(["mine_approved", "mine_pending"]);
//     });
//   }

//   async function deleteManyAndReload(ids: string[]) {
//     if (!ids.length) return;

//     await runMutating(setMutating, async () => {
//       await Promise.all(ids.map((id) => deleteNewsRecord(id)));

//       if (isSuper) {
//         await reloadViews([
//           "mine",
//           "provider_pending",
//           "provider_approved",
//           "provider_rejected",
//         ]);
//       } else {
//         await reloadViews(["mine_pending", "mine_approved", "mine_rejected"]);
//       }
//     });
//   }

//   async function setPublished(n: News, next: boolean) {
//     const id = getId(n);
//     if (!id) return;

//     setPublishedBusyId(id);
//     try {
//       await toggleNewsPublished(id, next);

//       if (isSuper) {
//         await reloadViews(["mine", "provider_approved"]);
//       } else {
//         await reloadViews(["mine_approved"]);
//       }
//     } finally {
//       setPublishedBusyId(null);
//     }
//   }

//   const anyError =
//     mine.error ||
//     providerPending.error ||
//     providerApproved.error ||
//     providerRejected.error ||
//     minePending.error ||
//     mineApproved.error ||
//     mineRejected.error;

//   const myPendingItems = useMemo(
//     () => (minePending.items as any[]) || [],
//     [minePending.items],
//   );
//   const myApprovedItems = useMemo(
//     () => (mineApproved.items as any[]) || [],
//     [mineApproved.items],
//   );
//   const myRejectedItems = useMemo(
//     () => (mineRejected.items as any[]) || [],
//     [mineRejected.items],
//   );

//   const previewSlug = clean(editItem?.slug);
//   const previewHref = previewSlug ? buildPreview(previewSlug) : "";

//   return (
//     <div className="news-admin ks">
//       <main className="container">
//         <div className="dialog-subhead news-admin__subhead">
//           <h1 className="text-2xl font-bold m-0 news-admin__title">
//             News verwalten
//             {isSuper && providerPending.items.length > 0 ? (
//               <span
//                 className="news-admin__alarm"
//                 title="Neue Beiträge zur Prüfung"
//               >
//                 <span className="news-admin__alarm-dot" />
//                 <span className="news-admin__alarm-badge">
//                   {providerPending.items.length}
//                 </span>
//               </span>
//             ) : null}
//           </h1>

//           <button
//             className="btn"
//             type="button"
//             onClick={() => {
//               if (mutating) return;
//               setCreateOpen(true);
//             }}
//           >
//             <img
//               src="/icons/plus.svg"
//               alt=""
//               aria-hidden="true"
//               className="btn__icon"
//             />
//             Neuer Beitrag
//           </button>
//         </div>

//         <NewsFilters
//           q={q}
//           onChangeQ={setQ}
//           sort={sort}
//           onChangeSort={setSort}
//         />

//         {isSuper ? (
//           <section className="news-admin__section">
//             <div className="news-admin__section-head">
//               <h2 className="news-admin__section-title">
//                 Lizenznehmer – Zu prüfen
//               </h2>
//               <span className="news-admin__section-meta">
//                 {providerPending.items.length
//                   ? `(${providerPending.items.length} neu)`
//                   : ""}
//               </span>
//             </div>

//             <div className="news-admin__box news-admin__box--scroll3">
//               <PendingNewsList
//                 items={providerPending.items as any}
//                 loading={providerPending.loading || busy}
//                 onApprove={handleApprove}
//                 onReject={() => {}}
//                 onAskReject={handleRejectOpen}
//                 onOpen={(n) => setEditItem(n)}
//               />
//             </div>

//             <Pagination
//               page={providerPending.page}
//               pages={providerPending.pages}
//               onPrev={() => providerPending.setPage((p) => Math.max(1, p - 1))}
//               onNext={() =>
//                 providerPending.setPage((p) =>
//                   Math.min(providerPending.pages, p + 1),
//                 )
//               }
//             />
//           </section>
//         ) : null}

//         {isSuper ? (
//           <section className="news-admin__section">
//             <div className="news-admin__section-head">
//               <h2 className="news-admin__section-title">
//                 Lizenznehmer – Freigegeben
//               </h2>
//               <span className="news-admin__section-meta">
//                 {providerApproved.items.length
//                   ? `(${providerApproved.items.length})`
//                   : ""}
//               </span>
//             </div>

//             <div className="news-admin__box news-admin__box--scroll3">
//               <NewsTableList
//                 items={providerApproved.items as any}
//                 rowMode="provider_approved"
//                 selectMode={provApprovedSelectMode}
//                 onToggleSelectMode={() => setProvApprovedSelectMode((p) => !p)}
//                 busy={busy}
//                 onOpen={(n: News) => setEditItem(n)}
//                 onInfo={openInfo}
//                 onAskReject={handleRejectOpen}
//                 onDeleteOne={handleDeleteOne}
//                 onDeleteMany={deleteManyAndReload}
//                 onTogglePublished={setPublished}
//                 publishedBusyId={publishedBusyId}
//                 toggleBtnRef={provApprovedToggleRef}
//               />
//             </div>

//             <Pagination
//               page={providerApproved.page}
//               pages={providerApproved.pages}
//               onPrev={() => providerApproved.setPage((p) => Math.max(1, p - 1))}
//               onNext={() =>
//                 providerApproved.setPage((p) =>
//                   Math.min(providerApproved.pages, p + 1),
//                 )
//               }
//             />
//           </section>
//         ) : null}

//         {isSuper ? (
//           <section className="news-admin__section">
//             <div className="news-admin__section-head">
//               <h2 className="news-admin__section-title">
//                 Lizenznehmer – Abgelehnt
//               </h2>
//               <span className="news-admin__section-meta">
//                 {providerRejected.items.length
//                   ? `(${providerRejected.items.length})`
//                   : ""}
//               </span>
//             </div>

//             <div className="news-admin__box news-admin__box--scroll3">
//               <NewsTableList
//                 items={providerRejected.items as any}
//                 rowMode="provider_rejected"
//                 selectMode={provRejectedSelectMode}
//                 onToggleSelectMode={() => setProvRejectedSelectMode((p) => !p)}
//                 busy={busy}
//                 onOpen={(n: News) => setEditItem(n)}
//                 onInfo={openInfo}
//                 onDeleteOne={handleDeleteOne}
//                 onDeleteMany={deleteManyAndReload}
//                 toggleBtnRef={provRejectedToggleRef}
//               />
//             </div>

//             <Pagination
//               page={providerRejected.page}
//               pages={providerRejected.pages}
//               onPrev={() => providerRejected.setPage((p) => Math.max(1, p - 1))}
//               onNext={() =>
//                 providerRejected.setPage((p) =>
//                   Math.min(providerRejected.pages, p + 1),
//                 )
//               }
//             />
//           </section>
//         ) : null}

//         {anyError ? (
//           <div className="card" role="alert">
//             <div className="text-red-600">{anyError}</div>
//           </div>
//         ) : null}

//         {!isSuper ? (
//           <section className="news-admin__section">
//             <div className="news-admin__section-head">
//               <h2 className="news-admin__section-title">
//                 Meine News – Zu prüfen
//               </h2>
//               <span className="news-admin__section-meta">
//                 {myPendingItems.length ? `(${myPendingItems.length})` : ""}
//               </span>
//             </div>

//             <div className="news-admin__box news-admin__box--scroll3">
//               <NewsTableList
//                 items={myPendingItems as any}
//                 rowMode="mine_pending"
//                 selectMode={minePendingSelectMode}
//                 onToggleSelectMode={() => setMinePendingSelectMode((p) => !p)}
//                 busy={busy}
//                 onOpen={(n: News) => setEditItem(n)}
//                 onInfo={openInfo}
//                 onDeleteOne={handleDeleteOne}
//                 onDeleteMany={deleteManyAndReload}
//                 toggleBtnRef={minePendingToggleRef}
//               />
//             </div>

//             <Pagination
//               page={minePending.page}
//               pages={minePending.pages}
//               onPrev={() => minePending.setPage((p) => Math.max(1, p - 1))}
//               onNext={() =>
//                 minePending.setPage((p) => Math.min(minePending.pages, p + 1))
//               }
//             />
//           </section>
//         ) : null}

//         <section className="news-admin__section">
//           <div className="news-admin__section-head">
//             <h2 className="news-admin__section-title">
//               Meine News – Freigegeben
//             </h2>
//             <span className="news-admin__section-meta">
//               {(isSuper ? mine.items.length : myApprovedItems.length)
//                 ? `(${isSuper ? mine.items.length : myApprovedItems.length})`
//                 : ""}
//             </span>
//           </div>

//           <div className="news-admin__box news-admin__box--scroll3">
//             <NewsTableList
//               items={(isSuper ? (mine.items as any[]) : myApprovedItems) as any}
//               rowMode="mine_approved"
//               selectMode={mineApprovedSelectMode}
//               onToggleSelectMode={() => setMineApprovedSelectMode((p) => !p)}
//               busy={busy}
//               onOpen={(n: News) => setEditItem(n)}
//               onInfo={openInfo}
//               onAskReject={isSuper ? handleRejectOpen : undefined}
//               onSubmitForReview={!isSuper ? resubmitApprovedMine : undefined}
//               onDeleteOne={handleDeleteOne}
//               onDeleteMany={deleteManyAndReload}
//               onTogglePublished={setPublished}
//               publishedBusyId={publishedBusyId}
//               toggleBtnRef={mineApprovedToggleRef}
//             />
//           </div>

//           <Pagination
//             page={isSuper ? mine.page : mineApproved.page}
//             pages={isSuper ? mine.pages : mineApproved.pages}
//             onPrev={() =>
//               (isSuper ? mine : mineApproved).setPage((p) => Math.max(1, p - 1))
//             }
//             onNext={() =>
//               (isSuper ? mine : mineApproved).setPage((p) =>
//                 Math.min((isSuper ? mine : mineApproved).pages, p + 1),
//               )
//             }
//           />
//         </section>

//         {!isSuper ? (
//           <section className="news-admin__section">
//             <div className="news-admin__section-head">
//               <h2 className="news-admin__section-title">
//                 Meine News – Abgelehnt
//               </h2>
//               <span className="news-admin__section-meta">
//                 {myRejectedItems.length ? `(${myRejectedItems.length})` : ""}
//               </span>
//             </div>

//             <div className="news-admin__box news-admin__box--scroll3">
//               <NewsTableList
//                 items={myRejectedItems as any}
//                 rowMode="mine_rejected"
//                 selectMode={mineRejectedSelectMode}
//                 onToggleSelectMode={() => setMineRejectedSelectMode((p) => !p)}
//                 busy={busy}
//                 onOpen={(n: News) => setEditItem(n)}
//                 onInfo={openInfo}
//                 onResubmit={resubmitMine}
//                 onDeleteOne={handleDeleteOne}
//                 onDeleteMany={deleteManyAndReload}
//                 toggleBtnRef={mineRejectedToggleRef}
//               />
//             </div>

//             <Pagination
//               page={mineRejected.page}
//               pages={mineRejected.pages}
//               onPrev={() => mineRejected.setPage((p) => Math.max(1, p - 1))}
//               onNext={() =>
//                 mineRejected.setPage((p) => Math.min(mineRejected.pages, p + 1))
//               }
//             />
//           </section>
//         ) : null}
//       </main>

//       {createOpen ? (
//         <NewsDialog
//           mode="create"
//           initial={null}
//           onClose={() => setCreateOpen(false)}
//           upload={uploadNewsFile}
//           save={handleSave}
//           remove={handleDeleteById}
//         />
//       ) : null}

//       {editItem ? (
//         <NewsDialog
//           mode="edit"
//           initial={editItem}
//           onClose={() => setEditItem(null)}
//           upload={uploadNewsFile}
//           save={handleSave}
//           remove={handleDeleteById}
//         />
//       ) : null}

//       {rejectOpen ? (
//         <RejectDialog
//           open={rejectOpen}
//           title={rejectTarget?.title || ""}
//           onClose={() => {
//             setRejectOpen(false);
//             setRejectTarget(null);
//           }}
//           onSubmit={submitReject}
//         />
//       ) : null}

//       {infoOpen ? (
//         <NewsInfoDialog
//           open={infoOpen}
//           item={infoTarget}
//           onClose={() => {
//             setInfoOpen(false);
//             setInfoTarget(null);
//           }}
//         />
//       ) : null}

//       {previewHref ? (
//         <div className="news-admin__hint">
//           <a
//             className="btn"
//             href={previewHref}
//             target="_blank"
//             rel="noreferrer"
//           >
//             Open WordPress preview
//           </a>
//         </div>
//       ) : null}
//     </div>
//   );
// }

// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import type { News, SortKey } from "./types";
// import {
//   approveNews,
//   createNews,
//   deleteNewsRecord,
//   rejectNews,
//   submitNewsForReview,
//   toggleNewsPublished,
//   updateNews,
//   uploadNewsFile,
// } from "./api";
// import { WP_DETAIL_BASE } from "./constants";
// import { useNewsList } from "./hooks/useNewsList";
// import NewsDialog from "./components/NewsDialog";
// import Pagination from "./components/Pagination";
// import PendingNewsList from "./components/PendingNewsList";
// import NewsTableList from "./components/NewsTableList";
// import RejectDialog from "./moderation/RejectDialog";
// import NewsInfoDialog from "./moderation/NewsInfoDialog";
// import NewsFilters from "./components/NewsFilters";

// type Me = { id: string; isSuperAdmin: boolean };

// function clean(v: unknown) {
//   return String(v ?? "").trim();
// }

// function buildPreview(slug: string) {
//   return `${WP_DETAIL_BASE}${encodeURIComponent(slug || "")}`;
// }

// async function fetchMe(): Promise<Me | null> {
//   const r = await fetch("/api/admin/auth/me", { cache: "no-store" }).catch(
//     () => null,
//   );
//   if (!r) return null;

//   const js = await r.json().catch(() => null);
//   if (!js?.ok || !js?.user?.id) return null;

//   return {
//     id: String(js.user.id),
//     isSuperAdmin: Boolean(js.user.isSuperAdmin),
//   };
// }

// function getId(n: News | null) {
//   return clean((n as any)?._id);
// }

// async function runMutating(setBusy: (v: boolean) => void, fn: () => any) {
//   setBusy(true);
//   try {
//     await fn();
//   } finally {
//     setBusy(false);
//   }
// }

// async function saveOne(n: News) {
//   const id = getId(n);
//   if (id) return await updateNews(id, n as any);
//   return await createNews(n as any);
// }

// function hasDraftForReview(n: News) {
//   const anyN = n as any;
//   if (anyN?.hasDraft === true) return true;
//   const d = anyN?.draft;
//   return Boolean(d && typeof d === "object" && Object.keys(d).length > 0);
// }

// export default function NewsAdminPage() {
//   const [me, setMe] = useState<Me | null>(null);

//   const [createOpen, setCreateOpen] = useState(false);
//   const [editItem, setEditItem] = useState<News | null>(null);

//   const [rejectOpen, setRejectOpen] = useState(false);
//   const [rejectTarget, setRejectTarget] = useState<News | null>(null);

//   const [infoOpen, setInfoOpen] = useState(false);
//   const [infoTarget, setInfoTarget] = useState<News | null>(null);

//   const [mutating, setMutating] = useState(false);

//   const [q, setQ] = useState("");
//   const [sort, setSort] = useState<SortKey>("newest");

//   const [minePendingSelectMode, setMinePendingSelectMode] = useState(false);
//   const [mineApprovedSelectMode, setMineApprovedSelectMode] = useState(false);
//   const [mineRejectedSelectMode, setMineRejectedSelectMode] = useState(false);

//   const [provApprovedSelectMode, setProvApprovedSelectMode] = useState(false);
//   const [provRejectedSelectMode, setProvRejectedSelectMode] = useState(false);

//   const minePendingToggleRef = useRef<HTMLButtonElement | null>(null);
//   const mineApprovedToggleRef = useRef<HTMLButtonElement | null>(null);
//   const mineRejectedToggleRef = useRef<HTMLButtonElement | null>(null);

//   const provApprovedToggleRef = useRef<HTMLButtonElement | null>(null);
//   const provRejectedToggleRef = useRef<HTMLButtonElement | null>(null);

//   const [publishedBusyId, setPublishedBusyId] = useState<string | null>(null);

//   useEffect(() => {
//     fetchMe().then(setMe);
//   }, []);

//   const isSuper = Boolean(me?.isSuperAdmin);
//   const busy = mutating;

//   const mine = useNewsList("mine", true, q, sort);
//   const providerPending = useNewsList("provider_pending", isSuper, q, sort);
//   const providerApproved = useNewsList("provider_approved", isSuper, q, sort);
//   const providerRejected = useNewsList("provider_rejected", isSuper, q, sort);

//   const minePending = useNewsList("mine_pending", !isSuper, q, sort);
//   const mineApproved = useNewsList("mine_approved", !isSuper, q, sort);
//   const mineRejected = useNewsList("mine_rejected", !isSuper, q, sort);

//   async function reloadAll() {
//     await Promise.all([
//       mine.reload(),
//       providerPending.reload(),
//       providerApproved.reload(),
//       providerRejected.reload(),
//       minePending.reload(),
//       mineApproved.reload(),
//       mineRejected.reload(),
//     ]);
//   }

//   function resetSelections() {
//     setMinePendingSelectMode(false);
//     setMineApprovedSelectMode(false);
//     setMineRejectedSelectMode(false);
//     setProvApprovedSelectMode(false);
//     setProvRejectedSelectMode(false);
//   }

//   async function handleSave(n: News) {
//     await runMutating(setMutating, async () => {
//       await saveOne(n);
//       await reloadAll();
//       resetSelections();
//     });
//   }

//   async function handleDeleteById(id: string) {
//     await runMutating(setMutating, async () => {
//       await deleteNewsRecord(id);
//       await reloadAll();
//     });
//   }

//   async function handleDeleteOne(n: News) {
//     const id = getId(n);
//     if (!id) return;
//     await handleDeleteById(id);
//   }

//   async function handleApprove(n: News) {
//     const id = getId(n);
//     if (!id) return;

//     await runMutating(setMutating, async () => {
//       await approveNews(id);
//       await reloadAll();
//     });
//   }

//   function handleRejectOpen(n: News) {
//     setRejectTarget(n);
//     setRejectOpen(true);
//   }

//   async function submitReject(reason: string) {
//     const id = getId(rejectTarget);
//     if (!id) return;

//     await runMutating(setMutating, async () => {
//       await rejectNews(id, reason);
//       await reloadAll();
//       setRejectOpen(false);
//       setRejectTarget(null);
//     });
//   }

//   function openInfo(n: News) {
//     setInfoTarget(n);
//     setInfoOpen(true);
//   }

//   async function resubmitMine(n: News) {
//     const id = getId(n);
//     if (!id) return;

//     await runMutating(setMutating, async () => {
//       await submitNewsForReview(id);
//       await reloadAll();
//     });
//   }

//   async function resubmitApprovedMine(n: News) {
//     const id = getId(n);
//     if (!id || !hasDraftForReview(n)) return;

//     await runMutating(setMutating, async () => {
//       await submitNewsForReview(id);
//       await reloadAll();
//     });
//   }

//   async function deleteManyAndReload(ids: string[]) {
//     if (!ids.length) return;

//     await runMutating(setMutating, async () => {
//       await Promise.all(ids.map((id) => deleteNewsRecord(id)));
//       await reloadAll();
//     });
//   }

//   async function setPublished(n: News, next: boolean) {
//     const id = getId(n);
//     if (!id) return;

//     setPublishedBusyId(id);
//     try {
//       await toggleNewsPublished(id, next);
//       await reloadAll();
//     } finally {
//       setPublishedBusyId(null);
//     }
//   }

//   const anyError =
//     mine.error ||
//     providerPending.error ||
//     providerApproved.error ||
//     providerRejected.error ||
//     minePending.error ||
//     mineApproved.error ||
//     mineRejected.error;

//   const myPendingItems = useMemo(
//     () => (minePending.items as any[]) || [],
//     [minePending.items],
//   );
//   const myApprovedItems = useMemo(
//     () => (mineApproved.items as any[]) || [],
//     [mineApproved.items],
//   );
//   const myRejectedItems = useMemo(
//     () => (mineRejected.items as any[]) || [],
//     [mineRejected.items],
//   );

//   const previewSlug = clean(editItem?.slug);
//   const previewHref = previewSlug ? buildPreview(previewSlug) : "";

//   return (
//     <div className="news-admin ks">
//       <main className="container">
//         <div className="dialog-subhead news-admin__subhead">
//           <h1 className="text-2xl font-bold m-0 news-admin__title">
//             News verwalten
//             {isSuper && providerPending.items.length > 0 ? (
//               <span
//                 className="news-admin__alarm"
//                 title="Neue Beiträge zur Prüfung"
//               >
//                 <span className="news-admin__alarm-dot" />
//                 <span className="news-admin__alarm-badge">
//                   {providerPending.items.length}
//                 </span>
//               </span>
//             ) : null}
//           </h1>

//           <button
//             className="btn"
//             type="button"
//             onClick={() => {
//               if (mutating) return;
//               setCreateOpen(true);
//             }}
//           >
//             <img
//               src="/icons/plus.svg"
//               alt=""
//               aria-hidden="true"
//               className="btn__icon"
//             />
//             Neuer Beitrag
//           </button>
//         </div>

//         <NewsFilters
//           q={q}
//           onChangeQ={setQ}
//           sort={sort}
//           onChangeSort={setSort}
//         />

//         {isSuper ? (
//           <section className="news-admin__section">
//             <div className="news-admin__section-head">
//               <h2 className="news-admin__section-title">
//                 Lizenznehmer – Zu prüfen
//               </h2>
//               <span className="news-admin__section-meta">
//                 {providerPending.items.length
//                   ? `(${providerPending.items.length} neu)`
//                   : ""}
//               </span>
//             </div>

//             <div className="news-admin__box news-admin__box--scroll3">
//               <PendingNewsList
//                 items={providerPending.items as any}
//                 loading={providerPending.loading || busy}
//                 onApprove={handleApprove}
//                 onReject={() => {}}
//                 onAskReject={handleRejectOpen}
//                 onOpen={(n) => setEditItem(n)}
//               />
//             </div>

//             <Pagination
//               page={providerPending.page}
//               pages={providerPending.pages}
//               onPrev={() => providerPending.setPage((p) => Math.max(1, p - 1))}
//               onNext={() =>
//                 providerPending.setPage((p) =>
//                   Math.min(providerPending.pages, p + 1),
//                 )
//               }
//             />
//           </section>
//         ) : null}

//         {isSuper ? (
//           <section className="news-admin__section">
//             <div className="news-admin__section-head">
//               <h2 className="news-admin__section-title">
//                 Lizenznehmer – Freigegeben
//               </h2>
//               <span className="news-admin__section-meta">
//                 {providerApproved.items.length
//                   ? `(${providerApproved.items.length})`
//                   : ""}
//               </span>
//             </div>

//             <div className="news-admin__box news-admin__box--scroll3">
//               <NewsTableList
//                 items={providerApproved.items as any}
//                 rowMode="provider_approved"
//                 selectMode={provApprovedSelectMode}
//                 onToggleSelectMode={() => setProvApprovedSelectMode((p) => !p)}
//                 busy={busy}
//                 onOpen={(n: News) => setEditItem(n)}
//                 onInfo={openInfo}
//                 onAskReject={handleRejectOpen}
//                 onDeleteOne={handleDeleteOne}
//                 onDeleteMany={deleteManyAndReload}
//                 onTogglePublished={setPublished}
//                 publishedBusyId={publishedBusyId}
//                 toggleBtnRef={provApprovedToggleRef}
//               />
//             </div>

//             <Pagination
//               page={providerApproved.page}
//               pages={providerApproved.pages}
//               onPrev={() => providerApproved.setPage((p) => Math.max(1, p - 1))}
//               onNext={() =>
//                 providerApproved.setPage((p) =>
//                   Math.min(providerApproved.pages, p + 1),
//                 )
//               }
//             />
//           </section>
//         ) : null}

//         {isSuper ? (
//           <section className="news-admin__section">
//             <div className="news-admin__section-head">
//               <h2 className="news-admin__section-title">
//                 Lizenznehmer – Abgelehnt
//               </h2>
//               <span className="news-admin__section-meta">
//                 {providerRejected.items.length
//                   ? `(${providerRejected.items.length})`
//                   : ""}
//               </span>
//             </div>

//             <div className="news-admin__box news-admin__box--scroll3">
//               <NewsTableList
//                 items={providerRejected.items as any}
//                 rowMode="provider_rejected"
//                 selectMode={provRejectedSelectMode}
//                 onToggleSelectMode={() => setProvRejectedSelectMode((p) => !p)}
//                 busy={busy}
//                 onOpen={(n: News) => setEditItem(n)}
//                 onInfo={openInfo}
//                 onDeleteOne={handleDeleteOne}
//                 onDeleteMany={deleteManyAndReload}
//                 toggleBtnRef={provRejectedToggleRef}
//               />
//             </div>

//             <Pagination
//               page={providerRejected.page}
//               pages={providerRejected.pages}
//               onPrev={() => providerRejected.setPage((p) => Math.max(1, p - 1))}
//               onNext={() =>
//                 providerRejected.setPage((p) =>
//                   Math.min(providerRejected.pages, p + 1),
//                 )
//               }
//             />
//           </section>
//         ) : null}

//         {anyError ? (
//           <div className="card" role="alert">
//             <div className="text-red-600">{anyError}</div>
//           </div>
//         ) : null}

//         {!isSuper ? (
//           <section className="news-admin__section">
//             <div className="news-admin__section-head">
//               <h2 className="news-admin__section-title">
//                 Meine News – Zu prüfen
//               </h2>
//               <span className="news-admin__section-meta">
//                 {myPendingItems.length ? `(${myPendingItems.length})` : ""}
//               </span>
//             </div>

//             <div className="news-admin__box news-admin__box--scroll3">
//               <NewsTableList
//                 items={myPendingItems as any}
//                 rowMode="mine_pending"
//                 selectMode={minePendingSelectMode}
//                 onToggleSelectMode={() => setMinePendingSelectMode((p) => !p)}
//                 busy={busy}
//                 onOpen={(n: News) => setEditItem(n)}
//                 onInfo={openInfo}
//                 onDeleteOne={handleDeleteOne}
//                 onDeleteMany={deleteManyAndReload}
//                 toggleBtnRef={minePendingToggleRef}
//               />
//             </div>

//             <Pagination
//               page={minePending.page}
//               pages={minePending.pages}
//               onPrev={() => minePending.setPage((p) => Math.max(1, p - 1))}
//               onNext={() =>
//                 minePending.setPage((p) => Math.min(minePending.pages, p + 1))
//               }
//             />
//           </section>
//         ) : null}

//         <section className="news-admin__section">
//           <div className="news-admin__section-head">
//             <h2 className="news-admin__section-title">
//               Meine News – Freigegeben
//             </h2>
//             <span className="news-admin__section-meta">
//               {(isSuper ? mine.items.length : myApprovedItems.length)
//                 ? `(${isSuper ? mine.items.length : myApprovedItems.length})`
//                 : ""}
//             </span>
//           </div>

//           <div className="news-admin__box news-admin__box--scroll3">
//             <NewsTableList
//               items={(isSuper ? (mine.items as any[]) : myApprovedItems) as any}
//               rowMode="mine_approved"
//               selectMode={mineApprovedSelectMode}
//               onToggleSelectMode={() => setMineApprovedSelectMode((p) => !p)}
//               busy={busy}
//               onOpen={(n: News) => setEditItem(n)}
//               onInfo={openInfo}
//               onAskReject={isSuper ? handleRejectOpen : undefined}
//               onSubmitForReview={!isSuper ? resubmitApprovedMine : undefined}
//               onDeleteOne={handleDeleteOne}
//               onDeleteMany={deleteManyAndReload}
//               onTogglePublished={setPublished}
//               publishedBusyId={publishedBusyId}
//               toggleBtnRef={mineApprovedToggleRef}
//             />
//           </div>

//           <Pagination
//             page={isSuper ? mine.page : mineApproved.page}
//             pages={isSuper ? mine.pages : mineApproved.pages}
//             onPrev={() =>
//               (isSuper ? mine : mineApproved).setPage((p) => Math.max(1, p - 1))
//             }
//             onNext={() =>
//               (isSuper ? mine : mineApproved).setPage((p) =>
//                 Math.min((isSuper ? mine : mineApproved).pages, p + 1),
//               )
//             }
//           />
//         </section>

//         {!isSuper ? (
//           <section className="news-admin__section">
//             <div className="news-admin__section-head">
//               <h2 className="news-admin__section-title">
//                 Meine News – Abgelehnt
//               </h2>
//               <span className="news-admin__section-meta">
//                 {myRejectedItems.length ? `(${myRejectedItems.length})` : ""}
//               </span>
//             </div>

//             <div className="news-admin__box news-admin__box--scroll3">
//               <NewsTableList
//                 items={myRejectedItems as any}
//                 rowMode="mine_rejected"
//                 selectMode={mineRejectedSelectMode}
//                 onToggleSelectMode={() => setMineRejectedSelectMode((p) => !p)}
//                 busy={busy}
//                 onOpen={(n: News) => setEditItem(n)}
//                 onInfo={openInfo}
//                 onResubmit={resubmitMine}
//                 onDeleteOne={handleDeleteOne}
//                 onDeleteMany={deleteManyAndReload}
//                 toggleBtnRef={mineRejectedToggleRef}
//               />
//             </div>

//             <Pagination
//               page={mineRejected.page}
//               pages={mineRejected.pages}
//               onPrev={() => mineRejected.setPage((p) => Math.max(1, p - 1))}
//               onNext={() =>
//                 mineRejected.setPage((p) => Math.min(mineRejected.pages, p + 1))
//               }
//             />
//           </section>
//         ) : null}
//       </main>

//       {createOpen ? (
//         <NewsDialog
//           mode="create"
//           initial={null}
//           onClose={() => setCreateOpen(false)}
//           upload={uploadNewsFile}
//           save={handleSave}
//           remove={handleDeleteById}
//         />
//       ) : null}

//       {editItem ? (
//         <NewsDialog
//           mode="edit"
//           initial={editItem}
//           onClose={() => setEditItem(null)}
//           upload={uploadNewsFile}
//           save={handleSave}
//           remove={handleDeleteById}
//         />
//       ) : null}

//       {rejectOpen ? (
//         <RejectDialog
//           open={rejectOpen}
//           title={rejectTarget?.title || ""}
//           onClose={() => {
//             setRejectOpen(false);
//             setRejectTarget(null);
//           }}
//           onSubmit={submitReject}
//         />
//       ) : null}

//       {infoOpen ? (
//         <NewsInfoDialog
//           open={infoOpen}
//           item={infoTarget}
//           onClose={() => {
//             setInfoOpen(false);
//             setInfoTarget(null);
//           }}
//         />
//       ) : null}

//       {previewHref ? (
//         <div className="news-admin__hint">
//           <a
//             className="btn"
//             href={previewHref}
//             target="_blank"
//             rel="noreferrer"
//           >
//             Open WordPress preview
//           </a>
//         </div>
//       ) : null}
//     </div>
//   );
// }

// // src/app/admin/(app)/news/NewsAdminPage.tsx
// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import type { News } from "./types";
// import {
//   approveNews,
//   createNews,
//   deleteNewsRecord,
//   rejectNews,
//   submitNewsForReview,
//   toggleNewsPublished,
//   updateNews,
//   uploadNewsFile,
// } from "./api";
// import { WP_DETAIL_BASE } from "./constants";
// import { useNewsList } from "./hooks/useNewsList";
// import NewsDialog from "./components/NewsDialog";
// import Pagination from "./components/Pagination";
// import PendingNewsList from "./components/PendingNewsList";
// import NewsTableList from "./components/NewsTableList";
// import RejectDialog from "./moderation/RejectDialog";
// import NewsInfoDialog from "./moderation/NewsInfoDialog";

// type Me = { id: string; isSuperAdmin: boolean };

// function clean(v: unknown) {
//   return String(v ?? "").trim();
// }

// function buildPreview(slug: string) {
//   return `${WP_DETAIL_BASE}${encodeURIComponent(slug || "")}`;
// }

// async function fetchMe(): Promise<Me | null> {
//   const r = await fetch("/api/admin/auth/me", { cache: "no-store" }).catch(
//     () => null,
//   );
//   if (!r) return null;

//   const js = await r.json().catch(() => null);
//   if (!js?.ok || !js?.user?.id) return null;

//   return {
//     id: String(js.user.id),
//     isSuperAdmin: Boolean(js.user.isSuperAdmin),
//   };
// }

// function getId(n: News | null) {
//   return clean((n as any)?._id);
// }

// async function runMutating(setBusy: (v: boolean) => void, fn: () => any) {
//   setBusy(true);
//   try {
//     await fn();
//   } finally {
//     setBusy(false);
//   }
// }

// async function saveOne(n: News) {
//   const id = getId(n);
//   if (id) return await updateNews(id, n as any);
//   return await createNews(n as any);
// }

// function hasDraftForReview(n: News) {
//   const anyN = n as any;
//   if (anyN?.hasDraft === true) return true;
//   const d = anyN?.draft;
//   return Boolean(d && typeof d === "object" && Object.keys(d).length > 0);
// }

// export default function NewsAdminPage() {
//   const [me, setMe] = useState<Me | null>(null);

//   const [createOpen, setCreateOpen] = useState(false);
//   const [editItem, setEditItem] = useState<News | null>(null);

//   const [rejectOpen, setRejectOpen] = useState(false);
//   const [rejectTarget, setRejectTarget] = useState<News | null>(null);

//   const [infoOpen, setInfoOpen] = useState(false);
//   const [infoTarget, setInfoTarget] = useState<News | null>(null);

//   const [mutating, setMutating] = useState(false);

//   const [minePendingSelectMode, setMinePendingSelectMode] = useState(false);
//   const [mineApprovedSelectMode, setMineApprovedSelectMode] = useState(false);
//   const [mineRejectedSelectMode, setMineRejectedSelectMode] = useState(false);

//   const [provApprovedSelectMode, setProvApprovedSelectMode] = useState(false);
//   const [provRejectedSelectMode, setProvRejectedSelectMode] = useState(false);

//   const minePendingToggleRef = useRef<HTMLButtonElement | null>(null);
//   const mineApprovedToggleRef = useRef<HTMLButtonElement | null>(null);
//   const mineRejectedToggleRef = useRef<HTMLButtonElement | null>(null);

//   const provApprovedToggleRef = useRef<HTMLButtonElement | null>(null);
//   const provRejectedToggleRef = useRef<HTMLButtonElement | null>(null);

//   const [publishedBusyId, setPublishedBusyId] = useState<string | null>(null);

//   useEffect(() => {
//     fetchMe().then(setMe);
//   }, []);

//   const isSuper = Boolean(me?.isSuperAdmin);
//   const busy = mutating;

//   const mine = useNewsList("mine", true);
//   const providerPending = useNewsList("provider_pending", isSuper);
//   const providerApproved = useNewsList("provider_approved", isSuper);
//   const providerRejected = useNewsList("provider_rejected", isSuper);

//   const minePending = useNewsList("mine_pending", !isSuper);
//   const mineApproved = useNewsList("mine_approved", !isSuper);
//   const mineRejected = useNewsList("mine_rejected", !isSuper);

//   async function reloadAll() {
//     await Promise.all([
//       mine.reload(),
//       providerPending.reload(),
//       providerApproved.reload(),
//       providerRejected.reload(),
//       minePending.reload(),
//       mineApproved.reload(),
//       mineRejected.reload(),
//     ]);
//   }

//   function resetSelections() {
//     setMinePendingSelectMode(false);
//     setMineApprovedSelectMode(false);
//     setMineRejectedSelectMode(false);
//     setProvApprovedSelectMode(false);
//     setProvRejectedSelectMode(false);
//   }

//   async function handleSave(n: News) {
//     await runMutating(setMutating, async () => {
//       await saveOne(n);
//       await reloadAll();
//       resetSelections();
//     });
//   }

//   async function handleDeleteById(id: string) {
//     await runMutating(setMutating, async () => {
//       await deleteNewsRecord(id);
//       await reloadAll();
//     });
//   }

//   async function handleDeleteOne(n: News) {
//     const id = getId(n);
//     if (!id) return;
//     await handleDeleteById(id);
//   }

//   async function handleApprove(n: News) {
//     const id = getId(n);
//     if (!id) return;

//     await runMutating(setMutating, async () => {
//       await approveNews(id);
//       await reloadAll();
//     });
//   }

//   function handleRejectOpen(n: News) {
//     setRejectTarget(n);
//     setRejectOpen(true);
//   }

//   async function submitReject(reason: string) {
//     const id = getId(rejectTarget);
//     if (!id) return;

//     await runMutating(setMutating, async () => {
//       await rejectNews(id, reason);
//       await reloadAll();
//       setRejectOpen(false);
//       setRejectTarget(null);
//     });
//   }

//   function openInfo(n: News) {
//     setInfoTarget(n);
//     setInfoOpen(true);
//   }

//   async function resubmitMine(n: News) {
//     const id = getId(n);
//     if (!id) return;

//     await runMutating(setMutating, async () => {
//       await submitNewsForReview(id);
//       await reloadAll();
//     });
//   }

//   async function resubmitApprovedMine(n: News) {
//     const id = getId(n);
//     if (!id || !hasDraftForReview(n)) return;

//     await runMutating(setMutating, async () => {
//       await submitNewsForReview(id);
//       await reloadAll();
//     });
//   }

//   async function deleteManyAndReload(ids: string[]) {
//     if (!ids.length) return;

//     await runMutating(setMutating, async () => {
//       await Promise.all(ids.map((id) => deleteNewsRecord(id)));
//       await reloadAll();
//     });
//   }

//   // async function setPublished(n: News, next: boolean) {
//   //   const id = getId(n);
//   //   if (!id) return;

//   //   setPublishedBusyId(id);

//   //   try {
//   //     await runMutating(setMutating, async () => {
//   //       await toggleNewsPublished(id, next);
//   //       await reloadAll();
//   //     });
//   //   } finally {
//   //     setPublishedBusyId(null);
//   //   }
//   // }

//   async function setPublished(n: News, next: boolean) {
//     const id = getId(n);
//     if (!id) return;

//     setPublishedBusyId(id);
//     try {
//       await toggleNewsPublished(id, next);
//       await reloadAll();
//     } finally {
//       setPublishedBusyId(null);
//     }
//   }

//   const anyError =
//     mine.error ||
//     providerPending.error ||
//     providerApproved.error ||
//     providerRejected.error ||
//     minePending.error ||
//     mineApproved.error ||
//     mineRejected.error;

//   const myPendingItems = useMemo(
//     () => (minePending.items as any[]) || [],
//     [minePending.items],
//   );
//   const myApprovedItems = useMemo(
//     () => (mineApproved.items as any[]) || [],
//     [mineApproved.items],
//   );
//   const myRejectedItems = useMemo(
//     () => (mineRejected.items as any[]) || [],
//     [mineRejected.items],
//   );

//   const previewSlug = clean(editItem?.slug);
//   const previewHref = previewSlug ? buildPreview(previewSlug) : "";

//   return (
//     <div className="news-admin ks">
//       <main className="container">
//         <div className="dialog-subhead news-admin__subhead">
//           <h1 className="text-2xl font-bold m-0 news-admin__title">
//             News verwalten
//             {isSuper && providerPending.items.length > 0 ? (
//               <span
//                 className="news-admin__alarm"
//                 title="Neue Beiträge zur Prüfung"
//               >
//                 <span className="news-admin__alarm-dot" />
//                 <span className="news-admin__alarm-badge">
//                   {providerPending.items.length}
//                 </span>
//               </span>
//             ) : null}
//           </h1>

//           <button
//             className="btn"
//             type="button"
//             onClick={() => {
//               if (mutating) return;
//               setCreateOpen(true);
//             }}
//           >
//             <img
//               src="/icons/plus.svg"
//               alt=""
//               aria-hidden="true"
//               className="btn__icon"
//             />
//             Neuer Beitrag
//           </button>
//         </div>

//         {isSuper ? (
//           <section className="news-admin__section">
//             <div className="news-admin__section-head">
//               <h2 className="news-admin__section-title">
//                 Lizenznehmer – Zu prüfen
//               </h2>
//               <span className="news-admin__section-meta">
//                 {providerPending.items.length
//                   ? `(${providerPending.items.length} neu)`
//                   : ""}
//               </span>
//             </div>

//             <div className="news-admin__box news-admin__box--scroll3">
//               <PendingNewsList
//                 items={providerPending.items as any}
//                 loading={providerPending.loading || busy}
//                 onApprove={handleApprove}
//                 onReject={() => {}}
//                 onAskReject={handleRejectOpen}
//                 onOpen={(n) => setEditItem(n)}
//               />
//             </div>

//             <Pagination
//               page={providerPending.page}
//               pages={providerPending.pages}
//               onPrev={() => providerPending.setPage((p) => Math.max(1, p - 1))}
//               onNext={() =>
//                 providerPending.setPage((p) =>
//                   Math.min(providerPending.pages, p + 1),
//                 )
//               }
//             />
//           </section>
//         ) : null}

//         {isSuper ? (
//           <section className="news-admin__section">
//             <div className="news-admin__section-head">
//               <h2 className="news-admin__section-title">
//                 Lizenznehmer – Freigegeben
//               </h2>
//               <span className="news-admin__section-meta">
//                 {providerApproved.items.length
//                   ? `(${providerApproved.items.length})`
//                   : ""}
//               </span>
//             </div>

//             <div className="news-admin__box news-admin__box--scroll3">
//               <NewsTableList
//                 items={providerApproved.items as any}
//                 rowMode="provider_approved"
//                 selectMode={provApprovedSelectMode}
//                 onToggleSelectMode={() => setProvApprovedSelectMode((p) => !p)}
//                 busy={busy}
//                 onOpen={(n: News) => setEditItem(n)}
//                 onInfo={openInfo}
//                 onAskReject={handleRejectOpen}
//                 onDeleteOne={handleDeleteOne}
//                 onDeleteMany={deleteManyAndReload}
//                 onTogglePublished={setPublished}
//                 publishedBusyId={publishedBusyId}
//                 toggleBtnRef={provApprovedToggleRef}
//               />
//             </div>

//             <Pagination
//               page={providerApproved.page}
//               pages={providerApproved.pages}
//               onPrev={() => providerApproved.setPage((p) => Math.max(1, p - 1))}
//               onNext={() =>
//                 providerApproved.setPage((p) =>
//                   Math.min(providerApproved.pages, p + 1),
//                 )
//               }
//             />
//           </section>
//         ) : null}

//         {isSuper ? (
//           <section className="news-admin__section">
//             <div className="news-admin__section-head">
//               <h2 className="news-admin__section-title">
//                 Lizenznehmer – Abgelehnt
//               </h2>
//               <span className="news-admin__section-meta">
//                 {providerRejected.items.length
//                   ? `(${providerRejected.items.length})`
//                   : ""}
//               </span>
//             </div>

//             <div className="news-admin__box news-admin__box--scroll3">
//               <NewsTableList
//                 items={providerRejected.items as any}
//                 rowMode="provider_rejected"
//                 selectMode={provRejectedSelectMode}
//                 onToggleSelectMode={() => setProvRejectedSelectMode((p) => !p)}
//                 busy={busy}
//                 onOpen={(n: News) => setEditItem(n)}
//                 onInfo={openInfo}
//                 onDeleteOne={handleDeleteOne}
//                 onDeleteMany={deleteManyAndReload}
//                 toggleBtnRef={provRejectedToggleRef}
//               />
//             </div>

//             <Pagination
//               page={providerRejected.page}
//               pages={providerRejected.pages}
//               onPrev={() => providerRejected.setPage((p) => Math.max(1, p - 1))}
//               onNext={() =>
//                 providerRejected.setPage((p) =>
//                   Math.min(providerRejected.pages, p + 1),
//                 )
//               }
//             />
//           </section>
//         ) : null}

//         {anyError ? (
//           <div className="card" role="alert">
//             <div className="text-red-600">{anyError}</div>
//           </div>
//         ) : null}

//         {!isSuper ? (
//           <section className="news-admin__section">
//             <div className="news-admin__section-head">
//               <h2 className="news-admin__section-title">
//                 Meine News – Zu prüfen
//               </h2>
//               <span className="news-admin__section-meta">
//                 {myPendingItems.length ? `(${myPendingItems.length})` : ""}
//               </span>
//             </div>

//             <div className="news-admin__box news-admin__box--scroll3">
//               <NewsTableList
//                 items={myPendingItems as any}
//                 rowMode="mine_pending"
//                 selectMode={minePendingSelectMode}
//                 onToggleSelectMode={() => setMinePendingSelectMode((p) => !p)}
//                 busy={busy}
//                 onOpen={(n: News) => setEditItem(n)}
//                 onInfo={openInfo}
//                 onDeleteOne={handleDeleteOne}
//                 onDeleteMany={deleteManyAndReload}
//                 toggleBtnRef={minePendingToggleRef}
//               />
//             </div>

//             <Pagination
//               page={minePending.page}
//               pages={minePending.pages}
//               onPrev={() => minePending.setPage((p) => Math.max(1, p - 1))}
//               onNext={() =>
//                 minePending.setPage((p) => Math.min(minePending.pages, p + 1))
//               }
//             />
//           </section>
//         ) : null}

//         <section className="news-admin__section">
//           <div className="news-admin__section-head">
//             <h2 className="news-admin__section-title">
//               Meine News – Freigegeben
//             </h2>
//             <span className="news-admin__section-meta">
//               {(isSuper ? mine.items.length : myApprovedItems.length)
//                 ? `(${isSuper ? mine.items.length : myApprovedItems.length})`
//                 : ""}
//             </span>
//           </div>

//           <div className="news-admin__box news-admin__box--scroll3">
//             <NewsTableList
//               items={(isSuper ? (mine.items as any[]) : myApprovedItems) as any}
//               rowMode="mine_approved"
//               selectMode={mineApprovedSelectMode}
//               onToggleSelectMode={() => setMineApprovedSelectMode((p) => !p)}
//               busy={busy}
//               onOpen={(n: News) => setEditItem(n)}
//               onInfo={openInfo}
//               onAskReject={isSuper ? handleRejectOpen : undefined}
//               onSubmitForReview={!isSuper ? resubmitApprovedMine : undefined}
//               onDeleteOne={handleDeleteOne}
//               onDeleteMany={deleteManyAndReload}
//               onTogglePublished={setPublished}
//               publishedBusyId={publishedBusyId}
//               toggleBtnRef={mineApprovedToggleRef}
//             />
//           </div>

//           <Pagination
//             page={isSuper ? mine.page : mineApproved.page}
//             pages={isSuper ? mine.pages : mineApproved.pages}
//             onPrev={() =>
//               (isSuper ? mine : mineApproved).setPage((p) => Math.max(1, p - 1))
//             }
//             onNext={() =>
//               (isSuper ? mine : mineApproved).setPage((p) =>
//                 Math.min((isSuper ? mine : mineApproved).pages, p + 1),
//               )
//             }
//           />
//         </section>

//         {!isSuper ? (
//           <section className="news-admin__section">
//             <div className="news-admin__section-head">
//               <h2 className="news-admin__section-title">
//                 Meine News – Abgelehnt
//               </h2>
//               <span className="news-admin__section-meta">
//                 {myRejectedItems.length ? `(${myRejectedItems.length})` : ""}
//               </span>
//             </div>

//             <div className="news-admin__box news-admin__box--scroll3">
//               <NewsTableList
//                 items={myRejectedItems as any}
//                 rowMode="mine_rejected"
//                 selectMode={mineRejectedSelectMode}
//                 onToggleSelectMode={() => setMineRejectedSelectMode((p) => !p)}
//                 busy={busy}
//                 onOpen={(n: News) => setEditItem(n)}
//                 onInfo={openInfo}
//                 onResubmit={resubmitMine}
//                 onDeleteOne={handleDeleteOne}
//                 onDeleteMany={deleteManyAndReload}
//                 toggleBtnRef={mineRejectedToggleRef}
//               />
//             </div>

//             <Pagination
//               page={mineRejected.page}
//               pages={mineRejected.pages}
//               onPrev={() => mineRejected.setPage((p) => Math.max(1, p - 1))}
//               onNext={() =>
//                 mineRejected.setPage((p) => Math.min(mineRejected.pages, p + 1))
//               }
//             />
//           </section>
//         ) : null}
//       </main>

//       {createOpen ? (
//         <NewsDialog
//           mode="create"
//           initial={null}
//           onClose={() => setCreateOpen(false)}
//           upload={uploadNewsFile}
//           save={handleSave}
//           remove={handleDeleteById}
//         />
//       ) : null}

//       {editItem ? (
//         <NewsDialog
//           mode="edit"
//           initial={editItem}
//           onClose={() => setEditItem(null)}
//           upload={uploadNewsFile}
//           save={handleSave}
//           remove={handleDeleteById}
//         />
//       ) : null}

//       {rejectOpen ? (
//         <RejectDialog
//           open={rejectOpen}
//           title={rejectTarget?.title || ""}
//           onClose={() => {
//             setRejectOpen(false);
//             setRejectTarget(null);
//           }}
//           onSubmit={submitReject}
//         />
//       ) : null}

//       {infoOpen ? (
//         <NewsInfoDialog
//           open={infoOpen}
//           item={infoTarget}
//           onClose={() => {
//             setInfoOpen(false);
//             setInfoTarget(null);
//           }}
//         />
//       ) : null}

//       {previewHref ? (
//         <div className="news-admin__hint">
//           <a
//             className="btn"
//             href={previewHref}
//             target="_blank"
//             rel="noreferrer"
//           >
//             Open WordPress preview
//           </a>
//         </div>
//       ) : null}
//     </div>
//   );
// }
