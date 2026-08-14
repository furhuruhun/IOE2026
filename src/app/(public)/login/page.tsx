import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

// Route: /login. Public. Redirect ke /dashboard kalau sudah ada sesi (middleware.ts).
export default function LoginPage() {
  return (
    <PlaceholderPage
      title="Login"
      fId="F-40–F-41"
      note="LoginForm, GoogleAuthButton — belum dibangun. Infra: useLogin/useGoogleLogin di hooks/useAuth.ts sudah siap dipakai."
    />
  );
}
