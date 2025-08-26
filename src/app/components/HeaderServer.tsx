

export const dynamic = 'force-dynamic'; // ensure per-request render

import { cookies } from 'next/headers';
import Header from './Header';

export default async function HeaderServer() {
  // Some setups type this as Promise — await is safe in both cases
  const c = await cookies();

  // Adjust names if your auth uses different cookie keys
  const isAdmin =
    Boolean(c.get('admin_token')?.value) ||
    Boolean(c.get('adminToken')?.value);

  return <Header isAdminInitial={isAdmin} />;
}
