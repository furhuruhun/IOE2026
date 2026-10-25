import type { User } from '@/types/auth';
// GET /profile: only the fields explicitly listed in API_CONTRACT §3.1.
export type Profile = Pick<User, 'id' | 'name' | 'email' | 'role' | 'institution' | 'phone' | 'domicile'>;
export interface ProfileUpdate {
  name: string;
  institution: string;
  phone: string;
  domicile: string;
}
