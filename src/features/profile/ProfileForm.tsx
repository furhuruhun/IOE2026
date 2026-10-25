'use client';
import { useEffect, useId, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Icon } from '@iconify/react/offline';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { FormBanner } from '@/components/ui/FormBanner';
import { profileSchema, type ProfileFormValues } from './schemas';
import type { Profile } from '@/types/profile';
const FIELDS = [
  { key: 'name', label: 'Name', autoComplete: 'name' },
  { key: 'email', label: 'Email', autoComplete: 'email' },
  { key: 'institution', label: 'Institution / University', autoComplete: 'organization' },
  { key: 'phone', label: 'WhatsApp Number', autoComplete: 'tel' },
  { key: 'domicile', label: 'Domicile', autoComplete: 'address-level2' },
] as const;
function values(profile: Profile): ProfileFormValues {
  return { name: profile.name, institution: profile.institution ?? '', phone: profile.phone ?? '', domicile: profile.domicile ?? '' };
}
export function ProfileForm() {
  const profile = useProfile();
  const save = useUpdateProfile();
  const handleError = useErrorHandler();
  const pathname = usePathname();
  const id = useId();
  const [editing, setEditing] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [toast, setToast] = useState<{ status: 'success' | 'error'; title: string } | null>(null);
  const { register, reset, handleSubmit, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema), defaultValues: { name: '', institution: '', phone: '', domicile: '' },
  });
  const redirectTo = `/login?redirect=${encodeURIComponent(pathname)}`;
  useEffect(() => {
    if (profile.error) handleError(profile.error, { redirectTo, onToast: title => setToast({ status: 'error', title }) });
  }, [profile.error, handleError, redirectTo]);
  const submit = (body: ProfileFormValues) => {
    setBanner(null); setToast(null);
    save.mutate(body, {
      onSuccess: updated => { reset(values(updated)); setEditing(false); setToast({ status: 'success', title: 'Profil berhasil disimpan.' }); },
      onError: error => handleError(error, {
        redirectTo,
        // The API error envelope has no field-detail shape. Follow the documented
        // fallback to a form-level banner rather than inventing an errors payload.
        onInlineField: setBanner, onInlineBanner: setBanner,
        onToast: title => setToast({ status: 'error', title }),
      }),
    });
  };
  return <section className="flex min-w-0 flex-col gap-6">
    <h1 className="text-h4 text-secondary-1000 md:text-h3">My Profile</h1>
    {toast && <Toast status={toast.status} title={toast.title} onDismiss={() => setToast(null)} />}
    {profile.isPending ? <div role="status" aria-label="Loading profile" className="grid gap-6 rounded-xl bg-neutral-100 p-6 shadow-sm md:rounded-[36px] lg:grid-cols-2">
      {FIELDS.map(field => <div key={field.key} className="h-20 animate-pulse rounded-xl bg-neutral-200" />)}
    </div> : profile.isError ? <Button onClick={() => { setToast(null); void profile.refetch(); }} className="self-start">Coba lagi</Button> : profile.data && <form noValidate onSubmit={handleSubmit(submit)} className="grid min-w-0 grid-cols-1 gap-6 rounded-xl bg-neutral-100 p-6 shadow-sm md:rounded-[36px] lg:grid-cols-2">
      {banner && <div className="lg:col-span-2"><FormBanner message={banner} variant="error" /></div>}
      {FIELDS.map(field => !editing ? <div key={field.key} className="min-w-0 rounded-xl border border-neutral-300 px-5 py-4">
        <p className="font-ui text-b4 text-neutral-700">{field.label}</p>
        <p className="break-words font-body text-b2 text-secondary-1000">{profile.data![field.key] || '—'}</p>
      </div> : field.key === 'email' ? <Input key={field.key} id={`${id}-email`} label={field.label} value={profile.data!.email} disabled type="email" /> : <Input
        key={field.key} id={`${id}-${field.key}`} label={field.label} autoComplete={field.autoComplete}
        type={field.key === 'phone' ? 'tel' : 'text'} disabled={save.isPending} error={errors[field.key]?.message} {...register(field.key)}
      />)}
      <div className="flex flex-wrap justify-end gap-3 lg:col-span-2">
        {!editing ? <Button key="edit" type="button" onClick={() => { reset(values(profile.data!)); setBanner(null); setToast(null); setEditing(true); }}><Icon icon="mdi:pencil" className="size-5" />Edit Personal Info</Button> : <>
          <Button key={save.isPending ? "cancel-pending" : "cancel"} type="button" variant="secondary" disabled={save.isPending} onClick={() => { reset(values(profile.data!)); setBanner(null); setToast(null); setEditing(false); }}><Icon icon="mdi:close" className="size-5" />Cancel</Button>
          <Button key="save" type="submit" loading={save.isPending}><Icon icon="mdi:content-save" className="size-5" />Save Changes</Button>
        </>}
      </div>
    </form>}
    {toast?.status === 'error' && !profile.isError && <Button variant="ghost" className="self-start" onClick={editing ? handleSubmit(submit) : () => { setToast(null); void profile.refetch(); }}>Coba lagi</Button>}
  </section>;
}
