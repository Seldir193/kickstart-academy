// app/admin/customers/dialogs/StornoDialog.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Customer, BookingRef } from '../types';

type Props = {
  customer: Customer;
  onClose: () => void;
  onChanged: (freshCustomer: Customer) => void;
};

/* ---------- helpers ---------- */
function rawType(b?: Partial<BookingRef> | null) {
  return (b?.type || (b as any)?.offerType || '').trim();
}
function norm(s: string) {
  return (s || '')
    .replace(/[Ää]/g, 'ae')
    .replace(/[Öö]/g, 'oe')
    .replace(/[Üü]/g, 'ue')
    .replace(/ß/g, 'ss')
    .toLowerCase();
}
function textFor(b: any) {
  // combine type + title (robust even if type missing/inconsistent)
  return norm([rawType(b), b?.offerTitle].filter(Boolean).join(' '));
}
function labelFor(b: any) {
  const parts = [
    b.offerTitle || '—',
    rawType(b) || '—',
    b.status === 'cancelled' ? 'Cancelled' : (b.status || 'Active'),
    b.date ? `since ${String(b.date).slice(0,10)}` : undefined,
  ].filter(Boolean);
  return parts.join(' — ');
}

/** Category matcher (includes Camp + PersonalTraining) */
function matchesCategory(b: any, category: string): boolean {
  if (category === 'all') return true;
  const t = textFor(b);
  if (category === 'Kindergarten')     return t.includes('kindergarten');
  if (category === 'Foerdertraining')  return t.includes('foerder') || t.includes('forder');
  if (category === 'Athletiktraining') return t.includes('athletik') || t.includes('athletic');
  if (category === 'Camp')             return t.includes('camp');
  if (category === 'PersonalTraining') return t.includes('personaltraining') || t.includes('personal training') || t.includes('individualtraining') || t.includes('individual training');
  return false;
}

export default function StornoDialog({ customer, onClose, onChanged }: Props) {
  // categories incl. Camp + PersonalTraining
  const categories = ['all', 'Camp', 'PersonalTraining', 'Kindergarten', 'Foerdertraining', 'Athletiktraining'] as const;
  const [category, setCategory] = useState<string>('all');

  // Fixed-overlay dropdown (same behaviour as CancelDialog)
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ left: number; top: number; width: number }>({ left: 0, top: 0, width: 0 });

  const [selectedId, setSelectedId] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string|null>(null);

  // Show ALL bookings (active + cancelled). Cancelled are grey and not selectable.
  const allBookings = useMemo(
    () => (customer.bookings || []),
    [customer.bookings]
  );
  const filtered = useMemo(
    () => allBookings.filter(b => matchesCategory(b, category)),
    [allBookings, category]
  );
  const selected = useMemo(
    () => filtered.find(b => String(b._id) === selectedId) || null,
    [filtered, selectedId]
  );

  useEffect(() => {
    setCategory('all');
    setNote('');
    setErr(null);
    // preselect the first ACTIVE booking if possible, otherwise first item
    if (filtered.length) {
      const firstActive = filtered.find(b => b.status !== 'cancelled');
      setSelectedId(String((firstActive || filtered[0])._id));
    } else {
      setSelectedId('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer?._id]);

  useEffect(() => {
    if (!filtered.length) { setSelectedId(''); return; }
    if (!filtered.some(b => String(b._id) === selectedId)) {
      const firstActive = filtered.find(b => b.status !== 'cancelled');
      setSelectedId(String((firstActive || filtered[0])._id));
    }
  }, [filtered, selectedId]);

  function computeMenuPos() {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setMenuPos({ left: Math.round(r.left), top: Math.round(r.bottom + 4), width: Math.round(r.width) });
  }
  function openMenu() {
    if (!filtered.length) return;
    computeMenuPos();
    setMenuOpen(true);
  }

  useEffect(() => {
    if (!menuOpen) return;
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (triggerRef.current && (t === triggerRef.current || triggerRef.current.contains(t))) return;
      if (menuRef.current && (t === menuRef.current || menuRef.current.contains(t))) return;
      setMenuOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onResize = () => computeMenuPos();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [menuOpen]);

  const isCancelled = selected?.status === 'cancelled';
  const disabled = saving || !selected || isCancelled; // cannot storno cancelled again






async function submit() {
  if (!customer._id || !selected?._id) return;
  setSaving(true);
  setErr(null);

  try {
    const pid =
      (typeof window !== 'undefined' && localStorage.getItem('providerId')) || '';

    // --- 1) Kunde frisch laden, um aktuelle invoice-Felder zu bekommen
    const rGet1 = await fetch(
      `/api/admin/customers/${encodeURIComponent(customer._id)}`,
      {
        cache: 'no-store',
        headers: { ...(pid ? { 'x-provider-id': pid } : {}) },
      }
    );
    if (!rGet1.ok) {
      const t = await rGet1.text().catch(() => '');
      throw new Error(`Kunde laden fehlgeschlagen (${rGet1.status}). ${t}`);
    }
    let fresh: Customer = await rGet1.json();
    let freshBooking = (fresh.bookings || []).find(
      (b) => String(b._id) === String(selected._id)
    );
    if (!freshBooking) throw new Error('Buchung nicht gefunden.');

    // --- 2) Falls keine Referenz-Rechnung existiert: Bestätigung senden -> erzeugt invoice
    let refInvoiceNo: string =
      (freshBooking as any).invoiceNumber ||
      (freshBooking as any).invoiceNo ||
      '';
    let refInvoiceDate: any = (freshBooking as any).invoiceDate || null;

    if (!refInvoiceNo) {
      const rConf = await fetch(
        `/api/admin/customers/${encodeURIComponent(customer._id)}/bookings/${encodeURIComponent(
          freshBooking._id as any
        )}/email/confirmation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(pid ? { 'x-provider-id': pid } : {}),
          },
          cache: 'no-store',
          body: JSON.stringify({}), // nichts nötig; Server erzeugt invoiceNumber/-Date
        }
      );
      if (!rConf.ok) {
        const t = await rConf.text().catch(() => '');
        throw new Error(
          `Rechnungs-Erzeugung (Bestätigung) fehlgeschlagen (${rConf.status}). ${t}`
        );
      }

      // nach Erzeugung nochmal frisch laden
      const rGet2 = await fetch(
        `/api/admin/customers/${encodeURIComponent(customer._id)}`,
        {
          cache: 'no-store',
          headers: { ...(pid ? { 'x-provider-id': pid } : {}) },
        }
      );
      if (!rGet2.ok) {
        const t = await rGet2.text().catch(() => '');
        throw new Error(`Kunde reload fehlgeschlagen (${rGet2.status}). ${t}`);
      }
      fresh = await rGet2.json();
      freshBooking = (fresh.bookings || []).find(
        (b) => String(b._id) === String(selected._id)
      );
      if (!freshBooking) throw new Error('Buchung nach Reload nicht gefunden.');

      refInvoiceNo =
        (freshBooking as any).invoiceNumber ||
        (freshBooking as any).invoiceNo ||
        '';
      refInvoiceDate = (freshBooking as any).invoiceDate || null;

      if (!refInvoiceNo) {
        throw new Error(
          'Konnte trotz Bestätigung keine Rechnungsnummer ermitteln.'
        );
      }
    }

    // --- 3) Buchung als cancelled markieren (409 = bereits cancelled -> ok)
    {
      const r1 = await fetch(
        `/api/admin/customers/${encodeURIComponent(customer._id)}/bookings/${encodeURIComponent(
          freshBooking._id as any
        )}/storno`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(pid ? { 'x-provider-id': pid } : {}),
          },
          cache: 'no-store',
          body: JSON.stringify({ note }),
        }
      );
      if (!r1.ok && r1.status !== 409) {
        const t = await r1.text().catch(() => '');
        throw new Error(`Storno-Status fehlgeschlagen (${r1.status}). ${t}`);
      }
    }

    // --- 4) Storno-Mail mit PDF und Referenzdaten schicken
    {
      const r2 = await fetch(
        `/api/admin/customers/${encodeURIComponent(customer._id)}/bookings/${encodeURIComponent(
          freshBooking._id as any
        )}/email/storno`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(pid ? { 'x-provider-id': pid } : {}),
          },
          cache: 'no-store',
          body: JSON.stringify({
            currency: 'EUR',
            note,
            refInvoiceNo,
            refInvoiceDate, // ISO- oder Date-String genügt
          }),
        }
      );
      if (!r2.ok) {
        const t = await r2.text().catch(() => '');
        throw new Error(`Storno-E-Mail fehlgeschlagen (${r2.status}). ${t}`);
      }
    }

    // --- 5) UI aktualisieren
    const rGet3 = await fetch(
      `/api/admin/customers/${encodeURIComponent(customer._id)}`,
      {
        cache: 'no-store',
        headers: { ...(pid ? { 'x-provider-id': pid } : {}) },
      }
    );
    const fresh2 = rGet3.ok ? await rGet3.json() : null;
    if (fresh2) onChanged(fresh2);
    onClose();
  } catch (e: any) {
    setErr(e?.message || 'Storno fehlgeschlagen');
  } finally {
    setSaving(false);
  }
}








  return (
    <div className="ks-modal-root ks-modal-root--top">
      <div className="ks-backdrop" onClick={onClose} />
      <div className="ks-panel card ks-panel--md" onClick={(e)=> e.stopPropagation()}>
        <div className="dialog-subhead">
          <h3 className="text-lg font-bold">Storno</h3>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>

        {err && <div className="mb-2 text-red-600">{err}</div>}

        {/* Category */}
        <div className="grid gap-2 mb-2">
          <div>
            <label className="lbl">Category</label>
            <select className="input" value={category} onChange={(e)=> setCategory(e.target.value)}>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === 'all' ? 'All' : cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Booking trigger (fixed overlay) */}
        <div className="grid gap-2 mb-2">
          <div>
            <label className="lbl">Booking</label>
            <button
              ref={triggerRef}
              type="button"
              className="input"
              onClick={() => (menuOpen ? setMenuOpen(false) : openMenu())}
              disabled={!filtered.length}
              aria-haspopup="listbox"
              aria-expanded={menuOpen}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span style={{ opacity: isCancelled ? 0.6 : 1 }}>
                {selected ? labelFor(selected) : (filtered.length ? 'Select…' : 'No bookings')}
              </span>
              <span aria-hidden>▾</span>
            </button>
          </div>
        </div>

        {menuOpen && filtered.length > 0 && (
          <div
            ref={menuRef}
            role="listbox"
            style={{
              position: 'fixed',
              left: menuPos.left,
              top: menuPos.top,
              width: menuPos.width,
              maxHeight: 44 * 5,
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
            {filtered.map((b: any) => {
              const cancelled = b.status === 'cancelled';
              const active = selectedId === String(b._id);
              return (
                <div
                  key={b._id || `${b.offerId}-${b.createdAt}`}
                  role="option"
                  aria-selected={active}
                  aria-disabled={cancelled}
                  onClick={() => {
                    if (cancelled) return; // cannot select cancelled for storno
                    setSelectedId(String(b._id));
                    setMenuOpen(false);
                  }}
                  style={{
                    display: 'block',
                    padding: '8px 12px',
                    background: active ? 'rgba(0,0,0,.04)' : 'transparent',
                    opacity: cancelled ? 0.6 : 1, // grey for cancelled
                    cursor: cancelled ? 'not-allowed' : 'pointer',
                  }}
                >
                  <div style={{ fontWeight: 600, whiteSpace: 'normal' }}>{b.offerTitle || '—'}</div>
                  <div style={{ fontSize: 12, color: '#666', whiteSpace: 'normal' }}>
                    {(rawType(b) || '—')} · {cancelled ? 'Cancelled' : (b.status || 'Active')}
                    {b.date ? ` · since ${String(b.date).slice(0,10)}` : ''}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Optional note */}
        <div className="grid gap-2">
          <div>
            <label className="lbl">Note (optional)</label>
            <textarea
              className="input"
              rows={3}
              value={note}
              onChange={(e)=> setNote(e.target.value)}
              placeholder="e.g., partial refund, goodwill"
              disabled={!selected || isCancelled}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-3">
          <button className="btn" onClick={onClose}>Close</button>
          <button className="btn btn-primary" disabled={disabled} onClick={submit}>
            {saving ? 'Processing…' : 'Confirm storno'}
          </button>
        </div>
      </div>
    </div>
  );
}













