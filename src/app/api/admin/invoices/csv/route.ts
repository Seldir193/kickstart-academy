// app/api/admin/invoices/csv/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getProviderId } from '@/app/api/lib/auth';

/* ===== base/env ===== */
function baseFromEnv() {
  const raw =
    process.env.NEXT_BACKEND_API_BASE ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://127.0.0.1:5000/api';
  return raw.replace(/\/+$/, '');
}
const ENV = (k: string, d = '') => (process.env[k] ?? d) as string;

/* ===== helpers ===== */
function parseDate(s: any) {
  if (!s) return null;
  const d = new Date(String(s));
  return isNaN(d.getTime()) ? null : d;
}
function fmtDEDate(value?: any) {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('de-DE', {
    timeZone: 'Europe/Berlin',
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(d);
}
function escCSV(v: any) {
  if (v == null) return '';
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function normalizeInvoiceNo(no: any) {
  return String(no || '').trim();
}
function docMatchesType(d: any, set: Set<string>) {
  if (!set || set.size === 0) return true;
  return set.has(String(d.type || '').toLowerCase());
}
function docMatchesQuery(d: any, q: string) {
  if (!q) return true;
  const hay = [
    d.title, d.offerTitle, d.offerType, d.venue,
    d.bookingId, d.invoiceNo, d.cancellationNo, d.stornoNo,
  ].filter(Boolean).join(' ').toLowerCase();
  return hay.includes(String(q).toLowerCase());
}
const pick = (...vals: any[]) => {
  for (const v of vals) {
    const s = typeof v === 'string' ? v : v == null ? '' : String(v);
    if (s && s.trim()) return s;
  }
  return '';
};
type AnyRec = Record<string, any>;
async function fetchJSON(url: string, headers: HeadersInit) {
  const r = await fetch(url, { headers, cache: 'no-store' });
  const t = await r.text();
  let j: any; try { j = JSON.parse(t); } catch { j = null; }
  return { ok: r.ok, status: r.status, json: j };
}

/* ===== types ===== */
type CustomerLite = { _id: string; bookings?: any[] };

/* ===== handler ===== */
export async function GET(req: NextRequest) {
  const BASE = baseFromEnv();
  if (!BASE) {
    return NextResponse.json(
      { ok: false, error: 'Server misconfigured: NEXT_BACKEND_API_BASE is missing' },
      { status: 500 }
    );
  }

  const providerId = await getProviderId(req);
  if (!providerId) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  try {
    // query & sort
    const typeParam = String(req.nextUrl.searchParams.get('type') || '').trim();
    const typeSet = new Set(
      typeParam ? typeParam.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean) : []
    );
    const from = parseDate(req.nextUrl.searchParams.get('from'));
    const to   = parseDate(req.nextUrl.searchParams.get('to'));
    const q    = String(req.nextUrl.searchParams.get('q') || '').trim();

    const sortStr = String(req.nextUrl.searchParams.get('sort') || 'issuedAt:desc');
    const [sortFieldRaw, sortDir] = sortStr.split(':');
    const sortField = sortFieldRaw || 'issuedAt';
    const sortMul = sortDir === 'asc' ? 1 : -1;

    // load customers (paginated) and build docs (original behavior)
    const limit = Number(req.nextUrl.searchParams.get('limit') || 200);
    let page = 1;
    const docs: AnyRec[] = [];

    while (true) {
      const url = new URL(`${BASE}/customers`);
      url.searchParams.set('page', String(page));
      url.searchParams.set('limit', String(limit));
      url.searchParams.set('sort', 'createdAt:desc');

      const r = await fetch(url.toString(), {
        method: 'GET',
        headers: { Accept: 'application/json', 'x-provider-id': providerId },
        cache: 'no-store',
      });
      if (!r.ok) {
        const t = await r.text().catch(() => '');
        return NextResponse.json(
          { ok: false, error: `Upstream customers failed (${r.status})`, detail: t.slice(0, 1000) },
          { status: r.status }
        );
      }

      const data = (await r.json()) as { items?: CustomerLite[]; total?: number };
      const items = Array.isArray(data?.items) ? data.items : [];
      if (!items.length) break;

      for (const customer of items) {
        const bookings = Array.isArray(customer.bookings) ? customer.bookings : [];
        for (const b of bookings) {
          const bid = String(b._id || '');
          if (!bid) continue;

          const offerTitle = b.offerTitle || '';
          const offerType  = b.offerType || '';
          const venue      = b.venue || '';
          const price =
            typeof b.priceMonthly === 'number' ? b.priceMonthly
            : typeof b.price === 'number' ? b.price
            : '';
          const currency = 'EUR';

          const base = {
            bookingId: bid,
            offerTitle, offerType, venue, price, currency,
            status: b.status,
            customerId: String((customer as any)._id),
          };

          docs.push({
            id: `${bid}:participation`,
            type: 'participation',
            title: `Teilnahmebestätigung – ${offerTitle || offerType || 'Angebot'}`,
            issuedAt: b.date || b.createdAt,
            href: `/api/admin/customers/${(customer as any)._id}/bookings/${bid}/documents/participation`,
            invoiceNo: normalizeInvoiceNo(b.invoiceNumber || b.invoiceNo || ''),
            invoiceDate: b.invoiceDate || null,
            refInvoiceNo: '',
            refInvoiceDate: null,
            cancellationNo: '',
            stornoNo: '',
            stornoAmount: '',
            ...base,
          });

          if (b.status === 'cancelled') {
            const issued = b.cancelDate || b.updatedAt || b.createdAt;

            docs.push({
              id: `${bid}:cancellation`,
              type: 'cancellation',
              title: `Kündigungsbestätigung – ${offerTitle || offerType || 'Angebot'}`,
              issuedAt: issued,
              href: `/api/admin/customers/${(customer as any)._id}/bookings/${bid}/documents/cancellation`,
              invoiceNo: normalizeInvoiceNo(b.invoiceNumber || b.invoiceNo || ''),
              invoiceDate: b.invoiceDate || null,
              refInvoiceNo: normalizeInvoiceNo(b.refInvoiceNo || b.invoiceNumber || b.invoiceNo || ''),
              refInvoiceDate: b.refInvoiceDate || b.invoiceDate || null,
              cancellationNo: b.cancellationNo || '',
              stornoNo: '',
              stornoAmount: '',
              ...base,
            });

            docs.push({
              id: `${bid}:storno`,
              type: 'storno',
              title: `Storno-Rechnung – ${offerTitle || offerType || 'Angebot'}`,
              issuedAt: issued,
              href: `/api/admin/customers/${(customer as any)._id}/bookings/${bid}/documents/storno`,
              invoiceNo: normalizeInvoiceNo(b.invoiceNumber || b.invoiceNo || ''),
              invoiceDate: b.invoiceDate || null,
              refInvoiceNo: normalizeInvoiceNo(b.refInvoiceNo || b.invoiceNumber || b.invoiceNo || ''),
              refInvoiceDate: b.refInvoiceDate || b.invoiceDate || null,
              cancellationNo: b.cancellationNo || '',
              stornoNo: b.stornoNo || '',
              stornoAmount:
                typeof b.stornoAmount === 'number' ? b.stornoAmount
                : typeof base.price === 'number' ? base.price
                : '',
              ...base,
            });
          }
        }
      }

      const total = Number(data?.total || 0);
      const got = page * limit;
      if (!total || got >= total) break;
      page += 1;
      if (page > 2000) break; // safety
    }

    // filter & sort
    let filtered = docs.filter((d) => docMatchesType(d, typeSet) && docMatchesQuery(d, q));
    if (from) filtered = filtered.filter((d) => new Date(d.issuedAt) >= from);
    if (to)   filtered = filtered.filter((d) => new Date(d.issuedAt) <= to);

    filtered.sort((a, b) => {
      const av =
        sortField === 'issuedAt'
          ? new Date(a.issuedAt || 0).getTime()
          : String(a[sortField] || '').localeCompare(String(b[sortField] || ''));
      const bv =
        sortField === 'issuedAt'
          ? new Date(b.issuedAt || 0).getTime()
          : String(b[sortField] || '').localeCompare(String(a[sortField] || ''));
      if (sortField === 'issuedAt') {
        if (av === bv) return 0;
        return (av < bv ? -1 : 1) * sortMul;
      }
      return (av as number) * sortMul;
    });

    // enrichment (customers/bookings for extra fields)
    const bookingsById = new Map<string, AnyRec>();
    const customersById = new Map<string, AnyRec>();
    const customerIdByBooking = new Map<string, string>();
    const toFetchBookings = new Set<string>();
    const toFetchCustomers = new Set<string>();

    for (const d of filtered) {
      const bid = String(d.bookingId || '');
      const cid = String(d.customerId || '');
      if (bid && !bookingsById.has(bid)) toFetchBookings.add(bid);
      if (cid) toFetchCustomers.add(cid);
    }

    await Promise.all(Array.from(toFetchBookings).map(async (bid) => {
      const url = `${BASE}/admin/bookings/${encodeURIComponent(bid)}`;
      const { ok, json } = await fetchJSON(url, { 'x-provider-id': providerId, Accept: 'application/json' });
      if (!ok || !json) return;
      const b = json.booking || json;
      bookingsById.set(bid, b);
      const cid = pick(b.customerId, b.customer?.id, b.customer?._id, b.customer);
      if (cid) {
        customerIdByBooking.set(bid, cid);
        toFetchCustomers.add(cid);
      }
    }));

    await Promise.all(Array.from(toFetchCustomers).map(async (cid) => {
      const url = `${BASE}/admin/customers/${encodeURIComponent(cid)}`;
      const { ok, json } = await fetchJSON(url, { 'x-provider-id': providerId, Accept: 'application/json' });
      if (ok && json) customersById.set(cid, json.customer || json);
    }));

    function findBookingRef(cid: string, bid: string) {
      const customer = customersById.get(cid) as AnyRec | undefined;
      const list: AnyRec[] = Array.isArray(customer?.bookings) ? customer!.bookings : [];
      return list.find(x => String(x._id) === String(bid)) || null;
    }

    const SUPPLIER = {
      name: ENV('PROVIDER_NAME', 'Münchner Fussballschule NRW'),
      addr1: ENV('PROVIDER_ADDRESS_LINE1', 'Hochfelder Str.33'),
      zip:   ENV('PROVIDER_ZIP', '47226'),
      city:  ENV('PROVIDER_CITY', 'Duisburg'),
      vat:   ENV('PROVIDER_VAT_ID', ''), // §19: leer ok
    };

    // headers: keep original + add extras
    const baseHeaders = [
      'id','bookingId','type','title','issuedAt','status',
      'offerTitle','offerType','venue','price','currency','href',
      'invoiceNo','invoiceDate','refInvoiceNo','refInvoiceDate',
      'cancellationNo','stornoNo','stornoAmount',
    ];
    const extraHeaders = [
      'customerName','customerAddressLine1','customerZip','customerCity',
      'supplierName','supplierAddressLine1','supplierZip','supplierCity','supplierVatId',
      'itemDescription','quantity','netAmount','vatRatePercent','vatAmount','grossAmount',
      'paymentTerms','paymentDueDate','paymentStatus','paymentDate',
      'originalInvoiceNumber','creditNoteNumber','notes','pdfUrl','costCenter',
      'serviceFrom','serviceTo',
    ];

    let csv = baseHeaders.concat(extraHeaders).join(',') + '\n';

    for (const d of filtered) {
      const bid = String(d.bookingId || '');
      const cid = customerIdByBooking.get(bid) || String(d.customerId || '');
      const booking = bid ? (bookingsById.get(bid) || {}) : {};
      const customer = cid ? (customersById.get(cid) || {}) : {};
      const bref = (cid && bid) ? findBookingRef(cid, bid) : null;

      // best values
      const invoiceNo = normalizeInvoiceNo(
        pick(d.invoiceNo, bref?.invoiceNumber, booking.invoiceNumber, booking.invoiceNo)
      );
      const invoiceDate = pick(d.invoiceDate, bref?.invoiceDate, booking.invoiceDate, booking.createdAt);

      // customer fields
      const custName  = pick(customer?.name, [customer?.parent?.firstName, customer?.parent?.lastName].filter(Boolean).join(' '), d.customerName);
      const custAddr1 = pick([customer?.address?.street, customer?.address?.houseNo].filter(Boolean).join(' '), [customer?.parent?.address?.street, customer?.parent?.address?.houseNo].filter(Boolean).join(' '), d.customerAddressLine1);
      const custZip   = pick(customer?.address?.zip, customer?.parent?.address?.zip, d.customerZip);
      const custCity  = pick(customer?.address?.city, customer?.parent?.address?.city, d.customerCity);

      // description & amounts
      const title = d.title || pick(d.offerTitle, d.offerType, booking.offerTitle, booking.type);
      const itemDescription = title; // <— exakt wie gewünscht: gleich dem title
      const quantity = 1;
      const gross =
        Number(
          (typeof d.stornoAmount === 'number' && d.stornoAmount) ||
          (typeof d.price === 'number' && d.price) ||
          booking.price || bref?.priceMonthly || 0
        ) || 0;
      const net = gross; // USt-befreit
      const vatRate = 0;
      const vat = 0;
      const currency = pick(d.currency, 'EUR');

      // optional payments (leer lassen, wenn nicht vorhanden)
      const paymentTerms   = '';
      const paymentDueDate = '';
      const paymentStatus  = '';
      const paymentDate    = '';

      const refInvoiceNo     = normalizeInvoiceNo(pick(d.refInvoiceNo, bref?.refInvoiceNo));
      const creditNoteNumber = pick(d.stornoNo, bref?.stornoNo);
      const notes            = pick(d.notes, 'USt-befreit gem. § 19 UStG');

      // pdfUrl nur setzen, wenn sie sich von href unterscheidet (kein Duplikat)
      const preferredPdf =
        cid && bid
          ? `/api/admin/customers/${encodeURIComponent(cid)}/bookings/${encodeURIComponent(bid)}/documents/participation`
          : String(d.href || '');
      const pdfUrlExtra = preferredPdf !== d.href ? preferredPdf : '';

      // originalInvoiceNumber leer lassen, wenn invoiceNo gesetzt (kein Duplikat)
      const originalInvoiceNumber = invoiceNo ? '' : invoiceNo;

      const costCenter = '';
      const serviceFrom = '';
      const serviceTo   = '';

      // rows
      const baseRow = [
        d.id, d.bookingId, d.type, title,
        fmtDEDate(d.issuedAt), d.status || '',
        d.offerTitle || '', d.offerType || '', d.venue || '',
        typeof d.price === 'number' ? Number(d.price).toFixed(2) : '',
        currency, d.href || '',
        invoiceNo, fmtDEDate(invoiceDate),
        refInvoiceNo, fmtDEDate(d.refInvoiceDate),
        d.cancellationNo || '', d.stornoNo || '',
        d.stornoAmount != null && d.stornoAmount !== '' ? String(d.stornoAmount) : '',
      ].map(escCSV);

      const extraRow = [
        custName, custAddr1, custZip, custCity,
        SUPPLIER.name, SUPPLIER.addr1, SUPPLIER.zip, SUPPLIER.city, SUPPLIER.vat,
        itemDescription, quantity, net.toFixed(2), vatRate, vat.toFixed(2), gross.toFixed(2),
        paymentTerms, fmtDEDate(paymentDueDate), paymentStatus, fmtDEDate(paymentDate),
        originalInvoiceNumber, creditNoteNumber, notes, pdfUrlExtra, costCenter,
        fmtDEDate(serviceFrom), fmtDEDate(serviceTo),
      ].map(escCSV);

      csv += baseRow.concat(extraRow).join(',') + '\n';
    }

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': 'attachment; filename="invoices.csv"',
        'cache-control': 'no-store',
      },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Proxy error' }, { status: 500 });
  }
}











