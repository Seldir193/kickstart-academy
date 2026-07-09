import { useEffect } from "react";

export default function useAdminAuthBodyClass() {
  useEffect(() => {
    document.body.classList.add("is-admin-auth");
    return () => document.body.classList.remove("is-admin-auth");
  }, []);
}
