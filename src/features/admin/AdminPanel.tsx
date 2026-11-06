"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import * as Tabs from "@radix-ui/react-tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { Input } from "@/components/ui/Input";
import { FormBanner } from "@/components/ui/FormBanner";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { adminRequest, type AdminRegistrations, type AdminSubmission } from "@/services/adminService";
import { unwrapResponse } from "@/services/apiResponse";
import { formatWibDate } from "@/utils/formatDate";
import styles from "./AdminPanel.module.css";
import { AdminSchedulesPanel } from "./AdminSchedulesPanel";

const control = "min-h-11 w-full rounded-xl border border-neutral-500 bg-neutral-100 px-md py-sm text-b3 text-secondary-1000 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-800";
const card = `${styles.card} rounded-3xl border border-secondary-200 bg-neutral-100 p-lg md:p-xl`;
const statuses = { pending: "Menunggu review", accepted: "Diterima", rejected: "Ditolak" };
const discoverySourceLabels: Record<string, string> = { INSTAGRAM: "Instagram", WEBSITE: "Our Website", FRIENDS: "Friends/Relatives", TIKTOK: "TikTok", LINKEDIN: "LinkedIn", OTHERS: "Other" };
const sessionLabel = (value: string) => value === "day1" ? "Day 1 (22 January 2027)" : value === "day2" ? "Day 2 (23 January 2027)" : value;
const date = (value: string) => Number.isFinite(Date.parse(value)) ? formatWibDate(value) : "—";

export function AdminPanel() {
  const client = useQueryClient();
  const handleError = useErrorHandler();
  const [tab, setTab] = useState("submissions");
  const [notice, setNotice] = useState<{ text: string; error: boolean } | null>(null);
  const [status, setStatus] = useState("");
  const [competition, setCompetition] = useState("");
  const [search, setSearch] = useState("");
  const [review, setReview] = useState<string | null>(null);
  const submissions = useQuery({ queryKey: ["admin", "submissions"], queryFn: () => adminRequest<AdminSubmission[]>("submissions"), retry: false });
  const registrations = useQuery({ queryKey: ["admin", "registrations"], queryFn: () => adminRequest<AdminRegistrations>("registrations"), enabled: tab === "registrations", retry: false });
  const report = (error: unknown) => {
    const show = (text: string) => setNotice({ text, error: true });
    handleError(error instanceof Error ? error : undefined, { onToast: show, onInlineBanner: show, onInlineField: show });
  };
  useEffect(() => {
    const error = submissions.error || registrations.error;
    if (error) {
      const show = (text: string) => setNotice({ text, error: true });
      handleError(error, { onToast: show, onInlineBanner: show, onInlineField: show });
    }
  }, [submissions.error, registrations.error, handleError]);
  const mutation = useMutation({
    mutationFn: ({ path, body }: { path: string; body: unknown }) => adminRequest(path, path === "users/password" ? "POST" : "PATCH", body),
    onSuccess: () => { setNotice({ text: "Perubahan berhasil disimpan.", error: false }); setReview(null); void client.invalidateQueries({ queryKey: ["admin"] }); },
    onError: report,
  });
  async function submit(event: FormEvent<HTMLFormElement>, path: string, body: (data: FormData) => unknown) {
    event.preventDefault();
    const form = event.currentTarget;
    setNotice(null);
    try { await mutation.mutateAsync({ path, body: body(new FormData(form)) }); if (path === "users/password") form.reset(); } catch { /* mutation reports mapped errors */ }
  }
  const all = submissions.data ?? [];
  const competitions = Array.from(new Map(all.map(item => [item.competition_id, item.competition_name])).entries());
  const filtered = all.filter(item => (!status || item.status === status) && (!competition || item.competition_id === competition) && `${item.team_name ?? ""} ${item.participant_name ?? ""} ${item.participant_email ?? ""} ${item.requirement_name}`.toLowerCase().includes(search.toLowerCase()));
  async function exportCsv() {
    try {
      const response = await fetch("/api/admin/registrations/export", { cache: "no-store" });
      if (!response.ok) { await unwrapResponse(response); return; }
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a"); link.href = url; link.download = "teams-export.csv"; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) { report(error); }
  }
  return <main id="main-content" tabIndex={-1} className={`${styles.workspace} min-h-screen text-neutral-1000`}>
    <div className="site-container flex flex-col gap-xl py-xl md:py-2xl">
      <header className={`${styles.hero} flex flex-wrap items-start justify-between gap-md`}>
        <div><p className="font-ui text-b3 font-bold text-secondary-800">IOE 2027 · Ruang Panitia</p><h1 className="mt-sm font-heading text-h3 md:text-h2">Admin Panel</h1><p className="mt-sm text-b2 text-neutral-800">Kelola persiapan peserta dan informasi kegiatan.</p></div>
        <div className="flex flex-wrap items-center gap-md">
          <Link href="/" className="ui-action ui-action-ghost ui-action-sm">Beranda</Link>
          <Link href="/profile" className="ui-action ui-action-ghost ui-action-sm">My Profile</Link>
          <LogoutButton />
        </div>
      </header>
      <div className={`${styles.stats} grid gap-md sm:grid-cols-3`}>
        {[["Menunggu review", all.filter(item => item.status === "pending").length], ["Diterima", all.filter(item => item.status === "accepted").length], ["Ditolak", all.filter(item => item.status === "rejected").length]].map(([label, count], index) => <div key={label} className={`${card} ${styles.stat}`} data-status={index}><p className="text-b3 text-neutral-800"><span className={styles.dot} aria-hidden="true" />{label}</p><p className="mt-sm font-heading text-h3 text-secondary-1000 tabular-nums">{submissions.isSuccess ? count : "—"}</p><p className="mt-sm text-b3 text-neutral-800">Berkas peserta</p></div>)}
      </div>
      <Tabs.Root value={tab} onValueChange={value => { setTab(value); setNotice(null); }} className="flex min-w-0 flex-col gap-lg">
        <Tabs.List aria-label="Bagian admin" className={`${styles.tabs} grid grid-cols-2 gap-sm rounded-2xl bg-neutral-100 p-sm md:flex md:flex-wrap`}>
          {[["submissions", "Review berkas"], ["registrations", "Pendaftar"], ["schedules", "Jadwal Deadline"], ["password", "Reset password"]].map(([value, label]) => <Tabs.Trigger key={value} value={value} className="min-h-11 rounded-xl px-md py-sm font-ui text-b3 font-semibold text-secondary-1000 hover:bg-tertiary-100 focus-visible:outline-2 focus-visible:outline-secondary-800 data-[state=active]:bg-primary-200">{label}</Tabs.Trigger>)}
        </Tabs.List>
        {notice && <FormBanner message={notice.text} variant={notice.error ? "error" : "success"} />}
        <Tabs.Content value="submissions" className="flex flex-col gap-lg">
          <div className={card}>
            <div className="flex flex-wrap items-center justify-between gap-md"><div><h2 className="font-heading text-h4">Review berkas peserta</h2><p className="mt-sm text-b3 text-neutral-800">Periksa dokumen, beri keputusan, dan atur deadline requirement.</p></div><Button variant="ghost" size="sm" loading={submissions.isFetching} onClick={() => void submissions.refetch()}>Muat ulang</Button></div>
            <div className="mt-lg grid gap-md md:grid-cols-3">
              <Input id="admin-search" label="Cari peserta atau berkas" value={search} onChange={event => setSearch(event.target.value)} placeholder="Nama, email, atau requirement" />
              <label className="flex flex-col gap-sm text-b3 font-bold text-secondary-1000">Kompetisi<select className={control} value={competition} onChange={event => setCompetition(event.target.value)}><option value="">Semua kompetisi</option>{competitions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
              <label className="flex flex-col gap-sm text-b3 font-bold text-secondary-1000">Status<select className={control} value={status} onChange={event => setStatus(event.target.value)}><option value="">Semua status</option>{Object.entries(statuses).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
            </div>
          </div>
          {submissions.isPending && <p role="status">Memuat berkas peserta...</p>}
          {submissions.isError && <div className={card}><p role="status">Berkas belum dapat dimuat. Gunakan Muat ulang untuk mencoba lagi.</p></div>}
          {submissions.isSuccess && <p role="status" className="text-b3 text-neutral-800">{filtered.length} berkas ditampilkan</p>}
          {submissions.isSuccess && filtered.length === 0 && <div className={card}><h3 className="font-ui font-bold">Belum ada berkas yang sesuai</h3><p className="mt-sm text-b3 text-neutral-800">Berkas yang dikirim peserta akan muncul di sini. Coba ubah pencarian atau filter.</p></div>}
          {filtered.map(item => <article key={item.id} className={card}>
            <div className="flex flex-wrap items-start justify-between gap-md"><div className="min-w-0"><p className="text-b3 text-secondary-800">{item.competition_name}</p><h3 className="mt-sm wrap-anywhere font-ui text-s4 font-bold">{item.requirement_name}</h3><p className="mt-sm wrap-anywhere text-b3 text-neutral-800">{item.team_name || item.participant_name || "Peserta"}{item.participant_email && ` · ${item.participant_email}`}</p></div><span className={`rounded-full px-md py-sm text-b3 font-semibold ${item.status === "accepted" ? "bg-success-100 text-success-1000" : item.status === "rejected" ? "bg-error-100 text-error-1000" : "bg-secondary-100 text-secondary-1000"}`}>{statuses[item.status]}</span></div>
            <p className="mt-md text-b3 text-neutral-800">Deadline: {date(item.due_at)} (WIB)</p>
            {item.rejection_reason && <p className="mt-sm text-b3 text-error-1000">Alasan penolakan: {item.rejection_reason}</p>}
            <div className="mt-lg flex flex-wrap gap-sm">
              {item.fileUrl && <a className="ui-action ui-action-secondary ui-action-sm" href={item.fileUrl} target="_blank" rel="noopener noreferrer">Buka berkas<span className="sr-only"> {item.file_name} (tab baru)</span></a>}
              {item.status === "pending" && item.fileUrl && <Button size="sm" variant="ghost" onClick={() => setReview(review === item.id ? null : item.id)} aria-expanded={review === item.id} aria-controls={`review-${item.id}`}>Review berkas</Button>}
              {!item.fileUrl && <p className="text-b3 text-neutral-800">Tidak ada berkas untuk direview.</p>}
            </div>
            {review === item.id && <form id={`review-${item.id}`} className="mt-lg flex flex-col gap-md border-t border-neutral-300 pt-lg" onSubmit={event => void submit(event, `submissions/${encodeURIComponent(item.id)}`, data => ({ status: data.get("decision"), reason: data.get("reason") }))}>
              <label className="flex flex-col gap-sm text-b3 font-semibold">Keputusan<select name="decision" className={control} required onChange={event => { const field = event.currentTarget.form?.elements.namedItem("reason") as HTMLTextAreaElement; field.required = event.target.value === "rejected"; }}><option value="accepted">Terima berkas</option><option value="rejected">Tolak berkas</option></select></label>
              <label className="flex flex-col gap-sm text-b3 font-semibold">Alasan (wajib jika ditolak)<textarea name="reason" rows={3} className={control} /></label>
              <p className="text-b3 text-neutral-800">Penolakan akan menghapus berkas peserta. Pastikan keputusan sudah benar.</p>
              <div className="flex flex-wrap gap-sm"><Button type="submit" loading={mutation.isPending}>Simpan keputusan</Button><Button variant="ghost" onClick={() => setReview(null)}>Batal</Button></div>
            </form>}
            <details className="mt-lg border-t border-neutral-300 pt-md"><summary className="cursor-pointer py-sm font-ui text-b3 font-semibold text-secondary-800">Ubah deadline requirement</summary><form className="mt-md flex flex-col gap-md" onSubmit={event => void submit(event, `requirements/${encodeURIComponent(item.requirement_id)}/deadline`, data => ({ dueAt: `${data.get("dueAt")}:00+07:00` }))}>
              <p className="text-b3 text-neutral-800">Perubahan berlaku untuk semua peserta dengan requirement ini.</p><Input id={`deadline-${item.id}`} name="dueAt" label="Deadline baru (WIB)" type="datetime-local" required /><Button className="self-start" type="submit" variant="secondary" loading={mutation.isPending}>Simpan deadline</Button>
            </form></details>
          </article>)}
        </Tabs.Content>
        <Tabs.Content value="registrations" className={card}>
          <div className="flex flex-wrap items-center justify-between gap-md"><div><h2 className="font-heading text-h4">Data pendaftar</h2><p className="mt-sm text-b3 text-neutral-800">Pendaftaran kompetisi dan kegiatan IOE 2027.</p></div><div className="flex flex-wrap gap-sm"><Button variant="ghost" size="sm" loading={registrations.isFetching} onClick={() => void registrations.refetch()}>Muat ulang</Button><Button size="sm" onClick={() => void exportCsv()}>Export tim (.csv)</Button></div></div>
          {registrations.isPending && <p className="mt-lg" role="status">Memuat pendaftar...</p>}
          {registrations.isError && <p className="mt-lg" role="status">Data belum dapat dimuat. Silakan coba lagi.</p>}
          {registrations.isSuccess && <><RegistrationTable title="Tim kompetisi" headers={["Tim", "Kompetisi / batch", "Ketua", "Tanggal daftar"]} rows={registrations.data.teams.map(team => ({ id: team.team_id, cells: [team.team_name, `${team.competition_name} / ${team.batch_name}`, `${team.leader_name} · ${team.leader_email}`, date(team.created_at)] }))} /><RegistrationTable title="Peserta kegiatan" headers={["Peserta", "Kegiatan / sesi", "Kontak", "Institusi / domisili", "Sumber informasi", "Berkas", "Tanggal daftar"]} rows={registrations.data.eventRegistrations.map(item => ({ id: item.registration_id, cells: [item.participant_name, `${item.event_name} / ${sessionLabel(item.session_type)}`, `${item.email} · ${item.phone}`, `${item.institution} / ${item.domicile}`, (item.discovery_source && discoverySourceLabels[item.discovery_source]) || "—", <span key="files" className="flex flex-wrap gap-sm">{item.cv_url && <a className="text-secondary-800 underline" href={item.cv_url} target="_blank" rel="noopener noreferrer">CV</a>}{item.payment_proof_url && <a className="text-secondary-800 underline" href={item.payment_proof_url} target="_blank" rel="noopener noreferrer">Bukti bayar</a>}{!item.cv_url && !item.payment_proof_url && "—"}</span>, date(item.created_at)] }))} /></>}
        </Tabs.Content>
        <Tabs.Content value="schedules"><AdminSchedulesPanel /></Tabs.Content>
        <Tabs.Content value="password" className={card}>
          <h2 className="font-heading text-h4">Reset password peserta</h2><p className="mt-sm text-b3 text-neutral-800">Hanya untuk akun peserta. Password akun panitia tidak dapat diubah di sini.</p>
          <form className="mt-lg flex flex-col gap-lg" onSubmit={event => void submit(event, "users/password", data => ({ email: data.get("email"), newPassword: data.get("newPassword") }))}>
            <Input id="reset-email" name="email" label="Email peserta" type="email" required autoComplete="off" />
            <Input id="reset-password" name="newPassword" label="Password baru (minimal 8 karakter, huruf dan angka)" type="password" required minLength={8} pattern="(?=.*[A-Za-z])(?=.*[0-9]).{8,}" revealable autoComplete="new-password" />
            <Button type="submit" variant="destructive" loading={mutation.isPending} className="self-start">Reset password</Button>
          </form>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  </main>;
}

function RegistrationTable({ title, headers, rows }: { title: string; headers: string[]; rows: { id: string; cells: ReactNode[] }[] }) {
  return <section className="mt-xl"><h3 className="font-ui text-s4 font-bold">{title} <span className="text-neutral-800">({rows.length})</span></h3>{rows.length === 0 ? <p className="mt-md text-b3 text-neutral-800">Belum ada pendaftar.</p> : <div className="mt-md overflow-x-auto rounded-xl border border-neutral-300" tabIndex={0} role="region" aria-label={title}><table className="w-full text-left text-b3"><caption className="sr-only">{title}</caption><thead className="bg-tertiary-100"><tr>{headers.map(header => <th key={header} scope="col" className="px-md py-md font-ui font-bold text-secondary-1000">{header}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.id} className="border-t border-neutral-300">{row.cells.map((cell, index) => <td key={index} className="px-md py-md align-top wrap-anywhere">{cell || "—"}</td>)}</tr>)}</tbody></table></div>}</section>;
}
