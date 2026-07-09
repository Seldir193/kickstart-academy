import { useState } from "react";
import { useAdminHomeCounts } from "./useAdminHomeCounts";
import { useAdminName } from "./useAdminName";
import { useRecentOffers } from "./useRecentOffers";

export function useAdminHomePageState() {
  const [page, setPage] = useState(1);
  const [quickOpen, setQuickOpen] = useState(false);
  const counts = useAdminHomeCounts();
  const adminName = useAdminName();
  const recent = useRecentOffers(page);
  return { page, setPage, quickOpen, setQuickOpen, counts, adminName, recent };
}
