import { useEffect, useState } from "react";
import { fetchAdminName } from "./homeApi";

export function useAdminName() {
  const [adminName, setAdminName] = useState("");
  useEffect(() => {
    let abort = false;
    fetchAdminName().then((name) => !abort && setAdminName(name)).catch(() => undefined);
    return () => {
      abort = true;
    };
  }, []);
  return adminName;
}
