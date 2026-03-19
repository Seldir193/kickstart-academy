// src/app/admin/new-password/page.tsx
import { Suspense } from "react";
import NewPasswordClient from "./NewPasswordClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <NewPasswordClient />
    </Suspense>
  );
}
