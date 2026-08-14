import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

// Route: /register. Public. Redirect ke /dashboard kalau sudah ada sesi (middleware.ts).
export default function RegisterPage() {
  return (
    <PlaceholderPage
      title="Register"
      fId="F-40, F-42"
      note="RegisterForm — belum dibangun. Infra: useRegister di hooks/useAuth.ts sudah siap dipakai."
    />
  );
}
