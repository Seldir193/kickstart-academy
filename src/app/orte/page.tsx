// src/app/orte/page.tsx
import { redirect } from "next/navigation";

type OrteRedirectProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OrteRedirectPage({
  searchParams,
}: OrteRedirectProps) {
  const resolved = (await searchParams) ?? {};
  const qs = new URLSearchParams();

  for (const [key, value] of Object.entries(resolved)) {
    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v != null) qs.append(key, String(v));
      });
    } else if (value != null) {
      qs.set(key, String(value));
    }
  }

  const query = qs.toString();
  const target = query ? `/admin/orte?${query}` : "/admin/orte";

  redirect(target);
}
