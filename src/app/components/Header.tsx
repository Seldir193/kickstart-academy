'use client';

import React, { useEffect, useState } from 'react';
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
  { href: '/shop', label: 'Shop (demo)' },
];

const WP_OFFERS_URL =
  process.env.NEXT_PUBLIC_WP_OFFERS_URL ||
  'http://localhost/wordpress/index.php/angebote/';

/** Mega dropdown structure (column headings + items) */
const OFFER_GROUPS: Array<{
  heading: string;
  items: Array<
    | {
        label: string;
        type:
          | 'Camp'
          | 'Foerdertraining'
          | 'Kindergarten'
          | 'PersonalTraining'
          | 'AthleticTraining';
        extra?: Record<string, string>;
      }
    | { label: string; href: string }
  >;
}> = [
  {
    heading: 'Holiday Programs',
    items: [
      { label: 'Camps (Indoor/Outdoor)', type: 'Camp' },
      { label: 'Power Training', type: 'AthleticTraining' },
    ],
  },
  {
    heading: 'Weekly Courses',
    items: [
      { label: 'Soccer Kindergarten', type: 'Kindergarten' },
      { label: 'Development Training', type: 'Foerdertraining' },
    ],
  },
  {
    heading: 'Individual Courses',
    items: [
      { label: '1:1 Training', type: 'PersonalTraining' },
      { label: '1:1 Training Pro', type: 'PersonalTraining', extra: { variant: 'pro' } },
    ],
  },
  {
    heading: 'Club Programs',
    items: [
      { label: 'Rent-a-Coach', href: WP_OFFERS_URL },
      { label: 'Training Camps', href: WP_OFFERS_URL },
      { label: 'Coach Education', href: WP_OFFERS_URL },
    ],
  },
];

/** Helpers to build WP URLs with query params */
function appendParams(url: string, params: Record<string, string>) {
  const hasQuery = url.includes('?');
  const sep = hasQuery ? '&' : '?';
  const qs = new URLSearchParams(params).toString();
  return qs ? `${url}${sep}${qs}` : url;
}
function offersHref(base: string, type: string, extra?: Record<string, string>) {
  const params: Record<string, string> = { type };
  if (extra) Object.assign(params, extra);
  return appendParams(base, params);
}

function LogoutLink({
  isLoggingOut,
  setIsLoggingOut,
}: {
  isLoggingOut: boolean;
  setIsLoggingOut: (v: boolean) => void;
}) {
  async function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    setIsLoggingOut(true);
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
      });
    } catch {
      /* ignore */
    } finally {
      window.location.replace('/admin/login?next=/admin/bookings');
    }
  }
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

  const [offersOpen, setOffersOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // NEW: suppress active highlight while user navigates via a top nav link
  const [navigatingTopLink, setNavigatingTopLink] = useState(false);
  // already have navigatingFromMega from previous fix
  const [navigatingFromMega, setNavigatingFromMega] = useState(false);

  // Close mega on ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOffersOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Reset flags on real route change
  useEffect(() => {
    setOffersOpen(false);
    setNavigatingTopLink(false);
    setNavigatingFromMega(false);
  }, [pathname]);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand">KickStart Academy</Link>

        <nav className="nav">
          {/* Public + Admin nav items (hide /trainings for public) */}
          {baseNav.map((item) => {
            if (item.href === '/trainings' && !isAdmin) return null;

            const isRouteActive =
              pathname === item.href ||
              (item.href === '/trainings' && pathname.startsWith('/trainings'));

            // Suppress highlight while dropdown is open OR while a navigation was initiated
            const addActive =
              !isLoggingOut &&
              isRouteActive &&
              !offersOpen &&
              !navigatingFromMega &&
              !navigatingTopLink;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${addActive ? 'active' : ''}`}
                onMouseDown={() => {
                  // starting a top-nav navigation: suppress any active highlight flicker
                  setNavigatingTopLink(true);
                  // remove lingering focus on previous element
                  if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                  }
                }}
                onClick={() => {
                  setOffersOpen(false);
                }}
              >
                {item.label}
              </Link>
            );
          })}

          {/* Mega dropdown trigger */}
          <div className="nav-item nav-item--group">
            <button
              type="button"
              className={`nav-link nav-link--button ${offersOpen ? 'active' : ''}`}
              aria-haspopup="true"
              aria-expanded={offersOpen}
              onClick={(e) => {
                // clear lingering focus to avoid double “active” look
                if (
                  document.activeElement instanceof HTMLElement &&
                  document.activeElement !== e.currentTarget
                ) {
                  document.activeElement.blur();
                }
                setOffersOpen((o) => !o);
                setNavigatingTopLink(false);
                setNavigatingFromMega(false);
              }}
            >
              Programs <span className="caret" aria-hidden="true">▾</span>
            </button>

            {/* Backdrop + Panel */}
            <div className={`mega ${offersOpen ? 'is-open' : ''}`}>
              <div
                className="mega__backdrop"
                aria-hidden="true"
                onClick={() => {
                  setOffersOpen(false);
                  setNavigatingTopLink(false);
                  setNavigatingFromMega(false);
                }}
              />
              <div className="mega__panel" role="menu">
                <div className="mega__inner">
                  {OFFER_GROUPS.map((group) => (
                    <div key={group.heading} className="mega__col">
                      <div className="mega__heading">{group.heading}</div>
                      <ul className="mega__list">
                        {group.items.map((it) => {
                          const href =
                            'type' in it
                              ? offersHref(WP_OFFERS_URL, it.type, it.extra)
                              : it.href;
                          return (
                            <li key={it.label} className="mega__item">
                              <a
                                className="mega__link"
                                role="menuitem"
                                href={href}
                                // mark that navigation comes from mega dropdown
                                onMouseDown={() => setNavigatingFromMega(true)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') setNavigatingFromMega(true);
                                }}
                              >
                                {it.label}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Admin-only links: Bookings + Logout */}
          {isAdmin && (
            <>
              <Link
                href="/admin/bookings"
                className={`nav-link ${
                  !isLoggingOut &&
                  pathname.startsWith('/admin') &&
                  !offersOpen &&
                  !navigatingFromMega &&
                  !navigatingTopLink
                    ? 'active'
                    : ''
                }`}
                onMouseDown={() => {
                  setNavigatingTopLink(true);
                  if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                  }
                }}
                onClick={() => setOffersOpen(false)}
              >
                Bookings
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





