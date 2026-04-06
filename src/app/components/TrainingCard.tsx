// src/app/components/TrainingCard.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import OfferCreateDialog from "@/app/components/OfferCreateDialog";
import type { CreateOfferPayload } from "@/app/components/offer-create-dialog/types";
import type {
  Offer,
  TrainingSortKey,
} from "@/app/components/training-card/types";
import { useDropdownOutsideClose } from "@/app/components/training-card/hooks/useDropdownOutsideClose";
import { useBootstrapFromURL } from "@/app/components/training-card/hooks/useBootstrapFromURL";
import { useCities } from "@/app/components/training-card/hooks/useCities";
import { useOffers } from "@/app/components/training-card/hooks/useOffers";
import TrainingFilters from "@/app/components/training-card/ui/TrainingFilters";
import TrainingResults from "@/app/components/training-card/ui/TrainingResults";
import TrainingPager from "@/app/components/training-card/ui/TrainingPager";
import { sortTrainingItems } from "@/app/components/training-card/utils";

type OfferCreateDialogInitial = NonNullable<
  React.ComponentProps<typeof OfferCreateDialog>["initial"]
>;

function asDialog<T>(value: unknown) {
  return value as T;
}

function toNumberOrNull(value: number | "") {
  return value === "" ? null : Number(value);
}

function toPrice(value: number | "") {
  return value === "" ? 0 : Number(value);
}

function buildOfferPayload(payload: CreateOfferPayload) {
  return {
    ...payload,
    ageFrom: toNumberOrNull(payload.ageFrom),
    ageTo: toNumberOrNull(payload.ageTo),
    price: toPrice(payload.price),
  };
}

export default function TrainingCard() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [q, setQ] = useState("");
  const [courseValue, setCourseValue] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [locations, setLocations] = useState<string[]>([]);
  const [sort, setSort] = useState<TrainingSortKey>("newest");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [items, setItems] = useState<Offer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { pendingOpenIdRef } = useBootstrapFromURL({
    setQ,
    setLocationFilter,
    setCourseValue,
  });

  const [locationOpen, setLocationOpen] = useState(false);
  const [courseOpen, setCourseOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const locationDropdownRef = useRef<HTMLDivElement | null>(null);
  const courseDropdownRef = useRef<HTMLDivElement | null>(null);
  const sortDropdownRef = useRef<HTMLDivElement | null>(null);

  useDropdownOutsideClose({
    locationDropdownRef,
    courseDropdownRef,
    sortDropdownRef,
    closeLocation: () => setLocationOpen(false),
    closeCourse: () => setCourseOpen(false),
    closeSort: () => setSortOpen(false),
  });

  useCities({ setLocations });

  useOffers({
    q,
    courseValue,
    locationFilter,
    page,
    limit,
    refreshTick,
    setLoading,
    setItems,
    setTotal,
    setSelectedIds,
  });

  useEffect(() => {
    if (!pendingOpenIdRef.current || !items.length) return;
    const found = items.find((item) => item._id === pendingOpenIdRef.current);
    if (!found) return;
    setEditing(found);
    setEditOpen(true);
    pendingOpenIdRef.current = null;
  }, [items, pendingOpenIdRef]);

  useEffect(() => {
    setSelectMode(false);
    setSelectedIds([]);
  }, [page, q, courseValue, locationFilter, sort]);

  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(total / limit)),
    [total, limit],
  );

  const sortedItems = useMemo(
    () => sortTrainingItems(items, sort),
    [items, sort],
  );

  function startEdit(item: Offer) {
    setEditing(item);
    setEditOpen(true);
  }

  function closeEdit() {
    setEditOpen(false);
    setEditing(null);
  }

  function incrementRefresh() {
    setRefreshTick((value) => value + 1);
  }

  function toggleRowSelection(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
    );
  }

  async function handleCreate(payload: CreateOfferPayload) {
    try {
      const response = await fetch("/api/admin/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(buildOfferPayload(payload)),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error("Create offer failed", error);
      }
    } finally {
      setCreateOpen(false);
      setPage(1);
      setQ("");
      incrementRefresh();
    }
  }

  async function handleSave(id: string, payload: CreateOfferPayload) {
    try {
      const response = await fetch(
        `/api/admin/offers/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify(buildOfferPayload(payload)),
        },
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error("Update offer failed", error);
      }
    } finally {
      closeEdit();
      incrementRefresh();
    }
  }

  async function handleDeleteMany(ids: string[]) {
    if (!ids.length) return;

    for (const id of ids) {
      try {
        const response = await fetch(
          `/api/admin/offers/${encodeURIComponent(id)}`,
          {
            method: "DELETE",
            cache: "no-store",
          },
        );

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          console.error("Bulk delete failed for", id, error);
        }
      } catch (error) {
        console.error("Bulk delete error for", id, error);
      }
    }

    incrementRefresh();
    setSelectedIds([]);
    setSelectMode(false);
  }

  function avatarSrc(item: Offer) {
    return item.coachImage ? item.coachImage : "";
  }

  const editingInitial: React.ComponentProps<
    typeof OfferCreateDialog
  >["initial"] = editing
    ? ({
        _id: editing._id,
        type: asDialog<OfferCreateDialogInitial["type"]>(editing.type ?? ""),
        location: editing.location ?? "",
        placeId: editing.placeId ?? "",
        price: asDialog<OfferCreateDialogInitial["price"]>(
          typeof editing.price === "number" ? editing.price : "",
        ),
        timeFrom: editing.timeFrom ?? "",
        timeTo: editing.timeTo ?? "",
        ageFrom: asDialog<OfferCreateDialogInitial["ageFrom"]>(
          typeof editing.ageFrom === "number" ? editing.ageFrom : "",
        ),
        ageTo: asDialog<OfferCreateDialogInitial["ageTo"]>(
          typeof editing.ageTo === "number" ? editing.ageTo : "",
        ),
        info: editing.info ?? "",
        onlineActive:
          typeof editing.onlineActive === "boolean"
            ? editing.onlineActive
            : true,
        coachName: editing.coachName ?? "",
        coachEmail: editing.coachEmail ?? "",
        coachImage: editing.coachImage ?? "",
        category: asDialog<OfferCreateDialogInitial["category"]>(
          editing.category ?? "",
        ),
        sub_type: asDialog<OfferCreateDialogInitial["sub_type"]>(
          editing.sub_type ?? "",
        ),
      } satisfies OfferCreateDialogInitial)
    : undefined;

  return (
    <div className="news-admin ks ks-training-admin">
      <main className="container">
        <section className="news-admin__section">
          <div className="ks-training-admin__toolbar">
            <TrainingFilters
              q={q}
              setQ={setQ}
              setPage={setPage}
              locations={locations}
              locationFilter={locationFilter}
              setLocationFilter={setLocationFilter}
              courseValue={courseValue}
              setCourseValue={setCourseValue}
              sort={sort}
              setSort={setSort}
              locationOpen={locationOpen}
              setLocationOpen={setLocationOpen}
              courseOpen={courseOpen}
              setCourseOpen={setCourseOpen}
              sortOpen={sortOpen}
              setSortOpen={setSortOpen}
              locationDropdownRef={locationDropdownRef}
              courseDropdownRef={courseDropdownRef}
              sortDropdownRef={sortDropdownRef}
              onCreate={() => setCreateOpen(true)}
              createDisabled={loading}
            />
          </div>

          <div className="news-admin__section-head-number">
            <span className="news-admin__section-meta">
              {total ? `(${total})` : ""}
            </span>
          </div>

          <div
            className={
              "news-admin__box news-admin__box--scroll3" +
              (!loading && !items.length ? " is-empty" : "")
            }
          >
            <TrainingResults
              loading={loading}
              items={sortedItems}
              selectedIds={selectedIds}
              selectMode={selectMode}
              onToggleSelectMode={() => setSelectMode((value) => !value)}
              onDeleteMany={handleDeleteMany}
              onOpen={startEdit}
              onToggleOne={toggleRowSelection}
              avatarSrc={avatarSrc}
            />
          </div>

          <div className="pager pager--arrows mt-3 ks-training-admin__pager">
            <TrainingPager
              page={page}
              pageCount={pageCount}
              onPrev={() => setPage((value) => Math.max(1, value - 1))}
              onNext={() => setPage((value) => Math.min(pageCount, value + 1))}
            />
          </div>
        </section>
      </main>

      <OfferCreateDialog
        open={createOpen}
        mode="create"
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />

      {editOpen && editing ? (
        <OfferCreateDialog
          key={editing._id}
          open={editOpen}
          mode="edit"
          initial={editingInitial}
          onClose={closeEdit}
          onSave={handleSave}
        />
      ) : null}
    </div>
  );
}
