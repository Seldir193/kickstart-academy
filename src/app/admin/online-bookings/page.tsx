
// app/admin/online-bookings/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import BookingDialog from '../bookings/BookingDialog';

/* ============ Types ============ */
type Status = 'confirmed' | 'cancelled' | 'deleted';
type StatusOrAll = Status | 'all';
type ProgramFilter = 'all' | 'camp' | 'power';

type Booking = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  date: string;
  level: string;
  message?: string;
  createdAt: string;
  status?: Status;
  confirmationCode?: string;
};

type ListResp = {
  ok?: boolean;
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
  return (s ?? 'confirmed') as Status;
}

/* ============ Page ============ */
export default function AdminOnlineBookingsPage() {
  const [status, setStatus] = useState<StatusOrAll>('all');
  const [program, setProgram] = useState<ProgramFilter>('all');
  const [q, setQ] = useState('');
  const qDebounced = useDebouncedValue(q, 300);

  const [page, setPage] = useState(1);
  const [limit] = useState(PAGE_SIZE);

  const [items, setItems] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [counts, setCounts] = useState<Partial<Record<Status, number>>>({});
  const [totalAll, setTotalAll] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [notice, setNotice] =
    useState<{ type: 'ok' | 'error'; text: string } | null>(null);
  const showOk = (text: string) => {
    setNotice({ type: 'ok', text });
    setTimeout(() => setNotice(null), 5000);
  };
  const showError = (text: string) => {
    setNotice({ type: 'error', text });
    setTimeout(() => setNotice(null), 5000);
  };

  const [sel, setSel] = useState<Booking | null>(null);
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
  const deletedSelected = selItems.filter((b) => b.status === 'deleted');
  const canBulkDelete = selItems.length > 0;
  const canRestoreDeleted = deletedSelected.length > 0;

  function toggleOne(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
  }
  function selectAllVisible() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) visibleIds.forEach((id) => next.delete(id));
      else visibleIds.forEach((id) => next.add(id));
      return next;
    });
  }
  function clearSelection() {
    setSelectedIds(new Set());
  }

  // Query Richtung Backend
  const query = useMemo(() => {
    const p = new URLSearchParams();
    p.set('program', program);
    if (status && status !== 'all') p.set('status', status);
    if (qDebounced.trim()) p.set('q', qDebounced.trim());
    p.set('page', String(page));
    p.set('limit', String(limit));
    return p.toString();
  }, [status, program, qDebounced, page, limit]);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/online-bookings?${query}`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });
      const data: ListResp = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);

      const arr = Array.isArray(data.bookings) ? data.bookings : [];
      setItems(arr);

      const t = typeof data.total === 'number' ? data.total : arr.length;
      setTotal(t);
      setPages(Math.max(1, Math.ceil(t / limit)));

      // Total-All nur updaten wenn kein Status-Filter
      if (status === 'all' && !qDebounced.trim()) {
        setTotalAll(t);
      }

      if (data.counts) setCounts(data.counts);
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

  /* ===== Server-Aktionen ===== */
  async function apiConfirm(id: string, resend = false): Promise<string> {
    const params = new URLSearchParams();
    if (resend) params.set('resend', '1');
    params.set('withInvoice', '1');

    const url = `/api/admin/bookings/${encodeURIComponent(id)}/confirm?${params.toString()}`;

    const r = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || d?.ok === false) throw new Error(d?.error || r.statusText);
    await load();
    return resend
      ? 'Bestätigung erneut gesendet.'
      : 'Buchung bestätigt + Rechnung geschickt.';
  }

  async function apiSetStatus(id: string, next: Status): Promise<string> {
    const url = `/api/admin/bookings/${encodeURIComponent(id)}/status`;
    const r = await fetch(url, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || d?.ok === false) throw new Error(d?.error || r.statusText);
    await load();
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

  async function apiCancelConfirmed(id: string): Promise<string> {
    const r = await fetch(
      `/api/admin/bookings/${encodeURIComponent(id)}/cancel-confirmed`,
      {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
      }
    );
    const d = await r.json().catch(() => ({}));
    if (!r.ok || d?.ok === false) throw new Error(d?.error || r.statusText);
    await load();
    return 'Termin abgesagt.';
  }

  async function bulkDelete() {
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
      showOk(`(${eligible.length}) gelöscht.`);
    } catch (e: any) {
      showError(e?.message || 'Bulk-Löschen fehlgeschlagen.');
    } finally {
      clearSelection();
    }
  }

  async function bulkRestoreDeleted() {
    if (!deletedSelected.length) return;
    try {
      await Promise.all(
        deletedSelected.map((b) =>
          fetch(`/api/admin/bookings/${encodeURIComponent(b._id)}/restore`, {
            method: 'POST',
            credentials: 'include',
            cache: 'no-store',
          })
        )
      );
      await load();
      showOk(`(${deletedSelected.length}) wiederhergestellt.`);
    } catch (e: any) {
      showError(e?.message || 'Restore fehlgeschlagen.');
    } finally {
      clearSelection();
    }
  }


  function bookingProgramAbbr(b: Booking): string {
  const text = [
    (b as any).offerType,
    (b as any).offerTitle,
    b.level,
    (b as any).program,
    b.message,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (!text) return '—';

  if (text.includes('powertraining') || text.includes('power training')) {
    return 'PWR';
  }

  if (
    text.includes('camp') ||
    text.includes('feriencamp') ||
    text.includes('holiday camp')
  ) {
    return 'CMP';
  }

  return '—';
}


  return (
    <div className="p-4 max-w-6xl mx-auto">

      <h1 className="text-2xl font-bold mb-4">
        Online Buchungen (Holiday)
      </h1>

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
          <label className="block text-sm text-gray-600">Search</label>
          <input
            className="input"
            placeholder="Name, email, level…"
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

        

          {/* Courses / Program-Filter – NUR Styling geändert */}
        <div style={{ minWidth: 220 }}>
          <label className="block text-sm text-gray-600">Courses</label>
          <select
            className="input"
            value={program}
            onChange={(e) => {
              setProgram(e.target.value as ProgramFilter);
              setStatus('all');
              setPage(1);
              clearSelection();
            }}
          >
            <option value="all">All courses</option>
            <optgroup label="Holiday Programs">
              <option value="camp">Camps (Indoor/Outdoor)</option>
              <option value="power">Powertraining</option>
            </optgroup>
          </select>
        </div>

        <div style={{ minWidth: 180 }}>
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
            <option value="all">All ({totalAll ?? total})</option>
            <option value="confirmed">
              Confirmed ({counts.confirmed ?? 0})
            </option>
            <option value="cancelled">
              Cancelled ({counts.cancelled ?? 0})
            </option>
            <option value="deleted">
              Deleted ({counts.deleted ?? 0})
            </option>
          </select>
        </div>
      </div>

      {/* Bulk-Aktionen */}
      <div className="flex gap-2 justify-between mb-2">
        <div className="text-sm text-gray-700">
          {selectedCount > 0 ? `${selectedCount} ausgewählt` : ''}
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={selectAllVisible} disabled={!items.length}>
            {allVisibleSelected ? 'Abwählen' : 'Auswählen'}
          </button>
          <button className="btn" onClick={clearSelection} disabled={!selectedCount}>
            Clear
          </button>
          <button
            className="btn btn--danger"
            onClick={bulkDelete}
            disabled={!canBulkDelete}
          >
            Delete selected
          </button>
          <button
            className="btn"
            onClick={bulkRestoreDeleted}
            disabled={!canRestoreDeleted}
          >
            Wiederherstellen
          </button>
        </div>
      </div>

      {/* Tabelle */}
      {loading && <div className="card">Loading…</div>}
      {err && <div className="card text-red-600">{err}</div>}

      {!loading && !err && (
        <div className="card p-0 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="th" style={{ width: 44 }}>
                  <input
                    type="checkbox"
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
              {items.map((b) => (
                <tr
                  key={b._id}
                  className="tr hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSel(b)}
                >
                  <td className="td" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(b._id)}
                      onChange={(e) => toggleOne(b._id, e.target.checked)}
                    />
                  </td>
                  <td className="td">{b.firstName} {b.lastName}</td>
                  <td className="td">{b.email}</td>
                  <td className="td">{b.age}</td>
                   <td className="td">{bookingProgramAbbr(b)}</td> 
                  <td className="td">{asStatus(b.status)}</td>
                  <td className="td">{fmtDate_DE(b.createdAt)}</td>
                </tr>
              ))}
              {!items.length && (
                <tr>
                  <td className="td" colSpan={7}>
                    Keine Buchungen gefunden.
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
          onSetStatus={(s) => apiSetStatus(sel._id, s as Status)}
          onDelete={() => apiDelete(sel._id)}
          onCancelConfirmed={() => apiCancelConfirmed(sel._id)}
          notify={showOk}
        />
      )}
    </div>
  );
}






