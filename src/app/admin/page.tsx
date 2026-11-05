import { AdminGate } from "@/features/auth/AdminGate";
import { privateMetadata } from "@/lib/siteMetadata";
export const metadata = privateMetadata("Admin");

// Single admin workspace; Workers enforce authorization for every API operation.
export default function AdminPage() {
  return <AdminGate />;
}
