import { useRouter, useSearchParams } from "next/navigation";
import useAdminAuthBodyClass from "../../components/useAdminAuthBodyClass";
import AdminLoginForm from "./AdminLoginForm";
import useAdminLoginState from "./useAdminLoginState";

export default function AdminLoginContent() {
  const router = useRouter();
  const state = useAdminLoginState(useSearchParams());
  useAdminAuthBodyClass();
  return <AdminLoginForm {...state} onSubmit={state.submitLogin} onCreateAccount={() => router.push("/admin/signup")} />;
}
