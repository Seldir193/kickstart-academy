// app/admin/customers/dialogs/CustomerDialog.tsx
'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';

import type { Customer, Offer, BookingRef } from '../types';

import BookDialog from './BookDialog';
import CancelDialog from './CancelDialog';
import StornoDialog from './StornoDialog';
import DocumentsDialog from './DocumentsDialog';

type Props = {
  mode: 'create' | 'edit';
  customer?: Customer | null;
  onClose: () => void;
  onCreated?: () => void;
  onSaved?: () => void;
};

// Family-API Rückgabe (siehe /customers/:id/family)
type FamilyMember = {
  _id: string;
  userId: number | null;
  parent: {
    salutation?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  child: {
    firstName?: string;
    lastName?: string;
    birthDate?: string | null;
  } | null;
  children: {
    firstName?: string;
    lastName?: string;
    birthDate?: string | null;
  }[];
};

type FamilyApiResponse = {
  ok: boolean;
  baseCustomerId: string;
  members: FamilyMember[];
};

type FamilyCreateMode = 'none' | 'newChild';

export default function CustomerDialog({
  mode,
  customer,
  onClose,
  onCreated,
  onSaved,
}: Props) {
  const blank: Customer = {
    _id: '',
    newsletter: false,
    address: { street: '', houseNo: '', zip: '', city: '' },
    child: {
      firstName: '',
      lastName: '',
      gender: '',
      birthDate: null,
      club: '',
    },
    parent: {
      salutation: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      phone2: '',
    },
    notes: '',
    bookings: [],
    canceledAt: null,
  };

  const [form, setForm] = useState<Customer>(() =>
    mode === 'edit' && customer ? customer : blank,
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [bookOpen, setBookOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [stornoOpen, setStornoOpen] = useState(false);
  const [documentsOpen, setDocumentsOpen] = useState(false);

  const [offers, setOffers] = useState<Offer[]>([]);
  const [offersLoading, setOffersLoading] = useState(false);

  // Newsletter Busy Flag
  const [newsletterBusy, setNewsletterBusy] = useState(false);

  // 🔗 Family-States
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [familyLoading, setFamilyLoading] = useState(false);
  const [familyError, setFamilyError] = useState<string | null>(null);

  // Welcher Customer ist aktuell im Formular aktiv?
  const [activeCustomerId, setActiveCustomerId] = useState<string | null>(
    customer?._id || null,
  );

  // Modus: normal / neues Kind
  const [familyCreateMode, setFamilyCreateMode] =
    useState<FamilyCreateMode>('none');

  const baseCustomerId = customer?._id || null;

  // Custom-Dropdown offen/zu
  const [familyDropdownOpen, setFamilyDropdownOpen] = useState(false);
  const familyDropdownRef = useRef<HTMLDivElement | null>(null);

  // Neue Dropdowns: Salutation + Gender
  const [salutationOpen, setSalutationOpen] = useState(false);
  const [genderOpen, setGenderOpen] = useState(false);
  const salutationDropdownRef = useRef<HTMLDivElement | null>(null);
  const genderDropdownRef = useRef<HTMLDivElement | null>(null);

  /* ======================= Helpers ======================= */

  function up(path: string, value: any) {
    setForm(prev => {
      const c = structuredClone(prev) as any;
      const segs = path.split('.');
      let ref = c;
      for (let i = 0; i < segs.length - 1; i++) {
        ref[segs[i]] = ref[segs[i]] ?? {};
        ref = ref[segs[i]];
      }
      ref[segs[segs.length - 1]] = value;
      return c;
    });
  }

  async function toggleNewsletter(id: string, checked: boolean) {
    const r = await fetch(
      `/api/admin/customers/${encodeURIComponent(id)}/newsletter`,
      {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsletter: checked }),
      },
    );
    const data = await r.json().catch(() => null);
    if (!r.ok || data?.ok === false) {
      throw new Error(data?.error || `Failed to update newsletter (${r.status})`);
    }
    if (!data?.customer) {
      throw new Error('Server did not return updated customer');
    }
    return data.customer as Customer;
  }

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

  const mk = useMemo(() => {
    const anyForm = form as any;
    return {
      provider: anyForm?.marketingProvider as string | undefined,
      status: anyForm?.marketingStatus as string | undefined,
      contactId: anyForm?.marketingContactId as string | undefined,
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
      case 'subscribed':
        return 'Subscribed';
      case 'pending':
        return 'Pending (DOI)';
      case 'unsubscribed':
        return 'Unsubscribed';
      case 'error':
        return 'Error';
      default:
        return '—';
    }
  }

  const isActive = !form?.canceledAt;

  /* ======================= Family Helpers ======================= */

  function firstChildOf(member: FamilyMember | null | undefined) {
    if (!member) return null;
    if (member.child) return member.child;
    if (member.children && member.children.length > 0) return member.children[0];
    return null;
  }

  function formatParentLabel(m: FamilyMember): string {
    const p = m.parent || {};
    const ch = firstChildOf(m);
    const parts: string[] = [];
    if (m.userId != null) parts.push(`#${m.userId}`);
    if (p.lastName || p.firstName) {
      parts.push(`${p.lastName || ''} ${p.firstName || ''}`.trim());
    } else {
      parts.push('(ohne Elternname)');
    }
    if (p.email) parts.push(p.email);
    if (ch?.firstName || ch?.lastName) {
      parts.push(`${ch.firstName || ''} ${ch.lastName || ''}`.trim());
    }
    return parts.join(' · ');
  }

  function formatChildLabel(m: FamilyMember): string {
    const ch = firstChildOf(m);
    if (!ch) {
      return m.userId != null ? `#${m.userId} · (kein Kind)` : '(kein Kind)';
    }
    const parts: string[] = [];
    if (m.userId != null) parts.push(`#${m.userId}`);
    const base =
      `${ch.firstName || ''} ${ch.lastName || ''}`.trim() || '(Kind ohne Namen)';
    parts.push(base);
    if (ch.birthDate) {
      const d = new Date(ch.birthDate);
      if (!isNaN(d.getTime())) {
        parts.push(
          new Intl.DateTimeFormat('de-DE', {
            timeZone: 'Europe/Berlin',
            dateStyle: 'medium',
          }).format(d),
        );
      }
    }
    return parts.join(' · ');
  }

  const activeFamilyId = activeCustomerId || baseCustomerId || '';

  const selectedFamilyMember: FamilyMember | undefined = useMemo(() => {
    if (!familyMembers.length) return undefined;
    if (activeFamilyId) {
      return (
        familyMembers.find(m => m._id === activeFamilyId) || familyMembers[0]
      );
    }
    return familyMembers[0];
  }, [familyMembers, activeFamilyId]);

  async function loadCustomerById(id: string) {
    try {
      const r = await fetch(`/api/admin/customers/${encodeURIComponent(id)}`, {
        cache: 'no-store',
        credentials: 'include',
      });
      if (!r.ok) {
        throw new Error(`Failed to load customer (${r.status})`);
      }
      const fresh = await r.json();
      setForm(fresh);
      setActiveCustomerId(fresh._id || id);
      setFamilyDropdownOpen(false);
      // Familie anhand dieses Customers neu laden
      reloadFamily(fresh._id || id);
    } catch (e: any) {
      console.error('loadCustomerById failed', e);
      setErr(e?.message || 'Failed to load customer');
    }
  }

  async function reloadFamily(baseId?: string) {
    const id = baseId || baseCustomerId || form._id;
    if (!id) return;
    try {
      setFamilyLoading(true);
      setFamilyError(null);
      const r = await fetch(
        `/api/admin/customers/${encodeURIComponent(id)}/family`,
        {
          cache: 'no-store',
          credentials: 'include',
        },
      );
      if (!r.ok) {
        throw new Error(`Family load failed (${r.status})`);
      }
      const data = (await r.json()) as FamilyApiResponse;
      if (data?.ok && Array.isArray(data.members)) {
        setFamilyMembers(data.members);
      } else {
        setFamilyMembers([]);
      }
    } catch (e: any) {
      console.error('reloadFamily failed', e);
      setFamilyError(e?.message || 'Failed to load family');
      setFamilyMembers([]);
    } finally {
      setFamilyLoading(false);
    }
  }

  function handleSelectFamilyMember(id: string) {
    if (!id) return;
    setFamilyCreateMode('none');
    setActiveCustomerId(id);
    setFamilyDropdownOpen(false);
    loadCustomerById(id);
  }

  function handleAddSibling() {
    // Neues Kind zu bestehendem Elternteil
    if (!baseCustomerId && !form._id) return;
    setFamilyCreateMode('newChild');
    setActiveCustomerId(null);
    setFamilyDropdownOpen(false);
    setForm(prev => ({
      ...prev,
      child: {
        firstName: '',
        lastName: '',
        gender: '',
        birthDate: null,
        club: '',
      },
    }));
  }

  /* ======================= Effects ======================= */

  useEffect(() => {
    if (mode === 'edit' && customer) {
      setForm(customer);
      setActiveCustomerId(customer._id || null);
    }
    if (mode === 'create') {
      setForm(blank);
      setActiveCustomerId(null);
      setFamilyMembers([]);
      setFamilyDropdownOpen(false);
      setFamilyCreateMode('none');
    }
  }, [mode, customer]);

  // Dropdowns schließen, wenn außerhalb geklickt wird
  useEffect(() => {
    function handleClickOutside(ev: MouseEvent) {
      const target = ev.target as Node;

      if (
        familyDropdownRef.current &&
        !familyDropdownRef.current.contains(target)
      ) {
        setFamilyDropdownOpen(false);
      }

      if (
        salutationDropdownRef.current &&
        !salutationDropdownRef.current.contains(target)
      ) {
        setSalutationOpen(false);
      }

      if (
        genderDropdownRef.current &&
        !genderDropdownRef.current.contains(target)
      ) {
        setGenderOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Angebote nur im Edit-Modus laden (wie bisher)
  useEffect(() => {
    if (mode !== 'edit') return;
    (async () => {
      try {
        setOffersLoading(true);
        setErr(null);
        const res = await fetch(`/api/admin/offers?limit=200`, {
          cache: 'no-store',
          credentials: 'include',
        });
        if (!res.ok) throw new Error(`Failed to load offers (${res.status})`);
        const data = await res.json();
        setOffers(
          Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : [],
        );
      } catch (e: any) {
        setErr(e?.message || 'Failed to load offers');
      } finally {
        setOffersLoading(false);
      }
    })();
  }, [mode]);

  // Familie laden, sobald ein Basis-Customer vorhanden ist
  useEffect(() => {
    if (mode !== 'edit') return;
    const id = customer?._id;
    if (!id) return;
    reloadFamily(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, customer && customer._id]);

  const offerById = useMemo(() => {
    const m: Record<string, Offer> = {};
    for (const o of offers) m[o._id] = o;
    return m;
  }, [offers]);

  function bookingType(b: BookingRef): string {
    return (b.type || offerById[b.offerId || '']?.type || '').trim();
  }

  /* ======================= Create / Save ======================= */

  async function create() {
    setSaving(true);
    setErr(null);
    try {
      const body: any = {
        newsletter: !!form.newsletter,
        address: form.address,
        child: form.child,
        parent: form.parent,
        notes: form.notes || '',
      };

      const res = await fetch('/api/admin/customers', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Create failed (${res.status})`);
      const created = await res.json();

      if (created?._id && created?.newsletter === true) {
        try {
          const updated = await toggleNewsletter(created._id, true);
          setForm(updated);
        } catch (e: any) {
          console.warn('Newsletter sync after create failed:', e?.message || e);
          alert(e?.message || 'Newsletter sync failed after create');
        }
      }

      onCreated?.();
    } catch (e: any) {
      setErr(e?.message || 'Create failed');
    } finally {
      setSaving(false);
    }
  }

  async function save() {
    if (mode !== 'edit') return;
    setSaving(true);
    setErr(null);

    try {
      // 1) Normaler Update-Fall (kein Family-Mode)
      if (familyCreateMode === 'none') {
        if (!form._id) throw new Error('Missing customer id');

        const res = await fetch(
          `/api/admin/customers/${encodeURIComponent(form._id)}`,
          {
            method: 'PUT',
            credentials: 'include',
            cache: 'no-store',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              newsletter: !!form.newsletter,
              address: form.address,
              child: form.child,
              parent: form.parent,
              notes: form.notes || '',
            }),
          },
        );

        let data: any = null;
        try {
          data = await res.json();
        } catch {
          // ignorieren, falls keine JSON-Antwort
        }

        if (!res.ok || data?.ok === false) {
          const msg =
            data?.error || `Save failed (${res.status} ${res.statusText})`;
          console.error('Customer save failed', msg, data);
          throw new Error(msg);
        }

        const updated = data || {};
        if (updated && updated._id) {
          setForm(updated);
          setActiveCustomerId(updated._id);
          await reloadFamily(updated._id);
        }
        onSaved?.();
        return;
      }

      // 2) Family-Neu-Anlage (neues Kind)
      const baseId = baseCustomerId || form._id;
      if (!baseId) throw new Error('Missing base customer id for family');

      const body: any = {
        familyOf: baseId,
        newsletter: !!form.newsletter,
        address: form.address,
        child: form.child,
        parent: form.parent,
        notes: form.notes || '',
      };

      const res = await fetch('/api/admin/customers', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // wenn keine JSON, lassen wir data einfach null
      }

      if (!res.ok || data?.ok === false) {
        const msg =
          data?.error ||
          `Create family member failed (${res.status} ${res.statusText})`;
        console.error('Create family member failed', msg, data);
        throw new Error(msg);
      }

      const created = data;

      // Familie (Liste für Dropdown) neu laden
      await reloadFamily(baseId);

      // neu angelegtes Kind anzeigen
      if (created && created._id) {
        setForm(created);
        setActiveCustomerId(created._id);
      }

      setFamilyCreateMode('none');
      setFamilyDropdownOpen(false);
      onSaved?.();
    } catch (e: any) {
      console.error('Customer save error', e);
      setErr(e?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  /* ======================= Render ======================= */

  const selectedChildLabel =
    selectedFamilyMember && familyMembers.length
      ? formatChildLabel(selectedFamilyMember)
      : '';

  return (
    <div className="ks-modal-root ks-customer-dialog">
      <div className="ks-backdrop" onClick={onClose} />
      <div
        className="ks-panel card ks-panel--lg"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="dialog-head">
          <div className="dialog-head__left">
            <h2 className="text-xl font-bold">
              Customer #{(form as any).userId ?? '—'}
            </h2>
            <span className={`badge ${isActive ? '' : 'badge-muted'}`}>
              {isActive ? 'Active' : 'Cancelled'}
            </span>
            {mode === 'edit' && familyCreateMode !== 'none' && (
              <span className="badge badge-info ml-2">
                {familyCreateMode === 'newChild'
                  ? 'Neues Kind wird angelegt'
                  : ''}
              </span>
            )}
          </div>
          <div className="dialog-head__actions">
            <button
              className="btn"
              onClick={() => setDocumentsOpen(true)}
              disabled={!form._id}
            >
              Documents
            </button>
            <button
              className="btn"
              onClick={() => setBookOpen(true)}
              disabled={!form._id}
            >
              Book
            </button>
            <button
              className="btn"
              onClick={() => setCancelOpen(true)}
              disabled={!form._id}
            >
              Cancel
            </button>
            <button
              className="btn"
              onClick={() => setStornoOpen(true)}
              disabled={!form._id}
            >
              Storno
            </button>
          </div>
        </div>

        {err && <div className="mb-2 text-red-600">{err}</div>}

        {/* Family Section (nur im Edit-Modus) */}
        {mode === 'edit' && (
          <fieldset className="card mb-3">
            <legend className="font-bold">Family / Kinder</legend>
            {familyLoading && (
              <div className="text-xs text-gray-600 mb-1">
                Familie wird geladen…
              </div>
            )}
            {familyError && (
              <div className="text-xs text-red-600 mb-1">{familyError}</div>
            )}

            {familyMembers.length > 0 ? (
              <>
                <div className="grid md:grid-cols-1 gap-2 mb-2">
                  <div>
                    <label className="lbl">Kind wählen</label>

                    {/* ✅ Family-Dropdown mit --open-Klasse & Icon-Drehung */}
                    <div
                      className={
                        'family-dropdown' +
                        (familyDropdownOpen ? ' family-dropdown--open' : '')
                      }
                      ref={familyDropdownRef}
                    >
                      <button
                        type="button"
                        className="family-dropdown-trigger input"
                        onClick={() =>
                          setFamilyDropdownOpen(open => !open)
                        }
                        aria-haspopup="listbox"
                        aria-expanded={familyDropdownOpen}
                      >
                        <span className="family-dropdown-label">
                          {selectedChildLabel || 'Kind wählen …'}
                        </span>
                        <span
                          className="family-dropdown-caret"
                          aria-hidden="true"
                        />
                      </button>

                      {familyDropdownOpen && (
                        <ul
                          className="family-dropdown-menu"
                          role="listbox"
                        >
                          {familyMembers.map(m => (
                            <li
                              key={m._id}
                              className={
                                'family-dropdown-item' +
                                (m._id === activeFamilyId
                                  ? ' family-dropdown-item--active'
                                  : '')
                              }
                              onClick={() =>
                                handleSelectFamilyMember(m._id)
                              }
                              role="option"
                              aria-selected={m._id === activeFamilyId}
                            >
                              {formatChildLabel(m)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-sm mt-1">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={handleAddSibling}
                  >
                    + weiteres Kind hinzufügen
                  </button>
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-600">
                Noch keine weiteren Kinder verknüpft.
              </div>
            )}
          </fieldset>
        )}

        {/* Columns */}
        <div className="form-columns mb-3">
          {/* Child */}
          <fieldset className="card">
            <legend className="font-bold">Child</legend>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="lbl">First name</label>
                <input
                  className="input"
                  value={form.child?.firstName || ''}
                  onChange={e => up('child.firstName', e.target.value)}
                />
              </div>
              <div>
                <label className="lbl">Last name</label>
                <input
                  className="input"
                  value={form.child?.lastName || ''}
                  onChange={e => up('child.lastName', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="lbl">Gender</label>
                <div
                  className={
                    'ks-selectbox' +
                    (genderOpen ? ' ks-selectbox--open' : '')
                  }
                  ref={genderDropdownRef}
                >
                  <button
                    type="button"
                    className="ks-selectbox__trigger"
                    onClick={() => setGenderOpen(open => !open)}
                  >
                    <span className="ks-selectbox__label">
                      {form.child?.gender || '—'}
                    </span>
                    <span
                      className="ks-selectbox__chevron"
                      aria-hidden="true"
                    />
                  </button>

                  {genderOpen && (
                    <div className="ks-selectbox__panel">
                      <button
                        type="button"
                        className={
                          'ks-selectbox__option' +
                          (!form.child?.gender
                            ? ' ks-selectbox__option--active'
                            : '')
                        }
                        onClick={() => {
                          up('child.gender', '');
                          setGenderOpen(false);
                        }}
                      >
                        —
                      </button>
                      <button
                        type="button"
                        className={
                          'ks-selectbox__option' +
                          (form.child?.gender === 'weiblich'
                            ? ' ks-selectbox__option--active'
                            : '')
                        }
                        onClick={() => {
                          up('child.gender', 'weiblich');
                          setGenderOpen(false);
                        }}
                      >
                        weiblich
                      </button>
                      <button
                        type="button"
                        className={
                          'ks-selectbox__option' +
                          (form.child?.gender === 'männlich'
                            ? ' ks-selectbox__option--active'
                            : '')
                        }
                        onClick={() => {
                          up('child.gender', 'männlich');
                          setGenderOpen(false);
                        }}
                      >
                        männlich
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="lbl">Birth date</label>
                <input
                  className="input"
                  type="date"
                  value={(form.child?.birthDate || '').slice(0, 10)}
                  onChange={e => up('child.birthDate', e.target.value)}
                />
              </div>
              <div>
                <label className="lbl">Club</label>
                <input
                  className="input"
                  value={form.child?.club || ''}
                  onChange={e => up('child.club', e.target.value)}
                />
              </div>
            </div>
          </fieldset>

          {/* Parent */}
          <fieldset className="card">
            <legend className="font-bold">Parent</legend>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="lbl">Salutation</label>
                <div
                  className={
                    'ks-selectbox' +
                    (salutationOpen ? ' ks-selectbox--open' : '')
                  }
                  ref={salutationDropdownRef}
                >
                  <button
                    type="button"
                    className="ks-selectbox__trigger"
                    onClick={() => setSalutationOpen(open => !open)}
                  >
                    <span className="ks-selectbox__label">
                      {form.parent?.salutation || '—'}
                    </span>
                    <span
                      className="ks-selectbox__chevron"
                      aria-hidden="true"
                    />
                  </button>

                  {salutationOpen && (
                    <div className="ks-selectbox__panel">
                      <button
                        type="button"
                        className={
                          'ks-selectbox__option' +
                          (!form.parent?.salutation
                            ? ' ks-selectbox__option--active'
                            : '')
                        }
                        onClick={() => {
                          up('parent.salutation', '');
                          setSalutationOpen(false);
                        }}
                      >
                        —
                      </button>
                      <button
                        type="button"
                        className={
                          'ks-selectbox__option' +
                          (form.parent?.salutation === 'Frau'
                            ? ' ks-selectbox__option--active'
                            : '')
                        }
                        onClick={() => {
                          up('parent.salutation', 'Frau');
                          setSalutationOpen(false);
                        }}
                      >
                        Frau
                      </button>
                      <button
                        type="button"
                        className={
                          'ks-selectbox__option' +
                          (form.parent?.salutation === 'Herr'
                            ? ' ks-selectbox__option--active'
                            : '')
                        }
                        onClick={() => {
                          up('parent.salutation', 'Herr');
                          setSalutationOpen(false);
                        }}
                      >
                        Herr
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="lbl">First name</label>
                <input
                  className="input"
                  value={form.parent?.firstName || ''}
                  onChange={e => up('parent.firstName', e.target.value)}
                />
              </div>
              <div>
                <label className="lbl">Last name</label>
                <input
                  className="input"
                  value={form.parent?.lastName || ''}
                  onChange={e => up('parent.lastName', e.target.value)}
                />
              </div>
              <div>
                <label className="lbl">Email</label>
                <input
                  className="input"
                  type="email"
                  value={form.parent?.email || ''}
                  onChange={e => up('parent.email', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="lbl">Phone</label>
                <input
                  className="input"
                  value={form.parent?.phone || ''}
                  onChange={e => up('parent.phone', e.target.value)}
                />
              </div>
              <div>
                <label className="lbl">Phone 2</label>
                <input
                  className="input"
                  value={form.parent?.phone2 || ''}
                  onChange={e => up('parent.phone2', e.target.value)}
                />
              </div>

              <div>
                <label className="lbl flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!form.newsletter}
                    disabled={newsletterBusy || saving}
                    onChange={async e => {
                      const next = e.target.checked;
                      setForm(prev => ({ ...prev, newsletter: next }));
                      if (mode !== 'edit' || !form._id) return;

                      setNewsletterBusy(true);
                      try {
                        const updated = await toggleNewsletter(form._id, next);
                        setForm(prev => ({
                          ...prev,
                          ...updated,
                          newsletter: updated?.newsletter ?? next,
                        }));
                      } catch (err: any) {
                        setForm(prev => ({ ...prev, newsletter: !next }));
                        alert(err?.message || 'Newsletter update failed');
                      } finally {
                        setNewsletterBusy(false);
                      }
                    }}
                  />
                  Newsletter
                  {newsletterBusy && (
                    <span className="text-gray-500 text-sm">Saving…</span>
                  )}
                </label>

                <div
                  className="text-xs text-gray-600 mt-1"
                  title={mk.lastError ? `Error: ${mk.lastError}` : undefined}
                >
                  <div>
                    <span className="font-medium">Status:</span>{' '}
                    {statusLabel(mk.status)}
                    {mk.provider ? ` • Provider: ${mk.provider}` : ''}
                  </div>
                  <div>
                    {mk.consentAt ? `Consent: ${fmtDE(mk.consentAt)} • ` : ''}
                    {mk.lastSyncedAt ? `Synced: ${fmtDE(mk.lastSyncedAt)}` : ''}
                    {mk.lastError && (
                      <span className="text-red-600"> • Error vorhanden</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </fieldset>

          {/* Address */}
          <fieldset className="card">
            <legend className="font-bold">Address</legend>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="lbl">Street</label>
                <input
                  className="input"
                  value={form.address?.street || ''}
                  onChange={e => up('address.street', e.target.value)}
                />
              </div>
              <div>
                <label className="lbl">House no.</label>
                <input
                  className="input"
                  value={form.address?.houseNo || ''}
                  onChange={e => up('address.houseNo', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="lbl">ZIP</label>
                <input
                  className="input"
                  value={form.address?.zip || ''}
                  onChange={e => up('address.zip', e.target.value)}
                />
              </div>
              <div>
                <label className="lbl">City</label>
                <input
                  className="input"
                  value={form.address?.city || ''}
                  onChange={e => up('address.city', e.target.value)}
                />
              </div>
            </div>
          </fieldset>

          {/* Notes */}
          <fieldset className="card">
            <legend className="font-bold">Notes</legend>
            <textarea
              className="input"
              rows={5}
              value={form.notes || ''}
              onChange={e => up('notes', e.target.value)}
            />
          </fieldset>
        </div>

        {/* Footer actions */}
        <div className="flex flex-wrap gap-2 justify-end mt-3">
          <button className="btn" onClick={onClose} type="button">
            Close
          </button>
          {mode === 'create' ? (
            <button
              className="btn"
              onClick={create}
              disabled={saving}
              type="button"
            >
              {saving ? 'Creating…' : 'Create'}
            </button>
          ) : (
            <button
              className="btn"
              onClick={save}
              disabled={saving}
              type="button"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          )}
        </div>

        {/* Sub-Dialogs */}
        {documentsOpen && (
          <DocumentsDialog
            customerId={form._id}
            onClose={() => setDocumentsOpen(false)}
          />
        )}
        {bookOpen && (
          <BookDialog
            customerId={form._id}
            onClose={() => setBookOpen(false)}
            onBooked={fresh => setForm(fresh)}
          />
        )}
        {cancelOpen && (
          <CancelDialog
            customer={form}
            onClose={() => setCancelOpen(false)}
            onChanged={fresh => setForm(fresh)}
          />
        )}
        {stornoOpen && (
          <StornoDialog
            customer={form}
            onClose={() => setStornoOpen(false)}
            onChanged={fresh => setForm(fresh)}
          />
        )}
      </div>
    </div>
  );
}









