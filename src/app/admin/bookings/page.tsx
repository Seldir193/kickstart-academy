

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

/* ============ Types ============ */
type Status = 'pending' | 'processing' | 'confirmed' | 'cancelled' | 'deleted';
type StatusOrAll = Status | 'all';

type Booking = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  date: string;                 // yyyy-mm-dd oder ISO
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

/* ============ Modal Portal ============ */
function ModalPortal({ children }: { children: React.ReactNode }) {
  if (typeof document === 'undefined') return null;
  return createPortal(children, document.body);
}

/* ============ Helpers ============ */
const PAGE_SIZE = 10;

function fmtDate_DE(value?: string) {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(d);
}
function fmtDateOnly_DE(value?: string) {
  if (!value) return '—';
  const isoGuess = /T|\d{2}:\d{2}/.test(value) ? value : value + 'T00:00:00';
  const d = new Date(isoGuess);
  if (isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium' }).format(d);
}
function asStatus(s?: Booking['status']): Status {
  return (s ?? 'pending') as Status;
}

/** Zerlegt bekannte Teile der Freitext-Message in Zeilen */
function messageToLines(msg?: string): string[] {
  if (!msg) return [];
  let t = msg.trim();

  t = t
    .replace(/\s*,\s*Geburtstag:/gi, '\nGeburtstag:')
    .replace(/\s*,\s*Kontakt:/gi,    '\nKontakt:')
    .replace(/\s*,\s*Adresse:/gi,    '\nAdresse:')
    .replace(/\s*,\s*Telefon:/gi,    '\nTelefon:')
    .replace(/\s*,\s*Gutschein:/gi,  '\nGutschein:')
    .replace(/\s*,\s*Quelle:/gi,     '\nQuelle:')
    .replace(/\s*,\s*Kind:/gi,       '\nKind:');

  t = t.replace(/^\s*Anmeldung\b/i, 'Anmeldung');

  return t.split('\n').map(s => s.trim()).filter(Boolean);
}
function splitLabelValue(line: string): { label?: string; value: string } {
  const i = line.indexOf(':');
  if (i === -1) return { value: line };
  const label = line.slice(0, i).trim();
  const value = line.slice(i + 1).trim();
  return { label, value };
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

  // Globaler Toast (wie showOk)
  const [notice, setNotice] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);
  const showOk = (text: string) => { setNotice({ type: 'ok', text }); setTimeout(() => setNotice(null), 5000); };
  const showError = (text: string) => { setNotice({ type: 'error', text }); setTimeout(() => setNotice(null), 5000); };

  // Dialog
  const [sel, setSel] = useState<Booking | null>(null);

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
    setLoading(true); setErr(null);
    try {
      const res = await fetch(`/api/admin/bookings?${query}`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });
      const data: ListResp = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);

      const arr = (Array.isArray(data.items) ? data.items : (Array.isArray(data.bookings) ? data.bookings : [])) as Booking[];
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
  useEffect(() => { load(); }, [query]);

  const allCount =
    (counts.pending ?? 0) +
    (counts.processing ?? 0) +
    (counts.confirmed ?? 0) +
    (counts.cancelled ?? 0) +
    (counts.deleted ?? 0);

  /* ===== Server-Aktionen ===== */
  async function apiConfirm(id: string, resend = false): Promise<string> {
    const url = `/api/admin/bookings/${encodeURIComponent(id)}/confirm${resend ? '?resend=1' : ''}`;
    const r = await fetch(url, { method: 'POST', credentials: 'include', cache: 'no-store' });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || d?.ok === false) throw new Error(d?.error || r.statusText);
    await load();
    if (sel && sel._id === id) {
      setSel(prev => prev ? { ...prev, status: 'confirmed', confirmationCode: d.booking?.confirmationCode ?? prev.confirmationCode } : prev);
    }
    return resend ? 'Bestätigung erneut gesendet.' : 'Buchung bestätigt und E-Mail versendet.';
  }

  async function apiSetStatus(id: string, next: Status): Promise<string> {
    const r = await fetch(`/api/admin/bookings/${encodeURIComponent(id)}/status`, {
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
    if (next === 'cancelled')  return 'Absage versendet.';
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

  /* ===== Dialog mit per-Button-Hinweisen (5s) + globalem Toast ===== */
  function BookingDialog({
    booking,
    onClose,
    onConfirm,
    onResend,
    onSetStatus,
    onDelete,
    notify,
  }: {
    booking: Booking;
    onClose: () => void;
    onConfirm: () => Promise<string>;
    onResend: () => Promise<string>;
    onSetStatus: (s: Status) => Promise<string>;
    onDelete: () => Promise<string>;
    notify: (text: string) => void;       // 🔔 globaler Toast
  }) {
    const [busy, setBusy] = useState<string>('');
    const [msg, setMsg] = useState<{
      processing?: string;
      confirm?: string;
      resend?: string;
      cancelled?: string;
    }>({});

    function flash(key: keyof typeof msg, text: string) {
      setMsg(prev => ({ ...prev, [key]: text }));
      window.setTimeout(() => {
        setMsg(prev => ({ ...prev, [key]: undefined }));
      }, 5000);
    }

    const lines = messageToLines(booking.message);

    return (
      <ModalPortal>
        <div className="ks-modal-root ks-modal-root--top">
          <div className="ks-backdrop" onClick={onClose} />
          <div
            className="ks-panel ks-panel--md card"
            role="dialog"
            aria-modal="true"
            aria-label="Booking details"
            onClick={(e)=>e.stopPropagation()}
          >
            {/* Header */}
            <div className="dialog-head">
              <div className="dialog-head__left">
                <h2 className="text-xl font-bold">
                  {booking.firstName} {booking.lastName}
                </h2>
                <span className="badge">{booking.level}</span>
                <span className={`badge ${booking.status==='cancelled' || booking.status==='deleted' ? 'badge-muted' : ''}`}>
                  {asStatus(booking.status)}
                </span>
              </div>
              <div className="dialog-head__actions">
                <button className="btn" onClick={onClose}>Close</button>
              </div>
            </div>

            {/* Aktionsleiste mit Inline-Hinweisen */}
            <div className="flex flex-wrap gap-2 justify-end mb-3">
              {booking.status !== 'processing' && booking.status !== 'cancelled' && booking.status !== 'deleted' && (
                <div className="flex items-center gap-2">
                  <button
                    className="btn"
                    disabled={busy === 'processing'}
                    onClick={async () => {
                      try {
                        setBusy('processing');
                        const text = await onSetStatus('processing');
                        flash('processing', text);
                        notify(text); // 🔔 global
                      } catch (e:any) {
                        const t = e?.message || 'Aktion fehlgeschlagen';
                        flash('processing', t);
                        notify(t);
                      } finally {
                        setBusy('');
                      }
                    }}
                  >
                    {busy==='processing' ? 'Bitte warten…' : 'In Bearbeitung'}
                  </button>
                  {msg.processing && <span className="text-sm ok">{msg.processing}</span>}
                </div>
              )}

              {booking.status !== 'confirmed' && booking.status !== 'cancelled' && booking.status !== 'deleted' && (
                <div className="flex items-center gap-2">
                  <button
                    className="btn btn-primary"
                    disabled={busy === 'confirm'}
                    onClick={async () => {
                      try {
                        setBusy('confirm');
                        const text = await onConfirm();
                        flash('confirm', text);
                        notify(text); // 🔔 global
                      } catch (e:any) {
                        const t = e?.message || 'Aktion fehlgeschlagen';
                        flash('confirm', t);
                        notify(t);
                      } finally {
                        setBusy('');
                      }
                    }}
                  >
                    {busy==='confirm' ? 'Bitte warten…' : 'Bestätigen'}
                  </button>
                  {msg.confirm && <span className="text-sm ok">{msg.confirm}</span>}
                </div>
              )}

              {booking.status === 'confirmed' && (
                <div className="flex items-center gap-2">
                  <button
                    className="btn"
                    disabled={busy === 'resend'}
                    onClick={async () => {
                      try {
                        setBusy('resend');
                        const text = await onResend();
                        flash('resend', text);
                        notify(text); // 🔔 global
                      } catch (e:any) {
                        const t = e?.message || 'Aktion fehlgeschlagen';
                        flash('resend', t);
                        notify(t);
                      } finally {
                        setBusy('');
                      }
                    }}
                  >
                    {busy==='resend' ? 'Bitte warten…' : 'Erneut senden'}
                  </button>
                  {msg.resend && <span className="text-sm ok">{msg.resend}</span>}
                </div>
              )}

              {booking.status !== 'cancelled' && booking.status !== 'deleted' && (
                <div className="flex items-center gap-2">
                  <button
                    className="btn"
                    disabled={busy === 'cancelled'}
                    onClick={async () => {
                      try {
                        setBusy('cancelled');
                        const text = await onSetStatus('cancelled');
                        flash('cancelled', text);
                        notify(text); // 🔔 global
                      } catch (e:any) {
                        const t = e?.message || 'Aktion fehlgeschlagen';
                        flash('cancelled', t);
                        notify(t);
                      } finally {
                        setBusy('');
                      }
                    }}
                  >
                    {busy==='cancelled' ? 'Bitte warten…' : 'Absagen'}
                  </button>
                  {msg.cancelled && <span className="text-sm ok">{msg.cancelled}</span>}
                </div>
              )}

              {booking.status !== 'deleted' && (
                <div className="flex items-center gap-2">
                  <button
                    className="btn"
                    disabled={busy === 'delete'}
                    onClick={async () => {
                      try {
                        setBusy('delete');
                        const text = await onDelete();
                        notify(text); // 🔔 global
                        onClose();     // Dialog schließen nach Löschen
                      } finally {
                        setBusy('');
                      }
                    }}
                  >
                    {busy==='delete' ? 'Bitte warten…' : 'Löschen'}
                  </button>
                </div>
              )}
            </div>

            {/* Read-only Inhalte */}
            <div className="form-columns mb-3">
              {/* Buchung */}
              <fieldset className="card">
                <legend className="font-bold">Buchung</legend>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="lbl">Name</label>
                    <div>{booking.firstName} {booking.lastName}</div>
                  </div>
                  <div>
                    <label className="lbl">E-Mail</label>
                    <div>{booking.email || '—'}</div>
                  </div>
                  <div>
                    <label className="lbl">Alter</label>
                    <div>{booking.age ?? '—'}</div>
                  </div>
                  <div>
                    <label className="lbl">Wunschtermin</label>
                    <div>{fmtDateOnly_DE(booking.date)}</div>
                  </div>
                  <div>
                    <label className="lbl">Erstellt</label>
                    <div>{fmtDate_DE(booking.createdAt)}</div>
                  </div>
                  <div>
                    <label className="lbl">Bestätigungscode</label>
                    <div>{booking.confirmationCode || '—'}</div>
                  </div>
                </div>
              </fieldset>

              {/* Nachricht hübsch gelabelt */}
              <fieldset className="card">
                <legend className="font-bold">Nachricht</legend>
                {messageToLines(booking.message).length ? (
                  <ul className="card-list">
                    {messageToLines(booking.message).map((ln, i) => {
                      const { label, value } = splitLabelValue(ln);
                      return (
                        <li key={i}>
                          {label ? (<><strong>{label}:</strong> {value || '—'}</>) : ln}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div>—</div>
                )}
              </fieldset>
            </div>

            <div className="flex justify-end mt-3">
              <button className="btn" onClick={onClose}>Schließen</button>
            </div>
          </div>
        </div>
      </ModalPortal>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Head */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Bookings</h1>
      </div>

      {/* Globaler Toast (fixed, 5s) */}
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
            boxShadow: '0 10px 25px rgba(17,24,39,.08)'
          }}
        >
          {notice.text}
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 items-end mb-3">
        <div className="flex-1">
          <label htmlFor="search" className="block text-sm text-gray-600">Search</label>
          <input
            id="search"
            className="input"
            placeholder="Name, email, level, code, message…"
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            onKeyDown={(e) => { if (e.key === 'Enter') setPage(1); }}
          />
        </div>
        <div style={{ minWidth: 220 }}>
          <label className="block text-sm text-gray-600">Status</label>
          <select
            className="input"
            value={status}
            onChange={(e)=> { setStatus(e.target.value as StatusOrAll); setPage(1); }}
          >
            <option value="all">All ({(allCount || total)})</option>
            <option value="pending">Pending ({counts.pending ?? 0})</option>
            <option value="processing">Processing ({counts.processing ?? 0})</option>
            <option value="confirmed">Confirmed ({counts.confirmed ?? 0})</option>
            <option value="cancelled">Cancelled ({counts.cancelled ?? 0})</option>
            <option value="deleted">Deleted ({counts.deleted ?? 0})</option>
          </select>
        </div>
      </div>

      {/* Fehler/Loading */}
      {loading && <div className="card">Loading…</div>}
      {err && <div className="card text-red-600">{err}</div>}

      {/* Tabelle */}
      {!loading && !err && (
        <div className="card p-0 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="th">Name</th>
                <th className="th">Email</th>
                <th className="th">Age</th>
                <th className="th">Date</th>
                <th className="th">Level</th>
                <th className="th">Status</th>
                <th className="th">Created</th>
              </tr>
            </thead>
            <tbody>
              {items.map(b => (
                <tr
                  key={b._id}
                  className="tr hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSel(b)}
                  title="Details ansehen"
                >
                  <td className="td">{b.firstName} {b.lastName}</td>
                  <td className="td">{b.email}</td>
                  <td className="td">{b.age}</td>
                  <td className="td">{b.date}</td>
                  <td className="td">{b.level}</td>
                  <td className="td">{asStatus(b.status)}</td>
                  <td className="td">{fmtDate_DE(b.createdAt)}</td>
                </tr>
              ))}
              {!items.length && (
                <tr><td className="td" colSpan={7}>No bookings.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pager – 10 pro Seite */}
      <div className="flex gap-2 items-center justify-end mt-3">
        <button className="btn" onClick={()=> setPage(p => Math.max(1, p-1))} disabled={page<=1}>Prev</button>
        <div>{page} / {pages}</div>
        <button className="btn" onClick={()=> setPage(p => Math.min(pages, p+1))} disabled={page>=pages}>Next</button>
      </div>

      {/* Dialog */}
      {sel && (
        <BookingDialog
          booking={sel}
          onClose={()=> setSel(null)}
          onConfirm={() => apiConfirm(sel._id, false)}
          onResend={() => apiConfirm(sel._id, true)}
          onSetStatus={(s) => apiSetStatus(sel._id, s)}
          onDelete={() => apiDelete(sel._id)}
          notify={showOk} // 🔔 globaler Toast auslösen
        />
      )}
    </div>
  );
}












