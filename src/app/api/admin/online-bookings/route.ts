// app/api/admin/online-bookings/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

/**
 * Ist eine Holiday-Buchung? (Camp + Powertraining, nur online_request)
 */
function isHolidayBooking(b: any): boolean {
  if (!b) return false;
  if (b.source !== 'online_request') return false;

  const text = [
    b.offerType,
    b.offerTitle,
    b.level,
    b.program,
    b.message,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (!text) return false;

  const HOLIDAY_KEYWORDS = [
    'camp',
    'feriencamp',
    'holiday',
    'powertraining',
    'power training',
  ];

  return HOLIDAY_KEYWORDS.some((kw) => text.includes(kw));
}

/**
 * Textgrundlage für Programm-Erkennung (Camp vs Powertraining)
 */
function bookingProgramText(b: any): string {
  return [
    b.offerType,
    b.offerTitle,
    b.level,
    b.program,
    b.message,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function isCampBooking(b: any): boolean {
  const txt = bookingProgramText(b);
  if (!txt) return false;

  const hasCamp =
    txt.includes('camp') ||
    txt.includes('feriencamp') ||
    txt.includes('holiday camp');

  const hasPower =
    txt.includes('powertraining') ||
    txt.includes('power training');

  // Camp, aber NICHT Powertraining
  return hasCamp && !hasPower;
}

function isPowerBooking(b: any): boolean {
  const txt = bookingProgramText(b);
  if (!txt) return false;

  return (
    txt.includes('powertraining') ||
    txt.includes('power training')
  );
}

export async function GET(req: NextRequest) {
  try {
    const reqUrl = new URL(req.url);
    const origin = reqUrl.origin;
    const search = reqUrl.searchParams;

    // Paging aus Query (für finale Ergebnisliste)
    const pageRaw = parseInt(search.get('page') || '1', 10);
    const limitRaw = parseInt(search.get('limit') || '10', 10);
    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : 10;

    // Status-Filter (nur für Anzeige, NICHT für Counts)
    const status = (search.get('status') || 'all').toLowerCase();

    // Programm-Filter: all | camp | power
    const program = (search.get('program') || 'all').toLowerCase();

    // Upstream-URL zu deiner Admin-Bookings-API
    const upstreamUrl = new URL(`${origin}/api/admin/bookings`);

    // Suchparameter übernehmen (z.B. q, date, …), aber:
    // - page/limit machen wir hier selbst
    // - includeHoliday setzen wir explizit
    // - status & program benutzen wir nur im Next-API-Route-Filter
    search.forEach((value, key) => {
      if (
        key === 'page' ||
        key === 'limit' ||
        key === 'includeHoliday' ||
        key === 'status' ||
        key === 'program'
      ) {
        return;
      }
      upstreamUrl.searchParams.set(key, value);
    });

    // Holiday-Buchungen NICHT aus Bookings herausfiltern:
    // includeHoliday=1 sorgt dafür, dass dein Backend sie NICHT entfernt
    upstreamUrl.searchParams.set('includeHoliday', '1');

    // Wir holen ALLE passenden Einträge (ohne Status/Programm-Filter) auf einmal
    upstreamUrl.searchParams.set('page', '1');
    upstreamUrl.searchParams.set('limit', '10000');

    const upstream = await fetch(upstreamUrl.toString(), {
      method: 'GET',
      headers: {
        cookie: req.headers.get('cookie') ?? '',
        accept: 'application/json',
      },
      cache: 'no-store',
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
        { status: upstream.status }
      );
    }

    // Liste aus Upstream extrahieren
    const list: any[] = Array.isArray(data)
      ? data
      : Array.isArray(data.bookings)
      ? data.bookings
      : Array.isArray(data.items)
      ? data.items
      : [];

    // 1) Nur Holiday-Buchungen (Camp / Powertraining), online_request
    const holiday = list.filter(isHolidayBooking);

    // 2) Programm-Filter anwenden: all | camp | power
    let programFiltered = holiday;
    if (program === 'camp') {
      programFiltered = holiday.filter(isCampBooking);
    } else if (program === 'power') {
      programFiltered = holiday.filter(isPowerBooking);
    }

    // 3) Status-Counts IMMER auf Basis von programFiltered (unabhängig vom Status-Filter)
    const statusCounts: Record<string, number> = {
      confirmed: 0,
      cancelled: 0,
      deleted: 0,
    };

    for (const b of programFiltered) {
      const s = String(b.status || '').toLowerCase();
      if (s in statusCounts) {
        statusCounts[s] += 1;
      }
    }

    // 4) Status-Filter für Anzeige anwenden
    let finalList = programFiltered;
    if (status !== 'all') {
      const normalized =
        status === 'canceled' ? 'cancelled' : status;
      finalList = programFiltered.filter(
        (b) => String(b.status || '').toLowerCase() === normalized
      );
    }

    // 5) Pagination auf finalList
    const total = finalList.length;
    const pages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, pages);
    const start = (safePage - 1) * limit;
    const end = start + limit;
    const pageItems = finalList.slice(start, end);

    return NextResponse.json(
      {
        ok: true,
        bookings: pageItems,
        total,      // = Anzahl der Einträge nach Programm + Status + Suche
        page: safePage,
        pages,
        limit,
        // Counts: nur confirmed/cancelled/deleted über das ganze Programm (ohne Status-Filter)
        counts: statusCounts,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('[GET /api/admin/online-bookings] error:', err?.message || err);
    return NextResponse.json(
      {
        ok: false,
        error: 'Server error in /api/admin/online-bookings',
        detail: String(err?.message ?? err),
      },
      { status: 500 }
    );
  }
}













