"use client";

import Link from "next/link";

function websiteUrl() {
  return (
    process.env.NEXT_PUBLIC_PUBLIC_WEBSITE_URL ||
    "https://dortmunder-fussballschule.de"
  );
}

export default function BookSuccessPage() {
  return (
    <main className="book-status-page">
      <section className="book-status-card">
        <h1 className="book-status-title">Zahlung erfolgreich</h1>
        <p className="book-status-text">
          Vielen Dank. Deine Zahlung war erfolgreich und die Buchung ist
          bestätigt.
        </p>
        <p className="book-status-text">
          Du erhältst eine Bestätigung per E-Mail.
        </p>

        <div className="book-status-actions">
          <Link className="book-status-primary" href={websiteUrl()}>
            Zur Website
          </Link>
        </div>
      </section>
    </main>
  );
}
