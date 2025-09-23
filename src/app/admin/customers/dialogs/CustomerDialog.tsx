// app/admin/customers/dialogs/CustomerDialog.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { Customer, Offer, BookingRef } from '../types';

import BookDialog from './BookDialog';
import CancelDialog from './CancelDialog';
import StornoDialog from './StornoDialog';
import DocumentsDialog from './DocumentsDialog'; // NEW

type Props = {
  mode: 'create' | 'edit';
  customer?: Customer | null;
  onClose: () => void;
  onCreated?: () => void;
  onSaved?: () => void;
  onDeleted?: () => void;
};

export default function CustomerDialog({
  mode, customer, onClose, onCreated, onSaved, onDeleted,
}: Props) {
  const blank: Customer = {
    _id: '',
    newsletter: false,
    address: { street:'', houseNo:'', zip:'', city:'' },
    child:   { firstName:'', lastName:'', gender:'', birthDate:null, club:'' },
    parent:  { salutation:'', firstName:'', lastName:'', email:'', phone:'', phone2:'' },
    notes: '',
    bookings: [],
    canceledAt: null,
  };

  const [form, setForm] = useState<Customer>(() => mode==='edit' && customer ? customer : blank);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string|null>(null);

  const [bookOpen, setBookOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [stornoOpen, setStornoOpen] = useState(false);
  const [documentsOpen, setDocumentsOpen] = useState(false); // NEW

  const [offers, setOffers] = useState<Offer[]>([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [offerTypeFilter, setOfferTypeFilter] = useState<string>(''); // aktuell ungenutzt, kannst du später nutzen

  // Busy-Flag nur für den Newsletter-Toggle
const [newsletterBusy, setNewsletterBusy] = useState(false);




async function toggleNewsletter(id: string, checked: boolean) {
  const r = await fetch(`/api/admin/customers/${encodeURIComponent(id)}/newsletter`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newsletter: checked }),
  });
  const data = await r.json().catch(() => null);
  if (!r.ok || data?.ok === false) {
    throw new Error(data?.error || `Failed to update newsletter (${r.status})`);
  }
  if (!data?.customer) {
    // Server hat keinen Customer zurückgegeben → lieber Fehler werfen
    throw new Error('Server did not return updated customer');
  }
  return data.customer as Customer;
}



  useEffect(() => {
    if (mode==='edit' && customer) setForm(customer);
    if (mode==='create') setForm(blank);
  }, [mode, customer]);

  useEffect(() => {
    if (mode !== 'edit') return;
    (async () => {
      try {
        setOffersLoading(true);
        setErr(null);
        const res = await fetch(`/api/admin/offers?limit=200`, {
          cache: 'no-store',
          credentials: 'include', // 🔐 JWT-Cookie mitsenden
        });
        if (!res.ok) throw new Error(`Failed to load offers (${res.status})`);
        const data = await res.json();
        setOffers(Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : []));
      } catch (e: any) {
        setErr(e?.message || 'Failed to load offers');
      } finally {
        setOffersLoading(false);
      }
    })();
  }, [mode]);

  const offerById = useMemo(() => {
    const m: Record<string, Offer> = {};
    for (const o of offers) m[o._id] = o;
    return m;
  }, [offers]);

  function bookingType(b: BookingRef): string {
    return (b.type || offerById[b.offerId || '']?.type || '').trim();
  }



  function up(path: string, value: any) {
    setForm((prev) => {
      const c = structuredClone(prev) as any;
      const segs = path.split('.');
      let ref = c;
      for (let i=0;i<segs.length-1;i++) { ref[segs[i]] = ref[segs[i]] ?? {}; ref = ref[segs[i]]; }
      ref[segs[segs.length-1]] = value;
      return c;
    });
  }








  async function create() {
  setSaving(true); setErr(null);
  try {
    const res = await fetch('/api/admin/customers', {
      method:'POST',
      credentials: 'include',
      cache: 'no-store',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({
        newsletter: !!form.newsletter,
        address: form.address,
        child: form.child,
        parent: form.parent,
        notes: form.notes || '',
      }),
    });
    if (!res.ok) throw new Error(`Create failed (${res.status})`);
    const created = await res.json();

    // ⬇️ NEU: Falls im Dialog schon Newsletter angehakt war,
    // nach dem Anlegen direkt beim Provider eintragen
    if (created?._id && created?.newsletter === true) {
      try {
        await toggleNewsletter(created._id, true);
      } catch (e:any) {
        // Nicht hart fehlschlagen – Hinweis reicht
        console.warn('Newsletter sync after create failed:', e?.message || e);
        alert(e?.message || 'Newsletter sync failed after create');
      }
    }

    onCreated?.();
  } catch(e:any) {
    setErr(e?.message || 'Create failed');
  } finally { setSaving(false); }
}






















  async function save() {
    if (!form._id) return;
    setSaving(true); setErr(null);
    try {
      const res = await fetch(`/api/admin/customers/${encodeURIComponent(form._id)}`, {
        method:'PUT',
        credentials: 'include',         // 🔐
        cache: 'no-store',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({
          newsletter: !!form.newsletter,
          address: form.address,
          child: form.child,
          parent: form.parent,
          notes: form.notes || '',
        }),
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      onSaved?.();
    } catch(e:any) {
      setErr(e?.message || 'Save failed');
    } finally { setSaving(false); }
  }

  async function removeCustomer() {
    if (!form._id) return;
    if (!confirm('Delete this customer?')) return;
    setSaving(true); setErr(null);
    try {
      const res = await fetch(`/api/admin/customers/${encodeURIComponent(form._id)}`, {
        method:'DELETE',
        credentials: 'include',         // 🔐
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      onDeleted?.();
    } catch(e:any) {
      setErr(e?.message || 'Delete failed');
    } finally { setSaving(false); }
  }

  //const isActive = !form.canceledAt;




const isActive = !form?.canceledAt;




// Kleine Datumsformatierung (lokal)
function fmtDE(dt: any) {
  if (!dt) return '';
  const d = new Date(dt);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('de-DE', {
    timeZone: 'Europe/Berlin',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d);
}

// Marketing-Meta bequem aus dem Formular holen





const mk = useMemo(() => {
  const anyForm = form as any;
  return {
    provider: anyForm?.marketingProvider as string | undefined,
    status: anyForm?.marketingStatus as string | undefined,          // 'subscribed' | 'pending' | 'unsubscribed' | 'error'
    contactId: anyForm?.marketingContactId as string | undefined,
    // Fallbacks für unterschiedliche Feldnamen:
    lastSyncedAt:
      anyForm?.marketingLastSyncedAt ??
      anyForm?.marketingSyncedAt ??
      anyForm?.lastSyncedAt ??
      null,
    consentAt: anyForm?.marketingConsentAt as any,
    lastError: anyForm?.marketingLastError as string | undefined,
  };
}, [form]);


function statusLabel(s?: string) {
  switch ((s || '').toLowerCase()) {
    case 'subscribed':   return 'Subscribed';
    case 'pending':      return 'Pending (DOI)';
    case 'unsubscribed': return 'Unsubscribed';
    case 'error':        return 'Error';
    default:             return '—';
  }
}




  return (
    <div className="ks-modal-root">
      <div className="ks-backdrop" onClick={onClose} />
      <div className="ks-panel card ks-panel--lg" onClick={(e)=> e.stopPropagation()}>
        {/* Header */}
        <div className="dialog-head">
          <div className="dialog-head__left">
            <h2 className="text-xl font-bold">Customer #{(form as any).userId ?? '—'}</h2>
            <span className={`badge ${isActive ? '' : 'badge-muted'}`}>{isActive ? 'Active' : 'Cancelled'}</span>
          </div>
          <div className="dialog-head__actions">
            <button className="btn" onClick={()=> setDocumentsOpen(true)} disabled={!form._id}>Documents</button>
            <button className="btn" onClick={()=> setBookOpen(true)} disabled={!form._id}>Book</button>
            <button className="btn" onClick={()=> setCancelOpen(true)} disabled={!form._id}>Cancel</button>
            <button className="btn" onClick={()=> setStornoOpen(true)} disabled={!form._id}>Storno</button>
          </div>
        </div>

        {err && <div className="mb-2 text-red-600">{err}</div>}

        {/* Columns */}
        <div className="form-columns mb-3">
          {/* Child */}
          <fieldset className="card">
            <legend className="font-bold">Child</legend>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="lbl">First name</label>
                <input className="input" value={form.child?.firstName || ''} onChange={(e)=>up('child.firstName', e.target.value)} /></div>
              <div><label className="lbl">Last name</label>
                <input className="input" value={form.child?.lastName || ''} onChange={(e)=>up('child.lastName', e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div><label className="lbl">Gender</label>
                <select className="input" value={form.child?.gender || ''} onChange={(e)=>up('child.gender', e.target.value)}>
                  <option value="">—</option><option value="weiblich">weiblich</option><option value="männlich">männlich</option>
                </select></div>
              <div><label className="lbl">Birth date</label>
                <input className="input" type="date" value={(form.child?.birthDate || '').slice(0,10)} onChange={(e)=>up('child.birthDate', e.target.value)} /></div>
              <div><label className="lbl">Club</label>
                <input className="input" value={form.child?.club || ''} onChange={(e)=>up('child.club', e.target.value)} /></div>
            </div>
          </fieldset>

          {/* Parent */}
          <fieldset className="card">
            <legend className="font-bold">Parent</legend>
            <div className="grid grid-cols-4 gap-2">
              <div><label className="lbl">Salutation</label>
                <select className="input" value={form.parent?.salutation || ''} onChange={(e)=>up('parent.salutation', e.target.value)}>
                  <option value="">—</option><option value="Frau">Frau</option><option value="Herr">Herr</option>
                </select></div>
              <div><label className="lbl">First name</label>
                <input className="input" value={form.parent?.firstName || ''} onChange={(e)=>up('parent.firstName', e.target.value)} /></div>
              <div><label className="lbl">Last name</label>
                <input className="input" value={form.parent?.lastName || ''} onChange={(e)=>up('parent.lastName', e.target.value)} /></div>
              <div><label className="lbl">Email</label>
                <input className="input" type="email" value={form.parent?.email || ''} onChange={(e)=>up('parent.email', e.target.value)} /></div>
            </div>
          

          <div className="grid grid-cols-3 gap-2">
  <div>
    <label className="lbl">Phone</label>
    <input className="input" value={form.parent?.phone || ''} onChange={(e)=>up('parent.phone', e.target.value)} />
  </div>
  <div>
    <label className="lbl">Phone 2</label>
    <input className="input" value={form.parent?.phone2 || ''} onChange={(e)=>up('parent.phone2', e.target.value)} />
  </div>

  {/* Newsletter + Status */}
  <div>
    <label className="lbl flex items-center gap-2">



<input
  type="checkbox"
  checked={!!form.newsletter}
  disabled={newsletterBusy || saving}
  onChange={async (e) => {
    const next = e.target.checked;
    setForm(prev => ({ ...prev, newsletter: next }));
    if (mode !== 'edit' || !form._id) return;

    setNewsletterBusy(true);
    try {
      const updated = await toggleNewsletter(form._id, next);

      // ⬇️ HIER der Merge statt setForm(updated)
      setForm(prev => ({
        ...prev,
        ...updated,
        newsletter: updated?.newsletter ?? next,
      }));
    } catch (err:any) {
      setForm(prev => ({ ...prev, newsletter: !next }));
      alert(err?.message || 'Newsletter update failed');
    } finally {
      setNewsletterBusy(false);
    }
  }}
/>








      Newsletter
      {newsletterBusy && <span className="text-gray-500 text-sm">Saving…</span>}
    </label>

    {/* Marketing-Status anzeigen (rein informativ) */}
    <div className="text-xs text-gray-600 mt-1" title={mk.lastError ? `Error: ${mk.lastError}` : undefined}>
      <div>
        <span className="font-medium">Status:</span> {statusLabel(mk.status)}
        {mk.provider ? ` • Provider: ${mk.provider}` : ''}
      </div>
      <div>
        {mk.consentAt ? `Consent: ${fmtDE(mk.consentAt)} • ` : ''}
        {mk.lastSyncedAt ? `Synced: ${fmtDE(mk.lastSyncedAt)}` : ''}
        {mk.lastError && <span className="text-red-600"> • Error vorhanden</span>}
      </div>
    </div>
  </div>
</div>













          </fieldset>

          {/* Address */}
          <fieldset className="card">
            <legend className="font-bold">Address</legend>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="lbl">Street</label><input className="input" value={form.address?.street || ''} onChange={(e)=>up('address.street', e.target.value)} /></div>
              <div><label className="lbl">House no.</label><input className="input" value={form.address?.houseNo || ''} onChange={(e)=>up('address.houseNo', e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div><label className="lbl">ZIP</label><input className="input" value={form.address?.zip || ''} onChange={(e)=>up('address.zip', e.target.value)} /></div>
              <div><label className="lbl">City</label><input className="input" value={form.address?.city || ''} onChange={(e)=>up('address.city', e.target.value)} /></div>
            </div>
          </fieldset>

          {/* Notes */}
          <fieldset className="card">
            <legend className="font-bold">Notes</legend>
            <textarea className="input" rows={5} value={form.notes || ''} onChange={(e)=>up('notes', e.target.value)} />
          </fieldset>
        </div>

        {/* Footer actions */}
        <div className="flex flex-wrap gap-2 justify-end mt-3">
          <button className="btn" onClick={onClose} type="button">Close</button>
          {mode==='create' ? (
            <button className="btn btn-primary" onClick={create} disabled={saving} type="button">
              {saving ? 'Creating…' : 'Create'}
            </button>
          ) : (
            <>
              <button className="btn btn-primary" onClick={save} disabled={saving} type="button">
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              <button className="btn" onClick={removeCustomer} type="button">Delete</button>
            </>
          )}
        </div>

        {/* Sub-Dialogs */}
        {documentsOpen && (
          <DocumentsDialog customerId={form._id} onClose={()=> setDocumentsOpen(false)} />
        )}
        {bookOpen && (
          <BookDialog
            customerId={form._id}
            onClose={()=> setBookOpen(false)}
            onBooked={(fresh)=> setForm(fresh)}
          />
        )}
        {cancelOpen && (
          <CancelDialog
            customer={form}
            onClose={()=> setCancelOpen(false)}
            onChanged={(fresh)=> setForm(fresh)}
          />
        )}
        {stornoOpen && (
          <StornoDialog
            customer={form}
            onClose={()=> setStornoOpen(false)}
            onChanged={(fresh)=> setForm(fresh)}
          />
        )}
      </div>
    </div>
  );
}























