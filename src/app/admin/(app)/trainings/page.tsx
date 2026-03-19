// src/app/admin/trainings/page.tsx
// import TrainingCard from "@/app/components/TrainingCard";

// export default function AdminTrainingsPage() {
//   return <TrainingCard />;
// }

// src/app/admin/trainings/page.tsx
import { Suspense } from "react";
import TrainingCard from "@/app/components/TrainingCard";

export default function AdminTrainingsPage() {
  return (
    <Suspense fallback={null}>
      <TrainingCard />
    </Suspense>
  );
}
