// src/app/trainings/page.tsx
import { redirect } from "next/navigation";

type TrainingsRedirectProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TrainingsRedirectPage({
  searchParams,
}: TrainingsRedirectProps) {
  const sp = (await searchParams) ?? {};

  const qs = new URLSearchParams();

  for (const [key, value] of Object.entries(sp)) {
    if (Array.isArray(value)) {
      value.forEach((v) => v != null && qs.append(key, String(v)));
    } else if (value != null) {
      qs.set(key, String(value));
    }
  }

  const query = qs.toString();
  const target = query ? `/admin/trainings?${query}` : `/admin/trainings`;

  redirect(target);
}
