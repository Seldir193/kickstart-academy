'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

type Props = {
  /** Initial admin flag from server (reads HttpOnly cookie in HeaderServer) */
  isAdminInitial?: boolean;
};

const baseNav = [
  { href: '/', label: 'Home' },
  // NOTE: 'Trainings' will be shown only if isAdmin === true (see render logic)
  { href: '/trainings', label: 'Trainings' },
  { href: '/book', label: 'Book' },
  { href: '/shop', label: 'Shop (Demo)' },
];

const WP_OFFERS_URL =
  process.env.NEXT_PUBLIC_WP_OFFERS_URL ||
  'http://localhost/wordpress/index.php/angebote/';

// optional UI flag helper (not security-relevant)
function hasUiAdminFlag(): boolean {
  if (typeof document === 'undefined') return false;
  const hasCookie = document.cookie.split(';').some(c => c.trim().startsWith('admin_ui=1'));
  const hasSession = (() => {
    try { return sessionStorage.getItem('ks_admin') === '1'; } catch { return false; }
  })();
  return hasCookie || hasSession;
}

export default function Header({ isAdminInitial = false }: Props) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(isAdminInitial);

  // dropdown state
  const [offersOpen, setOffersOpen] = useState(false);
  const offersRef = useRef<HTMLDivElement | null>(null);

  // optional: refresh admin flag when window regains focus
  useEffect(() => {
    const check = () => { if (hasUiAdminFlag()) setIsAdmin(true); };
    window.addEventListener('focus', check);
    return () => window.removeEventListener('focus', check);
  }, []);

  // close dropdown on outside click / ESC
  useEffect(() => {
    function onDown(e: MouseEvent | PointerEvent) {
      if (!offersRef.current) return;
      if (!offersRef.current.contains(e.target as Node)) setOffersOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOffersOpen(false);
    }
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand">KickStart Academy</Link>

        <nav className="nav">
          {/* Public + Admin nav items (hide /trainings for public) */}
          {baseNav.map((item) => {
            if (item.href === '/trainings' && !isAdmin) return null; // hide for public

            const active =
              pathname === item.href ||
              (item.href === '/trainings' && pathname.startsWith('/trainings'));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${active ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            );
          })}

          {/* Offers dropdown (public visible) */}
          <div
            className="nav-item nav-item--group"
            ref={offersRef}
            onMouseEnter={() => setOffersOpen(true)}
            onMouseLeave={() => setOffersOpen(false)}
          >
            <button
              type="button"
              className={`nav-link nav-link--button ${offersOpen ? 'active' : ''}`}
              aria-haspopup="true"
              aria-expanded={offersOpen}
              onClick={() => setOffersOpen(o => !o)}
            >
              Angebote <span className="caret" aria-hidden="true">▾</span>
            </button>

            {offersOpen && (
              <div className="nav-dropdown" role="menu">
                <a
                  className="nav-dropdown__link nav-link"
                  role="menuitem"
                  href={`${WP_OFFERS_URL}?type=Camp`}
                  onClick={() => setOffersOpen(false)}
                >
                  Ferienangebote
                </a>
                <a
                  className="nav-dropdown__link nav-link"
                  role="menuitem"
                  href={`${WP_OFFERS_URL}?type=Foerdertraining`}
                  onClick={() => setOffersOpen(false)}
                >
                  Wochenkurse
                </a>
                <a
                  className="nav-dropdown__link nav-link"
                  role="menuitem"
                  href={`${WP_OFFERS_URL}?type=PersonalTraining`}
                  onClick={() => setOffersOpen(false)}
                >
                  Individualkurse
                </a>
              </div>
            )}
          </div>

          {/* Admin-only link: Buchungen */}
          {isAdmin && (
            <Link
              href="/admin/bookings"
              className={`nav-link ${pathname.startsWith('/admin') ? 'active' : ''}`}
            >
              Buchungen
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}






















