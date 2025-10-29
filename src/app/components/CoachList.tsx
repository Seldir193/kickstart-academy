// src/app/components/CoachList.tsx
'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import CoachDialog from './CoachDialog';

type Coach = {
  slug: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  position?: string;
  photoUrl?: string;
};

type CoachListResponse = {
  items: Coach[];
  total: number;
  page: number;
  limit: number;
};

const PAGE_SIZE = 10;

export default function CoachList({ initial, query }: { initial: CoachListResponse; query: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  const pathname = usePathname();

  const [state, setState] = React.useState<CoachListResponse>(initial);
  React.useEffect(() => {
    setState({ ...initial, limit: PAGE_SIZE });
    setSelected([]);
  }, [initial]);

  const [selected, setSelected] = React.useState<string[]>([]);
  const [creating, setCreating] = React.useState(false);
  const [editing, setEditing] = React.useState<Coach | null>(null);

  const [qLocal, setQLocal] = React.useState(query ?? '');
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const limit = PAGE_SIZE;
  const pageCount = Math.max(1, Math.ceil((state.total || 0) / limit));


function isValidPhotoUrl(u?: string): boolean {
  if (!u) return false;
  return /^data:image\//.test(u) || /^https?:\/\//.test(u) || u.startsWith('/');
}



  // keep qLocal in sync with query only when the input isn't focused
  React.useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setQLocal(query ?? '');
    }
  }, [query]);

  // live fetch on input (debounced)
  const abortRef = React.useRef<AbortController | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const q = (qLocal ?? '').trim();
    setLoading(true);

    const base = (process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/+$/, '');
    const url = `${base}/api/admin/coaches?q=${encodeURIComponent(q)}&page=1&limit=${limit}`;

    const t = setTimeout(() => {
      fetch(url, { signal: ctrl.signal, cache: 'no-store' })
        .then(r => (r.ok ? r.json() : Promise.reject(r)))
        .then((data: CoachListResponse) => {
          const safeItems = Array.isArray(data.items) ? data.items.slice(0, limit) : [];
          setSelected([]);
          setState({
            items: safeItems,
            total: Math.max(0, Number(data.total) || safeItems.length),
            page: 1,
            limit,
          });
        })
        .catch(err => {
          if (err?.name !== 'AbortError') console.error('Live search failed', err);
        })
        .finally(() => setLoading(false));
    }, 180);

    return () => { clearTimeout(t); ctrl.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qLocal, limit]);

  // reflect qLocal in URL (SSR follows)
  React.useEffect(() => {
    const t = setTimeout(() => {
      const currentQ = sp?.get('q') ?? '';
      if (qLocal === currentQ && sp?.get('limit') === String(limit) && sp?.get('page') === '1') return;
      const params = new URLSearchParams(sp?.toString() || '');
      params.set('q', qLocal);
      params.set('page', '1');
      params.set('limit', String(limit));
      router.replace(`${pathname}?${params.toString()}`);
    }, 280);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qLocal]);

  const allSelected = state.items.length > 0 && selected.length === state.items.length;
  const toggleSelect = (slug: string, checked: boolean) => {
    setSelected((prev) => (checked ? Array.from(new Set([...prev, slug])) : prev.filter((s) => s !== slug)));
  };
  const toggleSelectAll = (checked: boolean) => {
    if (!checked) return setSelected([]);
    setSelected(state.items.map((i) => i.slug));
  };

  async function handleCreate(values: Partial<Coach>) {
    const base = (process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/+$/, '');
    const r = await fetch(`${base}/api/admin/coaches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    setCreating(false);
    if (r.ok) {
      const created: Coach | null = await r.json().catch(() => null);
      if (created?.slug) {
        setState((prev) => ({
          ...prev,
          items: [created, ...prev.items].slice(0, limit),
          total: prev.total + 1,
          page: 1,
          limit,
        }));
      }
      const params = new URLSearchParams(sp?.toString() || '');
      params.set('q', qLocal);
      params.set('page', '1');
      params.set('limit', String(limit));
      router.replace(`${pathname}?${params.toString()}`);
      router.refresh();
    }
  }

  async function handleSave(slug: string, values: Partial<Coach>) {
    const base = (process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/+$/, '');
    const r = await fetch(`${base}/api/admin/coaches/${encodeURIComponent(slug)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    setEditing(null);
    if (r.ok) {
      const updated: Coach | null = await r.json().catch(() => null);
      if (updated?.slug) {
        setState((prev) => ({
          ...prev,
          items: prev.items.map((it) => (it.slug === slug ? updated : it)),
        }));
      }
      router.refresh();
    }
  }

  async function handleBulkDelete() {
    if (selected.length === 0) return;
    const ok = window.confirm(`Delete ${selected.length} selected coach(es)?`);
    if (!ok) return;
    const base = (process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/+$/, '');
    await Promise.all(
      selected.map((slug) =>
        fetch(`${base}/api/admin/coaches/${encodeURIComponent(slug)}`, { method: 'DELETE' }).catch(() => {})
      )
    );
    setSelected([]);
    router.refresh();
  }

  function gotoPage(p: number) {
    const params = new URLSearchParams(sp?.toString() || '');
    params.set('q', qLocal);
    params.set('page', String(p));
    params.set('limit', String(limit));
    router.push(`${pathname}?${params.toString()}`);
  }

  const visibleItems = state.items.slice(0, limit);

  return (
    <div className="coaches">
      {/* Filterleiste */}
      <section className="coach-filters">
        <div className="coach-filters__field coach-filters__field--grow">
          <label className="label">Suche (live)</label>
          <input
            ref={inputRef}
            className="input"
            value={qLocal}
            onChange={(e) => setQLocal(e.target.value)}
            placeholder="Name, Position…"
          />
        </div>
        <div className="coach-filters__field">
          <label className="label">&nbsp;</label>
          <button className="btn btn--primary" onClick={() => setCreating(true)}>
            Neuer Coach
          </button>
        </div>
      </section>

      {/* Bulk-Aktionen */}
      {selected.length > 0 && (
        <section className="card" aria-live="polite">
          <div className="card-head items-center justify-between">
            <h3 className="m-0">{selected.length} ausgewählt</h3>
            <div className="flex gap-2">
              <button className="btn" onClick={() => setSelected([])}>Clear</button>
              <button className="btn btn--primary" onClick={handleBulkDelete}>Löschen</button>
            </div>
          </div>
        </section>
      )}

      {/* Tabelle */}
      <section className="coach-table">
        <div className="coach-table__head">
          {/* Select-all in Header */}
          <div>
            <label className="sr-only" htmlFor="select-all">Alle auswählen</label>
            <input
              id="select-all"
              type="checkbox"
              checked={allSelected}
              aria-label="Alle auswählen"
              onChange={(e) => toggleSelectAll(e.target.checked)}
            />
          </div>

          <div>Bild</div>
          <div>Name</div>
          <div className="coach-table__pos">Position</div>
          <div className="coach-table__slug">Slug</div>
          <div>Aktion</div>
        </div>

        {loading && <div className="px-4 py-3" aria-live="polite">Suche …</div>}

        {!loading && visibleItems.length === 0 ? (
          <div className="px-4 py-6 text-gray-500">Keine Einträge.</div>
        ) : (
          !loading && visibleItems.map((c) => {
            const full = c.name || [c.firstName, c.lastName].filter(Boolean).join(' ');
            const checked = selected.includes(c.slug);
            return (
              <div
                key={c.slug}
                className="coach-table__row"
                role="button"
                tabIndex={0}
                onClick={() => setEditing(c)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setEditing(c);
                  }
                }}
              >
                {/* Checkbox-Zelle */}
                <div onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={checked}
                    aria-label="Coach auswählen"
                    onChange={(e) => toggleSelect(c.slug, e.target.checked)}
                  />
                </div>

             


   {/* Avatar */}
             

                <div>
  {isValidPhotoUrl(c.photoUrl) ? (
    <img
      src={c.photoUrl!}
      alt={full || 'Coach'}
      className="coach-table__avatar"
      onError={(e) => {
        // falls URL existiert aber 404 liefert → leise auf Placeholder umschalten
        const el = e.currentTarget;
        el.replaceWith(Object.assign(document.createElement('span'), {
          className: 'coach-table__avatar coach-table__avatar--ph',
          ariaHidden: 'true'
        }) as unknown as Node);
      }}
    />
  ) : (
    <span className="coach-table__avatar coach-table__avatar--ph" aria-hidden="true" />
  )}
</div>



                {/* Name */}
                <div className="coach-table__name">{full || '—'}</div>

                {/* Position */}
                <div className="coach-table__pos">{c.position || 'Trainer'}</div>

                {/* Slug */}
                <div className="coach-table__slug">{c.slug}</div>

                {/* Edit-Icon */}
                <div className="coach-table__actions" onClick={(e) => e.stopPropagation()}>
                  <span
                    className="edit-trigger"
                    role="button"
                    tabIndex={0}
                    title="Edit"
                    aria-label="Edit"
                    onClick={() => setEditing(c)}
                  >
                    <img src="/icons/edit.svg" alt="" aria-hidden="true" className="icon-img" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Pagination */}
      <div className="coach-pager">
        <button
          type="button"
          className="btn"
          aria-label="Previous page"
          disabled={state.page <= 1}
          onClick={() => gotoPage(Math.max(1, state.page - 1))}
        >
          <img src="/icons/arrow_right_alt.svg" alt="" aria-hidden="true" className="icon-img icon-img--left" />
        </button>

        <div className="coach-pager__count" aria-live="polite" aria-atomic="true">
          {state.page} / {pageCount}
        </div>

        <button
          type="button"
          className="btn"
          aria-label="Next page"
          disabled={state.page >= pageCount}
          onClick={() => gotoPage(Math.min(pageCount, state.page + 1))}
        >
          <img src="/icons/arrow_right_alt.svg" alt="" aria-hidden="true" className="icon-img" />
        </button>
      </div>

      {/* Dialoge */}
      <CoachDialog
        open={creating}
        mode="create"
        onClose={() => setCreating(false)}
        onSubmit={handleCreate}
      />
      <CoachDialog
        open={!!editing}
        mode="edit"
        initial={editing || undefined}
        onClose={() => setEditing(null)}
        onSubmit={async (vals) => { if (editing) await handleSave(editing.slug, vals); }}
      />
    </div>
  );
}














