// app/api/admin/online-bookings/route.ts

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

function safeText(v: unknown): string {
  return String(v ?? "").trim();
}

function bookingProgramText(b: any): string {
  return [
    b.offerType,
    b.offerTitle,
    b.level,
    b.program,
    b.message,
    b.meta?.holidayType,
    b.meta?.holidayLabel,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function holidayTypeOf(b: any): string {
  return safeText(b?.meta?.holidayType).toLowerCase();
}

function offerText(b: any): string {
  return [b?.offerType, b?.offerTitle].filter(Boolean).join(" ").toLowerCase();
}

// function isExcludedNonHolidayBooking(b: any): boolean {
//   const text = offerText(b);
//   return (
//     text.includes("clubprogram") ||
//     text.includes("rentacoach") ||
//     text.includes("coacheducation") ||
//     text.includes("coach education")
//   );
// }

// function isExcludedNonHolidayBooking(b: any): boolean {
//   const text = offerText(b);
//   return (
//     text.includes("clubprogram") ||
//     text.includes("rentacoach") ||
//     text.includes("coacheducation") ||
//     text.includes("coach education") ||
//     text.includes("kindergarten") ||
//     text.includes("foerdertraining") ||
//     text.includes("fördertraining") ||
//     text.includes("foerdertraining_athletik") ||
//     text.includes("fördertraining_athletik") ||
//     text.includes("torwarttraining")
//   );
// }

function isExcludedNonHolidayBooking(b: any): boolean {
  const text = offerText(b);
  return (
    text.includes("clubprogram") ||
    text.includes("rentacoach") ||
    text.includes("coacheducation") ||
    text.includes("coach education") ||
    text.includes("personaltraining") ||
    text.includes("einzeltraining_torwart") ||
    text.includes("einzeltraining_athletik") ||
    text.includes("kindergarten") ||
    text.includes("foerdertraining") ||
    text.includes("fördertraining") ||
    text.includes("foerdertraining_athletik") ||
    text.includes("fördertraining_athletik") ||
    text.includes("torwarttraining")
  );
}

function isHolidaySource(b: any): boolean {
  const source = safeText(b?.source).toLowerCase();
  return source === "online_request" || source === "admin_booking";
}

function isHolidayBooking(b: any): boolean {
  if (!b || !isHolidaySource(b)) return false;
  if (isExcludedNonHolidayBooking(b)) return false;

  const holidayType = holidayTypeOf(b);
  if (
    holidayType === "camp" ||
    holidayType === "powertraining" ||
    holidayType === "holiday"
  ) {
    return true;
  }

  const text = bookingProgramText(b);
  return (
    text.includes("camp") ||
    text.includes("feriencamp") ||
    text.includes("holiday") ||
    text.includes("powertraining") ||
    text.includes("power training")
  );
}

function isCampBooking(b: any): boolean {
  if (isExcludedNonHolidayBooking(b)) return false;

  const holidayType = holidayTypeOf(b);
  if (holidayType === "camp") return true;
  if (holidayType === "powertraining") return false;

  const txt = bookingProgramText(b);
  const hasCamp =
    txt.includes("camp") ||
    txt.includes("feriencamp") ||
    txt.includes("holiday camp");

  const hasPower =
    txt.includes("powertraining") || txt.includes("power training");

  return hasCamp && !hasPower;
}

function isPowerBooking(b: any): boolean {
  if (isExcludedNonHolidayBooking(b)) return false;

  const holidayType = holidayTypeOf(b);
  if (holidayType === "powertraining") return true;
  if (holidayType === "camp") return false;

  const txt = bookingProgramText(b);
  return txt.includes("powertraining") || txt.includes("power training");
}

function tsOf(v: unknown): number {
  const t = new Date(String(v ?? "")).getTime();
  return Number.isFinite(t) ? t : 0;
}

function nameKey(b: any): string {
  return `${safeText(b?.firstName)} ${safeText(b?.lastName)}`
    .trim()
    .toLowerCase();
}

function sortBookings(items: any[], sort: string): any[] {
  const list = [...items];

  if (sort === "oldest") {
    return list.sort((a, b) => tsOf(a?.createdAt) - tsOf(b?.createdAt));
  }

  if (sort === "name_asc") {
    return list.sort((a, b) =>
      nameKey(a).localeCompare(nameKey(b), "de", {
        sensitivity: "base",
      }),
    );
  }

  if (sort === "name_desc") {
    return list.sort((a, b) =>
      nameKey(b).localeCompare(nameKey(a), "de", {
        sensitivity: "base",
      }),
    );
  }

  return list.sort((a, b) => tsOf(b?.createdAt) - tsOf(a?.createdAt));
}

function isVisibleOnlineStatus(b: any): boolean {
  const status = safeText(b?.status).toLowerCase();
  return (
    status === "confirmed" || status === "cancelled" || status === "deleted"
  );
}

export async function GET(req: NextRequest) {
  try {
    const reqUrl = new URL(req.url);
    const origin = reqUrl.origin;
    const search = reqUrl.searchParams;

    const pageRaw = parseInt(search.get("page") || "1", 10);
    const limitRaw = parseInt(search.get("limit") || "10", 10);
    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : 10;

    const status = safeText(search.get("status") || "all").toLowerCase();
    const program = safeText(search.get("program") || "all").toLowerCase();
    const sort = safeText(search.get("sort") || "newest").toLowerCase();

    const upstreamUrl = new URL(`${origin}/api/admin/bookings`);

    search.forEach((value, key) => {
      if (
        key === "page" ||
        key === "limit" ||
        key === "includeHoliday" ||
        key === "status" ||
        key === "program" ||
        key === "sort"
      ) {
        return;
      }
      upstreamUrl.searchParams.set(key, value);
    });

    upstreamUrl.searchParams.set("includeHoliday", "1");
    upstreamUrl.searchParams.set("page", "1");
    upstreamUrl.searchParams.set("limit", "10000");

    const upstream = await fetch(upstreamUrl.toString(), {
      method: "GET",
      headers: {
        cookie: req.headers.get("cookie") ?? "",
        accept: "application/json",
      },
      cache: "no-store",
    });

    const text = await upstream.text();
    let data: any;

    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (!upstream.ok) {
      return NextResponse.json(
        {
          ok: false,
          error:
            data?.error ||
            `Upstream /api/admin/bookings failed (${upstream.status})`,
        },
        { status: upstream.status },
      );
    }

    const list: any[] = Array.isArray(data)
      ? data
      : Array.isArray(data.bookings)
        ? data.bookings
        : Array.isArray(data.items)
          ? data.items
          : [];

    const holiday = list.filter(isHolidayBooking);

    let programFiltered = holiday;
    if (program === "camp") {
      programFiltered = holiday.filter(isCampBooking);
    } else if (program === "power") {
      programFiltered = holiday.filter(isPowerBooking);
    }

    const visibleList = programFiltered.filter(isVisibleOnlineStatus);

    const statusCounts: Record<string, number> = {
      confirmed: 0,
      cancelled: 0,
      deleted: 0,
    };

    for (const b of visibleList) {
      const s = safeText(b.status).toLowerCase();
      if (s in statusCounts) statusCounts[s] += 1;
    }

    let finalList = visibleList;
    if (status !== "all") {
      const normalized = status === "canceled" ? "cancelled" : status;
      finalList = visibleList.filter(
        (b) => safeText(b.status).toLowerCase() === normalized,
      );
    }

    const sortedList = sortBookings(finalList, sort);
    const total = sortedList.length;
    const pages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, pages);
    const start = (safePage - 1) * limit;
    const end = start + limit;
    const pageItems = sortedList.slice(start, end);

    return NextResponse.json(
      {
        ok: true,
        bookings: pageItems,
        total,
        page: safePage,
        pages,
        limit,
        counts: statusCounts,
      },
      { status: 200 },
    );
  } catch (err: any) {
    console.error(
      "[GET /api/admin/online-bookings] error:",
      err?.message || err,
    );

    return NextResponse.json(
      {
        ok: false,
        error: "Server error in /api/admin/online-bookings",
        detail: String(err?.message ?? err),
      },
      { status: 500 },
    );
  }
}
// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// import { NextRequest, NextResponse } from "next/server";

// function bookingProgramText(b: any): string {
//   return [b.offerType, b.offerTitle, b.level, b.program, b.message]
//     .filter(Boolean)
//     .join(" ")
//     .toLowerCase();
// }

// function isHolidaySource(b: any): boolean {
//   if (!b) return false;
//   const source = String(b.source || "")
//     .trim()
//     .toLowerCase();
//   return source === "online_request" || source === "admin_booking";
// }

// function isHolidayBooking(b: any): boolean {
//   if (!b) return false;
//   if (!isHolidaySource(b)) return false;

//   const text = bookingProgramText(b);
//   if (!text) return false;

//   const holidayKeywords = [
//     "camp",
//     "feriencamp",
//     "holiday",
//     "powertraining",
//     "power training",
//   ];

//   return holidayKeywords.some((kw) => text.includes(kw));
// }

// function isCampBooking(b: any): boolean {
//   const txt = bookingProgramText(b);
//   if (!txt) return false;

//   const hasCamp =
//     txt.includes("camp") ||
//     txt.includes("feriencamp") ||
//     txt.includes("holiday camp");

//   const hasPower =
//     txt.includes("powertraining") || txt.includes("power training");

//   return hasCamp && !hasPower;
// }

// function isPowerBooking(b: any): boolean {
//   const txt = bookingProgramText(b);
//   if (!txt) return false;

//   return txt.includes("powertraining") || txt.includes("power training");
// }

// export async function GET(req: NextRequest) {
//   try {
//     const reqUrl = new URL(req.url);
//     const origin = reqUrl.origin;
//     const search = reqUrl.searchParams;

//     const pageRaw = parseInt(search.get("page") || "1", 10);
//     const limitRaw = parseInt(search.get("limit") || "10", 10);
//     const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
//     const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : 10;

//     const status = (search.get("status") || "all").toLowerCase();
//     const program = (search.get("program") || "all").toLowerCase();

//     const upstreamUrl = new URL(`${origin}/api/admin/bookings`);

//     search.forEach((value, key) => {
//       if (
//         key === "page" ||
//         key === "limit" ||
//         key === "includeHoliday" ||
//         key === "status" ||
//         key === "program"
//       ) {
//         return;
//       }
//       upstreamUrl.searchParams.set(key, value);
//     });

//     upstreamUrl.searchParams.set("includeHoliday", "1");
//     upstreamUrl.searchParams.set("page", "1");
//     upstreamUrl.searchParams.set("limit", "10000");

//     const upstream = await fetch(upstreamUrl.toString(), {
//       method: "GET",
//       headers: {
//         cookie: req.headers.get("cookie") ?? "",
//         accept: "application/json",
//       },
//       cache: "no-store",
//     });

//     const text = await upstream.text();
//     let data: any;

//     try {
//       data = JSON.parse(text);
//     } catch {
//       data = text;
//     }

//     if (!upstream.ok) {
//       return NextResponse.json(
//         {
//           ok: false,
//           error:
//             data?.error ||
//             `Upstream /api/admin/bookings failed (${upstream.status})`,
//         },
//         { status: upstream.status },
//       );
//     }

//     const list: any[] = Array.isArray(data)
//       ? data
//       : Array.isArray(data.bookings)
//         ? data.bookings
//         : Array.isArray(data.items)
//           ? data.items
//           : [];

//     const holiday = list.filter(isHolidayBooking);

//     let programFiltered = holiday;
//     if (program === "camp") {
//       programFiltered = holiday.filter(isCampBooking);
//     } else if (program === "power") {
//       programFiltered = holiday.filter(isPowerBooking);
//     }

//     const statusCounts: Record<string, number> = {
//       confirmed: 0,
//       cancelled: 0,
//       deleted: 0,
//     };

//     for (const b of programFiltered) {
//       const s = String(b.status || "").toLowerCase();
//       if (s in statusCounts) statusCounts[s] += 1;
//     }

//     let finalList = programFiltered;
//     if (status !== "all") {
//       const normalized = status === "canceled" ? "cancelled" : status;
//       finalList = programFiltered.filter(
//         (b) => String(b.status || "").toLowerCase() === normalized,
//       );
//     }

//     const total = finalList.length;
//     const pages = Math.max(1, Math.ceil(total / limit));
//     const safePage = Math.min(page, pages);
//     const start = (safePage - 1) * limit;
//     const end = start + limit;
//     const pageItems = finalList.slice(start, end);

//     return NextResponse.json(
//       {
//         ok: true,
//         bookings: pageItems,
//         total,
//         page: safePage,
//         pages,
//         limit,
//         counts: statusCounts,
//       },
//       { status: 200 },
//     );
//   } catch (err: any) {
//     console.error(
//       "[GET /api/admin/online-bookings] error:",
//       err?.message || err,
//     );

//     return NextResponse.json(
//       {
//         ok: false,
//         error: "Server error in /api/admin/online-bookings",
//         detail: String(err?.message ?? err),
//       },
//       { status: 500 },
//     );
//   }
// }

// // app/api/admin/online-bookings/route.ts
// export const runtime = 'nodejs';
// export const dynamic = 'force-dynamic';

// import { NextRequest, NextResponse } from 'next/server';

// /**
//  * Ist eine Holiday-Buchung? (Camp + Powertraining, nur online_request)
//  */
// function isHolidayBooking(b: any): boolean {
//   if (!b) return false;
//   if (b.source !== 'online_request') return false;

//   const text = [
//     b.offerType,
//     b.offerTitle,
//     b.level,
//     b.program,
//     b.message,
//   ]
//     .filter(Boolean)
//     .join(' ')
//     .toLowerCase();

//   if (!text) return false;

//   const HOLIDAY_KEYWORDS = [
//     'camp',
//     'feriencamp',
//     'holiday',
//     'powertraining',
//     'power training',
//   ];

//   return HOLIDAY_KEYWORDS.some((kw) => text.includes(kw));
// }

// /**
//  * Textgrundlage für Programm-Erkennung (Camp vs Powertraining)
//  */
// function bookingProgramText(b: any): string {
//   return [
//     b.offerType,
//     b.offerTitle,
//     b.level,
//     b.program,
//     b.message,
//   ]
//     .filter(Boolean)
//     .join(' ')
//     .toLowerCase();
// }

// function isCampBooking(b: any): boolean {
//   const txt = bookingProgramText(b);
//   if (!txt) return false;

//   const hasCamp =
//     txt.includes('camp') ||
//     txt.includes('feriencamp') ||
//     txt.includes('holiday camp');

//   const hasPower =
//     txt.includes('powertraining') ||
//     txt.includes('power training');

//   // Camp, aber NICHT Powertraining
//   return hasCamp && !hasPower;
// }

// function isPowerBooking(b: any): boolean {
//   const txt = bookingProgramText(b);
//   if (!txt) return false;

//   return (
//     txt.includes('powertraining') ||
//     txt.includes('power training')
//   );
// }

// export async function GET(req: NextRequest) {
//   try {
//     const reqUrl = new URL(req.url);
//     const origin = reqUrl.origin;
//     const search = reqUrl.searchParams;

//     // Paging aus Query (für finale Ergebnisliste)
//     const pageRaw = parseInt(search.get('page') || '1', 10);
//     const limitRaw = parseInt(search.get('limit') || '10', 10);
//     const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
//     const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : 10;

//     // Status-Filter (nur für Anzeige, NICHT für Counts)
//     const status = (search.get('status') || 'all').toLowerCase();

//     // Programm-Filter: all | camp | power
//     const program = (search.get('program') || 'all').toLowerCase();

//     // Upstream-URL zu deiner Admin-Bookings-API
//     const upstreamUrl = new URL(`${origin}/api/admin/bookings`);

//     // Suchparameter übernehmen (z.B. q, date, …), aber:
//     // - page/limit machen wir hier selbst
//     // - includeHoliday setzen wir explizit
//     // - status & program benutzen wir nur im Next-API-Route-Filter
//     search.forEach((value, key) => {
//       if (
//         key === 'page' ||
//         key === 'limit' ||
//         key === 'includeHoliday' ||
//         key === 'status' ||
//         key === 'program'
//       ) {
//         return;
//       }
//       upstreamUrl.searchParams.set(key, value);
//     });

//     // Holiday-Buchungen NICHT aus Bookings herausfiltern:
//     // includeHoliday=1 sorgt dafür, dass dein Backend sie NICHT entfernt
//     upstreamUrl.searchParams.set('includeHoliday', '1');

//     // Wir holen ALLE passenden Einträge (ohne Status/Programm-Filter) auf einmal
//     upstreamUrl.searchParams.set('page', '1');
//     upstreamUrl.searchParams.set('limit', '10000');

//     const upstream = await fetch(upstreamUrl.toString(), {
//       method: 'GET',
//       headers: {
//         cookie: req.headers.get('cookie') ?? '',
//         accept: 'application/json',
//       },
//       cache: 'no-store',
//     });

//     const text = await upstream.text();
//     let data: any;
//     try {
//       data = JSON.parse(text);
//     } catch {
//       data = text;
//     }

//     if (!upstream.ok) {
//       return NextResponse.json(
//         {
//           ok: false,
//           error:
//             data?.error ||
//             `Upstream /api/admin/bookings failed (${upstream.status})`,
//         },
//         { status: upstream.status }
//       );
//     }

//     // Liste aus Upstream extrahieren
//     const list: any[] = Array.isArray(data)
//       ? data
//       : Array.isArray(data.bookings)
//       ? data.bookings
//       : Array.isArray(data.items)
//       ? data.items
//       : [];

//     // 1) Nur Holiday-Buchungen (Camp / Powertraining), online_request
//     const holiday = list.filter(isHolidayBooking);

//     // 2) Programm-Filter anwenden: all | camp | power
//     let programFiltered = holiday;
//     if (program === 'camp') {
//       programFiltered = holiday.filter(isCampBooking);
//     } else if (program === 'power') {
//       programFiltered = holiday.filter(isPowerBooking);
//     }

//     // 3) Status-Counts IMMER auf Basis von programFiltered (unabhängig vom Status-Filter)
//     const statusCounts: Record<string, number> = {
//       confirmed: 0,
//       cancelled: 0,
//       deleted: 0,
//     };

//     for (const b of programFiltered) {
//       const s = String(b.status || '').toLowerCase();
//       if (s in statusCounts) {
//         statusCounts[s] += 1;
//       }
//     }

//     // 4) Status-Filter für Anzeige anwenden
//     let finalList = programFiltered;
//     if (status !== 'all') {
//       const normalized =
//         status === 'canceled' ? 'cancelled' : status;
//       finalList = programFiltered.filter(
//         (b) => String(b.status || '').toLowerCase() === normalized
//       );
//     }

//     // 5) Pagination auf finalList
//     const total = finalList.length;
//     const pages = Math.max(1, Math.ceil(total / limit));
//     const safePage = Math.min(page, pages);
//     const start = (safePage - 1) * limit;
//     const end = start + limit;
//     const pageItems = finalList.slice(start, end);

//     return NextResponse.json(
//       {
//         ok: true,
//         bookings: pageItems,
//         total,      // = Anzahl der Einträge nach Programm + Status + Suche
//         page: safePage,
//         pages,
//         limit,
//         // Counts: nur confirmed/cancelled/deleted über das ganze Programm (ohne Status-Filter)
//         counts: statusCounts,
//       },
//       { status: 200 }
//     );
//   } catch (err: any) {
//     console.error('[GET /api/admin/online-bookings] error:', err?.message || err);
//     return NextResponse.json(
//       {
//         ok: false,
//         error: 'Server error in /api/admin/online-bookings',
//         detail: String(err?.message ?? err),
//       },
//       { status: 500 }
//     );
//   }
// }
