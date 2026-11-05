import { ProfileForm } from '@/features/profile/ProfileForm';
import { privateMetadata } from "@/lib/siteMetadata";
import { LogoutButton } from "@/components/ui/LogoutButton";
export const metadata = privateMetadata("My Profile");
// Retain the existing protected Navbar entry point; dashboard sidebar remains a tab.
export default function ProfilePage() {
  return <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-[80rem] px-6 py-10 md:px-12 md:py-16"><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><Link href="/dashboard" className="ui-action ui-action-secondary ui-action-sm"><span aria-hidden="true">←</span> Kembali ke dashboard</Link><LogoutButton /></div><ProfileForm /></main>;
}
import Link from 'next/link';
