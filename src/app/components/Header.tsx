


'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Props = {
  /** Server truth from HeaderServer (reads HttpOnly admin cookie) */
  isAdminInitial?: boolean;
};

/** Public contact page (WordPress) */
const WP_CONTACT_URL =
  process.env.NEXT_PUBLIC_WP_CONTACT_URL ||
  'http://localhost/wordpress/index.php/home/';

const adminNav = [
  { href: '/', label: 'Home' },
  { href: '/trainings', label: 'Trainings' },
  { href: '/admin/invoices', label: 'Rechnungen' }, 
  { href: '/customers', label: 'Customers' },
  { href: '/shop', label: 'Shop (demo)' },
  //{ href: '/admin/bookings', label: 'Bookings' },
];

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
  return (
    <Link
      href="/admin/logout"
      className={`nav-link ${isLoggingOut ? 'active' : ''}`}
      onClick={handleClick}
      onMouseDown={() => setIsLoggingOut(true)}
      onTouchStart={() => setIsLoggingOut(true)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') setIsLoggingOut(true);
      }}
    >
      Logout
    </Link>
  );
}

export default function Header({ isAdminInitial = false }: Props) {
  const pathname = usePathname();
  const isAdmin = isAdminInitial;

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [navigatingTopLink, setNavigatingTopLink] = useState(false);

  // Reset highlight flags on route change
  useEffect(() => {
    setNavigatingTopLink(false);
  }, [pathname]);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand">KickStart Academy</Link>

        <nav className="nav">
          {isAdmin ? (
            <>
              {adminNav.map((item) => {
                // hide Programs mega-menu entirely for admin (requirement)
                if (item.label.toLowerCase() === 'programs') return null;

                const isRouteActive =
                  pathname === item.href ||
                  (item.href === '/trainings' && pathname.startsWith('/trainings')) ||
                  (item.href === '/customers' && pathname.startsWith('/customers'));

                const addActive =
                  !isLoggingOut && isRouteActive && !navigatingTopLink;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-link ${addActive ? 'active' : ''}`}
                    onMouseDown={() => {
                      setNavigatingTopLink(true);
                      if (document.activeElement instanceof HTMLElement) {
                        document.activeElement.blur();
                      }
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {/* Admin-only link: Bookings */}
              <Link
                href="/admin/bookings"
                className={`nav-link ${
                  !isLoggingOut &&
                  pathname.startsWith('/admin') &&
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
              >
                Bookings
              </Link>

              <LogoutLink
                isLoggingOut={isLoggingOut}
                setIsLoggingOut={setIsLoggingOut}
              />
            </>
          ) : (
            // PUBLIC (logged out): only one Contact link. No Home/Shop/Programs
            

            <a
              href={WP_CONTACT_URL}
              className="nav-link active"
              rel="noopener"
            >
              Contact
            </a>

           


          )}
        </nav>
      </div>
    </header>
  );
}











