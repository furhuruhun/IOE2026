"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormBanner } from "@/components/ui/FormBanner";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { adminRequest, type AdminSchedules, type RegistrationWindow, type TimelineMilestone } from "@/services/adminService";
import { scheduleChanges, wibInput } from "./scheduleDates";
import styles from "./AdminPanel.module.css";

const control = "min-h-11 w-full min-w-0 rounded-xl border border-neutral-500 bg-neutral-100 px-md py-sm text-b3 text-secondary-1000 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-800";
const card = `${styles.card} min-w-0 rounded-3xl border border-secondary-200 bg-neutral-100 p-lg md:p-xl`;

export function AdminSchedulesPanel() {
  const schedules = useQuery({ queryKey: ["admin", "schedules"], queryFn: () => adminRequest<AdminSchedules>("schedules"), retry: false });
  const [competitionId, setCompetitionId] = useState("");
  const [timelineId, setTimelineId] = useState("");
  const [eventId, setEventId] = useState("");
  const [saved, setSaved] = useState(false);
  const onSaved = setSaved;
  const data = schedules.data;
  const milestones = data?.timeline.filter(item => item.competitionId === competitionId) ?? [];
  const batches = data?.batches.filter(item => item.competitionId === competitionId) ?? [];
  const milestone = milestones.find(item => item.id === timelineId);
  const batch = batches[0];
  const event = data?.events.find(item => item.id === eventId);
  return <div className="flex min-w-0 flex-col gap-lg">
    <section className={card}>
      <div className="flex flex-wrap items-center justify-between gap-md"><h2 className="font-heading text-h4">Jadwal Deadline</h2><Button variant="ghost" size="sm" loading={schedules.isFetching} onClick={() => void schedules.refetch()}>Muat ulang jadwal</Button></div>
      <p className="mt-md text-b3 text-neutral-800">Semua waktu menggunakan WIB (UTC+7). Perubahan timeline, pendaftaran kompetisi, dan pendaftaran kegiatan disimpan secara terpisah.</p>
      <p className="mt-sm text-b3 text-neutral-800">Untuk deadline berkas pendaftaran, buka tab Review berkas lalu pilih Ubah deadline requirement.</p>
      {saved && <div className="mt-md"><FormBanner variant="success" message="Perubahan berhasil disimpan." /></div>}
      {schedules.isPending && <p className="mt-md" role="status">Memuat jadwal...</p>}
      {schedules.isError && <div className="mt-md"><FormBanner variant="error" message="Jadwal belum dapat dimuat. Gunakan Muat ulang jadwal untuk mencoba lagi." /></div>}
      {data && <div className="mt-lg"><Picker id="schedule-competition" label="Kompetisi" value={competitionId} onChange={value => { setCompetitionId(value); setTimelineId(""); }} options={data.competitions} /></div>}
      {data && competitionId && <>
        <div className="mt-xl border-t border-neutral-300 pt-xl"><h3 className="font-heading text-h4">Timeline kompetisi</h3><p className="mt-sm text-b3 text-neutral-800">Atur milestone dan kalender peserta. Perubahan ini tidak mengubah batas pendaftaran atau deadline berkas.</p>
        <div className="mt-lg"><Picker id="schedule-milestone" label="Milestone" value={timelineId} onChange={setTimelineId} disabled={!competitionId} options={milestones.map(item => ({ id: item.id, name: item.label }))} /></div>
        {competitionId && milestones.length === 0 && <p className="mt-md" role="status">Belum ada milestone untuk kompetisi ini.</p>}
        {milestone && <ScheduleEditor key={JSON.stringify(milestone)} path={`competitions/${encodeURIComponent(competitionId)}/timeline/${encodeURIComponent(milestone.id)}`} record={milestone} onSaved={onSaved} />}
        </div>
        <div className="mt-xl border-t border-neutral-300 pt-xl"><h3 className="font-heading text-h4">Pendaftaran kompetisi</h3><p className="mt-sm text-b3 text-neutral-800">Atur periode pendaftaran kompetisi.</p>
        {competitionId && batches.length === 0 && <p className="mt-md" role="status">Belum ada batch untuk kompetisi ini.</p>}
        {batch && <ScheduleEditor key={JSON.stringify(batch)} path={`competition-batches/${encodeURIComponent(batch.id)}/registration-window`} record={batch} onSaved={onSaved} />}
        </div>
      </>}
    </section>
    {data && <>
      <section className={card}><h3 className="font-heading text-h4">Pendaftaran kegiatan</h3><p className="mt-sm text-b3 text-neutral-800">Atur periode pendaftaran kegiatan. Tanggal pelaksanaan kegiatan tetap terpisah.</p>
        <div className="mt-lg"><Picker id="schedule-event" label="Kegiatan" value={eventId} onChange={setEventId} options={data.events} /></div>
        {data.events.length === 0 && <p className="mt-md" role="status">Belum ada kegiatan.</p>}
        {event && <ScheduleEditor key={JSON.stringify(event)} path={`events/${encodeURIComponent(event.id)}/registration-window`} record={event} onSaved={onSaved} />}
      </section>
    </>}
  </div>;
}

function Picker({ id, label, value, onChange, options, disabled }: { id: string; label: string; value: string; onChange: (value: string) => void; options: { id: string; name: string }[]; disabled?: boolean }) {
  return <label htmlFor={id} className="flex min-w-0 flex-col gap-sm text-b3 font-bold text-secondary-1000">{label}<select id={id} className={control} value={value} disabled={disabled} onChange={event => onChange(event.target.value)}><option value="">Pilih {label.toLowerCase()}</option>{options.map(option => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label>;
}

function ScheduleEditor({ path, record, onSaved }: { path: string; record: RegistrationWindow | TimelineMilestone; onSaved: (saved: boolean) => void }) {
  const client = useQueryClient();
  const handleError = useErrorHandler();
  const [notice, setNotice] = useState<{ text: string; error: boolean } | null>(null);
  const [rangeError, setRangeError] = useState("");
  const mutation = useMutation({ mutationFn: (body: Record<string, unknown>) => adminRequest(path, "PATCH", body) });
  const timeline = "occursAt" in record;
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    onSaved(false);
    setRangeError("");
    const body = scheduleChanges(record, new FormData(event.currentTarget));
    if (!Object.keys(body).length) { setNotice({ text: "Tidak ada perubahan untuk disimpan.", error: false }); return; }
    if (!timeline) {
      const opensAt = String(body.opensAt ?? record.opensAt);
      const closesAt = String(body.closesAt ?? record.closesAt);
      if (Date.parse(opensAt) > Date.parse(closesAt)) { const message = "Tanggal mulai harus sebelum atau sama dengan tanggal tutup."; setRangeError(message); setNotice({ text: message, error: true }); return; }
    }
    try {
      await mutation.mutateAsync(body);
      // Update only the saved record so other in-progress forms keep their values.
      client.setQueryData<AdminSchedules>(["admin", "schedules"], data => {
        if (!data) return data;
        const group = timeline ? "timeline" : path.startsWith("events/") ? "events" : "batches";
        const patch = { ...body, ...(body.showInCalendar === undefined ? {} : { showInCalendar: body.showInCalendar ? 1 : 0 }) };
        return { ...data, [group]: data[group].map(item => item.id === record.id ? { ...item, ...patch } : item) };
      });
      onSaved(true);
      for (const queryKey of [["competitions"], ["events"], ["dashboard"]]) void client.invalidateQueries({ queryKey });
    } catch (error) {
      const show = (text: string) => setNotice({ text, error: true });
      handleError(error instanceof Error ? error : undefined, { onToast: show, onInlineBanner: show, onInlineField: show });
    }
  }
  let fields: ReactNode;
  if (timeline) fields = <>
    <Input id={`${record.id}-label`} name="label" label="Label milestone" defaultValue={record.label} required pattern=".*\S.*" />
    <Input id={`${record.id}-occursAt`} name="occursAt" label="Tanggal dan waktu (WIB)" type="datetime-local" step="1" defaultValue={wibInput(record.occursAt)} required />
    <label className="flex min-h-11 items-center gap-sm text-b3"><input name="showInCalendar" type="checkbox" defaultChecked={Boolean(record.showInCalendar)} />Tampilkan di kalender peserta</label>
  </>;
  else fields = <>
    <Input id={`${record.id}-opensAt`} name="opensAt" label="Pendaftaran dibuka (WIB)" type="datetime-local" step="1" defaultValue={wibInput(record.opensAt)} required />
    <Input id={`${record.id}-closesAt`} name="closesAt" label="Pendaftaran ditutup (WIB)" type="datetime-local" step="1" defaultValue={wibInput(record.closesAt)} error={rangeError} required />
  </>;
  return <form className="mt-lg flex flex-col gap-md" onSubmit={event => void save(event)}>
    <fieldset disabled={mutation.isPending} className="grid min-w-0 gap-md md:grid-cols-2">{fields}</fieldset>
    {notice && <FormBanner variant={notice.error ? "error" : "success"} message={notice.text} />}
    <Button type="submit" variant="secondary" className="self-start" loading={mutation.isPending}>Simpan perubahan</Button>
  </form>;
}
