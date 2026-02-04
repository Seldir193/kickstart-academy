// src/app/components/TrainingCard.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import OfferCreateDialog from "@/app/components/OfferCreateDialog";
import type { CreateOfferPayload } from "@/app/components/offer-create-dialog/types";

import type { Offer } from "@/app/components/training-card/types";

import { useDropdownOutsideClose } from "@/app/components/training-card/hooks/useDropdownOutsideClose";
import { useBootstrapFromURL } from "@/app/components/training-card/hooks/useBootstrapFromURL";
import { useCities } from "@/app/components/training-card/hooks/useCities";
import { useOffers } from "@/app/components/training-card/hooks/useOffers";

import TrainingFilters from "@/app/components/training-card/ui/TrainingFilters";
import BulkActionsBar from "@/app/components/training-card/ui/BulkActionsBar";
import TrainingResults from "@/app/components/training-card/ui/TrainingResults";
import TrainingPager from "@/app/components/training-card/ui/TrainingPager";

type OfferCreateDialogInitial = NonNullable<
  React.ComponentProps<typeof OfferCreateDialog>["initial"]
>;

function asDialog<T>(v: unknown) {
  return v as T;
}

export default function TrainingCard() {
  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Offer | null>(null);

  // Filters / list
  const [q, setQ] = useState("");
  const [courseValue, setCourseValue] = useState<string>("");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [locations, setLocations] = useState<string[]>([]);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [items, setItems] = useState<Offer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  // Auswahl (Checkboxen)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // URL→Initial-State
  const { pendingOpenIdRef } = useBootstrapFromURL({
    setQ,
    setLocationFilter,
    setCourseValue,
  });

  // Custom-Dropdowns: Locations + Courses
  const [locationOpen, setLocationOpen] = useState(false);
  const [courseOpen, setCourseOpen] = useState(false);
  const locationDropdownRef = useRef<HTMLDivElement | null>(null);
  const courseDropdownRef = useRef<HTMLDivElement | null>(null);

  /* ==== Outside-Click: Dropdowns schließen ==== */
  useDropdownOutsideClose({
    locationDropdownRef,
    courseDropdownRef,
    closeLocation: () => setLocationOpen(false),
    closeCourse: () => setCourseOpen(false),
  });

  // Orte (Cities)
  useCities({ setLocations });

  // Offers laden
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

  // ?open=<offerId> → direkt Edit
  useEffect(() => {
    if (!pendingOpenIdRef.current || !items.length) return;

    const id = pendingOpenIdRef.current;
    const found = items.find((o) => o._id === id);

    if (found) {
      setEditing(found);
      setEditOpen(true);
      pendingOpenIdRef.current = null;
    }
  }, [items, pendingOpenIdRef]);

  const pageCount = Math.max(1, Math.ceil(total / limit));

  const startEdit = (o: Offer) => {
    setEditing(o);
    setEditOpen(true);
  };

  async function handleCreate(payload: CreateOfferPayload) {
    try {
      const res = await fetch(`/api/admin/offers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          ...payload,
          ageFrom: payload.ageFrom === "" ? null : Number(payload.ageFrom),
          ageTo: payload.ageTo === "" ? null : Number(payload.ageTo),
          price: payload.price === "" ? 0 : Number(payload.price),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Create offer failed", err);
      }
    } finally {
      setCreateOpen(false);
      setPage(1);
      setQ("");
      setRefreshTick((x) => x + 1);
    }
  }

  async function handleSave(id: string, payload: CreateOfferPayload) {
    try {
      const res = await fetch(`/api/admin/offers/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          ...payload,
          ageFrom: payload.ageFrom === "" ? null : Number(payload.ageFrom),
          ageTo: payload.ageTo === "" ? null : Number(payload.ageTo),
          price: payload.price === "" ? 0 : Number(payload.price),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Update offer failed", err);
      }
    } finally {
      setEditOpen(false);
      setEditing(null);
      setRefreshTick((x) => x + 1);
    }
  }

  // Bulk-Delete (nur aktuelle Seite)
  async function handleBulkDelete() {
    if (selectedIds.length === 0) return;

    for (const id of selectedIds) {
      try {
        const res = await fetch(`/api/admin/offers/${encodeURIComponent(id)}`, {
          method: "DELETE",
          cache: "no-store",
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error("Bulk delete failed for", id, err);
        }
      } catch (e) {
        console.error("Bulk delete error for", id, e);
      }
    }

    setRefreshTick((x) => x + 1);
    setSelectedIds([]);
  }

  const avatarSrc = (o: Offer) => (o.coachImage ? o.coachImage : "");

  // Auswahl-Helpers
  const allSelected = items.length > 0 && selectedIds.length === items.length;

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked
        ? Array.from(new Set([...prev, id]))
        : prev.filter((x) => x !== id)
    );
  };

  const toggleSelectAll = (checked: boolean) => {
    if (!checked) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(items.map((x) => x._id));
  };

  // ✅ initial muss "undefined" sein (nicht null) und type muss "" | OfferType | undefined sein
  const editingInitial: React.ComponentProps<
    typeof OfferCreateDialog
  >["initial"] = editing
    ? ({
        _id: editing._id,
        type: asDialog<OfferCreateDialogInitial["type"]>(editing.type ?? ""),
        location: editing.location ?? "",
        placeId: editing.placeId ?? "",
        price: asDialog<OfferCreateDialogInitial["price"]>(
          typeof editing.price === "number" ? editing.price : ""
        ),
        days: asDialog<OfferCreateDialogInitial["days"]>(
          Array.isArray(editing.days) ? editing.days : []
        ),
        timeFrom: editing.timeFrom ?? "",
        timeTo: editing.timeTo ?? "",
        ageFrom: asDialog<OfferCreateDialogInitial["ageFrom"]>(
          typeof editing.ageFrom === "number" ? editing.ageFrom : ""
        ),
        ageTo: asDialog<OfferCreateDialogInitial["ageTo"]>(
          typeof editing.ageTo === "number" ? editing.ageTo : ""
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
          editing.category ?? ""
        ),
        sub_type: asDialog<OfferCreateDialogInitial["sub_type"]>(
          editing.sub_type ?? ""
        ),
      } satisfies OfferCreateDialogInitial)
    : undefined;

  return (
    <div className="ks ks-training-admin">
      <div className="p-4 max-w-6xl mx-auto">
        <header className="mb-4">
          <h1 className="text-2xl font-bold m-0">Trainings</h1>
          <p className="text-gray-700 m-0">
            Choose a session and book your spot. No account required (coming
            soon).
          </p>
        </header>

        <TrainingFilters
          q={q}
          setQ={setQ}
          setPage={setPage}
          createOpen={createOpen}
          setCreateOpen={setCreateOpen}
          locations={locations}
          locationFilter={locationFilter}
          setLocationFilter={setLocationFilter}
          courseValue={courseValue}
          setCourseValue={setCourseValue}
          locationOpen={locationOpen}
          setLocationOpen={setLocationOpen}
          courseOpen={courseOpen}
          setCourseOpen={setCourseOpen}
          locationDropdownRef={locationDropdownRef}
          courseDropdownRef={courseDropdownRef}
        />

        <BulkActionsBar
          selectedCount={selectedIds.length}
          onClear={() => setSelectedIds([])}
          onBulkDelete={handleBulkDelete}
        />

        <TrainingResults
          loading={loading}
          items={items}
          selectedIds={selectedIds}
          allSelected={allSelected}
          onToggleAll={toggleSelectAll}
          onToggleOne={toggleSelect}
          onStartEdit={startEdit}
          onOpenEdit={(it) => {
            setEditing(it);
            setEditOpen(true);
          }}
          avatarSrc={avatarSrc}
        />

        <TrainingPager
          page={page}
          pageCount={pageCount}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(pageCount, p + 1))}
        />
      </div>

      {/* Create */}
      <OfferCreateDialog
        open={createOpen}
        mode="create"
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />

      {/* Edit */}
      <OfferCreateDialog
        open={editOpen}
        mode="edit"
        initial={editingInitial}
        onClose={() => {
          setEditOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
}
