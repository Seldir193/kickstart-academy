//src\app\pay\PayClient.tsx
"use client";

import { useEffect, useState } from "react";

type Props = { bookingId: string };

export default function PayClient({ bookingId }: Props) {
  const [err, setErr] = useState("");

  useEffect(() => {
    let live = true;

    async function run() {
      console.log("[PayClient] mounted", {
        bookingId,
        href: window.location.href,
        referrer: document.referrer,
        time: new Date().toISOString(),
      });

      if (!bookingId) {
        console.log("[PayClient] missing bookingId", {
          bookingId,
          href: window.location.href,
        });
        setErr("Missing bookingId.");
        return;
      }

      const requestBody = { bookingId };

      console.log("[PayClient] before fetch /api/public/pay", {
        requestBody,
        href: window.location.href,
        referrer: document.referrer,
      });

      const r = await fetch("/api/public/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      console.log("[PayClient] fetch completed", {
        ok: r.ok,
        status: r.status,
        statusText: r.statusText,
        url: r.url,
        redirected: r.redirected,
        type: r.type,
      });

      const d = await r.json().catch((jsonError) => {
        console.log("[PayClient] json parse failed", {
          jsonError:
            jsonError instanceof Error ? jsonError.message : String(jsonError),
        });
        return null;
      });

      console.log("[PayClient] response json", d);

      if (!live) {
        console.log(
          "[PayClient] aborted because component is not live anymore",
        );
        return;
      }

      if (!r.ok || !d?.ok || !d?.url) {
        const nextError = d?.error || d?.code || "Checkout failed.";

        console.log("[PayClient] stopping before redirect", {
          reason: nextError,
          ok: r.ok,
          response: d,
        });

        setErr(nextError);
        return;
      }

      console.log("[PayClient] redirecting to stripe", {
        redirectUrl: String(d.url),
        bookingId,
      });

      window.location.href = String(d.url);
    }

    run().catch((e) => {
      const nextError = e instanceof Error ? e.message : "Checkout failed.";

      console.log("[PayClient] run failed", {
        error: nextError,
        raw: e,
      });

      setErr(nextError);
    });

    return () => {
      live = false;
      console.log("[PayClient] unmounted", {
        bookingId,
        href: window.location.href,
      });
    };
  }, [bookingId]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <h1 className="text-xl font-bold mb-2">Zahlung wird vorbereitet…</h1>
        <p className="opacity-80 mb-4">
          Bitte nicht schließen. Du wirst gleich zu Stripe weitergeleitet.
        </p>
        {err ? (
          <div className="p-3 rounded-lg border border-red-300 text-red-700">
            {err}
          </div>
        ) : null}
      </div>
    </div>
  );
}

// //src\app\pay\PayClient.tsx
// "use client";

// import { useEffect, useState } from "react";

// type Props = { bookingId: string };

// export default function PayClient({ bookingId }: Props) {
//   const [err, setErr] = useState("");

//   useEffect(() => {
//     let live = true;

//     async function run() {
//       if (!bookingId) {
//         setErr("Missing bookingId.");
//         return;
//       }

//       const r = await fetch("/api/public/pay", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ bookingId }),
//       });

//       const d = await r.json().catch(() => null);

//       if (!live) return;

//       if (!r.ok || !d?.ok || !d?.url) {
//         setErr(d?.error || d?.code || "Checkout failed.");
//         return;
//       }

//       window.location.href = String(d.url);
//     }

//     run().catch((e) => setErr(e?.message || "Checkout failed."));
//     return () => {
//       live = false;
//     };
//   }, [bookingId]);

//   return (
//     <div className="min-h-[60vh] flex items-center justify-center p-6">
//       <div className="max-w-md w-full">
//         <h1 className="text-xl font-bold mb-2">Zahlung wird vorbereitet…</h1>
//         <p className="opacity-80 mb-4">
//           Bitte nicht schließen. Du wirst gleich zu Stripe weitergeleitet.
//         </p>
//         {err ? (
//           <div className="p-3 rounded-lg border border-red-300 text-red-700">
//             {err}
//           </div>
//         ) : null}
//       </div>
//     </div>
//   );
// }
