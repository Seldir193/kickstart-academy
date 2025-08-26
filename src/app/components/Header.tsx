






















'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const baseNav = [
  { href: '/', label: 'Home' },
  { href: '/trainings', label: 'Trainings' },
  { href: '/book', label: 'Book' },
  { href: '/shop', label: 'Shop (Demo)' },
];

const WP_OFFERS_URL =
  process.env.NEXT_PUBLIC_WP_OFFERS_URL ||
  'http://localhost/wordpress/index.php/angebote/';

function hasAdminCookie() {
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some(c => c.trim().startsWith('admin_token='));
}

export default function Header() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  // dropdown state
  const [offersOpen, setOffersOpen] = useState(false);
  const offersRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { setIsAdmin(hasAdminCookie()); }, []);

  // Close on outside click / ESC
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
          {/* regular nav items */}
          {baseNav.map((item) => {
            const active = pathname === item.href;
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

          {/* Angebote dropdown (links nebeneinander im Dropdown) */}
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
  <a className="nav-dropdown__link nav-link" role="menuitem" href={`${WP_OFFERS_URL}?type=Camp`}>
    Ferienangebote
  </a>
  <a className="nav-dropdown__link nav-link" role="menuitem" href={`${WP_OFFERS_URL}?type=Foerdertraining`}>
    Wochenkurse
  </a>
  <a className="nav-dropdown__link nav-link" role="menuitem" href={`${WP_OFFERS_URL}?type=PersonalTraining`}>
    Individualkurse
  </a>
</div>

            )}
          </div>

          {/* Admin link only with cookie */}
          {isAdmin && (
            <Link
              href="/admin/bookings"
              className={`nav-link ${pathname.startsWith('/admin') ? 'active' : ''}`}
            >
              Admin
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
