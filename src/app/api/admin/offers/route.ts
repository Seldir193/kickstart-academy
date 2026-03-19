import { NextResponse } from "next/server";
import { getProviderIdFromCookies } from "@/app/api/lib/auth";

function apiBase() {
  const b = process.env.NEXT_BACKEND_API_BASE || "http://127.0.0.1:5000/api";
  return b.replace(/\/+$/, "");
}

function sanitizeOfferBody(body: any) {
  const next = body && typeof body === "object" ? { ...body } : {};
  const category = String(next.category || "").trim();
  const subType = String(next.sub_type || "").trim();
  const type = String(next.type || "").trim();

  const isPowertraining =
    category === "Holiday" &&
    (subType === "Powertraining" || type === "AthleticTraining");

  if (isPowertraining) next.days = [];
  return next;
}

export async function GET(req: Request) {
  const pid = await getProviderIdFromCookies();
  if (!pid) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const qs = new URL(req.url).search;
  const r = await fetch(`${apiBase()}/offers${qs}`, {
    headers: { "X-Provider-Id": pid },
    cache: "no-store",
  });

  const text = await r.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    data = { ok: false, raw: text };
  }
  return NextResponse.json(data, { status: r.status });
}

export async function POST(req: Request) {
  const pid = await getProviderIdFromCookies();
  if (!pid) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const rawBody = await req.json().catch(() => ({}));
  const body = sanitizeOfferBody(rawBody);

  const r = await fetch(`${apiBase()}/offers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Provider-Id": pid,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const text = await r.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    data = { ok: false, raw: text };
  }
  return NextResponse.json(data, { status: r.status });
}

// //src\app\api\admin\offers\route.ts

// import { NextResponse } from "next/server";
// import { getProviderIdFromCookies } from "@/app/api/lib/auth"; // <— Alias empfohlen

// function apiBase() {
//   const b = process.env.NEXT_BACKEND_API_BASE || "http://127.0.0.1:5000/api";
//   return b.replace(/\/+$/, "");
// }

// // Liste mit Provider-Scope
// export async function GET(req: Request) {
//   const pid = await getProviderIdFromCookies();
//   if (!pid)
//     return NextResponse.json(
//       { ok: false, error: "Unauthorized" },
//       { status: 401 },
//     );

//   const qs = new URL(req.url).search;
//   const r = await fetch(`${apiBase()}/offers${qs}`, {
//     headers: { "X-Provider-Id": pid },
//     cache: "no-store",
//   });

//   const text = await r.text();
//   let data: any;
//   try {
//     data = JSON.parse(text);
//   } catch {
//     data = { ok: false, raw: text };
//   }
//   return NextResponse.json(data, { status: r.status });
// }

// // Erstellen (Owner kommt aus X-Provider-Id)
// export async function POST(req: Request) {
//   const pid = await getProviderIdFromCookies();
//   if (!pid)
//     return NextResponse.json(
//       { ok: false, error: "Unauthorized" },
//       { status: 401 },
//     );

//   const body = await req.json().catch(() => ({}));
//   const r = await fetch(`${apiBase()}/offers`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "X-Provider-Id": pid,
//     },
//     body: JSON.stringify(body),
//     cache: "no-store",
//   });

//   const text = await r.text();
//   let data: any;
//   try {
//     data = JSON.parse(text);
//   } catch {
//     data = { ok: false, raw: text };
//   }
//   return NextResponse.json(data, { status: r.status });
// }
