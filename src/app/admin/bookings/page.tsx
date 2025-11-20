// app/admin/bookings/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import BookingDialog from './BookingDialog';

/* ============ Types ============ */
type Status = 'pending' | 'processing' | 'confirmed' | 'cancelled' | 'deleted';
type StatusOrAll = Status | 'all';

type ProgramFilter =
  | 'all'
  // Weekly Courses
  | 'weekly_foerdertraining'
  | 'weekly_kindergarten'
  | 'weekly_goalkeeper'
  | 'weekly_development_athletik'
  // Individual Courses
  | 'ind_1to1'
  | 'ind_1to1_athletik'
  | 'ind_1to1_goalkeeper'
  // Club Programs
  | 'club_rentacoach'
  | 'club_trainingcamps'
  | 'club_coacheducation';

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
  // wichtig: backend filtert über offerId, wir zeigen es aber nicht an
  offerId?: string;
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
  if (
    low.includes('kindergarten') ||
    low.includes('fußballkindergarten') ||
    low.includes('fussballkindergarten')
  )
    return 'KDG';
  if (low.includes('torwart') || low.includes('goalkeeper')) return 'TW';
  if (low.includes('athletik') || low.includes('athletic')) return 'ATH';
  if (low.includes('rentacoach') || low.includes('rent-a-coach')) return 'RAC';
  if (low.includes('coach education')) return 'CE';
  if (low.includes('camp')) return 'CMP';
  if (low.includes('powertraining') || low.includes('power training')) return 'PWR';

  // Fallback: erste 3 Buchstaben, groß
  const clean = name.replace(/[^a-zA-ZäöüÄÖÜß]/g, '').toUpperCase();
  if (!clean) return '—';
  return clean.slice(0, 3);
}

/* ============ Page ============ */
export default function AdminBookingsPage() {
  // Filter UI
  const [status, setStatus] = useState<StatusOrAll>('all');
  const [program, setProgram] = useState<ProgramFilter>('all');
  const [q, setQ] = useState('');
  const qDebounced = useDebouncedValue(q, 300);

  // Paging (serverseitig)
  const [page, setPage] = useState(1);
  const [limit] = useState(PAGE_SIZE);

  // Daten für aktuelle Ansicht (inkl. Status + Seite)
  const [items, setItems] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0); // für Pager (aktuelle Filterung)
  const [pages, setPages] = useState(1);
  const [counts, setCounts] = useState<Partial<Record<Status, number>>>({});

  // Globale Daten (alle Status, gleiche Suche + Programm)
  const [globalTotal, setGlobalTotal] = useState(0);
  const [globalCounts, setGlobalCounts] = useState<
    Partial<Record<Status, number>>
  >({});

  // UI state
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Globaler Toast
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

  // Dialog
  const [sel, setSel] = useState<Booking | null>(null);

  // Auswahl (Checkboxen)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showHardDeleteDialog, setShowHardDeleteDialog] = useState(false);

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

  const deletedSelected = selItems.filter((b) => b.status === 'deleted');
  const canRestoreDeleted = deletedSelected.length > 0;
  const canHardDelete = deletedSelected.length > 0;
  const canBulkDelete = selItems.length > 0;

  // Query für aktuelle Ansicht (Status + Seite + Programm)
  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (status && status !== 'all') p.set('status', status);
    if (program && program !== 'all') p.set('program', program);
    if (qDebounced.trim()) p.set('q', qDebounced.trim());
    p.set('page', String(page));
    p.set('limit', String(limit));
    return p.toString();
  }, [status, program, qDebounced, page, limit]);

  // Query für globale Zahlen (nur Suche + Programm, keine Status-Filter)
  const globalQuery = useMemo(() => {
    const p = new URLSearchParams();
    if (program && program !== 'all') p.set('program', program);
    if (qDebounced.trim()) p.set('q', qDebounced.trim());
    p.set('page', '1');
    p.set('limit', '1');
    return p.toString();
  }, [qDebounced, program]);

  /* ===== Globale Zahlen laden (All + Status-Zahlen) ===== */
  async function loadGlobal() {
    try {
      const res = await fetch(`/api/admin/bookings?${globalQuery}`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });
      const data: ListResp = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);

      const totalAll =
        typeof data.total === 'number'
          ? data.total
          : Array.isArray(data.items)
          ? data.items.length
          : Array.isArray(data.bookings)
          ? data.bookings.length
          : 0;

      setGlobalTotal(totalAll);
      setGlobalCounts(data.counts || {});
    } catch (e: any) {
      console.warn('[bookings] loadGlobal failed:', e?.message || e);
    }
  }

  const allCount =
    (globalCounts.pending ?? 0) +
    (globalCounts.processing ?? 0) +
    (globalCounts.confirmed ?? 0) +
    (globalCounts.cancelled ?? 0) +
    (globalCounts.deleted ?? 0);

  /* ===== Daten für aktuelle Ansicht laden ===== */
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

      const list =
        Array.isArray(data.items)
          ? data.items
          : Array.isArray(data.bookings)
          ? data.bookings
          : [];

      const totalForFilter =
        typeof data.total === 'number' ? data.total : list.length;

      setItems(list as Booking[]);
      setTotal(totalForFilter);
      setPages(Math.max(1, Math.ceil(totalForFilter / limit)));

      setCounts(data.counts || {});
    } catch (e: any) {
      setErr(e?.message || 'Load failed');
      showError(e?.message || 'Load failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    loadGlobal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalQuery]);

  /* ===== Server-Aktionen (Einzel) ===== */
  async function apiConfirm(id: string, resend = false): Promise<string> {
    const url = `/api/admin/bookings/${encodeURIComponent(id)}/confirm${
      resend ? '?resend=1' : ''
    }`;
    const r = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || d?.ok === false) throw new Error(d?.error || r.statusText);
    await Promise.all([load(), loadGlobal()]);
    if (sel && sel._id === id) {
      setSel((prev) =>
        prev
          ? {
              ...prev,
              status: 'confirmed',
              confirmationCode:
                d.booking?.confirmationCode ?? prev.confirmationCode,
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
    await Promise.all([load(), loadGlobal()]);
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
    await Promise.all([load(), loadGlobal()]);
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
    await Promise.all([load(), loadGlobal()]);
    if (sel && sel._id === id)
      setSel((prev) => (prev ? { ...prev, status: 'cancelled' } : prev));
    return 'Bestätigter Termin wurde abgesagt und spezielle E-Mail versendet.';
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
      await Promise.all([load(), loadGlobal()]);
      showOk(`(${eligible.length}) Buchungen gelöscht.`);
    } catch (e: any) {
      showError(e?.message || 'Bulk-Löschen fehlgeschlagen.');
    } finally {
      clearSelection();
    }
  }

  // Gelöschte (status='deleted') wiederherstellen
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
      await Promise.all([load(), loadGlobal()]);
      showOk(`(${deletedSelected.length}) Buchungen wiederhergestellt.`);
    } catch (e: any) {
      showError(e?.message || 'Wiederherstellen fehlgeschlagen.');
    } finally {
      clearSelection();
    }
  }

  async function bulkHardDelete() {
    if (!deletedSelected.length) return;

    try {
      await Promise.all(
        deletedSelected.map((b) =>
          fetch(`/api/admin/bookings/${encodeURIComponent(b._id)}/hard`, {
            method: 'DELETE',
            credentials: 'include',
            cache: 'no-store',
          })
        )
      );
      await Promise.all([load(), loadGlobal()]);
      showOk(`(${deletedSelected.length}) Buchungen endgültig gelöscht.`);
    } catch (e: any) {
      showError(e?.message || 'Endgültiges Löschen fehlgeschlagen.');
    } finally {
      clearSelection();
      setShowHardDeleteDialog(false);
    }
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
      <div className="flex flex-wrap gap-2 items-end mb-3">
        <div className="flex-1 min-w-[220px]">
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

        {/* Kurs-Filter wie im WordPress-Formular (ohne Holiday) */}
        <div style={{ minWidth: 260 }}>
          <label className="block text-sm text-gray-600">Course</label>
          <select
            className="input"
            value={program}
            onChange={(e) => {
              setProgram(e.target.value as ProgramFilter);
              setPage(1);
              clearSelection();
            }}
          >
            <option value="all">All courses</option>

            <optgroup label="Weekly Courses">
              <option value="weekly_foerdertraining">Foerdertraining</option>
              <option value="weekly_kindergarten">Soccer Kindergarten</option>
              <option value="weekly_goalkeeper">Goalkeeper Training</option>
              <option value="weekly_development_athletik">
                Development Training • Athletik
              </option>
            </optgroup>

            <optgroup label="Individual Courses">
              <option value="ind_1to1">1:1 Training</option>
              <option value="ind_1to1_athletik">1:1 Training Athletik</option>
              <option value="ind_1to1_goalkeeper">1:1 Training Torwart</option>
            </optgroup>

            <optgroup label="Club Programs">
              <option value="club_rentacoach">Rent-a-Coach</option>
              <option value="club_trainingcamps">Training Camps</option>
              <option value="club_coacheducation">Coach Education</option>
            </optgroup>
          </select>
        </div>

        {/* Status-Filter */}
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
            <option value="all">All ({allCount})</option>
            <option value="pending">Pending ({globalCounts.pending ?? 0})</option>
            <option value="processing">
              Processing ({globalCounts.processing ?? 0})
            </option>
            <option value="confirmed">
              Confirmed ({globalCounts.confirmed ?? 0})
            </option>
            <option value="cancelled">
              Cancelled ({globalCounts.cancelled ?? 0})
            </option>
            <option value="deleted">
              Deleted ({globalCounts.deleted ?? 0})
            </option>
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

          {/* Soft-Delete → status='deleted' */}
          <button
            type="button"
            className="btn btn--danger"
            onClick={bulkDelete}
            disabled={!canBulkDelete}
          >
            Delete selected
          </button>

          {/* Gelöschte wiederherstellen */}
          <button
            type="button"
            className="btn"
            onClick={bulkRestoreDeleted}
            disabled={!canRestoreDeleted}
          >
            Wiederherstellen
          </button>

          {/* Hard Delete */}
          <button
            type="button"
            className="btn btn--danger"
            onClick={() => setShowHardDeleteDialog(true)}
            disabled={!canHardDelete}
          >
            Endgültig löschen
          </button>
        </div>
      </div>

      {/* Fehler/Loading */}
      {loading && <div className="card">Loading…</div>}
      {err && <div className="card text-red-600">{err}</div>}

      {/* Tabelle */}
      {!loading && !err && (
        <div className="card p-0 overflow-auto">
          <table
            className="w-full text-sm"
            style={{ borderCollapse: 'collapse' }}
          >
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
                  <td className="td" colSpan={7}>
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

      {/* Bestätigungsdialog für endgültiges Löschen */}
      {showHardDeleteDialog && deletedSelected.length > 0 && (
        <div
          onClick={() => setShowHardDeleteDialog(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 7000,
          }}
        >
          <div
            className="card"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 420,
              width: '100%',
              margin: '0 16px',
            }}
          >
            <h2 className="text-lg font-semibold mb-2">
              Buchungen endgültig löschen
            </h2>
            <p className="text-sm text-gray-700 mb-4">
              Bist du sicher? Möchtest du {deletedSelected.length} ausgewählte
              Anfrage{deletedSelected.length > 1 ? 'n' : ''} endgültig löschen?
              Dieser Vorgang kann <b>nicht</b> rückgängig gemacht werden.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="btn"
                onClick={() => setShowHardDeleteDialog(false)}
              >
                Nein
              </button>
              <button
                type="button"
                className="btn btn--danger"
                onClick={bulkHardDelete}
              >
                Ja, endgültig löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
