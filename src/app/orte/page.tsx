'use client';

import React, { useEffect, useMemo, useState } from 'react';
import PlaceDialog from '@/app/components/places/PlaceDialog';
import type { Place } from '@/types/place';

function clsx(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(' ');
}

const pageSize = 10;

const displayId = (p: Place & { publicId?: number }) => {
  if (typeof p.publicId === 'number' && Number.isFinite(p.publicId)) {
    return String(p.publicId);
  }
  const hex = (p._id || '').toString();
  return '1' + hex.slice(-7).toUpperCase(); // fallback: always starts with 1
};

export default function OrtePage() {
  const [items, setItems] = useState<Array<Place & { publicId?: number }>>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Place | null>(null);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim().length >= 2) params.set('q', q.trim());
      params.set('page', String(page));
      // keep your existing param, add limit for safety in case backend expects it
      params.set('pageSize', String(pageSize));
      params.set('limit', String(pageSize));

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

  const pageCount = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);

  // ---- NEW: delete handler lives INSIDE the component (has access to setItems/setTotal)
  async function handleDelete(p: { _id: string; name: string }) {
    const ok = window.confirm(`Delete place "${p.name}"?`);
    if (!ok) return;
    try {
      const r = await fetch(`/api/admin/places/${encodeURIComponent(p._id)}`, {
        method: 'DELETE',
        cache: 'no-store',
      });

      if (r.status === 409) {
        const j = await r.json().catch(() => ({}));
        alert(j?.error || 'Cannot delete: place is in use.');
        return;
      }
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j?.error || `Delete failed (${r.status})`);
      }

      // Optimistic UI update
      setItems(prev => prev.filter(x => x._id !== p._id));
      setTotal(t => Math.max(0, t - 1));
    } catch (e: any) {
      alert(e?.message || 'Delete error');
    }
  }

  return (
    <div className="ks max-w-6xl mx-auto p-4">
      <h1 className="card-title" style={{ marginBottom: 10 }}>Places</h1>

      <div className="flex items-end gap-2 mb-3">
        <div className="flex-1">
          <label className="lbl">Search (min. 2 letters)</label>
          <input
            className="input"
            value={q}
            onChange={e => { setQ(e.target.value); setPage(1); }}
            placeholder="e.g., club, street, city, zip"
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setEditing(null); setDialogOpen(true); }}
        >
          New place
        </button>
      </div>

      <div className="card overflow-auto">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr className="th">
              <th className="th" style={{ width: 120 }}>ID</th>
              <th className="th">Name</th>
              <th className="th">Address</th>
              <th className="th" style={{ width: 120 }}>ZIP</th>
              <th className="th" style={{ width: 180 }}>City</th>
              <th className="th" style={{ width: 1 }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="td" colSpan={6}>Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td className="td" colSpan={6}>No places found.</td></tr>
            ) : (
              items.map((p) => (
                <tr
                  className="tr hover:bg-gray-50 cursor-pointer"
                  key={p._id}
                  onClick={() => { setEditing(p as Place); setDialogOpen(true); }}
                >
                  <td className="td font-mono">{displayId(p)}</td>
                  <td className="td">{p.name}</td>
                  <td className="td">{p.address}</td>
                  <td className="td">{p.zip}</td>
                  <td className="td">{p.city}</td>
                  <td className="td">
                    {/* Actions cell: Edit + Delete */}
                    <div className="list__actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn btn-ghost"
                        onClick={() => {
                          setEditing(p as Place);
                          setDialogOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="icon-btn icon-btn--danger"
                        type="button"
                        title="Delete"
                        aria-label="Delete"
                        onClick={() => handleDelete({ _id: p._id as string, name: p.name })}
                        style={{ marginLeft: 8 }}
                      >
                        <span className="icon icon--close" aria-hidden="true"></span>
                        <span className="sr-only">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="pager pager--arrows" style={{ marginTop: 12 }}>
          <button
            type="button"
            className="pager__nav pager__nav--prev"
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            <span className="icon icon--arrow icon--arrow-left" aria-hidden="true" />
          </button>
          <div className="pager__count">{page} / {pageCount}</div>
          <button
            type="button"
            className="pager__nav pager__nav--next"
            aria-label="Next page"
            disabled={page >= pageCount}
            onClick={() => setPage(p => Math.min(pageCount, p + 1))}
          >
            <span className="icon icon--arrow" aria-hidden="true" />
          </button>
        </div>
      </div>

      <PlaceDialog
        open={dialogOpen}
        initial={editing || undefined}
        onClose={() => setDialogOpen(false)}
        onSaved={() => { setDialogOpen(false); load(); }}
      />
    </div>
  );
}









