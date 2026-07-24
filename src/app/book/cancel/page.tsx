"use client";

import Link from "next/link";

function websiteUrl() {
  return (
    process.env.NEXT_PUBLIC_PUBLIC_WEBSITE_URL ||
    "https://dortmunder-fussballschule.de"
  );
}

export default function BookCancelPage() {
  return (
    <main className="book-status-page">
      <section className="book-status-card">
        <h1 className="book-status-title">Zahlung abgebrochen</h1>
        <p className="book-status-text">
          Die Zahlung wurde abgebrochen. Es wurde noch nichts bezahlt.
        </p>
        <p className="book-status-text">
          Du kannst es später erneut versuchen.
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
