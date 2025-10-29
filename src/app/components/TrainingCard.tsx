




// src/app/components/TrainingCard.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { GROUPED_COURSE_OPTIONS, ALL_COURSE_OPTIONS } from '@/app/lib/courseOptions';
import OfferCreateDialog, { CreateOfferPayload } from '@/app/components/OfferCreateDialog';
import { useSearchParams } from 'next/navigation';

type Offer = {
  _id: string;
  title?: string;
  type?: string;
  sub_type?: string;
  category?: string;
  legacy_type?: string;
  location?: string;
  price?: number;
  days?: string[];
  timeFrom?: string;
  timeTo?: string;
  ageFrom?: number | null;
  ageTo?: number | null;
  info?: string;
  onlineActive?: boolean;
  coachName?: string;
  coachEmail?: string;
  coachImage?: string;
  placeId?: string;
};

type OffersResponse = { items: Offer[]; total: number };

function clsx(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(' ');
}

export default function TrainingCard() {
  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Offer | null>(null);

  // Filters / list
  const [q, setQ] = useState('');
  const [courseValue, setCourseValue] = useState<string>(''); // value from ALL_COURSE_OPTIONS or ''
  const [locationFilter, setLocationFilter] = useState<string>('');
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
  const searchParams = useSearchParams();
  const [bootstrappedFromURL, setBootstrappedFromURL] = useState(false);
  const pendingOpenIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (bootstrappedFromURL) return;
    if (!searchParams) return;

    const sp = searchParams;

    const qParam   = sp.get('q');
    const locParam = sp.get('location') || sp.get('city');
    const course   = sp.get('course');
    const type     = sp.get('type');
    const cat      = sp.get('category');
    const sub      = sp.get('sub_type');
    const openId   = sp.get('open');

    if (qParam)   setQ(qParam);
    if (locParam) setLocationFilter(locParam);

    if (course) {
      setCourseValue(course);
    } else if (type) {
      setCourseValue(type);
    } else if (cat && sub) {
      setCourseValue(sub);
    }

    if (openId) pendingOpenIdRef.current = openId;

    setBootstrappedFromURL(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, bootstrappedFromURL]);

  // Orte (Cities)
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const r = await fetch('/api/admin/places?page=1&pageSize=500', {
          cache: 'no-store',
          signal: ctrl.signal,
        });
        const j = await r.json().catch(() => ({}));
        const arr: any[] = Array.isArray(j?.items) ? j.items : [];
        const cityList = arr
          .map((p) => String(p?.city ?? '').trim())
          .filter((s) => s.length > 0);
        const unique = Array.from(new Set(cityList)).sort((a, b) => a.localeCompare(b));
        setLocations(unique);
      } catch {
        setLocations([]);
      }
    })();
    return () => ctrl.abort();
  }, []);

  // Query-Builder
  function buildQueryParams() {
    const params = new URLSearchParams();
    if (q.trim().length >= 2) params.set('q', q.trim());
    if (locationFilter) params.set('location', locationFilter);
    params.set('page', String(page));
    params.set('limit', String(limit));

    const chosen = ALL_COURSE_OPTIONS.find((x) => x.value === courseValue);
    if (chosen) {
      if (chosen.mode === 'type') {
        params.set('type', chosen.value);
      } else {
        params.set('category', chosen.category);
        params.set('sub_type', chosen.value);
      }
    }
    return params;
  }

  // Offers laden
  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const params = buildQueryParams();
        const r = await fetch(`/api/admin/offers?${params.toString()}`, {
          cache: 'no-store',
          signal: ctrl.signal,
        });
        if (!r.ok) {
          setItems([]);
          setTotal(0);
        } else {
          const raw = await r.json().catch(() => ({}));
          const d: OffersResponse = Array.isArray(raw)
            ? { items: raw as Offer[], total: (raw as Offer[]).length }
            : { items: Array.isArray(raw.items) ? raw.items : [], total: Number(raw.total || 0) };
          setItems(d.items);
          setTotal(d.total);
          // Auswahl zurücksetzen, wenn Seite/Daten wechseln
          setSelectedIds([]);
        }
      } catch {
        setItems([]);
        setTotal(0);
        setSelectedIds([]);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, courseValue, locationFilter, page, limit, refreshTick]);

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
  }, [items]);

  const pageCount = Math.max(1, Math.ceil(total / limit));
  const startEdit = (o: Offer) => { setEditing(o); setEditOpen(true); };

  async function handleCreate(payload: CreateOfferPayload) {
    try {
      const res = await fetch(`/api/admin/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          ...payload,
          ageFrom: payload.ageFrom === '' ? null : Number(payload.ageFrom),
          ageTo: payload.ageTo === '' ? null : Number(payload.ageTo),
          price: payload.price === '' ? 0 : Number(payload.price),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('Create offer failed', err);
      }
    } finally {
      setCreateOpen(false);
      setPage(1);
      setQ('');
      setRefreshTick((x) => x + 1);
    }
  }

  async function handleSave(id: string, payload: CreateOfferPayload) {
    try {
      const res = await fetch(`/api/admin/offers/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          ...payload,
          ageFrom: payload.ageFrom === '' ? null : Number(payload.ageFrom),
          ageTo: payload.ageTo === '' ? null : Number(payload.ageTo),
          price: payload.price === '' ? 0 : Number(payload.price),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('Update offer failed', err);
      }
    } finally {
      setEditOpen(false);
      setEditing(null);
      setRefreshTick((x) => x + 1);
    }
  }

  async function handleDelete(o: Offer) {
    const ok = window.confirm(`Delete offer "${o.title ?? o.type}"?`);
    if (!ok) return;
    try {
      const res = await fetch(`/api/admin/offers/${encodeURIComponent(o._id)}`, {
        method: 'DELETE',
        cache: 'no-store',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('Delete failed', err);
      } else {
        setItems((prev) => prev.filter((x) => x._id !== o._id));
        setTotal((t) => Math.max(0, t - 1));
        setSelectedIds((prev) => prev.filter((id) => id !== o._id));
      }
    } catch (e) {
      console.error('Delete error', e);
    }
  }

  // Bulk-Delete (nur aktuelle Seite)
  async function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    const ok = window.confirm(`Delete ${selectedIds.length} selected offer(s)?`);
    if (!ok) return;
    for (const id of selectedIds) {
      try {
        const res = await fetch(`/api/admin/offers/${encodeURIComponent(id)}`, {
          method: 'DELETE',
          cache: 'no-store',
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error('Bulk delete failed for', id, err);
        }
      } catch (e) {
        console.error('Bulk delete error for', id, e);
      }
    }
    setRefreshTick((x) => x + 1);
    setSelectedIds([]);
  }

  const avatarSrc = (o: Offer) => (o.coachImage ? o.coachImage : '');

  // Auswahl-Helpers
  const allSelected = items.length > 0 && selectedIds.length === items.length;
  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? Array.from(new Set([...prev, id])) : prev.filter((x) => x !== id)
    );
  };
  const toggleSelectAll = (checked: boolean) => {
    if (!checked) { setSelectedIds([]); return; }
    setSelectedIds(items.map((x) => x._id));
  };

  return (
    <div className="ks">
      {/* == wie booking: schmaler, zentrierter Hauptbereich == */}
      <div className="p-4 max-w-6xl mx-auto">
        {/* Intro (wie booking) */}
        <header className="mb-4">
          <h1 className="text-2xl font-bold m-0">Trainings</h1>
          <p className="text-gray-700 m-0">
            Choose a session and book your spot. No account required (coming soon).
          </p>
        </header>

        {/* Filter */}
        <section className="filters">
          <div className="filters__row">
            <div className="filters__field">
              <button className="btn btn--primary" onClick={() => setCreateOpen(true)}>
                Create new offer
              </button>
            </div>

            <div className="filters__field filters__field--grow">
              <label className="label">Search offers (min. 2 letters)</label>
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                className="input"
                placeholder="e.g., Summer Camp or street/city/zip"
              />
            </div>
          </div>

          <div className="filters__field">
            <label className="label">Locations</label>
            <select
              className="input"
              value={locationFilter}
              onChange={(e) => { setLocationFilter(e.target.value); setPage(1); }}
            >
              <option value="">All locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div className="filters__field">
            <label className="label">Courses</label>
            <select
              className="input"
              value={courseValue}
              onChange={(e) => { setCourseValue(e.target.value); setPage(1); }}
            >
              <option value="">All courses</option>
              {GROUPED_COURSE_OPTIONS.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.items.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </section>

        {/* Bulk-Aktionen (sichtbar wenn Auswahl) */}
        {selectedIds.length > 0 && (
          <section className="card" aria-live="polite">
            <div className="card-head">
              <h3 className="card-title m-0">
                {selectedIds.length} selected
              </h3>
              <div className="card-actions" style={{ display: 'flex', gap: 8 }}>
                <button className="btn" onClick={() => setSelectedIds([])}>Clear</button>
                <button className="btn btn-primary" onClick={handleBulkDelete}>Delete selected</button>
              </div>
            </div>
          </section>
        )}

        {/* Results */}
        <section className="card p-0 overflow-hidden">
          {loading ? (
            <div className="card__empty">Loading…</div>
          ) : items.length === 0 ? (
            <div className="card__empty">No offers found.</div>
          ) : (
            <>
              {/* Kopfzeile: "Alle auswählen" */}
              <div
                className="list-header"
                style={{
                  paddingLeft: 'calc(var(--card-pad) + 1rem)',
                  paddingRight: 'calc(var(--card-pad) + 1rem)',
                  paddingTop: 8,
                  paddingBottom: 8,
                  borderBottom: '1px solid #eef2f7',
                }}
              >
                <label
                  className="label"
                  style={{ display: 'flex', alignItems: 'center', gap: 10, margin: 0, cursor: 'pointer' }}
                >
                  <input
                    type="checkbox"
                    checked={allSelected}
                    aria-label="Alle auswählen"
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  Alle auswählen
                </label>
              </div>

              <ul className="list list--bleed">
                {items.map((it) => {
                  const isChecked = selectedIds.includes(it._id);
                  return (
                    <li
                      key={it._id}
                      className="list__item chip is-fullhover is-interactive"
                      onClick={() => startEdit(it)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          startEdit(it);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`Edit offer ${it.title ?? it.type}`}
                    >
                      {/* Checkbox links */}
                      <input
                        type="checkbox"
                        checked={isChecked}
                        aria-label="Zeile auswählen"
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => toggleSelect(it._id, e.target.checked)}
                        style={{ marginRight: 10 }}
                      />

                      {/* Avatar */}
                      {avatarSrc(it) ? (
                        <img
                          src={avatarSrc(it)}
                          alt={it.coachName ? `Coach ${it.coachName}` : 'Coach avatar'}
                          className="list__avatar"
                        />
                      ) : (
                        <div className="list__avatar list__avatar--ph" aria-hidden="true" />
                      )}

                      {/* Text */}
                      <div className="list__body">
                        <div className="list__title">{it.title ?? 'Offer'}</div>
                        <div className="list__meta">
                          {[it.type, it.location].filter(Boolean).join(' • ')}{' '}
                          {typeof it.price === 'number' ? <>· {it.price} €</> : <>· Price on request</>}
                          {it.coachName ? <> · Coach: {it.coachName}</> : null}
                          {it.category ? <> · {it.category}</> : null}
                          {it.sub_type ? <> · {it.sub_type}</> : null}
                        </div>
                      </div>

                      {/* Actions rechts */}
                      <div
                        className="list__actions"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        <span
                          className="edit-trigger"
                          role="button"
                          tabIndex={0}
                          title="Edit"
                          aria-label="Edit"
                          onClick={() => { setEditing(it); setEditOpen(true); }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setEditing(it);
                              setEditOpen(true);
                            }
                          }}
                        >
                          <img src="/icons/edit.svg" alt="" aria-hidden="true" className="icon-img" />
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </section>

        {/* Pagination */}
        <div className="pager pager--arrows">
          <button
            type="button"
            className="btn"
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <img
              src="/icons/arrow_right_alt.svg"
              alt=""
              aria-hidden="true"
              className="icon-img icon-img--left"
            />
          </button>

          <div className="pager__count" aria-live="polite" aria-atomic="true">
            {page} / {pageCount}
          </div>

          <button
            type="button"
            className="btn"
            aria-label="Next page"
            disabled={page >= pageCount}
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
          >
            <img
              src="/icons/arrow_right_alt.svg"
              alt=""
              aria-hidden="true"
              className="icon-img"
            />
          </button>
        </div>
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
        initial={
          editing
            ? {
                _id: editing._id,
                type: (editing.type as any) ?? '',
                location: editing.location ?? '',
                placeId: editing.placeId ?? '',
                price: editing.price ?? '',
                days: (editing.days as any) ?? [],
                timeFrom: editing.timeFrom ?? '',
                timeTo: editing.timeTo ?? '',
                ageFrom: (editing.ageFrom as any) ?? '',
                ageTo: (editing.ageTo as any) ?? '',
                info: editing.info ?? '',
                onlineActive:
                  typeof editing.onlineActive === 'boolean' ? editing.onlineActive : true,
                coachName: editing.coachName ?? '',
                coachEmail: editing.coachEmail ?? '',
                coachImage: editing.coachImage ?? '',
                category: (editing.category as any) ?? '',
                sub_type: (editing.sub_type as any) ?? '',
              }
            : null
        }
        onClose={() => {
          setEditOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
}














