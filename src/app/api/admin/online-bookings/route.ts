export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

type BookingRecord = {
  offerType?: unknown;
  offerTitle?: unknown;
  level?: unknown;
  program?: unknown;
  message?: unknown;
  meta?: { holidayType?: unknown; holidayLabel?: unknown } | null;
  source?: unknown;
  status?: unknown;
  createdAt?: unknown;
  firstName?: unknown;
  lastName?: unknown;
};

type ListQuery = {
  page: number;
  limit: number;
  status: string;
  program: string;
  sort: string;
};

function safeText(v: unknown): string {
  return String(v ?? "").trim();
}

function bookingProgramText(b: BookingRecord): string {
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

function holidayTypeOf(b: BookingRecord): string {
  return safeText(b?.meta?.holidayType).toLowerCase();
}

function offerText(b: BookingRecord): string {
  return [b?.offerType, b?.offerTitle].filter(Boolean).join(" ").toLowerCase();
}

function isExcludedNonHolidayBooking(b: BookingRecord): boolean {
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

function isHolidaySource(b: BookingRecord): boolean {
  const source = safeText(b?.source).toLowerCase();
  return source === "online_request" || source === "admin_booking";
}

function isHolidayBooking(b: BookingRecord): boolean {
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

function isCampBooking(b: BookingRecord): boolean {
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

function isPowerBooking(b: BookingRecord): boolean {
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

function nameKey(b: BookingRecord): string {
  return `${safeText(b?.firstName)} ${safeText(b?.lastName)}`
    .trim()
    .toLowerCase();
}

function sortBookings(items: BookingRecord[], sort: string): BookingRecord[] {
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

function isVisibleOnlineStatus(b: BookingRecord): boolean {
  const status = safeText(b?.status).toLowerCase();
  return (
    status === "confirmed" || status === "cancelled" || status === "deleted"
  );
}

function parseListQuery(search: URLSearchParams): ListQuery {
  const pageRaw = parseInt(search.get("page") || "1", 10);
  const limitRaw = parseInt(search.get("limit") || "10", 10);

  return {
    page: Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1,
    limit: Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : 10,
    status: safeText(search.get("status") || "all").toLowerCase(),
    program: safeText(search.get("program") || "all").toLowerCase(),
    sort: safeText(search.get("sort") || "newest").toLowerCase(),
  };
}

function buildUpstreamUrl(origin: string, search: URLSearchParams): URL {
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

  return upstreamUrl;
}

async function fetchUpstreamBookings(req: NextRequest, upstreamUrl: URL) {
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

  return { upstream, data };
}

function upstreamFailedResponse(status: number, data: any) {
  return NextResponse.json(
    {
      ok: false,
      error: data?.error || `Upstream /api/admin/bookings failed (${status})`,
    },
    { status },
  );
}

function extractBookingList(data: any): BookingRecord[] {
  return Array.isArray(data)
    ? data
    : Array.isArray(data.bookings)
      ? data.bookings
      : Array.isArray(data.items)
        ? data.items
        : [];
}

function filterByProgram(holiday: BookingRecord[], program: string) {
  if (program === "camp") return holiday.filter(isCampBooking);
  if (program === "power") return holiday.filter(isPowerBooking);
  return holiday;
}

function countVisibleStatuses(list: BookingRecord[]) {
  const statusCounts: Record<string, number> = {
    confirmed: 0,
    cancelled: 0,
    deleted: 0,
  };

  for (const b of list) {
    const s = safeText(b.status).toLowerCase();
    if (s in statusCounts) statusCounts[s] += 1;
  }

  return statusCounts;
}

function filterByStatus(list: BookingRecord[], status: string) {
  if (status === "all") return list;

  const normalized = status === "canceled" ? "cancelled" : status;
  return list.filter((b) => safeText(b.status).toLowerCase() === normalized);
}

function paginate(list: BookingRecord[], page: number, limit: number) {
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, pages);
  const start = (safePage - 1) * limit;

  return {
    total,
    pages,
    safePage,
    pageItems: list.slice(start, start + limit),
  };
}

export async function GET(req: NextRequest) {
  try {
    const reqUrl = new URL(req.url);
    const query = parseListQuery(reqUrl.searchParams);
    const upstreamUrl = buildUpstreamUrl(reqUrl.origin, reqUrl.searchParams);

    const { upstream, data } = await fetchUpstreamBookings(req, upstreamUrl);
    if (!upstream.ok) return upstreamFailedResponse(upstream.status, data);

    const holiday = extractBookingList(data).filter(isHolidayBooking);
    const programFiltered = filterByProgram(holiday, query.program);
    const visibleList = programFiltered.filter(isVisibleOnlineStatus);
    const statusCounts = countVisibleStatuses(visibleList);
    const finalList = filterByStatus(visibleList, query.status);
    const sortedList = sortBookings(finalList, query.sort);
    const { total, pages, safePage, pageItems } = paginate(
      sortedList,
      query.page,
      query.limit,
    );

    return NextResponse.json(
      {
        ok: true,
        bookings: pageItems,
        total,
        page: safePage,
        pages,
        limit: query.limit,
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
