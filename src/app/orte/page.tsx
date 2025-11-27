


// app/orte/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import PlaceDialog from '@/app/components/places/PlaceDialog';
import type { Place } from '@/types/place';

const PAGE_SIZE = 10;

function displayId(p: Place & { publicId?: number }) {
  if (typeof p.publicId === 'number' && Number.isFinite(p.publicId)) {
    return String(p.publicId);
  }
  const hex = (p._id || '').toString();
  return '1' + hex.slice(-7).toUpperCase();
}

export default function OrtePage() {
  const [items, setItems] = useState<Array<Place & { publicId?: number }>>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Place | null>(null);

  // Auswahl (nur aktuelle Seite)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim().length >= 2) params.set('q', q.trim());
      params.set('page', String(page));
      params.set('pageSize', String(PAGE_SIZE));
      params.set('limit', String(PAGE_SIZE));

      const r = await fetch(`/api/admin/places?${params.toString()}`, { cache: 'no-store' });
      const j = await r.json().catch(() => ({}));
      const list: any[] = Array.isArray(j?.items) ? j.items : [];
      setItems(list as any);
      setTotal(Number(j?.total || list.length || 0));
    } catch {
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(load, 150);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, q]);

  // Seite wechselt → Auswahl zurücksetzen
  useEffect(() => { setSelectedIds(new Set()); }, [page]);

  const pageCount = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  // Einzel-Delete (für Bulk genutzt)
  async function deleteOne(p: { _id: string; name?: string }) {
    const r = await fetch(`/api/admin/places/${encodeURIComponent(p._id)}`, {
      method: 'DELETE',
      cache: 'no-store',
    });
    if (r.status === 409) {
      const j = await r.json().catch(() => ({}));
      throw new Error(j?.error || 'Cannot delete: place is in use.');
    }
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      throw new Error(j?.error || `Delete failed (${r.status})`);
    }
  }

  // Bulk-Delete — ohne Rückfrage
  async function handleBulkDelete() {
    if (selectedIds.size === 0) return;
    try {
      const ids = Array.from(selectedIds);
      const results = await Promise.allSettled(
        ids.map(async id => {
          const row = items.find(x => x._id === id);
          await deleteOne({ _id: id, name: row?.name });
        })
      );
      const failed = results.filter(r => r.status === 'rejected');
      if (failed.length) console.error(`Some items could not be deleted (${failed.length}).`, failed);
      setSelectedIds(new Set());
      await load();
    } catch (e) {
      console.error('Bulk delete error', e);
    }
  }

  // Auswahl-Helpers
  const allOnPageIds = useMemo(() => items.map(x => String(x._id)), [items]);
  const allSelectedOnPage = allOnPageIds.length > 0 && allOnPageIds.every(id => selectedIds.has(id));

  function toggleSelectOne(id: string, checked: boolean) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (checked) next.add(id); else next.delete(id);
      return next;
    });
  }
  function toggleSelectAll(checked: boolean) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (checked) allOnPageIds.forEach(id => next.add(id));
      else allOnPageIds.forEach(id => next.delete(id));
      return next;
    });
  }
  function clearSelection() { setSelectedIds(new Set()); }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Kopf */}
      <div className="flex items-end justify-between mb-4">
        <h1 className="text-2xl font-bold">Places</h1>
        <button
          className="btn"
          onClick={() => { setEditing(null); setDialogOpen(true); }}
        >
          New place
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-end gap-2 mb-3">
        <div className="flex-1">
          <label className="block text-sm text-gray-600">Search (min. 2 letters)</label>
          <input
            className="input"
            value={q}
            onChange={e => { setQ(e.target.value); setPage(1); }}
            placeholder="e.g., club, street, city, zip"
          />
        </div>
      </div>

      {/* Bulk-Bar */}
      {selectedIds.size > 0 && (
        <section className="card mb-3">
          <div className="card-head">
            <h3 className="card-title" style={{ margin: 0 }}>
              {selectedIds.size} selected
            </h3>
            <div className="card-actions" style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn--danger" onClick={handleBulkDelete}>Delete selected</button>
              <button className="btn" onClick={clearSelection}>Clear</button>
            </div>
          </div>
        </section>
      )}

      {/* Tabelle */}
      <div className="card p-0 overflow-auto">
        <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
          <thead className="bg-gray-50">
            <tr>
              <th className="th" style={{ width: 160 }}>
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  <input
                    id="select-all"
                    type="checkbox"
                    aria-label={allSelectedOnPage ? 'Alle abwählen' : 'Alle auswählen'}
                    checked={allSelectedOnPage}
                    onChange={e => toggleSelectAll(e.target.checked)}
                  />
                  <label
                    htmlFor="select-all"
                    className="text-sm text-gray-700"
                    style={{ cursor: 'pointer', userSelect: 'none', margin: 0 }}
                  >
                    Alle auswählen
                  </label>
                </div>
              </th>
              <th className="th" style={{ width: 120 }}>ID</th>
              <th className="th">Name</th>
              <th className="th">Address</th>
              <th className="th" style={{ width: 120 }}>ZIP</th>
              <th className="th" style={{ width: 180 }}>City</th>
              <th className="th" style={{ width: 1 }} />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="td" colSpan={7}>Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td className="td" colSpan={7}>No places found.</td></tr>
            ) : (
              items.map((p) => {
                const id = String(p._id);
                const isChecked = selectedIds.has(id);
                return (
                  <tr
                    key={id}
                    className="tr hover:bg-gray-50 cursor-pointer"
                    onClick={() => { setEditing(p as Place); setDialogOpen(true); }}
                    title="Edit place"
                  >
                    <td className="td" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        aria-label={`Select ${p.name}`}
                        checked={isChecked}
                        onChange={e => toggleSelectOne(id, e.target.checked)}
                      />
                    </td>
                    <td className="td font-mono">{displayId(p)}</td>
                    <td className="td">{p.name}</td>
                    <td className="td">{p.address}</td>
                    <td className="td">{p.zip}</td>
                    <td className="td">{p.city}</td>
                    <td className="td">
                      <div className="list__actions" onClick={(e) => e.stopPropagation()}>
                        <span
                          className="edit-trigger"
                          role="button"
                          tabIndex={0}
                          title="Edit"
                          aria-label="Edit"
                          onClick={() => { setEditing(p as Place); setDialogOpen(true); }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setEditing(p as Place);
                              setDialogOpen(true);
                            }
                          }}
                        >
                          <img src="/icons/edit.svg" alt="" aria-hidden="true" className="icon-img" />
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pager – gleich wie Bookings */}
      <div className="pager pager--arrows mt-3">
        <button
          type="button"
          className="btn"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          <img src="/icons/arrow_right_alt.svg" alt="" aria-hidden="true" className="icon-img icon-img--left" />
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
          <img src="/icons/arrow_right_alt.svg" alt="" aria-hidden="true" className="icon-img" />
        </button>
      </div>

      {/* Dialog (unverändert; Tailwind intern) */}
      <PlaceDialog
        open={dialogOpen}
        initial={editing || undefined}
        onClose={() => setDialogOpen(false)}
        onSaved={() => { setDialogOpen(false); load(); }}
      />
    </div>
  );
}

















