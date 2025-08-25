


































'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import OfferCreateDialog, {
  OFFER_TYPES,
  OfferType,
  CreateOfferPayload,
} from '@/app/components/OfferCreateDialog';

type Offer = {
  _id: string;
  title?: string;
  type: OfferType;
  location: string;
  price?: number;
  days?: string[];
  timeFrom?: string;
  timeTo?: string;
  ageFrom?: number | null;
  ageTo?: number | null;
  info?: string;
  onlineActive?: boolean;
};

type OffersResponse = { items: Offer[]; total: number };

function clsx(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(' ');
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

export default function TrainingCard() {
  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [presetType, setPresetType] = useState<OfferType | undefined>(undefined);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Offer | null>(null);

  // Filters / list
  const [q, setQ] = useState('');
  const [typeFilter, setTypeFilter] = useState<'' | OfferType>('');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [items, setItems] = useState<Offer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  // keep whatever locations you like
  const locations = ['Duisburg', 'Düsseldorf', 'Essen', 'Köln'];

  const openCreate = (t?: OfferType) => {
    setPresetType(t);
    setCreateOpen(true);
  };

  const startEdit = (o: Offer) => {
    setEditing(o);
    setEditOpen(true);
  };

  // Fetch offers from API
  useEffect(() => {
    const ctrl = new AbortController();
    const id = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (q.trim().length >= 2) params.set('q', q.trim());
        if (typeFilter) params.set('type', typeFilter);
        if (locationFilter) params.set('location', locationFilter);
        params.set('page', String(page));
        params.set('limit', String(limit));

        const r = await fetch(`${API}/api/offers?${params.toString()}`, {
          signal: ctrl.signal,
          cache: 'no-store',
        });

        if (!r.ok) {
          setItems([]);
          setTotal(0);
        } else {
          const raw = await r.json();
          const d: OffersResponse = Array.isArray(raw)
            ? { items: raw, total: raw.length }
            : { items: Array.isArray(raw.items) ? raw.items : [], total: Number(raw.total || 0) };
          setItems(d.items);
          setTotal(d.total);
        }
      } catch {
        setItems([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => {
      clearTimeout(id);
      ctrl.abort();
    };
  }, [q, typeFilter, locationFilter, page, limit, refreshTick]);

  const pageCount = Math.max(1, Math.ceil(total / limit));

  async function handleCreate(payload: CreateOfferPayload) {
    try {
      await fetch(`${API}/api/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          ageFrom: payload.ageFrom === '' ? null : Number(payload.ageFrom),
          ageTo: payload.ageTo === '' ? null : Number(payload.ageTo),
          price: Number(payload.price),
        }),
      });
    } catch (e) {
      console.error('Create offer error', e);
    } finally {
      // close + reset
      setCreateOpen(false);
      setPresetType(undefined);
      setPage(1);
      setQ('');
      setRefreshTick((x) => x + 1);
    }
  }

  async function handleSave(id: string, payload: CreateOfferPayload) {
    try {
      await fetch(`${API}/api/offers/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          ageFrom: payload.ageFrom === '' ? null : Number(payload.ageFrom),
          ageTo: payload.ageTo === '' ? null : Number(payload.ageTo),
          price: Number(payload.price),
        }),
      });
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
      const res = await fetch(`${API}/api/offers/${encodeURIComponent(o._id)}`, {
        method: 'DELETE',
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

  return (
    <div className="ks">
      <main className="container">
        {/* Row 1: Quick create + Search */}
        <section className="filters">
          <div className="filters__row">
            <div className="quick-types" aria-label="Quick create types">
              {OFFER_TYPES.map((t) => (
                <button key={t} className="btn" onClick={() => openCreate(t)}>
                  {t}
                </button>
              ))}
            </div>

            <div className="filters__field filters__field--grow">
              <label className="label">Search offers (min. 2 letters)</label>
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
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
              onChange={(e) => {
                setLocationFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div className="filters__field">
            <label className="label">Types</label>
            <select
              className="input"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as OfferType | '');
                setPage(1);
              }}
            >
              <option value="">All types</option>
              {OFFER_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
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
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); startEdit(it); }
          }}
          tabIndex={0}
          role="button"
          aria-label={`Edit offer ${it.title ?? it.type}`}
        >
          <div className="list__body">
            <div className="list__title">{it.title ?? 'Offer'}</div>
            <div className="list__meta">
              {it.type} · {it.location}{' '}
              {typeof it.price === 'number' ? <>· {it.price} €</> : <>· Price on request</>}
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

  {/* NEW: icon delete button */}
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



{/* Pagination (icon-only arrows + centered numbers) */}
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
        presetType={presetType}
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
                type: editing.type,
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
