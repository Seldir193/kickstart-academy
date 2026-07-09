import { useEffect, useState } from "react";
import { fetchAdminHomeCounts } from "./homeApi";
import type { AdminHomeCounts } from "./types";

const EMPTY_COUNTS: AdminHomeCounts = {
  onlineCount: 0,
  placesCount: 0,
  newsletterLeads: 0,
  openBookingsCount: 0,
};

export function useAdminHomeCounts() {
  const [counts, setCounts] = useState<AdminHomeCounts>(EMPTY_COUNTS);
  useEffect(() => {
    let abort = false;
    fetchAdminHomeCounts().then((next) => !abort && setCounts(next));
    return () => {
      abort = true;
    };
  }, []);
  return counts;
}
