'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { Customer, ListResponse } from './types';
import CustomerDialog from './dialogs/CustomerDialog';

export default function CustomersPage() {
  const [items, setItems] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const [q, setQ] = useState('');
  const [newsletter, setNewsletter] = useState<'all'|'true'|'false'>('all');

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string|null>(null);

  const [editing, setEditing] = useState<Customer|null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set('q', q.trim());
    if (newsletter !== 'all') p.set('newsletter', newsletter);
    p.set('page', String(page));
    p.set('limit', String(limit));
    p.set('sort', 'createdAt:desc');
    return p.toString();
  }, [q, newsletter, page, limit]);

  async function load() {
    setLoading(true); setErr(null);
    try {
      const res = await fetch(`/api/admin/customers?${query}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ListResponse = await res.json();
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (e:any) {
      setErr(e?.message || 'Load failed');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, [query]);

  const pages = Math.max(1, Math.ceil(total/limit));

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Customers</h1>
        <button className="btn btn-primary" onClick={()=> setCreateOpen(true)}>New customer</button>
      </div>

      <div className="flex gap-2 items-end mb-3">
        <div className="flex-1">
          <label className="block text-sm text-gray-600">Search</label>
          <input
            className="input"
            placeholder="Name, email, city, userId… (child & parent)"
            value={q}
            onChange={(e)=>{ setPage(1); setQ(e.target.value); }}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Newsletter</label>
          <select className="input" value={newsletter} onChange={(e)=>{ setPage(1); setNewsletter(e.target.value as any); }}>
            <option value="all">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>

      {loading && <div className="card">Loading…</div>}
      {err && <div className="card text-red-600">{err}</div>}

      {!loading && !err && (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="th">ID</th>
                <th className="th">Child</th>
                <th className="th">Parent</th>
                <th className="th">Email</th>
                <th className="th">Address</th>
                <th className="th">Newsletter</th>
                <th className="th">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr
                  key={c._id}
                  className="tr hover:bg-gray-50 cursor-pointer"
                  onClick={async ()=>{
                    const r = await fetch(`/api/admin/customers/${c._id}`, { cache:'no-store' });
                    const full = r.ok ? await r.json() : c;
                    setEditing(full);
                  }}
                >
                  <td className="td font-mono">{c.userId ?? '—'}</td>
                  <td className="td">{[c.child?.firstName, c.child?.lastName].filter(Boolean).join(' ') || '—'}</td>
                  <td className="td">{[c.parent?.firstName, c.parent?.lastName].filter(Boolean).join(' ') || '—'}</td>
                  <td className="td">{c.parent?.email || '—'}</td>
                  <td className="td">
                    {[c.address?.street && `${c.address.street} ${c.address.houseNo||''}`, c.address?.zip, c.address?.city]
                      .filter(Boolean).join(', ') || '—'}
                  </td>
                  <td className="td">{c.newsletter ? 'Yes' : 'No'}</td>
                  <td className="td">{c.canceledAt ? 'Canceled' : 'Active'}</td>
                </tr>
              ))}
              {!items.length && <tr><td className="td" colSpan={7}>No customers yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex gap-2 items-center justify-end mt-3">
        <button className="btn" onClick={()=> setPage(p=>Math.max(1,p-1))} disabled={page<=1}>Prev</button>
        <div>{page} / {pages}</div>
        <button className="btn" onClick={()=> setPage(p=>Math.min(pages,p+1))} disabled={page>=pages}>Next</button>
      </div>

      {createOpen && (
        <CustomerDialog
          mode="create"
          onClose={()=> setCreateOpen(false)}
          onCreated={()=>{ setCreateOpen(false); load(); }}
        />
      )}
      {editing && (
        <CustomerDialog
          mode="edit"
          customer={editing}
          onClose={()=> setEditing(null)}
          onSaved={()=>{ setEditing(null); load(); }}
          onDeleted={()=>{ setEditing(null); load(); }}
        />
      )}
    </div>
  );
}