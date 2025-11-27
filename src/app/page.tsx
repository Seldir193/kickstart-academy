
// app/admin/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { dayGreeting, firstNameOf } from '@/app/lib/greeting';

// DEIN QuickBookingDialog (unverändert verwenden)
import QuickBookingDialog from './admin/customers/QuickBookingDialog';

/* ---------- Types ---------- */
type Offer = {
  _id: string;
  title?: string;
  type?: string;
  sub_type?: string;
  category?: string;
  location?: string;
  price?: number;
  updatedAt?: string;
};
type OffersResponse = { items: Offer[]; total: number };

export default function AdminHomePage() {
  const router = useRouter();

  // KPIs
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [placesCount, setPlacesCount] = useState<number>(0);
  const [newsletterLeads, setNewsletterLeads] = useState<number>(0);
  const [openBookingsCount, setOpenBookingsCount] = useState<number>(0);

  // Zuletzt bearbeitete Kurse (paginiert 10/Seite)
  const [page, setPage] = useState(1);
  const limit = 10;
  const [items, setItems] = useState<Offer[]>([]);
  const [total, setTotal] = useState(0);
  const [loadingList, setLoadingList] = useState(true);

  // Quick-Booking Modal
  const [quickOpen, setQuickOpen] = useState(false);

  // KPIs laden
  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        const rOffers = await fetch('/api/admin/offers?onlineActive=true&limit=1', {
          cache: 'no-store',
          credentials: 'include',
        });
        const jrOffers: OffersResponse = await rOffers.json().catch(() => ({ items: [], total: 0 }));
        if (!abort) setOnlineCount(Number(jrOffers?.total || 0));
      } catch { if (!abort) setOnlineCount(0); }

      try {
        const rPlaces = await fetch('/api/admin/places?limit=1', {
          cache: 'no-store',
          credentials: 'include',
        });
        const jp: any = await rPlaces.json().catch(() => ({}));
        if (!abort) setPlacesCount(Number(jp?.total || 0));
      } catch { if (!abort) setPlacesCount(0); }

      try {
        const rLead = await fetch('/api/admin/customers?tab=newsletter&limit=1', {
          cache: 'no-store',
          credentials: 'include',
        });
        const jl: any = await rLead.json().catch(() => ({}));
        if (!abort) setNewsletterLeads(Number(jl?.total || 0));
      } catch { if (!abort) setNewsletterLeads(0); }

      try {
        // Nur offene Anfragen = nur "pending"
        const rPend = await fetch('/api/admin/bookings?status=pending&limit=1', {
          cache: 'no-store',
          credentials: 'include',
        });
        const jPend = await rPend.json().catch(() => ({ total: 0 }));
        if (!abort) setOpenBookingsCount(Number(jPend?.total || 0));
      } catch {
        if (!abort) setOpenBookingsCount(0);
      }
    })();
    return () => { abort = true; };
  }, []);

  // Kurse (paginiert) laden
  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        setLoadingList(true);
        const r = await fetch(`/api/admin/offers?page=${page}&limit=${limit}`, {
          cache: 'no-store',
          credentials: 'include',
        });
        const j: OffersResponse = await r.json().catch(() => ({ items: [], total: 0 }));
        const list = Array.isArray(j?.items) ? j.items : [];
        // clientseitig nach updatedAt (fallback)
        list.sort((a, b) => {
          const ta = (a.updatedAt && Date.parse(a.updatedAt)) || 0;
          const tb = (b.updatedAt && Date.parse(b.updatedAt)) || 0;
          return tb - ta;
        });
        if (!abort) {
          setItems(list);
          setTotal(Number(j?.total || list.length));
        }
      } finally {
        if (!abort) setLoadingList(false);
      }
    })();
    return () => { abort = true; };
  }, [page]);

  const [adminName, setAdminName] = useState<string>('');
  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        const r = await fetch('/api/admin/auth/me', { cache: 'no-store', credentials: 'include' });
        const j = await r.json().catch(() => ({}));
        if (!abort && j?.ok && j?.user) {
          const dn = j.user.fullName || j.user.displayName || j.user.email || '';
          setAdminName(dn);
        }
      } catch {}
    })();
    return () => { abort = true; };
  }, []);

  const pageCount = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="ks admin-home">
      <main className="container">
        {/* Hero */}
        <section className="hero">
          <div className="hero-content">
            <h1>
              {dayGreeting()} {adminName ? `${firstNameOf(adminName)}` : ''}{adminName ? '!' : ''}
            </h1>
            <p>Verwalte Trainings, Orte, Kunden und Buchungen an einem Ort.</p>
            <div className="hero-actions">
              <Link href="/trainings" className="btn">Kurs anlegen</Link>
              <Link href="/orte" className="btn">Ort anlegen</Link>
              <button className="btn" onClick={() => setQuickOpen(true)} type="button">Buchung erstellen</button>
              {/* Contact-Button entfernt – CTA ist jetzt im Footer */}
            </div>
          </div>
        </section>

        {/* KPIs */}
        <section className="grid">
          <div className="card">
            <div className="card-head"><h3 className="card-title">Kurse online</h3></div>
            <div className="text-xl font-bold">{onlineCount}</div>
            <div className="card-actions"><Link href="/trainings" className="btn">Alle Trainings</Link></div>
          </div>

          <div className="card">
            <div className="card-head"><h3 className="card-title">Orte</h3></div>
            <div className="text-xl font-bold">{placesCount}</div>
            <div className="card-actions"><Link href="/orte" className="btn">Orte verwalten</Link></div>
          </div>

          <div className="card">
            <div className="card-head"><h3 className="card-title">Newsletter-Leads</h3></div>
            <div className="text-xl font-bold">{newsletterLeads}</div>
            <div className="card-actions"><Link href="/customers?tab=newsletter" className="btn">Leads ansehen</Link></div>
          </div>

          <div className="card">
            <div className="card-head"><h3 className="card-title">Offene Anfragen</h3></div>
            <div className="text-xl font-bold">{openBookingsCount}</div>
            <div className="card-actions"><Link href="/admin/bookings" className="btn">Zu den Buchungen</Link></div>
          </div>
        </section>

        {/* Zuletzt bearbeitete Kurse */}
        <section className="card">
          <div className="card-head">
            <h3 className="card-title">Zuletzt bearbeitete Kurse</h3>
            <Link href="/trainings" className="btn">Alle anzeigen</Link>
          </div>

          {loadingList ? (
            <div className="card__empty">Loading…</div>
          ) : items.length === 0 ? (
            <div className="card__empty">Keine Kurse gefunden.</div>
          ) : (
            <>
              <ul className="list list--bleed">
                {items.map((o, i) => {
                  const courseValue = (o.sub_type || o.type || '').trim();
                  const filterHref = courseValue
                    ? `/trainings?course=${encodeURIComponent(courseValue)}`
                    : '/trainings';

                  const isLatest = page === 1 && i === 0;

                  const updatedText = o.updatedAt
                    ? new Date(o.updatedAt).toLocaleString('de-DE', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })
                    : null;

                  return (
                    <li
                      key={o._id}
                      className="list__item chip is-fullhover is-interactive"
                      onClick={() => router.push(filterHref)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push(filterHref); }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`Filtern nach Kurs: ${courseValue || (o.title ?? 'Kurs')}`}
                    >
                      {(o as any).coachImage ? (
                        <img
                          src={(o as any).coachImage}
                          alt={(o as any).coachName ? `Coach ${ (o as any).coachName }` : 'Coach'}
                          className="list__avatar"
                        />
                      ) : (
                        <div className="list__avatar list__avatar--ph" aria-hidden="true" />
                      )}

                      <div className="list__body">
                        <div className="list__title">
                          {o.title ?? 'Kurs'}{' '}
                          {isLatest ? <span className="badge">Zuletzt geändert</span> : null}
                        </div>
                        <div className="list__meta">
                          {[o.sub_type || o.type, o.location].filter(Boolean).join(' • ')}
                          {typeof o.price === 'number' ? <> · {o.price} €</> : null}
                          {updatedText ? <> · aktualisiert am {updatedText}</> : null}
                        </div>
                      </div>

                      <div className="list__actions" onClick={(e) => e.stopPropagation()}>
                        <span
                          className="edit-trigger"
                          role="button"
                          tabIndex={0}
                          title="Nach diesem Kurs filtern"
                          aria-label="Nach diesem Kurs filtern"
                          onClick={() => router.push(filterHref)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              router.push(filterHref);
                            }
                          }}
                        >
                          <img src="/icons/filter.svg" alt="" aria-hidden="true" className="icon-img" />
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </section>
      </main>

      {/* Pager (IMG-Icon-Style) */}
      <div className="pager pager--arrows">
        <button
          type="button"
          className="btn"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          <img
            src="/icons/arrow_right_alt.svg"
            alt=""
            aria-hidden="true"
            className="icon-img icon-img--left"
          />
        </button>

        <div className="pager__count" aria-live="polite" aria-atomic="true">
          {page} / {pageCount}
        </div>

        <button
          type="button"
          className="btn"
          aria-label="Next page"
          disabled={page >= pageCount}
          onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
        >
          <img
            src="/icons/arrow_right_alt.svg"
            alt=""
            aria-hidden="true"
            className="icon-img"
          />
        </button>
      </div>

      {/* QuickBooking zuerst öffnen – nutzt deinen BookDialog intern */}
      {quickOpen && <QuickBookingDialog onClose={() => setQuickOpen(false)} />}
    </div>
  );
}











