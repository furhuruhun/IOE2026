import { z } from 'zod';
// The contract defines strings, but no required/non-empty, length or phone pattern
// constraints. Do not transfer the registration form's separate assumptions here.
export const profileSchema = z.object({
  name: z.string(),
  institution: z.string(),
  phone: z.string(),
  domicile: z.string(),
}).strict();
export type ProfileFormValues = z.infer<typeof profileSchema>;
