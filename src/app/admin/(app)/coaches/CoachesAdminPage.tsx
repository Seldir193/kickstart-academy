"use client";

import { useEffect, useRef, useState } from "react";
import CoachDialog from "@/app/components/CoachDialog";
import type { Coach } from "./types";
import CoachesFilters from "./components/CoachesFilters";
import Pagination from "./components/Pagination";
import PendingCoachesList from "./components/PendingCoachesList";
import CoachTableList from "./components/CoachTableList";
import DeleteCoachDialog from "./moderation/DeleteCoachDialog";
import RejectDialog from "./moderation/RejectDialog";
import CoachInfoDialog from "./moderation/CoachInfoDialog";
import CoachPublishedInfoDialog from "./components/CoachPublishedInfoDialog";
import { fullName, canSubmitUpdate } from "./utils";
import { useCoachesData } from "./hooks/useCoachesData";
import { cleanStr } from "./pageHelpers";
import { useCoachesPageState } from "./hooks/useCoachesPageState";
import { useCoachesPageMutations } from "./hooks/useCoachesPageMutations";

function CreateCoachButton({
  busy,
  onOpen,
}: {
  busy: boolean;
  onOpen: () => void;
}) {
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
      New coach
    </button>
  );
}

export default function CoachesAdminPage() {
  const { me, items, resp, loading, error } = useCoachesData();

  const isSuper = Boolean((me as any)?.isSuperAdmin);
  const meId = cleanStr((me as any)?.id);
  const meLabel = cleanStr((me as any)?.fullName) || "Me";

  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Coach | null>(null);

  const [pendingBusySlug, setPendingBusySlug] = useState<string | null>(null);
  const [publishedBusyId, setPublishedBusyId] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Coach | null>(null);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<Coach | null>(null);

  const [rejectInfoOpen, setRejectInfoOpen] = useState(false);
  const [rejectInfoTarget, setRejectInfoTarget] = useState<Coach | null>(null);

  const [publishedInfoOpen, setPublishedInfoOpen] = useState(false);
  const [publishedInfoTarget, setPublishedInfoTarget] = useState<Coach | null>(
    null,
  );

  const approvedProvidersToggleRef = useRef<HTMLButtonElement | null>(null);
  const rejectedProvidersToggleRef = useRef<HTMLButtonElement | null>(null);
  const myPendingToggleRef = useRef<HTMLButtonElement | null>(null);
  const myApprovedToggleRef = useRef<HTMLButtonElement | null>(null);
  const myRejectedToggleRef = useRef<HTMLButtonElement | null>(null);

  const state = useCoachesPageState({ isSuper, meId });

  const isOtherProviderItem = (c: Coach) => {
    const pid = cleanStr((c as any)?.providerId);
    if (!pid) return false;
    if (!meId) return true;
    return pid !== meId;
  };

  const muts = useCoachesPageMutations({
    isSuper,
    isProviderItem: isOtherProviderItem,
    applySplitMoveProvider: state.applySplitMoveProvider,
    applySplitUpsert: state.applySplitUpsert,
    applySplitRemove: state.applySplitRemove,
    applyMineUpsert: state.applyMineUpsert,
    applyMineRemove: state.applyMineRemove,
    resetSelections: state.resetSelections,
  });

  useEffect(() => {
    if (!isSuper) {
      state.setSplitFromResponse(null);
      return;
    }
    if (resp) state.setSplitFromResponse(resp);
  }, [isSuper, resp]);

  useEffect(() => {
    if (isSuper) return;
    state.setMineFromItems(Array.isArray(items) ? items : []);
  }, [isSuper, items]);

  function coachRowId(c: Coach) {
    return cleanStr((c as any)?.slug) || cleanStr((c as any)?.id);
  }

  function openDelete(c: Coach) {
    setDeleteTarget(c);
    setDeleteOpen(true);
  }

  async function togglePublished(c: Coach, next: boolean) {
    const id = coachRowId(c);
    if (!id || muts.mutating) return;
    setPublishedBusyId(id);
    try {
      await Promise.resolve(muts.togglePublished(c, next));
    } finally {
      setPublishedBusyId(null);
    }
  }

  const pendingCount = isSuper ? state.providersPendingAll.length : 0;

  return (
    <div className="coaches coaches-admin ks">
      <main className="container">
        <CoachesFilters
          q={state.q}
          sort={state.sort}
          onChangeQ={(v) => {
            state.setQ(v);
            state.resetPages();
          }}
          onChangeSort={(v) => {
            state.setSort(v);
            state.resetPages();
          }}
          actionSlot={
            <CreateCoachButton
              busy={muts.mutating}
              onOpen={() => setCreateOpen(true)}
            />
          }
        />

        {error ? (
          <div className="card" role="alert">
            <div className="text-red-600">{error}</div>
          </div>
        ) : null}

        {muts.notice ? (
          <div className="card" role="status">
            <div className="text-red-600">{muts.notice}</div>
          </div>
        ) : null}

        {isSuper ? (
          <section className="coach-admin__section">
            <div className="coach-admin__section-head">
              <h2 className="coach-admin__section-title">
                Providers – Pending review
              </h2>
              <span className="coach-admin__section-meta">
                {pendingCount ? `(${pendingCount} new)` : ""}
              </span>
            </div>

            <div className="coach-admin__box coach-admin__box--scroll3">
              {loading && !state.split ? (
                <section className="card">
                  <div className="card__empty">Loading…</div>
                </section>
              ) : (
                <PendingCoachesList
                  items={state.providersPending.slice}
                  onOpen={(c) => setEditItem(c)}
                  onApprove={async (c) => {
                    const slug = cleanStr((c as any).slug);
                    if (!slug || muts.mutating) return;
                    setPendingBusySlug(slug);
                    try {
                      await muts.handleApprove(slug);
                    } finally {
                      setPendingBusySlug(null);
                    }
                  }}
                  onReject={(c) => {
                    const slug = cleanStr((c as any).slug);
                    if (!slug || muts.mutating) return;
                    setPendingBusySlug(slug);
                    setRejectTarget(c);
                    setRejectOpen(true);
                  }}
                  busy={muts.mutating}
                  busySlug={pendingBusySlug}
                />
              )}
            </div>

            <Pagination
              page={state.providersPending.page}
              pages={state.providersPending.pages}
              onPrev={() =>
                state.pages.setPagePendingProviders((p) => Math.max(1, p - 1))
              }
              onNext={() =>
                state.pages.setPagePendingProviders((p) =>
                  Math.min(state.providersPending.pages, p + 1),
                )
              }
            />
          </section>
        ) : null}

        {isSuper ? (
          <section className="coach-admin__section">
            <div className="coach-admin__section-head">
              <h2 className="coach-admin__section-title">
                Providers – Approved
              </h2>
              <span className="coach-admin__section-meta">
                {state.providersApprovedAll.length
                  ? `(${state.providersApprovedAll.length})`
                  : ""}
              </span>
            </div>

            <div className="coach-admin__box coach-admin__box--scroll3">
              <CoachTableList
                items={state.providersApproved.slice}
                selectMode={state.selects.selectApprovedProviders}
                onToggleSelectMode={() =>
                  state.selects.setSelectApprovedProviders((s) => !s)
                }
                busy={muts.mutating}
                onOpen={(c) => setEditItem(c)}
                onDeleteMany={muts.deleteMany}
                toggleBtnRef={approvedProvidersToggleRef}
                onInfo={(c) => {
                  setPublishedInfoTarget(c);
                  setPublishedInfoOpen(true);
                }}
                onUnapprove={openDelete}
                onReject={(c) => {
                  setRejectTarget(c);
                  setRejectOpen(true);
                }}
                meLabel={meLabel}
                onTogglePublished={togglePublished}
                publishedBusyId={publishedBusyId}
              />
            </div>

            <Pagination
              page={state.providersApproved.page}
              pages={state.providersApproved.pages}
              onPrev={() =>
                state.pages.setPageApprovedProviders((p) => Math.max(1, p - 1))
              }
              onNext={() =>
                state.pages.setPageApprovedProviders((p) =>
                  Math.min(state.providersApproved.pages, p + 1),
                )
              }
            />
          </section>
        ) : null}

        {isSuper ? (
          <section className="coach-admin__section">
            <div className="coach-admin__section-head">
              <h2 className="coach-admin__section-title">
                Providers – Rejected
              </h2>
              <span className="coach-admin__section-meta">
                {state.providersRejectedAll.length
                  ? `(${state.providersRejectedAll.length})`
                  : ""}
              </span>
            </div>

            <div className="coach-admin__box coach-admin__box--scroll3">
              <CoachTableList
                items={state.providersRejected.slice}
                selectMode={state.selects.selectRejectedProviders}
                onToggleSelectMode={() =>
                  state.selects.setSelectRejectedProviders((s) => !s)
                }
                busy={muts.mutating}
                onOpen={(c) => setEditItem(c)}
                onDeleteMany={muts.deleteMany}
                toggleBtnRef={rejectedProvidersToggleRef}
                onInfo={(c) => {
                  setRejectInfoTarget(c);
                  setRejectInfoOpen(true);
                }}
                onUnapprove={openDelete}
                meLabel={meLabel}
              />
            </div>

            <Pagination
              page={state.providersRejected.page}
              pages={state.providersRejected.pages}
              onPrev={() =>
                state.pages.setPageRejectedProviders((p) => Math.max(1, p - 1))
              }
              onNext={() =>
                state.pages.setPageRejectedProviders((p) =>
                  Math.min(state.providersRejected.pages, p + 1),
                )
              }
            />
          </section>
        ) : null}

        {!isSuper ? (
          <section className="coach-admin__section">
            <div className="coach-admin__section-head">
              <h2 className="coach-admin__section-title">
                Coaches – Pending review
              </h2>
              <span className="coach-admin__section-meta">
                {state.myLists.pending.length
                  ? `(${state.myLists.pending.length})`
                  : ""}
              </span>
            </div>

            <div className="coach-admin__box coach-admin__box--scroll3">
              <CoachTableList
                items={state.myPending.slice}
                selectMode={state.selects.selectMyPending}
                onToggleSelectMode={() =>
                  state.selects.setSelectMyPending((s) => !s)
                }
                busy={muts.mutating}
                onOpen={(c) => setEditItem(c)}
                onDeleteMany={muts.deleteMany}
                toggleBtnRef={myPendingToggleRef}
                authorDash={true}
                meLabel={meLabel}
                onDelete={openDelete}
              />
            </div>

            <Pagination
              page={state.myPending.page}
              pages={state.myPending.pages}
              onPrev={() =>
                state.pages.setPageMyPending((p) => Math.max(1, p - 1))
              }
              onNext={() =>
                state.pages.setPageMyPending((p) =>
                  Math.min(state.myPending.pages, p + 1),
                )
              }
            />
          </section>
        ) : null}

        {!isSuper ? (
          <section className="coach-admin__section">
            <div className="coach-admin__section-head">
              <h2 className="coach-admin__section-title">Coaches – Approved</h2>
              <span className="coach-admin__section-meta">
                {state.myLists.approved.length
                  ? `(${state.myLists.approved.length})`
                  : ""}
              </span>
            </div>

            <div className="coach-admin__box coach-admin__box--scroll3">
              <CoachTableList
                items={state.myApproved.slice}
                selectMode={state.selects.selectMyApproved}
                onToggleSelectMode={() =>
                  state.selects.setSelectMyApproved((s) => !s)
                }
                busy={muts.mutating}
                onOpen={(c) => setEditItem(c)}
                onDeleteMany={muts.deleteMany}
                toggleBtnRef={myApprovedToggleRef}
                authorDash={true}
                meLabel={meLabel}
                onInfo={(c) => {
                  setPublishedInfoTarget(c);
                  setPublishedInfoOpen(true);
                }}
                onResubmit={(c) => muts.handleSubmit(cleanStr((c as any).slug))}
                canResubmit={(c) => canSubmitUpdate(c)}
                onTogglePublished={togglePublished}
                publishedBusyId={publishedBusyId}
                onDelete={openDelete}
              />
            </div>

            <Pagination
              page={state.myApproved.page}
              pages={state.myApproved.pages}
              onPrev={() =>
                state.pages.setPageMyApproved((p) => Math.max(1, p - 1))
              }
              onNext={() =>
                state.pages.setPageMyApproved((p) =>
                  Math.min(state.myApproved.pages, p + 1),
                )
              }
            />
          </section>
        ) : null}

        {!isSuper ? (
          <section className="coach-admin__section">
            <div className="coach-admin__section-head">
              <h2 className="coach-admin__section-title">Coaches – Rejected</h2>
              <span className="coach-admin__section-meta">
                {state.myLists.rejected.length
                  ? `(${state.myLists.rejected.length})`
                  : ""}
              </span>
            </div>

            <div className="coach-admin__box coach-admin__box--scroll3">
              <CoachTableList
                items={state.myRejected.slice}
                selectMode={state.selects.selectMyRejected}
                onToggleSelectMode={() =>
                  state.selects.setSelectMyRejected((s) => !s)
                }
                busy={muts.mutating}
                onOpen={(c) => setEditItem(c)}
                onDeleteMany={muts.deleteMany}
                toggleBtnRef={myRejectedToggleRef}
                authorDash={true}
                meLabel={meLabel}
                onDelete={openDelete}
                onInfo={(c) => {
                  setRejectInfoTarget(c);
                  setRejectInfoOpen(true);
                }}
                onResubmit={(c) => muts.handleSubmit(cleanStr((c as any).slug))}
                canResubmit={(c) => canSubmitUpdate(c)}
              />
            </div>

            <Pagination
              page={state.myRejected.page}
              pages={state.myRejected.pages}
              onPrev={() =>
                state.pages.setPageMyRejected((p) => Math.max(1, p - 1))
              }
              onNext={() =>
                state.pages.setPageMyRejected((p) =>
                  Math.min(state.myRejected.pages, p + 1),
                )
              }
            />
          </section>
        ) : null}

        {isSuper ? (
          <section className="coach-admin__section">
            <div className="coach-admin__section-head">
              <h2 className="coach-admin__section-title">
                My coaches – Approved
              </h2>
              <span className="coach-admin__section-meta">
                {state.myLists.approved.length
                  ? `(${state.myLists.approved.length})`
                  : ""}
              </span>
            </div>

            <div className="coach-admin__box coach-admin__box--scroll3">
              <CoachTableList
                items={state.myApproved.slice}
                selectMode={state.selects.selectMyApproved}
                onToggleSelectMode={() =>
                  state.selects.setSelectMyApproved((s) => !s)
                }
                busy={muts.mutating}
                onOpen={(c) => setEditItem(c)}
                onDeleteMany={muts.deleteMany}
                toggleBtnRef={myApprovedToggleRef}
                authorDash={false}
                meLabel={meLabel}
                onUnapprove={openDelete}
                onInfo={(c) => {
                  setPublishedInfoTarget(c);
                  setPublishedInfoOpen(true);
                }}
                onTogglePublished={togglePublished}
                publishedBusyId={publishedBusyId}
              />
            </div>

            <Pagination
              page={state.myApproved.page}
              pages={state.myApproved.pages}
              onPrev={() =>
                state.pages.setPageMyApproved((p) => Math.max(1, p - 1))
              }
              onNext={() =>
                state.pages.setPageMyApproved((p) =>
                  Math.min(state.myApproved.pages, p + 1),
                )
              }
            />
          </section>
        ) : null}
      </main>

      <CoachDialog
        open={createOpen}
        mode="create"
        onClose={() => setCreateOpen(false)}
        onSubmit={async (vals) => {
          const created = await muts.handleCreate(vals);
          if (created) setCreateOpen(false);
        }}
      />

      <CoachDialog
        open={!!editItem}
        mode="edit"
        initial={editItem || undefined}
        onClose={() => setEditItem(null)}
        onSubmit={async (vals) => {
          if (!editItem) return;
          const updated = await muts.handleSave(
            cleanStr((editItem as any).slug),
            vals,
          );
          if (updated) setEditItem(null);
        }}
      />

      <DeleteCoachDialog
        open={deleteOpen}
        coachName={deleteTarget ? fullName(deleteTarget) : ""}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await muts.handleDelete(cleanStr((deleteTarget as any).slug));
          setDeleteOpen(false);
          setDeleteTarget(null);
        }}
      />

      <RejectDialog
        open={rejectOpen}
        onClose={() => {
          setRejectOpen(false);
          setRejectTarget(null);
          setPendingBusySlug(null);
        }}
        onSubmit={async (reason) => {
          if (!rejectTarget) return;
          try {
            await muts.handleReject(
              cleanStr((rejectTarget as any).slug),
              reason,
            );
          } finally {
            setRejectOpen(false);
            setRejectTarget(null);
            setPendingBusySlug(null);
          }
        }}
      />

      <CoachInfoDialog
        open={rejectInfoOpen}
        coach={rejectInfoTarget}
        onClose={() => {
          setRejectInfoOpen(false);
          setRejectInfoTarget(null);
        }}
      />

      <CoachPublishedInfoDialog
        open={publishedInfoOpen}
        coach={publishedInfoTarget}
        onClose={() => {
          setPublishedInfoOpen(false);
          setPublishedInfoTarget(null);
        }}
      />
    </div>
  );
}

// "use client";

// import { useEffect, useRef, useState } from "react";
// import CoachDialog from "@/app/components/CoachDialog";
// import type { Coach } from "./types";
// import CoachesFilters from "./components/CoachesFilters";
// import Pagination from "./components/Pagination";
// import PendingCoachesList from "./components/PendingCoachesList";
// import CoachTableList from "./components/CoachTableList";
// import ConfirmDialog from "./moderation/ConfirmDialog";
// import RejectDialog from "./moderation/RejectDialog";
// import CoachInfoDialog from "./moderation/CoachInfoDialog";
// import CoachPublishedInfoDialog from "./components/CoachPublishedInfoDialog";
// import { fullName, canSubmitUpdate } from "./utils";
// import { useCoachesData } from "./hooks/useCoachesData";
// import { cleanStr } from "./pageHelpers";
// import { useCoachesPageState } from "./hooks/useCoachesPageState";
// import { useCoachesPageMutations } from "./hooks/useCoachesPageMutations";

// function CreateCoachButton({
//   busy,
//   onOpen,
// }: {
//   busy: boolean;
//   onOpen: () => void;
// }) {
//   return (
//     <button
//       className="btn"
//       type="button"
//       onClick={() => {
//         if (busy) return;
//         onOpen();
//       }}
//     >
//       <img
//         src="/icons/plus.svg"
//         alt=""
//         aria-hidden="true"
//         className="btn__icon"
//       />
//       Neuer Coach
//     </button>
//   );
// }

// export default function CoachesAdminPage() {
//   const { me, items, resp, loading, error } = useCoachesData();

//   const isSuper = Boolean((me as any)?.isSuperAdmin);
//   const meId = cleanStr((me as any)?.id);
//   const meLabel = cleanStr((me as any)?.fullName) || "Ich";

//   const [createOpen, setCreateOpen] = useState(false);
//   const [editItem, setEditItem] = useState<Coach | null>(null);

//   const [pendingBusySlug, setPendingBusySlug] = useState<string | null>(null);
//   const [publishedBusyId, setPublishedBusyId] = useState<string | null>(null);

//   const [confirmOpen, setConfirmOpen] = useState(false);
//   const [confirmTitle, setConfirmTitle] = useState("");
//   const [confirmText, setConfirmText] = useState("");

//   const [rejectOpen, setRejectOpen] = useState(false);
//   const [rejectTarget, setRejectTarget] = useState<Coach | null>(null);

//   const [rejectInfoOpen, setRejectInfoOpen] = useState(false);
//   const [rejectInfoTarget, setRejectInfoTarget] = useState<Coach | null>(null);

//   const [publishedInfoOpen, setPublishedInfoOpen] = useState(false);
//   const [publishedInfoTarget, setPublishedInfoTarget] = useState<Coach | null>(
//     null,
//   );

//   const approvedProvidersToggleRef = useRef<HTMLButtonElement | null>(null);
//   const rejectedProvidersToggleRef = useRef<HTMLButtonElement | null>(null);
//   const myPendingToggleRef = useRef<HTMLButtonElement | null>(null);
//   const myApprovedToggleRef = useRef<HTMLButtonElement | null>(null);
//   const myRejectedToggleRef = useRef<HTMLButtonElement | null>(null);

//   const state = useCoachesPageState({ isSuper, meId });

//   const isOtherProviderItem = (c: Coach) => {
//     const pid = cleanStr((c as any)?.providerId);
//     if (!pid) return false;
//     if (!meId) return true;
//     return pid !== meId;
//   };

//   const muts = useCoachesPageMutations({
//     isSuper,
//     isProviderItem: isOtherProviderItem,
//     applySplitMoveProvider: state.applySplitMoveProvider,
//     applySplitUpsert: state.applySplitUpsert,
//     applySplitRemove: state.applySplitRemove,
//     applyMineUpsert: state.applyMineUpsert,
//     applyMineRemove: state.applyMineRemove,
//     resetSelections: state.resetSelections,
//   });

//   useEffect(() => {
//     if (!isSuper) {
//       state.setSplitFromResponse(null);
//       return;
//     }
//     if (resp) state.setSplitFromResponse(resp);
//   }, [isSuper, resp]);

//   useEffect(() => {
//     if (isSuper) return;
//     state.setMineFromItems(Array.isArray(items) ? items : []);
//   }, [isSuper, items]);

//   function openConfirm(opts: {
//     title: string;
//     text: string;
//     action: () => Promise<void>;
//   }) {
//     setConfirmTitle(opts.title);
//     setConfirmText(opts.text);
//     muts.confirmActionRef.current = opts.action;
//     setConfirmOpen(true);
//   }

//   function coachRowId(c: Coach) {
//     return cleanStr((c as any)?.slug) || cleanStr((c as any)?.id);
//   }

//   async function togglePublished(c: Coach, next: boolean) {
//     const id = coachRowId(c);
//     if (!id || muts.mutating) return;
//     setPublishedBusyId(id);
//     try {
//       await Promise.resolve(muts.togglePublished(c, next));
//     } finally {
//       setPublishedBusyId(null);
//     }
//   }

//   const pendingCount = isSuper ? state.providersPendingAll.length : 0;

//   return (
//     <div className="coaches coaches-admin ks">
//       <main className="container">
//         <CoachesFilters
//           q={state.q}
//           sort={state.sort}
//           onChangeQ={(v) => {
//             state.setQ(v);
//             state.resetPages();
//           }}
//           onChangeSort={(v) => {
//             state.setSort(v);
//             state.resetPages();
//           }}
//           actionSlot={
//             <CreateCoachButton
//               busy={muts.mutating}
//               onOpen={() => setCreateOpen(true)}
//             />
//           }
//         />

//         {error ? (
//           <div className="card" role="alert">
//             <div className="text-red-600">{error}</div>
//           </div>
//         ) : null}

//         {muts.notice ? (
//           <div className="card" role="status">
//             <div className="text-red-600">{muts.notice}</div>
//           </div>
//         ) : null}

//         {isSuper ? (
//           <section className="coach-admin__section">
//             <div className="coach-admin__section-head">
//               <h2 className="coach-admin__section-title">
//                 Lizenznehmer – Zu prüfen
//               </h2>
//               <span className="coach-admin__section-meta">
//                 {pendingCount ? `(${pendingCount} neu)` : ""}
//               </span>
//             </div>

//             <div className="coach-admin__box coach-admin__box--scroll3">
//               {loading && !state.split ? (
//                 <section className="card">
//                   <div className="card__empty">Loading…</div>
//                 </section>
//               ) : (
//                 <PendingCoachesList
//                   items={state.providersPending.slice}
//                   onOpen={(c) => setEditItem(c)}
//                   onApprove={async (c) => {
//                     const slug = cleanStr((c as any).slug);
//                     if (!slug || muts.mutating) return;
//                     setPendingBusySlug(slug);
//                     try {
//                       await muts.handleApprove(slug);
//                     } finally {
//                       setPendingBusySlug(null);
//                     }
//                   }}
//                   onReject={(c) => {
//                     const slug = cleanStr((c as any).slug);
//                     if (!slug || muts.mutating) return;
//                     setPendingBusySlug(slug);
//                     setRejectTarget(c);
//                     setRejectOpen(true);
//                   }}
//                   busy={muts.mutating}
//                   busySlug={pendingBusySlug}
//                 />
//               )}
//             </div>

//             <Pagination
//               page={state.providersPending.page}
//               pages={state.providersPending.pages}
//               onPrev={() =>
//                 state.pages.setPagePendingProviders((p) => Math.max(1, p - 1))
//               }
//               onNext={() =>
//                 state.pages.setPagePendingProviders((p) =>
//                   Math.min(state.providersPending.pages, p + 1),
//                 )
//               }
//             />
//           </section>
//         ) : null}

//         {isSuper ? (
//           <section className="coach-admin__section">
//             <div className="coach-admin__section-head">
//               <h2 className="coach-admin__section-title">
//                 Lizenznehmer – Freigegeben
//               </h2>
//               <span className="coach-admin__section-meta">
//                 {state.providersApprovedAll.length
//                   ? `(${state.providersApprovedAll.length})`
//                   : ""}
//               </span>
//             </div>

//             <div className="coach-admin__box coach-admin__box--scroll3">
//               <CoachTableList
//                 items={state.providersApproved.slice}
//                 selectMode={state.selects.selectApprovedProviders}
//                 onToggleSelectMode={() =>
//                   state.selects.setSelectApprovedProviders((s) => !s)
//                 }
//                 busy={muts.mutating}
//                 onOpen={(c) => setEditItem(c)}
//                 onDeleteMany={muts.deleteMany}
//                 toggleBtnRef={approvedProvidersToggleRef}
//                 onInfo={(c) => {
//                   setPublishedInfoTarget(c);
//                   setPublishedInfoOpen(true);
//                 }}
//                 onUnapprove={(c) => {
//                   openConfirm({
//                     // title: "Coach löschen",
//                     // text: `Coach "${fullName(c)}" wirklich löschen?`,
//                     title: "Delete coach",
//                     text: `Do you really want to delete coach "${fullName(c)}"?`,
//                     action: async () =>
//                       muts.handleDelete(cleanStr((c as any).slug)),
//                   });
//                 }}
//                 onReject={(c) => {
//                   setRejectTarget(c);
//                   setRejectOpen(true);
//                 }}
//                 meLabel={meLabel}
//                 onTogglePublished={togglePublished}
//                 publishedBusyId={publishedBusyId}
//               />
//             </div>

//             <Pagination
//               page={state.providersApproved.page}
//               pages={state.providersApproved.pages}
//               onPrev={() =>
//                 state.pages.setPageApprovedProviders((p) => Math.max(1, p - 1))
//               }
//               onNext={() =>
//                 state.pages.setPageApprovedProviders((p) =>
//                   Math.min(state.providersApproved.pages, p + 1),
//                 )
//               }
//             />
//           </section>
//         ) : null}

//         {isSuper ? (
//           <section className="coach-admin__section">
//             <div className="coach-admin__section-head">
//               <h2 className="coach-admin__section-title">
//                 Lizenznehmer – Abgelehnt
//               </h2>
//               <span className="coach-admin__section-meta">
//                 {state.providersRejectedAll.length
//                   ? `(${state.providersRejectedAll.length})`
//                   : ""}
//               </span>
//             </div>

//             <div className="coach-admin__box coach-admin__box--scroll3">
//               <CoachTableList
//                 items={state.providersRejected.slice}
//                 selectMode={state.selects.selectRejectedProviders}
//                 onToggleSelectMode={() =>
//                   state.selects.setSelectRejectedProviders((s) => !s)
//                 }
//                 busy={muts.mutating}
//                 onOpen={(c) => setEditItem(c)}
//                 onDeleteMany={muts.deleteMany}
//                 toggleBtnRef={rejectedProvidersToggleRef}
//                 onInfo={(c) => {
//                   setRejectInfoTarget(c);
//                   setRejectInfoOpen(true);
//                 }}
//                 onUnapprove={(c) => {
//                   openConfirm({
//                     title: "Coach löschen",
//                     text: `Coach "${fullName(c)}" wirklich löschen?`,
//                     action: async () =>
//                       muts.handleDelete(cleanStr((c as any).slug)),
//                   });
//                 }}
//                 meLabel={meLabel}
//               />
//             </div>

//             <Pagination
//               page={state.providersRejected.page}
//               pages={state.providersRejected.pages}
//               onPrev={() =>
//                 state.pages.setPageRejectedProviders((p) => Math.max(1, p - 1))
//               }
//               onNext={() =>
//                 state.pages.setPageRejectedProviders((p) =>
//                   Math.min(state.providersRejected.pages, p + 1),
//                 )
//               }
//             />
//           </section>
//         ) : null}

//         {!isSuper ? (
//           <section className="coach-admin__section">
//             <div className="coach-admin__section-head">
//               <h2 className="coach-admin__section-title">
//                 Coaches – Zu prüfen
//               </h2>
//               <span className="coach-admin__section-meta">
//                 {state.myLists.pending.length
//                   ? `(${state.myLists.pending.length})`
//                   : ""}
//               </span>
//             </div>

//             <div className="coach-admin__box coach-admin__box--scroll3">
//               <CoachTableList
//                 items={state.myPending.slice}
//                 selectMode={state.selects.selectMyPending}
//                 onToggleSelectMode={() =>
//                   state.selects.setSelectMyPending((s) => !s)
//                 }
//                 busy={muts.mutating}
//                 onOpen={(c) => setEditItem(c)}
//                 onDeleteMany={muts.deleteMany}
//                 toggleBtnRef={myPendingToggleRef}
//                 authorDash={true}
//                 meLabel={meLabel}
//                 onDelete={(c) => {
//                   openConfirm({
//                     title: "Coach löschen",
//                     text: `Coach "${fullName(c)}" wirklich löschen?`,
//                     action: async () => {
//                       await muts.handleDelete(cleanStr((c as any).slug));
//                     },
//                   });
//                 }}
//               />
//             </div>

//             <Pagination
//               page={state.myPending.page}
//               pages={state.myPending.pages}
//               onPrev={() =>
//                 state.pages.setPageMyPending((p) => Math.max(1, p - 1))
//               }
//               onNext={() =>
//                 state.pages.setPageMyPending((p) =>
//                   Math.min(state.myPending.pages, p + 1),
//                 )
//               }
//             />
//           </section>
//         ) : null}

//         {!isSuper ? (
//           <section className="coach-admin__section">
//             <div className="coach-admin__section-head">
//               <h2 className="coach-admin__section-title">
//                 Coaches – Freigegeben
//               </h2>
//               <span className="coach-admin__section-meta">
//                 {state.myLists.approved.length
//                   ? `(${state.myLists.approved.length})`
//                   : ""}
//               </span>
//             </div>

//             <div className="coach-admin__box coach-admin__box--scroll3">
//               <CoachTableList
//                 items={state.myApproved.slice}
//                 selectMode={state.selects.selectMyApproved}
//                 onToggleSelectMode={() =>
//                   state.selects.setSelectMyApproved((s) => !s)
//                 }
//                 busy={muts.mutating}
//                 onOpen={(c) => setEditItem(c)}
//                 onDeleteMany={muts.deleteMany}
//                 toggleBtnRef={myApprovedToggleRef}
//                 authorDash={true}
//                 meLabel={meLabel}
//                 onInfo={(c) => {
//                   setPublishedInfoTarget(c);
//                   setPublishedInfoOpen(true);
//                 }}
//                 onResubmit={(c) => muts.handleSubmit(cleanStr((c as any).slug))}
//                 canResubmit={(c) => canSubmitUpdate(c)}
//                 onTogglePublished={togglePublished}
//                 publishedBusyId={publishedBusyId}
//                 onDelete={(c) => {
//                   openConfirm({
//                     title: "Coach löschen",
//                     text: `Coach "${fullName(c)}" wirklich löschen?`,
//                     action: async () => {
//                       await muts.handleDelete(cleanStr((c as any).slug));
//                     },
//                   });
//                 }}
//               />
//             </div>

//             <Pagination
//               page={state.myApproved.page}
//               pages={state.myApproved.pages}
//               onPrev={() =>
//                 state.pages.setPageMyApproved((p) => Math.max(1, p - 1))
//               }
//               onNext={() =>
//                 state.pages.setPageMyApproved((p) =>
//                   Math.min(state.myApproved.pages, p + 1),
//                 )
//               }
//             />
//           </section>
//         ) : null}

//         {!isSuper ? (
//           <section className="coach-admin__section">
//             <div className="coach-admin__section-head">
//               <h2 className="coach-admin__section-title">
//                 Coaches – Abgelehnt
//               </h2>
//               <span className="coach-admin__section-meta">
//                 {state.myLists.rejected.length
//                   ? `(${state.myLists.rejected.length})`
//                   : ""}
//               </span>
//             </div>

//             <div className="coach-admin__box coach-admin__box--scroll3">
//               <CoachTableList
//                 items={state.myRejected.slice}
//                 selectMode={state.selects.selectMyRejected}
//                 onToggleSelectMode={() =>
//                   state.selects.setSelectMyRejected((s) => !s)
//                 }
//                 busy={muts.mutating}
//                 onOpen={(c) => setEditItem(c)}
//                 onDeleteMany={muts.deleteMany}
//                 toggleBtnRef={myRejectedToggleRef}
//                 authorDash={true}
//                 meLabel={meLabel}
//                 onDelete={(c) => {
//                   openConfirm({
//                     title: "Coach löschen",
//                     text: `Coach "${fullName(c)}" wirklich löschen?`,
//                     action: async () => {
//                       await muts.handleDelete(cleanStr((c as any).slug));
//                     },
//                   });
//                 }}
//                 onInfo={(c) => {
//                   setRejectInfoTarget(c);
//                   setRejectInfoOpen(true);
//                 }}
//                 onResubmit={(c) => muts.handleSubmit(cleanStr((c as any).slug))}
//                 canResubmit={(c) => canSubmitUpdate(c)}
//               />
//             </div>

//             <Pagination
//               page={state.myRejected.page}
//               pages={state.myRejected.pages}
//               onPrev={() =>
//                 state.pages.setPageMyRejected((p) => Math.max(1, p - 1))
//               }
//               onNext={() =>
//                 state.pages.setPageMyRejected((p) =>
//                   Math.min(state.myRejected.pages, p + 1),
//                 )
//               }
//             />
//           </section>
//         ) : null}

//         {isSuper ? (
//           <section className="coach-admin__section">
//             <div className="coach-admin__section-head">
//               <h2 className="coach-admin__section-title">
//                 Meine Coaches – Freigegeben
//               </h2>
//               <span className="coach-admin__section-meta">
//                 {state.myLists.approved.length
//                   ? `(${state.myLists.approved.length})`
//                   : ""}
//               </span>
//             </div>

//             <div className="coach-admin__box coach-admin__box--scroll3">
//               <CoachTableList
//                 items={state.myApproved.slice}
//                 selectMode={state.selects.selectMyApproved}
//                 onToggleSelectMode={() =>
//                   state.selects.setSelectMyApproved((s) => !s)
//                 }
//                 busy={muts.mutating}
//                 onOpen={(c) => setEditItem(c)}
//                 onDeleteMany={muts.deleteMany}
//                 toggleBtnRef={myApprovedToggleRef}
//                 authorDash={false}
//                 meLabel={meLabel}
//                 onUnapprove={(c) => {
//                   openConfirm({
//                     title: "Coach löschen",
//                     text: `Coach "${fullName(c)}" wirklich löschen?`,
//                     action: async () =>
//                       muts.handleDelete(cleanStr((c as any).slug)),
//                   });
//                 }}
//                 onInfo={(c) => {
//                   setPublishedInfoTarget(c);
//                   setPublishedInfoOpen(true);
//                 }}
//                 onTogglePublished={togglePublished}
//                 publishedBusyId={publishedBusyId}
//               />
//             </div>

//             <Pagination
//               page={state.myApproved.page}
//               pages={state.myApproved.pages}
//               onPrev={() =>
//                 state.pages.setPageMyApproved((p) => Math.max(1, p - 1))
//               }
//               onNext={() =>
//                 state.pages.setPageMyApproved((p) =>
//                   Math.min(state.myApproved.pages, p + 1),
//                 )
//               }
//             />
//           </section>
//         ) : null}
//       </main>

//       <CoachDialog
//         open={createOpen}
//         mode="create"
//         onClose={() => setCreateOpen(false)}
//         onSubmit={async (vals) => {
//           const created = await muts.handleCreate(vals);
//           if (created) setCreateOpen(false);
//         }}
//       />

//       <CoachDialog
//         open={!!editItem}
//         mode="edit"
//         initial={editItem || undefined}
//         onClose={() => setEditItem(null)}
//         onSubmit={async (vals) => {
//           if (!editItem) return;
//           const updated = await muts.handleSave(
//             cleanStr((editItem as any).slug),
//             vals,
//           );
//           if (updated) setEditItem(null);
//         }}
//       />

//       <ConfirmDialog
//         open={confirmOpen}
//         title={confirmTitle}
//         text={confirmText}
//         danger={false}
//         onClose={() => {
//           setConfirmOpen(false);
//           muts.confirmActionRef.current = null;
//         }}
//         onConfirm={async () => {
//           const fn = muts.confirmActionRef.current;
//           if (!fn) return;
//           await fn();
//           setConfirmOpen(false);
//           muts.confirmActionRef.current = null;
//         }}
//       />

//       <RejectDialog
//         open={rejectOpen}
//         onClose={() => {
//           setRejectOpen(false);
//           setRejectTarget(null);
//           setPendingBusySlug(null);
//         }}
//         onSubmit={async (reason) => {
//           if (!rejectTarget) return;
//           try {
//             await muts.handleReject(
//               cleanStr((rejectTarget as any).slug),
//               reason,
//             );
//           } finally {
//             setRejectOpen(false);
//             setRejectTarget(null);
//             setPendingBusySlug(null);
//           }
//         }}
//       />

//       <CoachInfoDialog
//         open={rejectInfoOpen}
//         coach={rejectInfoTarget}
//         onClose={() => {
//           setRejectInfoOpen(false);
//           setRejectInfoTarget(null);
//         }}
//       />

//       <CoachPublishedInfoDialog
//         open={publishedInfoOpen}
//         coach={publishedInfoTarget}
//         onClose={() => {
//           setPublishedInfoOpen(false);
//           setPublishedInfoTarget(null);
//         }}
//       />
//     </div>
//   );
// }
