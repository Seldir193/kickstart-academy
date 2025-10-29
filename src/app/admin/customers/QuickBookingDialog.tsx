'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { Customer } from '../customers/types';
import BookDialog from '../customers/dialogs/BookDialog';

type Props = {
  onClose: () => void;
};

export default function QuickBookingDialog({ onClose }: Props) {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Customer[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const headers = useMemo(() => {
    const h: Record<string, string> = {};
    const pid = process.env.NEXT_PUBLIC_PROVIDER_ID || '';
    if (pid) h['X-Provider-Id'] = pid;
    return h;
  }, []);

  useEffect(() => {
    let abort = false;
    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const params = new URLSearchParams();
        if (q.trim()) params.set('q', q.trim());
        params.set('limit', '10');
        const r = await fetch(`/api/admin/customers?${params.toString()}`, {
          headers,
          cache: 'no-store',
          credentials: 'include',
        });
        const js = await r.json();
        if (!r.ok) throw new Error(js?.error || `HTTP ${r.status}`);
        if (!abort) setItems(Array.isArray(js.items) ? js.items : []);
      } catch (e: any) {
        if (!abort) setErr(e?.message || 'Fehler beim Laden');
      } finally {
        if (!abort) setLoading(false);
      }
    }
    load();
    return () => { abort = true; };
  }, [q, headers]);

  // Step 2: wenn Kunde gewählt → zeige deinen BookDialog 1:1
  if (selectedCustomer?._id) {
    return (
      <BookDialog
        customerId={selectedCustomer._id}
        onClose={onClose}
        onBooked={() => onClose()}
      />
    );
  }

  // Step 1: Kunde wählen
  return (
    <div className="ks-modal-root ks-modal-root--top">
      <div className="ks-backdrop" onClick={onClose} />
      <div className="ks-panel card ks-panel--md" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-subhead">
          <h3 className="text-lg font-bold">Buchung erstellen</h3>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>

        {err && <div className="mb-2 text-red-600">{err}</div>}

        <div className="form">
          <div className="field">
            <label className="lbl">Kunde suchen</label>
            <input
              className="input"
              placeholder="Name, E-Mail, Stadt…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-3 card p-0 overflow-auto" style={{ maxHeight: 300 }}>
          {loading ? (
            <div className="card__empty">Lade…</div>
          ) : items.length === 0 ? (
            <div className="card__empty">Keine Treffer.</div>
          ) : (
            <ul className="list list--bleed">
              {items.map((c) => (
                <li
                  key={c._id}
                  className="list__item chip is-fullhover is-interactive"
                  onClick={() => setSelectedCustomer(c)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedCustomer(c); }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Kunde wählen: ${[c.child?.firstName, c.child?.lastName].filter(Boolean).join(' ')}`}
                >
                  <div className="list__body">
                    <div className="list__title">
                      {[c.child?.firstName, c.child?.lastName].filter(Boolean).join(' ') || '—'}
                    </div>
                    <div className="list__meta">
                      {c.parent?.email || '—'}{c.address?.city ? ` · ${c.address.city}` : ''}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-3">
          <button className="btn" onClick={onClose}>Schließen</button>
        </div>
      </div>
    </div>
  );
}
