'use client';

import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();
  // per Env steuerbar: in PROD ausblenden, in DEV/Portfolio zeigen
  const showAdminLink = process.env.NEXT_PUBLIC_SHOW_ADMIN_LINK !== '0';

  return (
    <footer className="site-footer">
      <div className="container">
        <small>&copy; {year} KickStart Academy</small>

        {showAdminLink && (
          <small className="site-footer__admin">
            <Link href="/admin/login?next=/admin/bookings" rel="nofollow">
              Anbieter-Login
            </Link>
          </small>
        )}
      </div>
    </footer>
  );
}
