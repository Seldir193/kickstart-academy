// src/app/orte/page.tsx
import { redirect } from 'next/navigation';

type OrteRedirectProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function OrteRedirectPage({ searchParams = {} }: OrteRedirectProps) {
  const qs = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v != null) qs.append(key, String(v));
      });
    } else if (value != null) {
      qs.set(key, String(value));
    }
  }

  const query = qs.toString();
  const target = query ? `/admin/orte?${query}` : '/admin/orte';

  redirect(target);
}






















