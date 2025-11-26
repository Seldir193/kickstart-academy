

// app/admin/customers/dialogs/BookDialog.tsx
'use client';

import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import type { Customer, Offer } from '../types';
import {
  GROUPED_COURSE_OPTIONS,
  offerMatchesCourse,
} from 'src/app/lib/courseOptions';

type Props = {
  customerId: string;
  onClose: () => void;
  onBooked: (freshCustomer: Customer) => void;
};

/* ========= Helper: Weekly vs. Holiday ========= */
function isWeeklyOffer(o?: Offer | null) {
  if (!o) return false;
  if (o.category === 'Weekly') return true;
  if (o.category === 'ClubPrograms' || o.category === 'RentACoach') return false;
  return o.type === 'Foerdertraining' || o.type === 'Kindergarten';
}

function isNum(v: any): v is number {
  return typeof v === 'number' && isFinite(v);
}

function fmtEUR(n: number) {
  try {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(n);
  } catch {
    return `${n.toFixed(2)} €`;
  }
}

function fmtDE(dateISO: string) {
  if (!dateISO) return '—';
  try {
    const [y, m, d] = dateISO.split('-').map(Number);
    return `${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}.${y}`;
  } catch {
    return dateISO;
  }
}

function prorateForStart(dateISO: string, monthlyPrice?: number | null) {
  if (!dateISO || !isNum(monthlyPrice)) return null;
  const d = new Date(`${dateISO}T00:00:00`);
  if (isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = d.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const startDay = d.getDate();
  const daysRemaining = Math.max(0, daysInMonth - startDay + 1);
  const factor = Math.max(0, Math.min(1, daysRemaining / daysInMonth));
  const firstMonthPrice = Math.round(monthlyPrice * factor * 100) / 100;
  return { daysInMonth, daysRemaining, factor, firstMonthPrice, monthlyPrice };
}

/* ========= Family types & helpers ========= */

type FamilyChild = {
  firstName: string;
  lastName: string;
  birthDate: string | null;
};

type FamilyParent = {
  salutation: string;
  firstName: string;
  lastName: string;
  email: string;
};

type FamilyMember = {
  _id: string;
  userId: number | null;
  parent: FamilyParent;
  child: FamilyChild | null;
  children: FamilyChild[];
};

type FamilyResponse = {
  ok?: boolean;
  baseCustomerId?: string;
  members?: FamilyMember[];
  error?: string;
};

function firstChildOf(m: FamilyMember | null | undefined): FamilyChild | null {
  if (!m) return null;
  if (m.child) return m.child;
  if (Array.isArray(m.children) && m.children.length > 0) return m.children[0];
  return null;
}

// Label: "#ID - Kindname - dd.mm.yyyy"
function formatMemberChildLabel(m: FamilyMember): string {
  const kid = firstChildOf(m);
  const idPart =
    m.userId != null ? `#${m.userId}` : `#${m._id.slice(-4) || '????'}`;

  if (!kid) {
    return `${idPart} - (Kind ohne Namen)`;
  }

  const name =
    `${kid.firstName || ''} ${kid.lastName || ''}`.trim() || '(Kind ohne Namen)';

  let birth = '';
  if (kid.birthDate) {
    const d = new Date(kid.birthDate);
    if (!isNaN(d.getTime())) {
      birth = new Intl.DateTimeFormat('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(d);
    }
  }

  return birth ? `${idPart} - ${name} - ${birth}` : `${idPart} - ${name}`;
}

/* ===================== Component ===================== */

export default function BookDialog({ customerId, onClose, onBooked }: Props) {
  // Offers
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // grouped course selection (matches TrainingCard)
  const [courseValue, setCourseValue] = useState<string>('');
  const [selectedOfferId, setSelectedOfferId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [saving, setSaving] = useState(false);

  // Family
  const [family, setFamily] = useState<FamilyMember[] | null>(null);
  const [familyLoading, setFamilyLoading] = useState(false);
  const [familyError, setFamilyError] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');

  // Custom-Dropdown-States
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false);
  const memberDropdownRef = useRef<HTMLDivElement | null>(null);

  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const [isOfferDropdownOpen, setIsOfferDropdownOpen] = useState(false);
  const courseDropdownRef = useRef<HTMLDivElement | null>(null);
  const offerDropdownRef = useRef<HTMLDivElement | null>(null);

  /* ---- Outside click schließt Dropdowns ---- */
  useEffect(() => {
    function handleClickOutside(ev: MouseEvent) {
      const target = ev.target as Node;

      if (
        memberDropdownRef.current &&
        !memberDropdownRef.current.contains(target)
      ) {
        setIsMemberDropdownOpen(false);
      }

      if (
        courseDropdownRef.current &&
        !courseDropdownRef.current.contains(target)
      ) {
        setIsCourseDropdownOpen(false);
      }

      if (
        offerDropdownRef.current &&
        !offerDropdownRef.current.contains(target)
      ) {
        setIsOfferDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* ---- Load offers ---- */
  useEffect(() => {
    (async () => {
      try {
        setLoadingOffers(true);
        setErr(null);
        const res = await fetch(`/api/admin/offers?limit=500`, {
          cache: 'no-store',
          credentials: 'include',
        });
        if (!res.ok) throw new Error(`Failed to load offers (${res.status})`);
        const data = await res.json();
        const list = Array.isArray(data.items)
          ? data.items
          : Array.isArray(data)
          ? data
          : [];
        setOffers(list as any);
      } catch (e: any) {
        setErr(e?.message || 'Failed to load offers');
      } finally {
        setLoadingOffers(false);
      }
    })();
  }, []);

  /* ---- Load family ---- */
  useEffect(() => {
    if (!customerId) return;
    (async () => {
      try {
        setFamilyLoading(true);
        setFamilyError(null);
        const res = await fetch(
          `/api/admin/customers/${encodeURIComponent(customerId)}/family`,
          {
            cache: 'no-store',
            credentials: 'include',
          },
        );
        const data: FamilyResponse = await res.json().catch(() => ({} as any));
        if (!res.ok || data.ok === false) {
          throw new Error(data.error || `Failed to load family (${res.status})`);
        }
        const members = Array.isArray(data.members) ? data.members : [];
        setFamily(members);
        if (members.length) {
          const baseId = data.baseCustomerId;
          const initial =
            (baseId && members.find(m => m._id === baseId)?._id) ||
            members[0]._id;
          setSelectedMemberId(initial);
        }
      } catch (e: any) {
        console.warn('[BookDialog] load family failed:', e?.message || e);
        setFamily(null);
        setFamilyError(e?.message || 'Failed to load family');
      } finally {
        setFamilyLoading(false);
      }
    })();
  }, [customerId]);

  /* ---- Derived family selections ---- */
  const selectedMember: FamilyMember | null = useMemo(() => {
    if (!family || !family.length) return null;
    const found = family.find(m => m._id === selectedMemberId);
    return found || family[0] || null;
  }, [family, selectedMemberId]);

  const activeChild: FamilyChild | null = useMemo(
    () => firstChildOf(selectedMember),
    [selectedMember],
  );

  const selectedMemberLabel = useMemo(() => {
    if (!selectedMember) return 'Bitte Kind auswählen …';
    return formatMemberChildLabel(selectedMember);
  }, [selectedMember]);

  /* ---- Offer selection ---- */
  const filteredOffers = useMemo(
    () => offers.filter(o => offerMatchesCourse(courseValue, o)),
    [offers, courseValue],
  );

  useEffect(() => {
    if (!filteredOffers.length) {
      setSelectedOfferId('');
      return;
    }
    const still = filteredOffers.some(o => o._id === selectedOfferId);
    setSelectedOfferId(still ? selectedOfferId : filteredOffers[0]._id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredOffers.map(o => o._id).join('|')]);

  const selectedOffer = useMemo(
    () => filteredOffers.find(o => o._id === selectedOfferId) || null,
    [filteredOffers, selectedOfferId],
  );

  const isWeekly = useMemo(() => isWeeklyOffer(selectedOffer), [selectedOffer]);

  const pro = useMemo(() => {
    if (!isWeekly) return null;
    return isNum(selectedOffer?.price)
      ? prorateForStart(selectedDate, selectedOffer!.price)
      : null;
  }, [isWeekly, selectedDate, selectedOffer?.price]);

  /* ---- Labels für Custom-Dropdowns (Courses / Offer) ---- */

  const selectedCourseLabel = useMemo(() => {
    if (!courseValue) return 'All courses';
    for (const group of GROUPED_COURSE_OPTIONS) {
      const found = group.items.find(opt => opt.value === courseValue);
      if (found) return found.label;
    }
    return 'All courses';
  }, [courseValue]);

  const selectedOfferLabel = useMemo(() => {
    if (!filteredOffers.length) return 'No offers in this selection.';
    const found =
      filteredOffers.find(o => o._id === selectedOfferId) ||
      filteredOffers[0];

    const parts = [
      found.title || '—',
      isNum(found.price) ? fmtEUR(found.price) : undefined,
    ].filter(Boolean);

    return parts.join(' — ');
  }, [filteredOffers, selectedOfferId]);

  /* ---- Submit booking ---- */
  async function submit() {
    if (!selectedOfferId || !selectedDate) return;
    const targetCustomerId = selectedMember?._id || customerId;

    setSaving(true);
    setErr(null);

    try {
      const res = await fetch(
        `/api/admin/customers/${encodeURIComponent(targetCustomerId)}/bookings`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          cache: 'no-store',
          body: JSON.stringify({
            offerId: selectedOfferId,
            date: selectedDate,
          }),
        },
      );

      if (!res.ok) {
        throw new Error(`Create booking failed (${res.status})`);
      }

      const payload = await res.json();
      const newBooking = payload?.booking;

      if (newBooking?._id) {
        const r2 = await fetch(
          `/api/admin/bookings/${encodeURIComponent(newBooking._id)}/confirm`,
          {
            method: 'POST',
            credentials: 'include',
            cache: 'no-store',
          },
        );

        const d2 = await r2.json().catch(() => null);
        if (!r2.ok || d2?.ok === false) {
          console.warn(
            'confirmation (confirm route) failed',
            r2.status,
            d2 || (await r2.text().catch(() => '')),
          );
        }
      }

      const r3 = await fetch(
        `/api/admin/customers/${encodeURIComponent(targetCustomerId)}`,
        {
          cache: 'no-store',
          credentials: 'include',
        },
      );
      const fresh = r3.ok ? await r3.json() : null;
      if (fresh) onBooked(fresh);

      onClose();
    } catch (e: any) {
      setErr(e?.message || 'Booking failed');
    } finally {
      setSaving(false);
    }
  }

  /* ===================== Render ===================== */

  return (
    <div className="ks-modal-root ks-modal-root--top">
      <div className="ks-backdrop" onClick={onClose} />
      <div
        className="ks-panel card ks-panel--md"
        onClick={e => e.stopPropagation()}
      >
        <div className="dialog-subhead">
          <h3 className="text-lg font-bold">Book offer</h3>
          <button className="btn btn-ghost" onClick={onClose}>
            ✕
          </button>
        </div>

        {err && <div className="mb-2 text-red-600">{err}</div>}
        {loadingOffers && (
          <div className="mb-2 text-gray-600">Loading offers…</div>
        )}

        {/* Booking for (Family) */}
        <div className="mb-3 p-3 rounded border bg-gray-50 text-sm">
          <div className="font-semibold mb-1">Booking for</div>

          {familyLoading && (
            <div className="text-gray-600">Loading family…</div>
          )}

          {familyError && (
            <div className="text-red-600">
              Family could not be loaded – booking is still possible.
            </div>
          )}

         





{family && family.length > 0 ? (
  <>
    {/* Custom Dropdown – gleiche Optik wie Courses/Offer (ks-selectbox) */}
    <div
      className={
        'ks-selectbox' +
        (isMemberDropdownOpen ? ' ks-selectbox--open' : '')
      }
      ref={memberDropdownRef}
    >
      <button
        type="button"
        className="ks-selectbox__trigger"
        onClick={() =>
          setIsMemberDropdownOpen(open => !open)
        }
      >
        <span className="ks-selectbox__label">
          {selectedMemberLabel}
        </span>
        <span
          className="ks-selectbox__chevron"
          aria-hidden="true"
        />
      </button>

      {isMemberDropdownOpen && (
        <div
          className="ks-selectbox__panel"
          role="listbox"
        >
          {family.map(m => (
            <button
              type="button"
              key={m._id}
              className={
                'ks-selectbox__option' +
                (m._id === selectedMemberId
                  ? ' ks-selectbox__option--active'
                  : '')
              }
              onClick={() => {
                setSelectedMemberId(m._id);
                setIsMemberDropdownOpen(false);
              }}
            >
              {formatMemberChildLabel(m)}
            </button>
          ))}
        </div>
      )}
    </div>

    {/* Kurz-Zusammenfassung */}
    <div className="text-gray-700 mt-2">
      <div>
        <span className="font-medium">Parent:</span>{' '}
        {selectedMember
          ? `${selectedMember.parent.firstName} ${selectedMember.parent.lastName}`.trim()
          : '—'}
      </div>
      <div>
        <span className="font-medium">Child:</span>{' '}
        {activeChild
          ? `${activeChild.firstName} ${activeChild.lastName}`.trim()
          : '—'}
      </div>
    </div>
  </>
) : (
  !familyLoading && (
    <div className="text-gray-700">
      Booking will be created for the current customer.
    </div>
  )
)}







        </div>

        {/* Courses */}
        <div className="grid gap-2 mb-2">
         


<div>
  <label className="lbl">Courses</label>

  <div
    className={
      'ks-selectbox' +
      (isCourseDropdownOpen ? ' ks-selectbox--open' : '')
    }
    ref={courseDropdownRef}
  >
    <button
      type="button"
      className="ks-selectbox__trigger"
      onClick={() =>
        setIsCourseDropdownOpen(open => !open)
      }
    >
      <span className="ks-selectbox__label">
        {selectedCourseLabel}
      </span>
      <span
        className="ks-selectbox__chevron"
        aria-hidden="true"
      />
    </button>

    {isCourseDropdownOpen && (
      <div className="ks-selectbox__panel">
        <button
          type="button"
          className={
            'ks-selectbox__option' +
            (courseValue === ''
              ? ' ks-selectbox__option--active'
              : '')
          }
          onClick={() => {
            setCourseValue('');
            setIsCourseDropdownOpen(false);
          }}
        >
          All courses
        </button>

        {GROUPED_COURSE_OPTIONS.map(g => (
          <div
            key={g.label}
            className="ks-selectbox__group"
          >
            <div className="ks-selectbox__group-label">
              {g.label}
            </div>
            {g.items.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={
                  'ks-selectbox__option' +
                  (courseValue === opt.value
                    ? ' ks-selectbox__option--active'
                    : '')
                }
                onClick={() => {
                  setCourseValue(opt.value);
                  setIsCourseDropdownOpen(false);
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ))}
      </div>
    )}
  </div>
</div>





        </div>

        {/* Offer */}
        <div className="grid gap-2 mb-2">
          <div>
            <label className="lbl">Offer</label>

            <div
              className={
                'ks-selectbox' +
                (isOfferDropdownOpen ? ' ks-selectbox--open' : '') +
                (!filteredOffers.length ? ' ks-selectbox--disabled' : '')
              }
              ref={offerDropdownRef}
            >
              <button
                type="button"
                className="ks-selectbox__trigger"
                onClick={() => {
                  if (!filteredOffers.length) return;
                  setIsOfferDropdownOpen(open => !open);
                }}
                disabled={!filteredOffers.length}
              >
                <span className="ks-selectbox__label">
                  {selectedOfferLabel}
                </span>
                <span
                  className="ks-selectbox__chevron"
                  aria-hidden="true"
                />
              </button>

              {isOfferDropdownOpen && filteredOffers.length > 0 && (
                <div className="ks-selectbox__panel">
                  {filteredOffers.map(o => {
                    const parts = [
                      o.title || '—',
                      isNum(o.price) ? fmtEUR(o.price) : undefined,
                    ].filter(Boolean);
                    const label = parts.join(' — ');
                    return (
                      <button
                        key={o._id}
                        type="button"
                        className={
                          'ks-selectbox__option' +
                          (selectedOfferId === o._id
                            ? ' ks-selectbox__option--active'
                            : '')
                        }
                        onClick={() => {
                          setSelectedOfferId(o._id);
                          setIsOfferDropdownOpen(false);
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {!filteredOffers.length && (
              <div className="text-gray-600 mt-1">
                No offers in this selection.
              </div>
            )}
          </div>
        </div>

        {/* Date */}
        <div className="grid gap-2">
          <div>
            <label className="lbl">Start date</label>
            <input
              className="input"
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        {/* Price box */}
        {isNum(selectedOffer?.price) &&
          (isWeekly ? (
            <div className="mt-3 p-3 rounded bg-gray-50 border">
              <div className="font-semibold mb-1">
                Price overview
              </div>
              <ul className="list-disc ml-5">
                <li>
                  Monthly price:{' '}
                  <b>{fmtEUR(selectedOffer!.price!)}</b>
                </li>
                {pro ? (
                  <li>
                    First month (pro-rata from{' '}
                    <b>{fmtDE(selectedDate)}</b>:{' '}
                    <b>{fmtEUR(pro.firstMonthPrice)}</b>{' '}
                    <span className="text-gray-600">
                      ({pro.daysRemaining}/{pro.daysInMonth} days)
                    </span>
                  </li>
                ) : (
                  <li className="text-gray-600">
                    Select a valid date to see pro-rata.
                  </li>
                )}
              </ul>
            </div>
          ) : (
            <div className="mt-3">
              <div>
                Price:{' '}
                <b>{fmtEUR(selectedOffer!.price!)}</b>
              </div>
            </div>
          ))}

        <div className="flex justify-end gap-2 mt-3">
          <button className="btn" onClick={onClose}>
            Close
          </button>
          <button
            className="btn btn-primary"
            disabled={saving || !selectedOfferId || !selectedDate}
            onClick={submit}
          >
            {saving ? 'Booking…' : 'Confirm booking'}
          </button>
        </div>
      </div>
    </div>
  );
}



