


// src/app/trainings/page.tsx
import { redirect } from "next/navigation";

type TrainingsRedirectProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function TrainingsRedirectPage({ searchParams = {} }: TrainingsRedirectProps) {
  const qs = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      value.forEach(v => v != null && qs.append(key, String(v)));
    } else if (value != null) {
      qs.set(key, String(value));
    }
  }

  const query = qs.toString();
  const target = query ? `/admin/trainings?${query}` : `/admin/trainings`;

  redirect(target);
}
