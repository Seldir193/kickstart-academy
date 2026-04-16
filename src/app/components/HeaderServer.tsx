// headerServer.tsx
export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import Header from "./Header";

export default async function HeaderServer() {
  const c = await cookies();

  const isAdmin =
    Boolean(c.get("admin_token")?.value) || Boolean(c.get("adminToken")?.value);

  return <Header isAdminInitial={isAdmin} />;
}
