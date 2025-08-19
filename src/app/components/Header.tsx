'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  { href: '/', label: 'Home' },
  { href: '/trainings', label: 'Trainings' },
  { href: '/book', label: 'Book' },
  { href: '/shop', label: 'Shop (Demo)' },
   { href: '/admin/bookings', label: 'Admin (temp)' },
];


export default function Header() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand">
          KickStart Academy
        </Link>

        <nav className="nav">
          {nav.map((item) => {
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
        </nav>
      </div>
    </header>
  );
}
