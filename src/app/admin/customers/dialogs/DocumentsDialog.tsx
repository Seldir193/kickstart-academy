// app/admin/customers/dialogs/DocumentsDialog.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type DocItem = {
  id: string;
  bookingId: string;
  type: 'participation'|'cancellation'|'storno'|string;
  title: string;
  issuedAt?: string;
  href: string;           // POST endpoint that returns a PDF (Next proxy)
  status?: string;
  offerTitle?: string;
  offerType?: string;
};

type ListResponse = { ok: boolean; items: DocItem[]; total: number; page: number; limit: number };

type Props = {
  customerId: string;
  onClose: () => void;
};

function qs(params: Record<string, any>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    sp.set(k, String(v));
  }
  return sp.toString();
}

export default function DocumentsDialog({ customerId, onClose }: Props) {
  // filters
  const [typeParticipation, setTypeParticipation] = useState(true);
  const [typeCancellation,  setTypeCancellation]  = useState(true);
  const [typeStorno,        setTypeStorno]        = useState(true);
  const [q, setQ] = useState('');
  const [from, setFrom] = useState<string>('');
  const [to,   setTo]   = useState<string>('');

  // paging
  const [page, setPage]   = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  // data
  const [items, setItems] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string|null>(null);

  // Dropdown overlay (wie in Cancel/Storno)
  const triggerRef = useRef<HTMLButtonElement|null>(null);
  const menuRef = useRef<HTMLDivElement|null>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{left:number; top:number; width:number}>({left:0, top:0, width:0});

  const selectedTypes = useMemo(() => {
    const t: string[] = [];
    if (typeParticipation) t.push('participation');
    if (typeCancellation)  t.push('cancellation');
    if (typeStorno)        t.push('storno');
    return t;
  }, [typeParticipation, typeCancellation, typeStorno]);

  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, limit)));

  function computePos() {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setPos({ left: Math.round(r.left), top: Math.round(r.bottom + 4), width: Math.round(r.width) });
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

  // fetch list
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true); setErr(null);
      try {
        const pid = (typeof window !== 'undefined' && localStorage.getItem('providerId')) || '';
        const query = qs({
          page, limit,
          type: selectedTypes.join(','),
          from, to, q,
          sort: 'issuedAt:desc',
        });
        const res = await fetch(`/api/admin/customers/${encodeURIComponent(customerId)}/documents?${query}`, {
          cache: 'no-store',
          headers: { ...(pid ? { 'x-provider-id': pid } : {}) },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json() as ListResponse;
        if (!cancelled) {
          setItems(Array.isArray(data.items) ? data.items : []);
          setTotal(Number(data.total || 0));
        }
      } catch (e: any) {
        if (!cancelled) { setErr(e?.message || 'Load failed'); setItems([]); setTotal(0); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [customerId, page, limit, selectedTypes, from, to, q]);

  function openDropdown() {
    computePos();
    setOpen(true);
  }


function openPdf(item: DocItem) {
  // Neuer Tab als GET (Proxy akzeptiert jetzt GET und forwarded als POST)
  const url = item.href; // z. B. /api/admin/customers/:id/bookings/:bid/documents/cancellation
  window.open(url, '_blank', 'noopener,noreferrer');
}

  function downloadCsv() {
    const query = qs({
      type: selectedTypes.join(','),
      from, to, q,
      sort: 'issuedAt:desc',
    });
    const url = `/api/admin/customers/${encodeURIComponent(customerId)}/documents.csv?${query}`;
    // CSV darf gern im neuen Tab starten (Browser lädt die Datei)
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  // NEU: ZIP wird direkt heruntergeladen (kein neuer Tab)
  async function downloadZip() {
    try {
      const query = qs({
        type: selectedTypes.join(','),
        from, to, q,
        sort: 'issuedAt:desc',
      });
      const url = `/api/admin/customers/${encodeURIComponent(customerId)}/documents.zip?${query}`;
      const res = await fetch(url, { method: 'GET', credentials: 'include' });
      if (!res.ok) {
        const t = await res.text().catch(()=> '');
        throw new Error(`ZIP download failed (${res.status}) ${t}`);
      }
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = href;
      a.download = `customer-${customerId}-documents.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
    } catch (e) {
      console.error(e);
      alert('ZIP download failed.');
    }
  }

  return (
    <div className="ks-modal-root ks-modal-root--top">
      <div className="ks-backdrop" onClick={onClose} />
      <div className="ks-panel card ks-panel--md" onClick={(e)=> e.stopPropagation()}>
        <div className="dialog-subhead">
          <h3 className="text-lg font-bold">Documents</h3>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-3 mb-2">
          <div className="card p-2">
            <label className="lbl block mb-1">Types</label>
            <label className="flex items-center gap-2 mb-1">
              <input type="checkbox" checked={typeParticipation} onChange={(e)=>{ setTypeParticipation(e.target.checked); setPage(1); }} />
              Participation
            </label>
            <label className="flex items-center gap-2 mb-1">
              <input type="checkbox" checked={typeCancellation} onChange={(e)=>{ setTypeCancellation(e.target.checked); setPage(1); }} />
              Cancellation
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={typeStorno} onChange={(e)=>{ setTypeStorno(e.target.checked); setPage(1); }} />
              Storno
            </label>
          </div>
          <div className="card p-2">
            <label className="lbl block mb-1">Search & Date</label>
            <input className="input mb-2" placeholder="Search…" value={q} onChange={(e)=>{ setQ(e.target.value); setPage(1); }} />
            <div className="grid grid-cols-2 gap-2">
              <input className="input" type="date" value={from} onChange={(e)=>{ setFrom(e.target.value); setPage(1); }} />
              <input className="input" type="date" value={to}   onChange={(e)=>{ setTo(e.target.value);   setPage(1); }} />
            </div>
          </div>
        </div>

        {/* Dropdown trigger */}
        <div className="mb-2">
          <label className="lbl">Documents</label>
          <button
            ref={triggerRef}
            type="button"
            className="input"
            onClick={() => (open ? setOpen(false) : openDropdown())}
            disabled={loading || !items.length}
            style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            <span>{loading ? 'Loading…' : `${items.length} item(s) on this page`}</span>
            <span aria-hidden>▾</span>
          </button>
          <div className="text-gray-600 mt-1">Click an item to open PDF in a new tab.</div>
        </div>

        {/* Overlay list (current page only) */}
        {open && !!items.length && (
          <div
            ref={menuRef}
            role="listbox"
            style={{
              position:'fixed', left:pos.left, top:pos.top, width:pos.width,
              maxHeight: 44*7, overflowY:'auto', zIndex:10000,
              background:'#fff', border:'1px solid rgba(0,0,0,.12)',
              boxShadow:'0 8px 24px rgba(0,0,0,.12)', borderRadius:6, touchAction:'pan-y'
            }}
            onWheel={(e)=> e.stopPropagation()}
            onScroll={(e)=> e.stopPropagation()}
          >
            {items.map((d) => (
              <div
                key={d.id}
                role="option"
                onClick={() => { setOpen(false); openPdf(d); }}
                style={{ padding:'8px 12px', cursor:'pointer' }}
              >
                <div style={{ fontWeight:600, whiteSpace:'normal' }}>{d.title}</div>
                <div style={{ fontSize:12, color:'#666' }}>
                  {d.type} · {d.issuedAt ? new Date(d.issuedAt).toLocaleDateString('de-DE') : '-'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination + limit */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <button className="btn" onClick={()=> setPage(p => Math.max(1, p-1))} disabled={page<=1}>Prev</button>
            <div>Page {page} / {totalPages}</div>
            <button className="btn" onClick={()=> setPage(p => Math.min(totalPages, p+1))} disabled={page>=totalPages}>Next</button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Per page</span>
            <select className="input" value={limit} onChange={(e)=>{ setLimit(Number(e.target.value)); setPage(1); }}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-4">
          <button className="btn" onClick={downloadCsv}>Download CSV</button>
          <button className="btn btn-primary" onClick={downloadZip}>Download ZIP</button>
          <button className="btn" onClick={onClose}>Close</button>
        </div>

        {err && <div className="mt-2 text-red-600">{err}</div>}
      </div>
    </div>
  );
}














