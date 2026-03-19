// "use client";

// import { useEffect, useMemo, useState } from "react";

// type Props = { token: string };

// type ApiOk = {
//   ok: true;
//   url: string;
//   sessionId?: string;
//   contractSignedAt?: string;
// };
// type ApiErr = { ok: false; code?: string; error?: string; message?: string };

// function safeText(v: unknown) {
//   return String(v ?? "").trim();
// }

// function isApiOk(v: any): v is ApiOk {
//   return v && v.ok === true && typeof v.url === "string" && v.url.trim() !== "";
// }

// function apiBaseUrl() {
//   const v = safeText(process.env.NEXT_PUBLIC_API_URL);
//   if (v) return v.replace(/\/+$/, "");
//   return "http://localhost:5000/api";
// }

// function websiteUrl() {
//   return (
//     safeText(process.env.NEXT_PUBLIC_PUBLIC_WEBSITE_URL) ||
//     "https://dortmunder-fussballschule.de"
//   );
// }

// function apiErrorMessage(payload: ApiErr) {
//   const code = safeText(payload?.code);
//   if (code === "TOKEN_EXPIRED")
//     return "Der Link ist abgelaufen. Bitte fordere einen neuen Link an.";
//   if (code === "TOKEN_NOT_FOUND")
//     return "Der Link ist ungültig. Bitte fordere einen neuen Link an.";
//   if (code === "SUBSCRIPTION_NOT_ALLOWED")
//     return "Du bist noch nicht zugelassen. Bitte warte auf die Freigabe.";
//   if (code === "NOT_A_SUBSCRIPTION_OFFER")
//     return "Dieser Link ist nicht für ein Abo gültig.";
//   if (code === "SUBSCRIPTION_ALREADY_CREATED")
//     return "Das Abo wurde bereits gestartet. Bitte prüfe deine E-Mails oder kontaktiere den Support.";
//   if (code) return `Fehler: ${code}`;
//   return (
//     safeText(payload?.error) ||
//     safeText(payload?.message) ||
//     "Unbekannter Fehler."
//   );
// }

// export default function StartClient({ token }: Props) {
//   const [status, setStatus] = useState<"loading" | "error">("loading");
//   const [errorText, setErrorText] = useState("");

//   const canStart = useMemo(() => safeText(token).length > 10, [token]);

//   useEffect(() => {
//     let alive = true;

//     async function run() {
//       if (!canStart) {
//         setStatus("error");
//         setErrorText("Token fehlt oder ist ungültig.");
//         return;
//       }

//       try {
//         const base = apiBaseUrl();
//         const res = await fetch(
//           `${base}/public/weekly/contract-sign-and-checkout`,
//           {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               token,
//               returnTo: `${window.location.origin}/book/success`,
//             }),
//           },
//         );

//         const data = (await res.json().catch(() => null)) as
//           | ApiOk
//           | ApiErr
//           | null;
//         if (!alive) return;

//         if (data && isApiOk(data)) {
//           window.location.replace(data.url);
//           return;
//         }

//         const errPayload: ApiErr =
//           data && typeof data === "object"
//             ? (data as ApiErr)
//             : { ok: false, code: res.ok ? "SERVER" : String(res.status) };

//         setStatus("error");
//         setErrorText(apiErrorMessage(errPayload));
//       } catch {
//         if (!alive) return;
//         setStatus("error");
//         setErrorText("Netzwerkfehler. Bitte versuche es erneut.");
//       }
//     }

//     run();
//     return () => {
//       alive = false;
//     };
//   }, [token, canStart]);

//   return (
//     <main className="weekly-start-page">
//       <section className="weekly-start-card">
//         {status === "loading" ? (
//           <div className="weekly-start-loadingRow">
//             <span className="weekly-start-spinner" aria-hidden="true" />
//             <span className="weekly-start-loadingText">
//               Weiterleitung zu Stripe…
//             </span>
//           </div>
//         ) : (
//           <div className="weekly-start-errorBox">
//             <p className="weekly-start-errorText">{errorText}</p>

//             <div className="weekly-start-actions">
//               <a className="weekly-start-primaryBtn" href={websiteUrl()}>
//                 Zur Website
//               </a>

//               <a
//                 className="weekly-start-secondaryBtn"
//                 href={`mailto:${encodeURIComponent("fussballschule@selcuk-kocyigit.de")}?subject=${encodeURIComponent(
//                   "Abo-Link ungültig/abgelaufen",
//                 )}`}
//               >
//                 Support kontaktieren
//               </a>
//             </div>
//           </div>
//         )}
//       </section>
//     </main>
//   );
// }
