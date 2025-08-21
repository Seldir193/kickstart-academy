
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const baseNav = [
  { href: '/', label: 'Home' },
  { href: '/trainings', label: 'Trainings' },
  { href: '/book', label: 'Book' },
  { href: '/shop', label: 'Shop (Demo)' },
];

function hasAdminCookie() {
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some(c => c.trim().startsWith('admin_token='));
}

export default function Header() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => { setIsAdmin(hasAdminCookie()); }, []);


  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand">KickStart Academy</Link>
        <nav className="nav">
          {baseNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`nav-link ${active ? 'active' : ''}`}>
                {item.label}
              </Link>
            );
          })}


          {/* Nur zeigen, wenn Admin-Cookie existiert */}
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



