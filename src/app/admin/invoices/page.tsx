'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

const BASE_PATH = '/api/admin/invoices';

type DocItem = {
  id: string;
  bookingId: string;
  type: 'participation' | 'cancellation' | 'storno' | string;
  title: string;
  issuedAt?: string;
  href: string;
  status?: string;
  offerTitle?: string;
  offerType?: string;
  customerName?: string;
  customerEmail?: string;
};

type ListResponse =
  | { ok: boolean; items: DocItem[]; total: number; page: number; limit: number }
  | { items: DocItem[]; total?: number }
  | DocItem[];

function asList(raw: ListResponse): { items: DocItem[]; total: number } {
  if (Array.isArray(raw)) return { items: raw, total: raw.length };
  const items = Array.isArray((raw as any).items) ? (raw as any).items : [];
  const total = Number((raw as any).total ?? items.length ?? 0);
  return { items, total };
}

function qs(params: Record<string, any>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    sp.set(k, String(v));
  }
  return sp.toString();
}

// Stabile Datumsausgabe (Zeitzone fix), vermeidet SSR/CSR-Diffs
function fmtDate(s?: string) {
  if (!s) return '—';
  const d = new Date(s);
  if (isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('de-DE', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

export default function AdminInvoicesPage() {
  // Filter
  const [typeParticipation, setTypeParticipation] = useState(true);
  const [typeCancellation, setTypeCancellation] = useState(true);
  const [typeStorno, setTypeStorno] = useState(true);
  const [q, setQ] = useState('');
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');

  // Paging (fest auf 10)
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // immer 10
  const [total, setTotal] = useState(0);

  // Data + UI
  const [items, setItems] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Pseudo-Dropdown (Overlay)
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number; width: number }>({
    left: 0,
    top: 0,
    width: 0,
  });

  const selectedTypes = useMemo(() => {
    const t: string[] = [];
    if (typeParticipation) t.push('participation');
    if (typeCancellation) t.push('cancellation');
    if (typeStorno) t.push('storno');
    return t;
  }, [typeParticipation, typeCancellation, typeStorno]);

  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, limit)));

  function computePos() {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setPos({ left: Math.round(r.left), top: Math.round(r.bottom + 4), width: Math.round(r.width) });
  }
  function openDropdown() {
    computePos();
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current && (t === triggerRef.current || triggerRef.current.contains(t))) return;
      if (menuRef.current && (t === menuRef.current || menuRef.current.contains(t))) return;
      setOpen(false);
    };
    const onResize = () => computePos();
    document.addEventListener('mousedown', onDown);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  // --- Query-String (stabil für SSR/CSR)
  const baseQuery = useMemo(
    () =>
      qs({
        page,
        limit, // immer 10
        type: selectedTypes.join(','),
        from,
        to,
        q,
        sort: 'issuedAt:desc',
      }),
    [page, limit, selectedTypes, from, to, q]
  );

  // CSV/ZIP Links gehen über eigene API-Routen (Cookies werden vom Browser automatisch mitgesendet)
  const [csvHref, setCsvHref] = useState(`/api/admin/invoices/csv?${baseQuery}`);
  const [zipHref, setZipHref] = useState(`/api/admin/invoices/zip?${baseQuery}`);

  useEffect(() => {
    setCsvHref(`/api/admin/invoices/csv?${baseQuery}`);
    setZipHref(`/api/admin/invoices/zip?${baseQuery}`);
  }, [baseQuery]);

  // Daten laden
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`${BASE_PATH}?${baseQuery}`, {
          method: 'GET',
          credentials: 'include', // <— wichtig: JWT-Cookie mitsenden
          cache: 'no-store',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as ListResponse;
        if (!cancelled) {
          const { items, total } = asList(data);
          setItems(items);
          setTotal(total);
        }
      } catch (e: any) {
        if (!cancelled) {
          setErr(e?.message || 'Load failed');
          setItems([]);
          setTotal(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [baseQuery]);



function openPdf(item: DocItem) {
  const href = item.href || '';
  const publicApi = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_BACKEND_API_BASE || 'http://127.0.0.1:5000/api').replace(/\/$/, '');
  let target = href;

  try {
    // A) absolute Backend-URL → auf /api mappen
    if (href.startsWith(`${publicApi}/`)) {
      target = href.replace(publicApi, '/api'); // z.B. http://127.0.0.1:5000/api/admin/... -> /api/admin/...
    }
    // B) relative Backend-URL (/admin/...) → /api voranstellen
    else if (href.startsWith('/admin/')) {
      target = `/api${href}`; // /admin/... -> /api/admin/...
    }
    // C) schon Proxy-Pfad (/api/admin/...) → unverändert
    // D) Fallback: falls gar kein Slash/Protokoll, konservativ präfixen
    else if (!href.startsWith('http') && !href.startsWith('/')) {
      target = `/api/${href.replace(/^\/+/, '')}`;
    }
  } catch {
    // ignore
  }

  window.open(target, '_blank', 'noopener,noreferrer');

}






  return (
    <div className="ks invoices">
      <main className="container max-w-6xl mx-auto">
        <section className="card">
          <div className="dialog-subhead">
            <div className="dialog-head__left">
              <h2 className="card-title">Rechnungen / Dokumente</h2>
            </div>
          </div>

          {/* Filters */}
          <div className="form" style={{ marginTop: 0 }}>
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="card p-2">
                <label className="lbl block mb-1">Types</label>
                <label className="flex items-center gap-2 mb-1">
                  <input
                    type="checkbox"
                    checked={typeParticipation}
                    onChange={(e) => {
                      setTypeParticipation(e.target.checked);
                      setPage(1);
                    }}
                  />
                  Participation
                </label>
                <label className="flex items-center gap-2 mb-1">
                  <input
                    type="checkbox"
                    checked={typeCancellation}
                    onChange={(e) => {
                      setTypeCancellation(e.target.checked);
                      setPage(1);
                    }}
                  />
                  Cancellation
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={typeStorno}
                    onChange={(e) => {
                      setTypeStorno(e.target.checked);
                      setPage(1);
                    }}
                  />
                  Storno
                </label>
              </div>

              <div className="card p-2">
                <label className="lbl block mb-1">Search & Date</label>
                <input
                  className="input mb-2"
                  placeholder="Suche (Nummer, Kunde, E-Mail, Angebot)…"
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setPage(1);
                  }}
                />
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <input
                    className="input"
                    type="date"
                    value={from}
                    onChange={(e) => {
                      setFrom(e.target.value);
                      setPage(1);
                    }}
                  />
                  <input
                    className="input"
                    type="date"
                    value={to}
                    onChange={(e) => {
                      setTo(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Dropdown-Trigger */}
            <div>
              <label className="lbl">Dokumente (aktuelle Seite)</label>
              <button
                ref={triggerRef}
                type="button"
                className="input"
                onClick={() => (open ? setOpen(false) : openDropdown())}
                disabled={loading || !items.length}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 40 }}
                aria-haspopup="listbox"
                aria-expanded={open}
              >
                <span>{loading ? 'Lade…' : `${items.length} Einträge geladen`}</span>
                <span aria-hidden>▾</span>
              </button>
              <div className="text-gray-600 mt-1">Klick auf einen Eintrag öffnet das PDF in neuem Tab.</div>
            </div>
          </div>

          {/* Overlay-Liste */}
          {open && !!items.length && (
            <div
              ref={menuRef}
              role="listbox"
              style={{
                position: 'fixed',
                left: pos.left,
                top: pos.top,
                width: pos.width,
                maxHeight: 44 * 7,
                overflowY: 'auto',
                zIndex: 10000,
                background: '#fff',
                border: '1px solid rgba(0,0,0,.12)',
                boxShadow: '0 8px 24px rgba(0,0,0,.12)',
                borderRadius: 6,
                touchAction: 'pan-y',
              }}
              onWheel={(e) => e.stopPropagation()}
              onScroll={(e) => e.stopPropagation()}
            >
              {items.map((d) => (
                <div
                  key={d.id}
                  role="option"
                  onClick={() => {
                    setOpen(false);
                    openPdf(d);
                  }}
                  className="ks-list__item"
                  style={{ border: '0', borderRadius: 0 }}
                >
                  <div className="ks-item__title">{d.title}</div>
                  <div className="ks-item__meta">
                    {d.type} · {fmtDate(d.issuedAt)}
                    {d.offerTitle ? ` · ${d.offerTitle}` : ''}
                    {d.customerName ? ` · ${d.customerName}` : ''}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Ergebnisliste */}
          {loading ? (
            <div className="card__empty">Lade…</div>
          ) : items.length === 0 ? (
            <div className="card__empty">Keine Dokumente gefunden.</div>
          ) : (
            <ul className="list list--bleed">
              {items.map((d) => (
                <li
                  key={d.id}
                  className="list__item chip is-fullhover is-interactive"
                  onClick={() => openPdf(d)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') openPdf(d);
                  }}
                >
                  <div className="list__body">
                    <div className="list__title">{d.title}</div>
                    <div className="list__meta">
                      {d.type} · Ausgestellt: {fmtDate(d.issuedAt)}
                      {d.offerTitle ? ` · ${d.offerTitle}` : ''}
                      {d.offerType ? ` · ${d.offerType}` : ''}
                      {d.customerName ? ` · ${d.customerName}` : ''}
                      {d.customerEmail ? ` · ${d.customerEmail}` : ''}
                    </div>
                  </div>
                  <div className="list__actions">
                    <button className="btn">PDF öffnen</button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Pager */}
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
              {page} / {totalPages}
            </div>
            <button
              type="button"
              className="pager__nav pager__nav--next"
              aria-label="Next page"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <span className="icon icon--arrow" aria-hidden="true" />
            </button>
          </div>

          {/* Per-page + Downloads (auf 10 fest) */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Pro Seite</span>
              <span className="font-medium">10</span>
            </div>

            <div className="flex items-center gap-2">
              <a href={csvHref} className="btn" suppressHydrationWarning>
                Download CSV
              </a>
              <a href={zipHref} className="btn btn-primary" suppressHydrationWarning>
                Download ZIP
              </a>
            </div>
          </div>

          {err && <div className="mt-2 text-red-600">{err}</div>}
        </section>
      </main>
    </div>
  );
}















