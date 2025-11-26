

// src/app/admin/coaches/page.tsx
import Link from 'next/link';
import CoachList from '@/app/components/CoachList';

type Coach = {
  slug: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  position?: string;
  photoUrl?: string;
};
type CoachListResponse = { items: Coach[]; total: number; page: number; limit: number };

const BACKEND_BASE = (process.env.NEXT_BACKEND_API_BASE || '').replace(/\/+$/, '');
const PAGE_SIZE = 10;

async function fetchCoachesSSR(q: string, page: number, limit: number): Promise<CoachListResponse> {
  const params = new URLSearchParams({ q, page: String(page), limit: String(limit) });
  try {
    const r = await fetch(`${BACKEND_BASE}/coaches?${params.toString()}`, { cache: 'no-store' });
    if (!r.ok) return { items: [], total: 0, page, limit };
    return r.json();
  } catch {
    return { items: [], total: 0, page, limit };
  }
}

export default async function CoachesPage({
  searchParams,
}: {
  // ⬇️ In deinem Setup ist searchParams ein Promise → await nötig
  searchParams?: Promise<{ q?: string; page?: string; limit?: string }>;
}) {
  const sp = (await searchParams) ?? {};

  const q     = (sp.q ?? '').trim();
  const page  = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);
  const limit = PAGE_SIZE; // strikt 10

  const data = await fetchCoachesSSR(q, page, limit);

  return (
    <div className="ks-coaches-admin p-4 max-w-6xl mx-auto">
      <header className="mb-4">
        <h1 className="text-2xl font-bold m-0">Coaches</h1>
        <p className="text-gray-700 m-0">Trainer verwalten (serverseitige Suche &amp; Pagination).</p>
      </header>

      <CoachListSSRBridge data={data} query={q} />
    </div>
  );
}

function CoachListSSRBridge({ data, query }: { data: CoachListResponse; query: string }) {
  return <CoachList initial={data} query={query} />;
}



