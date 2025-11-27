'use client';

import React, { useMemo, useState } from 'react';

function fmtISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2,'0');
  const dd= String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${dd}`;
}
function firstOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function lastOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth()+1, 0);
}

export default function DatevExportPage() {
  const today = new Date();

  const [from, setFrom] = useState(fmtISO(firstOfMonth(today)));
  const [to,   setTo]   = useState(fmtISO(lastOfMonth(today)));
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const fileName = useMemo(() => {
    return `datev-export_${from}_bis_${to}.zip`;
  }, [from, to]);

  async function runExport() {
    setLoading(true); setErr(null);
    try {
      const url = `/api/admin/datev/export?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
      const res = await fetch(url, { method: 'GET', credentials: 'include' });
      if (!res.ok) {
        const txt = await res.text().catch(()=> '');
        throw new Error(`Export fehlgeschlagen (${res.status}) ${txt}`);
      }
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    } catch (e: any) {
      setErr(e?.message || 'Fehler beim Export');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 max-w-2xl">
      <h1 className="text-2xl font-bold m-0">DATEV-Export (OPOS-Variante)</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <label className="block">
          <span className="text-sm text-gray-700">Von (inkl.)</span>
          <input className="input w-full" type="date" value={from} onChange={e=> setFrom(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm text-gray-700">Bis (inkl.)</span>
          <input className="input w-full" type="date" value={to} onChange={e=> setTo(e.target.value)} />
        </label>
      </div>

      <div className="text-sm text-gray-600 mb-4">
        Exportiert <b>Rechnungen</b> & <b>Gutschriften</b> (keine Kündigungen) als ZIP mit
        <code className="mx-1">buchungen_extf.csv</code>,
        <code className="mx-1">buchungen_readable.csv</code> und <code>belege/*.pdf</code>.
      </div>

      {err && <div className="mb-3 text-red-600">{err}</div>}

      <button
        className="btn"
        onClick={runExport}
        disabled={loading}
      >
        {loading ? 'Export läuft…' : 'ZIP herunterladen'}
      </button>
    </div>
  );
}
