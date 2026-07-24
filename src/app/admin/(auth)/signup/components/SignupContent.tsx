import { useRouter, useSearchParams } from "next/navigation";
import useAdminAuthBodyClass from "../../components/useAdminAuthBodyClass";
import SignupForm from "./SignupForm";
import useSignupState from "./useSignupState";

export default function SignupContent() {
  const router = useRouter();
  const state = useSignupState(useSearchParams(), router);
  useAdminAuthBodyClass();
  return (
    <SignupForm
      {...state}
      onBack={(href) => router.push(href)}
      onLogin={() => router.push("/admin/login")}
    />
  );
}
