// app/components/header.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

import RevenueDialog from './RevenueDialog';



const ProfileButton = dynamic(() => import('./ProfileButton'), { ssr: false });



type Props = {
  isAdminInitial?: boolean;
  userInitial?: { id?: string; email?: string };
};

const WP_CONTACT_URL =
  process.env.NEXT_PUBLIC_WP_CONTACT_URL ||
  'http://localhost/wordpress/index.php/home/';

const adminNav = [
  { href: '/',               label: 'Home' },
  { href: '/orte',           label: 'Places' },
  { href: '/trainings',      label: 'Trainings' },
  { href: '/admin/coaches',  label: 'Coaches' }, 
  { href: '/admin/invoices', label: 'Rechnungen' },
  { href: '/customers',      label: 'Customers' },
  { href: '/admin/datev',    label: 'DATEV' },
   { href: '/admin/news',     label: 'News' },
  { href: '/admin/revenue',  label: 'Umsatz' }, 
];

export default function Header({ isAdminInitial = false }: Props) {
  const pathname = usePathname();
  const isAdmin = isAdminInitial;

  const [isLoggingOut] = useState(false); // bleibt für active-Logik bestehen
  const [navigatingTopLink, setNavigatingTopLink] = useState(false);

  useEffect(() => { setNavigatingTopLink(false); }, [pathname]);

  return (
    <header className="site-header">
      <div className="container header-inner">
       

   {/* Brand: Logo statt Text */}
        <Link href="/" className="brand" aria-label="Startseite">
          {/* aus /public/assets/img/logo.jpg */}
          <img
            src="/assets/img/logo.jpg"
            alt="Dortmunder Fussballschule"
          
          />
        </Link>



        <nav className="nav nav--row">
          {isAdmin ? (
            <>
              <div className="nav__links">
                {adminNav.map((item) => {
                  if (item.label.toLowerCase() === 'programs') return null;

                  const isRouteActive =
                    pathname === item.href ||
                    (item.href === '/trainings'      && pathname.startsWith('/trainings')) ||
                    (item.href === '/customers'      && pathname.startsWith('/customers')) ||
                    (item.href === '/orte'           && pathname.startsWith('/orte')) ||
                    (item.href === '/admin/invoices' && pathname.startsWith('/admin/invoices')) ||
                    (item.href === '/admin/datev'    && pathname.startsWith('/admin/datev'));
                    (item.href === '/admin/news'     && pathname.startsWith('/admin/news'));
                     (item.href === '/admin/coaches'  && pathname.startsWith('/admin/coaches')); 

                  const addActive = !isLoggingOut && isRouteActive && !navigatingTopLink;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`nav-link ${addActive ? 'active' : ''}`}
                      onMouseDown={() => {
                        setNavigatingTopLink(true);
                        (document.activeElement as HTMLElement | null)?.blur?.();
                      }}
                    >
                      {item.label}
                    </Link>
                  );
                })}

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
               

              </div>

              <div className="nav__spacer" />

              <div className="header__actions">
                <ProfileButton />
                


              </div>
            </>
          ) : (
            <>
              <Link href="/trainings" className="nav-link">Trainings</Link>
              <Link href="/coaches" className="nav-link">Coaches</Link> {/* optional */}
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















