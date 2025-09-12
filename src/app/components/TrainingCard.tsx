// src/app/components/TrainingCard.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import OfferCreateDialog, { CreateOfferPayload } from '@/app/components/OfferCreateDialog';

/** Category keys used by sub_type filters */
type CategoryKey = 'Holiday' | 'Weekly' | 'Individual' | 'ClubPrograms' | 'RentACoach';

/** For the list we don’t need strict typing of Offer.type anymore,
 * because some filters use category/sub_type. Keep it as string. */
type Offer = {
  _id: string;
  title?: string;
  type: string; // base type value (e.g., Foerdertraining)
  location: string;
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

  category?: string;
  sub_type?: string;
  legacy_type?: string;
};

type OffersResponse = { items: Offer[]; total: number };

function clsx(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(' ');
}

/** Build a flat “All courses” list (for the Types dropdown) */
const ALL_COURSE_OPTIONS: Array<
  { label: string; value: string; mode: 'type' } |
  { label: string; value: string; mode: 'subtype'; category: CategoryKey }
> = (() => {
  const base = [
    { label: 'AthleticTraining', value: 'AthleticTraining', mode: 'type' as const },
    { label: 'Camp', value: 'Camp', mode: 'type' as const },
    { label: 'Foerdertraining', value: 'Foerdertraining', mode: 'type' as const },
    { label: 'Kindergarten', value: 'Kindergarten', mode: 'type' as const },
    { label: 'PersonalTraining', value: 'PersonalTraining', mode: 'type' as const },
  ];
  const extra = [
    // Weekly
    { label: 'Torwarttraining', value: 'Torwarttraining', mode: 'subtype' as const, category: 'Weekly' as CategoryKey },
    { label: 'Foerdertraining_Athletik', value: 'Foerdertraining_Athletik', mode: 'subtype' as const, category: 'Weekly' as CategoryKey },
    // Individual
    { label: 'Einzeltraining_Athletik', value: 'Einzeltraining_Athletik', mode: 'subtype' as const, category: 'Individual' as CategoryKey },
    { label: 'Einzeltraining_Torwart', value: 'Einzeltraining_Torwart', mode: 'subtype' as const, category: 'Individual' as CategoryKey },
    // Holiday
    { label: 'Powertraining', value: 'Powertraining', mode: 'subtype' as const, category: 'Holiday' as CategoryKey },
    // Club
    { label: 'RentACoach_Generic', value: 'RentACoach_Generic', mode: 'subtype' as const, category: 'RentACoach' as CategoryKey },
    { label: 'ClubProgram_Generic', value: 'ClubProgram_Generic', mode: 'subtype' as const, category: 'ClubPrograms' as CategoryKey },
    { label: 'CoachEducation', value: 'CoachEducation', mode: 'subtype' as const, category: 'ClubPrograms' as CategoryKey },
  ];
  return [...base, ...extra];
})();

export default function TrainingCard() {
  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Offer | null>(null);

  // Filters / list
  const [q, setQ] = useState('');
  const [courseFilter, setCourseFilter] = useState<string>(''); // holds value from ALL_COURSE_OPTIONS OR ''
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [items, setItems] = useState<Offer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  // beliebige Locations
  const locations = ['Duisburg', 'Düsseldorf', 'Essen', 'Köln'];
  const [locationFilter, setLocationFilter] = useState<string>('');

  const startEdit = (o: Offer) => { setEditing(o); setEditOpen(true); };

  /** Build query according to our courseFilter selection. */
  function buildQueryParams() {
    const params = new URLSearchParams();
    if (q.trim().length >= 2) params.set('q', q.trim());
    if (locationFilter) params.set('location', locationFilter);
    params.set('page', String(page));
    params.set('limit', String(limit));

    const chosen = ALL_COURSE_OPTIONS.find((x) => x.value === courseFilter);
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

  // Admin-Offers laden (MANDANTEN-SCOPE via /api/admin/offers)
  useEffect(() => {
    const ctrl = new AbortController();
    const id = setTimeout(async () => {
      setLoading(true);
      try {
        const params = buildQueryParams();
        const r = await fetch(`/api/admin/offers?${params.toString()}`, {
          signal: ctrl.signal,
          cache: 'no-store',
        });

        if (!r.ok) {
          setItems([]); setTotal(0);
        } else {
          const raw = await r.json().catch(() => ({}));
          const d: OffersResponse = Array.isArray(raw)
            ? { items: raw as Offer[], total: (raw as Offer[]).length }
            : { items: Array.isArray(raw.items) ? raw.items : [], total: Number(raw.total || 0) };
          setItems(d.items); setTotal(d.total);
        }
      } catch (e) {
        console.error('fetch offers failed', e);
        setItems([]); setTotal(0);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => { clearTimeout(id); ctrl.abort(); };
  }, [q, courseFilter, locationFilter, page, limit, refreshTick]);

  const pageCount = Math.max(1, Math.ceil(total / limit));

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
    } catch (e) {
      console.error('Create offer error', e);
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
        method: 'PATCH', // proxy translates to PUT for backend
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
    } catch (e) {
      console.error('Update offer error', e);
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
      }
    } catch (e) {
      console.error('Delete error', e);
    }
  }

  const avatarSrc = (o: Offer) => (o.coachImage ? o.coachImage : '');

  return (
    <div className="ks">
      <main className="container">
        {/* Row 1: Create + Search */}
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
                placeholder="e.g., Summer Camp"
              />
            </div>
          </div>

          {/* Row 2: selects */}
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
              value={courseFilter}
              onChange={(e) => { setCourseFilter(e.target.value); setPage(1); }}
            >
              <option value="">All courses</option>
              {/* group visually: base types */}
              <optgroup label="Base types">
                {ALL_COURSE_OPTIONS.filter(o => o.mode === 'type').map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </optgroup>
              <optgroup label="Extra courses">
                {ALL_COURSE_OPTIONS.filter(o => o.mode === 'subtype').map(o => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </section>

        {/* Results */}
        <section className="card">
          {loading ? (
            <div className="card__empty">Loading…</div>
          ) : items.length === 0 ? (
            <div className="card__empty">No offers found.</div>
          ) : (
            <ul className="list list--bleed">
              {items.map((it) => (
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
                  {avatarSrc(it) ? (
                    <img
                      src={avatarSrc(it)}
                      alt={it.coachName ? `Coach ${it.coachName}` : 'Coach avatar'}
                      className="list__avatar"
                    />
                  ) : (
                    <div className="list__avatar list__avatar--ph" aria-hidden="true" />
                  )}

                  <div className="list__body">
                    <div className="list__title">{it.title ?? 'Offer'}</div>
                    <div className="list__meta">
                      {it.type} · {it.location}{' '}
                      {typeof it.price === 'number' ? <>· {it.price} €</> : <>· Price on request</>}
                      {it.coachName ? <> · Coach: {it.coachName}</> : null}
                      {it.coachEmail ? <> · {it.coachEmail}</> : null}
                      {it.category ? <> · {it.category}</> : null}
                      {it.sub_type ? <> · {it.sub_type}</> : null}
                    </div>
                  </div>

                  <div
                    className="list__actions"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <Link
                      href={`/book?offerId=${encodeURIComponent(it._id)}`}
                      className="btn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Book now
                    </Link>

                    <button
                      className="icon-btn icon-btn--danger"
                      type="button"
                      title="Delete"
                      aria-label="Delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(it);
                      }}
                    >
                      <span className="icon icon--close" aria-hidden="true"></span>
                      <span className="sr-only">Delete</span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Pagination */}
        <div className="pager pager--arrows">
          <button
            type="button"
            className="pager__nav pager__nav--prev"
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <span className="icon icon--arrow icon--arrow-left" aria-hidden="true" />
          </button>

          <div className="pager__count" aria-live="polite" aria-atomic="true">
            {page} / {pageCount}
          </div>

          <button
            type="button"
            className="pager__nav pager__nav--next"
            aria-label="Next page"
            disabled={page >= pageCount}
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
          >
            <span className="icon icon--arrow" aria-hidden="true" />
          </button>
        </div>
      </main>

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
                location: editing.location,
                price: editing.price ?? '',
                days: (editing.days as any) ?? [],
                timeFrom: editing.timeFrom ?? '',
                timeTo: editing.timeTo ?? '',
                ageFrom: editing.ageFrom ?? '',
                ageTo: editing.ageTo ?? '',
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

      <style jsx>{`
        .list__avatar {
          width: 36px;
          height: 36px;
          border-radius: 999px;
          object-fit: cover;
          border: 1px solid #e5e7eb;
          margin-right: 10px;
        }
        .list__avatar--ph {
          background: #f1f5f9;
          width: 36px;
          height: 36px;
          border-radius: 999px;
          margin-right: 10px;
          border: 1px solid #e5e7eb;
        }
        .list__item { display: flex; align-items: center; gap: 8px; }
        .list__body { flex: 1; min-width: 0; }
      `}</style>
    </div>
  );
}













