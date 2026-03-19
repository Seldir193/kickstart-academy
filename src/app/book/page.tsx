// src/app/book/page.tsx
import { Suspense } from "react";
import BookClient from "./BookClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <BookClient />
    </Suspense>
  );
}
