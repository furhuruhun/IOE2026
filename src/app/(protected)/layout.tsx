import { privateMetadata } from "@/lib/siteMetadata";
export const metadata = privateMetadata("Akun");
export default function ProtectedLayout({ children }: { children: React.ReactNode }) { return children; }
