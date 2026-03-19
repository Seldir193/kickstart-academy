"use client";

import React from "react";

export default function Footer() {
  const year = new Date().getFullYear();

  // Portal-Legal (default)

  const IMPRINT_URL =
    process.env.NEXT_PUBLIC_LEGAL_IMPRINT_URL || "/admin/imprint";
  const PRIVACY_URL =
    process.env.NEXT_PUBLIC_LEGAL_PRIVACY_URL || "/admin/privacy";
  const TERMS_URL = process.env.NEXT_PUBLIC_LEGAL_TERMS_URL || "/admin/agb";

  const EMAIL =
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
    "info@dortmunder-fussballschule.de";
  const LOGO_SRC = process.env.NEXT_PUBLIC_MINI_LOGO || "/assets/img/logo.jpg";

  const CONTACT_URL =
    process.env.NEXT_PUBLIC_CONTACT_URL ||
    (process.env.NEXT_PUBLIC_WP_BASE_URL
      ? `${process.env.NEXT_PUBLIC_WP_BASE_URL.replace(/\/$/, "")}/?page_id=143`
      : "/kontakt"); // Fallback, falls du die Seite in Next hostest

  return (
    <footer className="site-footer site-footer--minimal" role="contentinfo">
      <div className="container footer-min">
        <div className="footer-min__left">
          {LOGO_SRC ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={LOGO_SRC}
              alt=""
              aria-hidden="true"
              className="footer-min__logo"
            />
          ) : null}
          <div className="footer-min__brand">
            <span className="footer-min__brand-name">
              Dortmunder Fussballschule
            </span>
            <span className="footer-min__copy">© {year}</span>
          </div>
        </div>

        <a className="footer-min__mail" href={`mailto:${EMAIL}`}>
          {EMAIL}
        </a>

        <nav className="footer-min__links" aria-label="Links">
          <a href={CONTACT_URL}>Kontakt</a>
          <a href={IMPRINT_URL}>Impressum</a>
          <a href={PRIVACY_URL}>Datenschutz</a>
          <a href={TERMS_URL}>AGB</a>
        </nav>
      </div>
    </footer>
  );
}
