// app/admin/bookings/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import BookingDialog from './BookingDialog';

/* ============ Types ============ */
type Status = 'pending' | 'processing' | 'confirmed' | 'cancelled' | 'deleted';
type StatusOrAll = Status | 'all';

type Booking = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  date: string; // yyyy-mm-dd oder ISO
  level: string;
  message?: string;
  createdAt: string;
  status?: Status;
  confirmationCode?: string;
};

type ListResp = {
  ok?: boolean;
  items?: Booking[];
  bookings?: Booking[];
  total?: number;
  page?: number;
  limit?: number;
  pages?: number;
  counts?: Partial<Record<Status, number>>;
  error?: string;
};


/* ============ Debounce Hook ============ */
function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/* ============ Helpers ============ */
const PAGE_SIZE = 10;

function fmtDate_DE(value?: string) {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d);
}

function asStatus(s?: Booking['status']): Status {
  return (s ?? 'pending') as Status;
}

/* ============ Page ============ */
export default function AdminBookingsPage() {
  // Filter UI
  const [status, setStatus] = useState<StatusOrAll>('all');
  const [q, setQ] = useState('');
  const qDebounced = useDebouncedValue(q, 300);

  // Paging (serverseitig)
  const [page, setPage] = useState(1);
  const [limit] = useState(PAGE_SIZE);

  // Daten
  const [items, setItems] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [counts, setCounts] = useState<Partial<Record<Status, number>>>({});

  // UI state
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Globaler Toast
  const [notice, setNotice] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);
  const showOk = (text: string) => {
    setNotice({ type: 'ok', text });
    setTimeout(() => setNotice(null), 5000);
  };
  const showError = (text: string) => {
    setNotice({ type: 'error', text });
    setTimeout(() => setNotice(null), 5000);
  };

  // Dialog
  const [sel, setSel] = useState<Booking | null>(null);

  // Auswahl (Checkboxen)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const visibleIds = useMemo(() => items.map((b) => b._id), [items]);
  const selectedCount = selectedIds.size;
  const allVisibleSelected = useMemo(
    () => visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id)),
    [visibleIds, selectedIds]
  );
  const selItems = useMemo(
    () => items.filter((b) => selectedIds.has(b._id)),
    [items, selectedIds]
  );

  function toggleOne(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function selectAllVisible() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        visibleIds.forEach((id) => next.delete(id));
      } else {
        visibleIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  // Bulk-Eligibility (Regeln)
  const canBulkProcessing = selItems.some((b) => b.status === 'pending');
  const canBulkConfirmed = selItems.some(
    (b) => b.status === 'pending' || b.status === 'processing'
  );
  const canBulkCancelled = selItems.some(
    (b) => b.status === 'pending' || b.status === 'processing'
  );
  const canBulkDelete = selItems.length > 0;

  // Query
  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (status && status !== 'all') p.set('status', status);
    if (qDebounced.trim()) p.set('q', qDebounced.trim());
    p.set('page', String(page));
    p.set('limit', String(limit));
    return p.toString();
  }, [status, qDebounced, page, limit]);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/bookings?${query}`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });
      const data: ListResp = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);

      const arr = (
        Array.isArray(data.items)
          ? data.items
          : Array.isArray(data.bookings)
          ? data.bookings
          : []
      ) as Booking[];
      setItems(arr);
      setTotal(data.total ?? arr.length);
      setPages(data.pages ?? Math.max(1, Math.ceil((data.total ?? arr.length) / limit)));
      setCounts(data.counts ?? {});
    } catch (e: any) {
      setErr(e?.message || 'Load failed');
      showError(e?.message || 'Load failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [query]);

  /* ===== Server-Aktionen (Einzel) ===== */
  async function apiConfirm(id: string, resend = false): Promise<string> {
    const url = `/api/admin/bookings/${encodeURIComponent(id)}/confirm${
      resend ? '?resend=1' : ''
    }`;
    const r = await fetch(url, { method: 'POST', credentials: 'include', cache: 'no-store' });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || d?.ok === false) throw new Error(d?.error || r.statusText);
    await load();
    if (sel && sel._id === id) {
      setSel((prev) =>
        prev
          ? {
              ...prev,
              status: 'confirmed',
              confirmationCode: d.booking?.confirmationCode ?? prev.confirmationCode,
            }
          : prev
      );
    }
    return resend
      ? 'Bestätigung erneut gesendet.'
      : 'Buchung bestätigt und E-Mail versendet.';
  }

  async function apiSetStatus(
    id: string,
    next: Status,
    opts?: { forceMail?: boolean }
  ): Promise<string> {
    const url = `/api/admin/bookings/${encodeURIComponent(id)}/status${
      opts?.forceMail ? '?force=1' : ''
    }`;
    const r = await fetch(url, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || d?.ok === false) throw new Error(d?.error || r.statusText);
    await load();
    if (sel && sel._id === id) setSel(d.booking ?? sel);
    if (next === 'processing') return 'Auf „In Bearbeitung“ gesetzt.';
    if (next === 'cancelled') return 'Absage versendet.';
    return 'Status aktualisiert.';
  }

  async function apiDelete(id: string): Promise<string> {
    const r = await fetch(`/api/admin/bookings/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || d?.ok === false) throw new Error(d?.error || r.statusText);
    await load();
    return 'Buchung gelöscht.';
  }

  // Bestätigten Termin absagen
  async function apiCancelConfirmed(id: string): Promise<string> {
    const trySpecial = await fetch(
      `/api/admin/bookings/${encodeURIComponent(id)}/cancel-confirmed`,
      {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
      }
    );
    if (trySpecial.status === 404) {
      const text = await apiSetStatus(id, 'cancelled', { forceMail: true });
      showOk(text + ' (Fallback verwendet)');
      return 'Bestätigter Termin abgesagt (Fallback).';
    }
    const d = await trySpecial.json().catch(() => ({}));
    if (!trySpecial.ok || d?.ok === false)
      throw new Error(d?.error || trySpecial.statusText);
    await load();
    if (sel && sel._id === id)
      setSel((prev) => (prev ? { ...prev, status: 'cancelled' } : prev));
    return 'Bestätigter Termin wurde abgesagt und spezielle E-Mail versendet.';
  }

  /* ===== Bulk-Aktionen ===== */
  async function bulkSetStatus(next: Status) {
    if (!selectedIds.size) return;

    let eligible: Booking[] = [];
    if (next === 'processing') {
      eligible = selItems.filter((b) => b.status === 'pending');
    } else if (next === 'cancelled') {
      eligible = selItems.filter(
        (b) => b.status === 'pending' || b.status === 'processing'
      );
    } else if (next === 'confirmed') {
      eligible = selItems.filter(
        (b) => b.status === 'pending' || b.status === 'processing'
      );
    } else {
      eligible = [];
    }
    if (!eligible.length) return;

    try {
      if (next === 'confirmed') {
        await Promise.all(
          eligible.map((b) =>
            fetch(`/api/admin/bookings/${encodeURIComponent(b._id)}/confirm`, {
              method: 'POST',
              credentials: 'include',
              cache: 'no-store',
            })
          )
        );
        showOk(`(${eligible.length}) bestätigt und E-Mails versendet.`);
      } else {
        await Promise.all(
          eligible.map((b) =>
            fetch(`/api/admin/bookings/${encodeURIComponent(b._id)}/status`, {
              method: 'PATCH',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: next }),
            })
          )
        );
        showOk(
          next === 'processing'
            ? `(${eligible.length}) → In Bearbeitung.`
            : next === 'cancelled'
            ? `(${eligible.length}) → Abgesagt.`
            : 'Status aktualisiert.'
        );
      }
      await load();
    } catch (e: any) {
      showError(e?.message || 'Bulk-Aktion fehlgeschlagen.');
    } finally {
      clearSelection();
    }
  }

  async function bulkDelete() {
    if (!selectedIds.size) return;
    const eligible = selItems.filter((b) => b.status !== 'deleted');
    if (!eligible.length) return;
    try {
      await Promise.all(
        eligible.map((b) =>
          fetch(`/api/admin/bookings/${encodeURIComponent(b._id)}`, {
            method: 'DELETE',
            credentials: 'include',
          })
        )
      );
      await load();
      showOk(`(${eligible.length}) Buchungen gelöscht.`);
    } catch (e: any) {
      showError(e?.message || 'Bulk-Löschen fehlgeschlagen.');
    } finally {
      clearSelection();
    }
  }




// Programm aus message holen (Zeile "Programm: ...")
function extractProgramName(msg?: string): string | null {
  if (!msg) return null;
  const m = msg.match(/Programm:\s*(.+)/i);
  return m ? m[1].trim() : null;
}

// Kürzel für die Tabelle (max. 3 Zeichen)
function programShort(booking: Booking): string {
  const name = extractProgramName(booking.message) || '';
  if (!name) return '—';

  const low = name.toLowerCase();

  // Feste Mappings
  if (low.includes('fördertraining') || low.includes('foerdertraining')) return 'FÖ';
  if (low.includes('kindergarten') || low.includes('fußballkindergarten') || low.includes('fussballkindergarten')) return 'KDN';
  if (low.includes('camp')) return 'CMP';
  if (low.includes('power')) return 'PWR';
  if (low.includes('coach education')) return 'CE';
  if (low.includes('rent a coach') || low.includes('rentacoach')) return 'RAC';
  if (low.includes('individual')) return 'IND';
  if (low.includes('torwart') || low.includes('goalkeeper')) return 'TW';
  if (low.includes('athletik') || low.includes('athletic')) return 'ATH';

  // Fallback: erste 3 Buchstaben, groß
  const clean = name.replace(/[^a-zA-ZäöüÄÖÜß]/g, '').toUpperCase();
  if (!clean) return '—';
  return clean.slice(0, 3);
}



  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Head */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Bookings</h1>
      </div>

      {/* Globaler Toast */}
      {notice && (
        <div
          className={notice.type === 'ok' ? 'ok' : 'error'}
          style={{
            position: 'fixed',
            right: 12,
            bottom: 12,
            zIndex: 6000,
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: '10px 12px',
            boxShadow: '0 10px 25px rgba(17,24,39,.08)',
          }}
        >
          {notice.text}
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 items-end mb-3">
        <div className="flex-1">
          <label htmlFor="search" className="block text-sm text-gray-600">
            Search
          </label>
          <input
            id="search"
            className="input"
            placeholder="Name, email, level, code, message…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setPage(1);
            }}
          />
        </div>
        <div style={{ minWidth: 220 }}>
          <label className="block text-sm text-gray-600">Status</label>
          <select
            className="input"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as StatusOrAll);
              setPage(1);
              clearSelection();
            }}
          >
            <option value="all">
              All(
              {(
                (counts.pending ?? 0) +
                  (counts.processing ?? 0) +
                  (counts.confirmed ?? 0) +
                  (counts.cancelled ?? 0) +
                  (counts.deleted ?? 0) || total
              ).toString()}
              )
            </option>
            <option value="pending">Pending ({counts.pending ?? 0})</option>
            <option value="processing">Processing ({counts.processing ?? 0})</option>
            <option value="confirmed">Confirmed ({counts.confirmed ?? 0})</option>
            <option value="cancelled">Cancelled ({counts.cancelled ?? 0})</option>
            <option value="deleted">Deleted ({counts.deleted ?? 0})</option>
          </select>
        </div>
      </div>

      {/* Bulk-Aktionsleiste */}
      <div className="flex flex-wrap items-center justify-between mb-2">
        <div className="text-sm text-gray-700">
          {selectedCount > 0 ? `${selectedCount} ausgewählt` : ''}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn"
            onClick={selectAllVisible}
            disabled={items.length === 0}
          >
            {allVisibleSelected ? 'Sichtbare abwählen' : 'Sichtbare auswählen'}
          </button>
          <button
            type="button"
            className="btn"
            onClick={clearSelection}
            disabled={selectedCount === 0}
          >
            Clear
          </button>

          <button
            type="button"
            className="btn"
            onClick={() => bulkSetStatus('processing')}
            disabled={!canBulkProcessing}
          >
            → Processing
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => bulkSetStatus('cancelled')}
            disabled={!canBulkCancelled}
          >
            → Cancelled
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => bulkSetStatus('confirmed')}
            disabled={!canBulkConfirmed}
          >
            → Confirmed
          </button>
          <button
            type="button"
            className="btn btn--danger"
            onClick={bulkDelete}
            disabled={!canBulkDelete}
          >
            Delete selected
          </button>
        </div>
      </div>

      {/* Fehler/Loading */}
      {loading && <div className="card">Loading…</div>}
      {err && <div className="card text-red-600">{err}</div>}

      {/* Tabelle */}
      {!loading && !err && (
        <div className="card p-0 overflow-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead className="bg-gray-50">
              <tr>
                <th className="th" style={{ width: 44 }}>
                  <input
                    type="checkbox"
                    aria-label="Sichtbare auswählen/abwählen"
                    checked={allVisibleSelected && items.length > 0}
                    onChange={selectAllVisible}
                  />
                </th>
                <th className="th">Name</th>
                <th className="th">Email</th>
                <th className="th">Age</th>
                
                <th className="th">Programm</th>
                <th className="th">Status</th>
                <th className="th">Created</th>
              </tr>
            </thead>
            <tbody>
              {items.map((b) => {
                const checked = selectedIds.has(b._id);
                return (
                  <tr
                    key={b._id}
                    className="tr hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSel(b)}
                    title="Details ansehen"
                  >
                    <td className="td" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => toggleOne(b._id, e.target.checked)}
                        aria-label={`Buchung auswählen: ${b.firstName} ${b.lastName}`}
                        title={
                          b.status === 'cancelled'
                            ? 'Abgesagt – nur Bulk-Löschen sinnvoll'
                            : ''
                        }
                      />
                    </td>
                    <td className="td">
                      {b.firstName} {b.lastName}
                    </td>
                    <td className="td">{b.email}</td>
                    <td className="td">{b.age}</td>
                    
            
                    <td className="td">{programShort(b)}</td>

                    <td className="td">{asStatus(b.status)}</td>
                    <td className="td">{fmtDate_DE(b.createdAt)}</td>
                  </tr>
                );
              })}
              {!items.length && (
                <tr>
                  <td className="td" colSpan={8}>
                    No bookings.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pager */}
      <div className="pager pager--arrows">
        <button
          type="button"
          className="btn"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => {
            setPage((p) => Math.max(1, p - 1));
            clearSelection();
          }}
        >
          <img
            src="/icons/arrow_right_alt.svg"
            alt=""
            aria-hidden="true"
            className="icon-img icon-img--left"
          />
        </button>

        <div className="pager__count" aria-live="polite" aria-atomic="true">
          {page} / {pages}
        </div>

        <button
          type="button"
          className="btn"
          aria-label="Next page"
          disabled={page >= pages}
          onClick={() => {
            setPage((p) => Math.min(pages, p + 1));
            clearSelection();
          }}
        >
          <img
            src="/icons/arrow_right_alt.svg"
            alt=""
            aria-hidden="true"
            className="icon-img"
          />
        </button>
      </div>

      {/* Dialog */}
      {sel && (
        <BookingDialog
          booking={sel}
          onClose={() => setSel(null)}
          onConfirm={() => apiConfirm(sel._id, false)}
          onResend={() => apiConfirm(sel._id, true)}
          onSetStatus={(s) => apiSetStatus(sel._id, s)}
          onDelete={() => apiDelete(sel._id)}
          onCancelConfirmed={() => apiCancelConfirmed(sel._id)}
          notify={showOk}
        />
      )}
    </div>
  );
}














