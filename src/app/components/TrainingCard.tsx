
'use client';

import React, { useEffect, useState } from 'react';
import OfferCreateDialog, {
  OFFER_TYPES,
  OfferType,
  CreateOfferPayload,
} from '@/app/components/OfferCreateDialog';

function clsx(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(' ');
}

export default function OffersPage() {
  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [presetType, setPresetType] = useState<OfferType | undefined>(undefined);

  // Filters / list state
  const [q, setQ] = useState('');
  const [typeFilter, setTypeFilter] = useState<'' | OfferType>(''); // '' = All types
  const [locationFilter, setLocationFilter] = useState<string>('');  // '' = All locations
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Example locations; replace with API if needed
  const locations = ['Duisburg', 'Düsseldorf', 'Essen', 'Köln'];

  const openCreate = (t?: OfferType) => {
    setPresetType(t);
    setDialogOpen(true);
  };

  // Debounced fetch (q < 2 means no "q" param → backend returns all)
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

        const r = await fetch(`/api/offers?${params.toString()}`, { signal: ctrl.signal });
        const d = await r.json().catch(() => ({ items: [], total: 0 }));
        setItems(Array.isArray(d.items) ? d.items : []);
        setTotal(Number(d.total || 0));
      } catch {
        // ignore network errors for now
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => { clearTimeout(id); ctrl.abort(); };
  }, [q, typeFilter, locationFilter, page, limit]);

  const pageCount = Math.max(1, Math.ceil(total / limit));

  async function handleCreate(payload: CreateOfferPayload) {
    // TODO: wire to your backend (POST /api/offers)
    console.log('CREATE OFFER →', payload);
    setDialogOpen(false);
    setPage(1);
    setQ('');
  }

  return (
    <div className="ks">
      <main className="container">
        {/* Row 1: Search (grows) + quick type buttons (x-axis) */}
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
            <label className="label">Types</label>
            <select
              className="input"
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value as OfferType | ''); setPage(1); }}
            >
              <option value="">All types</option>
              {OFFER_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
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
            <ul className="list">
              {items.map((it: any, i: number) => (
                <li key={it._id ?? i} className="list__item">
                  <div>
                    <div className="list__title">{it.name ?? 'Offer'}</div>
                    <div className="list__meta">
                      {it.type} · {it.location} · {it.price ? `${it.price} €` : 'Price on request'}
                    </div>
                  </div>
                  <button className="btn">Details</button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Pagination */}
        <div className="pager">
          <div className="pager__info">Page {page} of {pageCount}</div>
          <div className="pager__actions">
            <button
              className="btn"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <button
              className="btn"
              disabled={page >= pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </main>

      <OfferCreateDialog
        open={dialogOpen}
        presetType={presetType}
        onClose={() => setDialogOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}









