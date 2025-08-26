'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Props = {
  /** Server truth from HeaderServer (reads HttpOnly admin cookie) */
  isAdminInitial?: boolean;
};

const baseNav = [
  { href: '/', label: 'Home' },
  // 'Trainings' is rendered only for admins (hidden for public)
  { href: '/trainings', label: 'Trainings' },
  { href: '/book', label: 'Book' },
  { href: '/shop', label: 'Shop (Demo)' },
];

const WP_OFFERS_URL =
  process.env.NEXT_PUBLIC_WP_OFFERS_URL ||
  'http://localhost/wordpress/index.php/angebote/';












function LogoutLink({
  isLoggingOut,
  setIsLoggingOut,
}: {
  isLoggingOut: boolean;
  setIsLoggingOut: (v: boolean) => void;
}) {
  async function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    // falls aus irgendeinem Grund noch nicht gesetzt
    setIsLoggingOut(true);

    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
      });
    } catch {
      // ignore
    } finally {
      window.location.replace('/admin/login?next=/admin/bookings');
    }
  }

  // WICHTIG: sofort beim Pressen aktiv schalten, damit "Buchungen" die active-Klasse verliert
  function handleMouseDown() { setIsLoggingOut(true); }
  function handleTouchStart() { setIsLoggingOut(true); }
  function handleKeyDown(e: React.KeyboardEvent<HTMLAnchorElement>) {
    if (e.key === 'Enter' || e.key === ' ') setIsLoggingOut(true);
  }

  return (
    <Link
      href="/admin/logout"
      className={`nav-link ${isLoggingOut ? 'active' : ''}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
    >
      Logout
    </Link>
  );
}








export default function Header({ isAdminInitial = false }: Props) {
  const pathname = usePathname();
  const isAdmin = isAdminInitial;

  // Dropdown state
  const [offersOpen, setOffersOpen] = useState(false);
  const offersRef = useRef<HTMLDivElement | null>(null);

  // Logout state: while true, only Logout shows 'active'
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Close dropdown on outside click / ESC
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
          {/* Public + Admin nav items (hide /trainings for public).
              While logging out, suppress 'active' on everything else. */}
          {baseNav.map((item) => {
            if (item.href === '/trainings' && !isAdmin) return null;

            const isRouteActive =
              pathname === item.href ||
              (item.href === '/trainings' && pathname.startsWith('/trainings'));

            const addActive = !isLoggingOut && isRouteActive;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${addActive ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            );
          })}

          {/* Offers dropdown (visible for everyone) */}
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
              onClick={() => setOffersOpen((o) => !o)}
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

          {/* Admin-only links: Buchungen + Logout */}
          {isAdmin && (
            <>
              <Link
                href="/admin/bookings"
                className={`nav-link ${
                  !isLoggingOut && pathname.startsWith('/admin') ? 'active' : ''
                }`}
              >
                Buchungen
              </Link>
              <LogoutLink
                isLoggingOut={isLoggingOut}
                setIsLoggingOut={setIsLoggingOut}
              />
            </>
          )}
        </nav>
      </div>
    </header>
  );
}





















