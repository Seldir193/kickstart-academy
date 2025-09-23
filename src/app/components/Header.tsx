'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Props = { isAdminInitial?: boolean };

const WP_CONTACT_URL =
  process.env.NEXT_PUBLIC_WP_CONTACT_URL ||
  'http://localhost/wordpress/index.php/home/';


const adminNav = [
  { href: '/',                label: 'Home' },
  { href: '/orte',            label: 'Places' },
  { href: '/trainings',       label: 'Trainings' },
  { href: '/admin/invoices',  label: 'Rechnungen' },
  { href: '/customers',       label: 'Customers' },
  { href: '/admin/datev',     label: 'DATEV' }, // <- EINMAL hier
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

  useEffect(() => { setNavigatingTopLink(false); }, [pathname]);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand">KickStart Academy</Link>

        <nav className="nav">
          {isAdmin ? (
            <>
              {adminNav.map((item) => {
                if (item.label.toLowerCase() === 'programs') return null;

              const isRouteActive =
                  pathname === item.href ||
                  (item.href === '/trainings'      && pathname.startsWith('/trainings')) ||
                  (item.href === '/customers'      && pathname.startsWith('/customers')) ||
                  (item.href === '/orte'           && pathname.startsWith('/orte')) ||      // <- fehlendes ||
                  (item.href === '/admin/invoices' && pathname.startsWith('/admin/invoices')) ||
                  (item.href === '/admin/datev'    && pathname.startsWith('/admin/datev'));

                const addActive = !isLoggingOut && isRouteActive && !navigatingTopLink;

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

              {/* Admin-only: Bookings separat lassen, wenn gewünscht */}
              <Link
                href="/admin/bookings"
                className={`nav-link ${
                  !isLoggingOut && pathname.startsWith('/admin/bookings') && !navigatingTopLink ? 'active' : ''
                }`}
                onMouseDown={() => {
                  setNavigatingTopLink(true);
                  (document.activeElement as HTMLElement | null)?.blur?.();
                }}
              >
                Bookings
              </Link>

              <LogoutLink isLoggingOut={isLoggingOut} setIsLoggingOut={setIsLoggingOut} />
            </>
          ) : (
   
            <>
    <Link href="/trainings" className="nav-link">Trainings</Link>
    
    <a href={WP_CONTACT_URL} className="nav-link" rel="noopener">
      Contact
    </a>
  </>

            


          )}
        </nav>
      </div>
    </header>
  );
}












