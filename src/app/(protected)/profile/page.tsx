import { ProfileForm } from '@/features/profile/ProfileForm';
// Retain the existing protected Navbar entry point; dashboard sidebar remains a tab.
export default function ProfilePage() {
  return <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-[80rem] px-6 py-10 md:px-12 md:py-16"><ProfileForm /></main>;
}