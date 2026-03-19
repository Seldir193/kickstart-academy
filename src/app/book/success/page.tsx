// src/app/book/success/page.tsx
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
// "use client";

// import Link from "next/link";
// import { useSearchParams } from "next/navigation";

// export default function BookSuccessPage() {
//   const params = useSearchParams();
//   const sessionId = params.get("session_id") || "";

//   return (
//     <main className="book-status-page">
//       <section className="book-status-card">
//         <h1>Zahlung erfolgreich</h1>
//         <p>
//           Vielen Dank. Deine Buchung/Zahlung wurde erfolgreich gestartet bzw.
//           bestätigt.
//         </p>

//         {sessionId ? (
//           <p>
//             <strong>Stripe Session:</strong> {sessionId}
//           </p>
//         ) : null}

//         <p>
//           Du erhältst eine Bestätigung per E-Mail. Falls es sich um eine
//           Ferien-/Powertraining-Buchung handelt, wird die Rechnung nach
//           erfolgreicher Zahlungsbestätigung erstellt.
//         </p>

//         <div className="book-status-actions">
//           <Link href="/book">Neue Buchung</Link>
//           <Link href="/">Zur Startseite</Link>
//         </div>
//       </section>
//     </main>
//   );
// }
