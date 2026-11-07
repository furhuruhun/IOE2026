"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { FormBanner } from "@/components/ui/FormBanner";
import { adminRequest, type AdminSchedules, type AdminQualification, type AdminRequirement } from "@/services/adminService";
import styles from "./AdminPanel.module.css";

const card = `${styles.card} min-w-0 rounded-3xl border border-secondary-200 bg-neutral-100 p-lg md:p-xl`;
const control = "min-h-11 w-full rounded-xl border border-neutral-500 bg-neutral-100 px-md py-sm text-b3 text-secondary-1000 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-800";
const formats = ["pdf", "pptx", "zip", "jpg", "png"] as const;
const inputDate = (value: string) => (value ? value.slice(0, 16) : "");

type FormValue = {
  name: string;
  stage: "registration" | "submission" | "final";
  type: "group" | "individual";
  dueAt: string;
  instructions: string;
  acceptedFormats: string[];
  sortOrder: string;
};

function emptyForm(): FormValue {
  return {
    name: "",
    stage: "submission",
    type: "group",
    dueAt: "",
    instructions: "",
    acceptedFormats: ["pdf"],
    sortOrder: "0",
  };
}

function toForm(item: AdminRequirement): FormValue {
  return {
    name: item.name,
    stage: item.stage,
    type: item.type,
    dueAt: inputDate(item.dueAt),
    instructions: item.instructions,
    acceptedFormats: item.acceptedFormats,
    sortOrder: String(item.sortOrder),
  };
}

const stageLabels: Record<FormValue["stage"], string> = {
  registration: "Tahap Pendaftaran",
  submission: "Submission Hasil Karya",
  final: "Tahap Final",
};

const teamStatusLabels: Record<"pendaftar" | "peserta" | "finalis", string> = {
  pendaftar: "Pendaftar",
  peserta: "Peserta",
  finalis: "Finalis",
};

function normalizeStatus(status: AdminQualification["status"]): "pendaftar" | "peserta" | "finalis" {
  if (status === "finalis" || status === "passed") return "finalis";
  if (status === "peserta") return "peserta";
  return "pendaftar";
}

export function AdminSubmissionSettingsPanel() {
  const client = useQueryClient();
  const [competitionId, setCompetitionId] = useState("");
  const [form, setForm] = useState<FormValue>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ text: string; error: boolean } | null>(null);
  const [teamSearch, setTeamSearch] = useState("");
  const [teamStatusFilter, setTeamStatusFilter] = useState<string>("");

  const schedules = useQuery({
    queryKey: ["admin", "schedules"],
    queryFn: () => adminRequest<AdminSchedules>("schedules"),
    retry: false,
  });

  const requirements = useQuery({
    queryKey: ["admin", "requirements", competitionId],
    queryFn: () => adminRequest<AdminRequirement[]>(`competitions/${encodeURIComponent(competitionId)}/requirements`),
    enabled: Boolean(competitionId),
    retry: false,
  });

  const qualifications = useQuery({
    queryKey: ["admin", "qualifications", competitionId],
    queryFn: () => adminRequest<AdminQualification[]>(`competitions/${encodeURIComponent(competitionId)}/qualifications`),
    enabled: Boolean(competitionId),
    retry: false,
  });

  const save = useMutation({
    mutationFn: ({ id, body }: { id?: string; body: FormValue }) =>
      adminRequest(
        id ? `requirements/${encodeURIComponent(id)}` : `competitions/${encodeURIComponent(competitionId)}/requirements`,
        id ? "PATCH" : "POST",
        {
          name: body.name,
          stage: body.stage,
          type: body.type,
          dueAt: `${body.dueAt}:00+07:00`,
          instructions: body.instructions,
          acceptedFormats: body.acceptedFormats,
          sortOrder: Number(body.sortOrder) || 0,
        }
      ),
    onSuccess: () => {
      setNotice({ text: "Pengaturan submission berhasil disimpan.", error: false });
      setForm(emptyForm());
      setEditingId(null);
      void client.invalidateQueries({ queryKey: ["admin", "requirements", competitionId] });
      void client.invalidateQueries({ queryKey: ["admin", "submissions"] });
    },
    onError: () => setNotice({ text: "Pengaturan submission belum dapat disimpan.", error: true }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminRequest(`requirements/${encodeURIComponent(id)}`, "DELETE"),
    onSuccess: () => {
      setNotice({ text: "Submission berhasil dihapus.", error: false });
      void client.invalidateQueries({ queryKey: ["admin", "requirements", competitionId] });
      void client.invalidateQueries({ queryKey: ["admin", "submissions"] });
    },
    onError: () => setNotice({ text: "Gagal menghapus submission.", error: true }),
  });

  const qualify = useMutation({
    mutationFn: ({ teamId, status }: { teamId: string; status: "pendaftar" | "peserta" | "finalis" }) =>
      adminRequest(`competitions/${encodeURIComponent(competitionId)}/qualifications/${encodeURIComponent(teamId)}`, "PATCH", { status }),
    onSuccess: () => {
      setNotice({ text: "Status tim berhasil diperbarui.", error: false });
      void client.invalidateQueries({ queryKey: ["admin", "qualifications", competitionId] });
      void client.invalidateQueries({ queryKey: ["admin", "submissions"] });
    },
    onError: () => setNotice({ text: "Status tim belum dapat diperbarui.", error: true }),
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!competitionId || !form.dueAt || !form.name.trim()) return;
    if (form.acceptedFormats.length === 0) {
      setNotice({ text: "Pilih minimal satu format file yang diperbolehkan.", error: true });
      return;
    }
    save.mutate({ id: editingId ?? undefined, body: form });
  };

  const selected = schedules.data?.competitions.find((item) => item.id === competitionId);

  const teamList = (qualifications.data ?? []).filter((team) => {
    const matchesSearch = `${team.teamName} ${team.teamCode} ${team.leaderName}`.toLowerCase().includes(teamSearch.toLowerCase());
    const currentStatus = normalizeStatus(team.status);
    const matchesStatus = !teamStatusFilter || currentStatus === teamStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendaftarCount = (qualifications.data ?? []).filter((t) => normalizeStatus(t.status) === "pendaftar").length;
  const pesertaCount = (qualifications.data ?? []).filter((t) => normalizeStatus(t.status) === "peserta").length;
  const finalisCount = (qualifications.data ?? []).filter((t) => normalizeStatus(t.status) === "finalis").length;

  return (
    <div className="flex min-w-0 flex-col gap-lg">
      {notice && <FormBanner variant={notice.error ? "error" : "success"} message={notice.text} />}

      <section className={card}>
        <h2 className="font-heading text-h4">Pengaturan Jenis Submisi & Tahap Lomba</h2>
        <p className="mt-sm text-b3 text-neutral-800">
          Atur kebutuhan submission (pendaftaran, submission hasil karya, dan tahap final). Tahap final hanya dapat diakses oleh tim yang telah diverifikasi lolos oleh panitia.
        </p>

        <div className="mt-lg">
          <label className="flex flex-col gap-sm text-b3 font-bold text-secondary-1000">
            Pilih Kompetisi
            <select
              className={control}
              value={competitionId}
              onChange={(event) => {
                setCompetitionId(event.target.value);
                setForm(emptyForm());
                setEditingId(null);
              }}
            >
              <option value="">-- Pilih Kompetisi --</option>
              {(schedules.data?.competitions ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {selected && (
          <form className="mt-xl grid gap-md border-t border-neutral-300 pt-xl md:grid-cols-2" onSubmit={submit}>
            <div className="md:col-span-2">
              <h3 className="font-ui text-s4 font-bold text-secondary-1000">
                {editingId ? "Edit Jenis Submisi" : "Tambah Jenis Submisi Baru"}
              </h3>
            </div>

            <label className="flex flex-col gap-sm text-b3 font-bold">
              Nama Submisi
              <input
                className={control}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Contoh: Hasil Pekerjaan Business Case"
                required
              />
            </label>

            <label className="flex flex-col gap-sm text-b3 font-bold">
              Tahap
              <select
                className={control}
                value={form.stage}
                onChange={(e) => setForm({ ...form, stage: e.target.value as FormValue["stage"] })}
              >
                <option value="registration">Tahap Pendaftaran</option>
                <option value="submission">Submission Hasil Karya</option>
                <option value="final">Tahap Final</option>
              </select>
            </label>

            <label className="flex flex-col gap-sm text-b3 font-bold">
              Tipe Submisi
              <select
                className={control}
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as FormValue["type"] })}
              >
                <option value="group">Group</option>
                <option value="individual">Individual</option>
              </select>
            </label>

            <label className="flex flex-col gap-sm text-b3 font-bold">
              Deadline (WIB)
              <input
                className={control}
                type="datetime-local"
                value={form.dueAt}
                onChange={(e) => setForm({ ...form, dueAt: e.target.value })}
                required
              />
            </label>

            <label className="flex flex-col gap-sm text-b3 font-bold md:col-span-2">
              Instruksi Submisi
              <textarea
                className={control}
                rows={3}
                value={form.instructions}
                onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                placeholder="Contoh: Upload proposal final maksimal 20 halaman / 5mb. Gunakan format yang ditentukan."
              />
            </label>

            <fieldset className="md:col-span-2">
              <legend className="text-b3 font-bold text-secondary-1000">
                Format File yang Diperbolehkan
              </legend>
              <div className="mt-sm flex flex-wrap gap-lg">
                {formats.map((format) => (
                  <label key={format} className="flex items-center gap-sm text-b3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.acceptedFormats.includes(format)}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          acceptedFormats: e.target.checked
                            ? [...form.acceptedFormats, format]
                            : form.acceptedFormats.filter((item) => item !== format),
                        })
                      }
                    />
                    <span className="font-semibold uppercase">.{format}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-wrap gap-sm pt-sm md:col-span-2">
              <Button type="submit" loading={save.isPending}>
                {editingId ? "Simpan Perubahan Submisi" : "Tambah Submisi"}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm());
                  }}
                >
                  Batal Edit
                </Button>
              )}
            </div>
          </form>
        )}
      </section>

      {competitionId && (
        <section className={card}>
          <div className="flex flex-wrap items-center justify-between gap-md">
            <div>
              <h3 className="font-heading text-h4">Daftar Submisi Terdaftar</h3>
              <p className="mt-xs text-b3 text-neutral-800">
                Semua jenis berkas yang harus diunggah peserta untuk kompetisi ini.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              loading={requirements.isFetching}
              onClick={() => void requirements.refetch()}
            >
              Muat ulang
            </Button>
          </div>

          {requirements.isPending ? (
            <p className="mt-md" role="status">Memuat daftar submission...</p>
          ) : requirements.data?.length ? (
            <div className="mt-md flex flex-col gap-md">
              {requirements.data.map((item) => (
                <article key={item.id} className="rounded-2xl border border-neutral-300 bg-neutral-50 p-md md:p-lg">
                  <div className="flex flex-wrap items-start justify-between gap-md">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-sm">
                        <span
                          className={`rounded-full px-sm py-xs text-b4 font-bold ${
                            item.stage === "final"
                              ? "bg-secondary-900 text-neutral-100"
                              : item.stage === "submission"
                              ? "bg-primary-200 text-secondary-1000"
                              : "bg-neutral-200 text-neutral-800"
                          }`}
                        >
                          {stageLabels[item.stage] ?? item.stage}
                        </span>
                        <span className="rounded-full bg-tertiary-100 px-sm py-xs text-b4 font-semibold text-secondary-900">
                          {item.type === "group" ? "Group (Tim)" : "Individual"}
                        </span>
                      </div>
                      <h4 className="mt-sm font-ui text-s4 font-bold text-secondary-1000">{item.name}</h4>
                      <p className="mt-xs text-b3 text-neutral-800">
                        Deadline: {item.dueAt} (WIB)
                      </p>
                      {item.instructions && (
                        <p className="mt-xs text-b4 text-neutral-700 italic">
                          Instruksi: {item.instructions}
                        </p>
                      )}
                      <p className="mt-xs text-b4 text-neutral-600">
                        Format: {item.acceptedFormats.map((f) => f.toUpperCase()).join(", ")}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-sm">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditingId(item.id);
                          setForm(toForm(item));
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm(`Yakin ingin menghapus submission "${item.name}"?`)) {
                            remove.mutate(item.id);
                          }
                        }}
                      >
                        Hapus
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-md text-b3 text-neutral-800">Belum ada submission yang disetting untuk kompetisi ini.</p>
          )}
        </section>
      )}

      {competitionId && (
        <section className={card}>
          <div className="flex flex-wrap items-start justify-between gap-md">
            <div>
              <h3 className="font-heading text-h4">Manajemen Status Tim</h3>
              <p className="mt-xs text-b3 text-neutral-800">
                Ubah status tim langsung per tim (Pendaftar, Peserta, Finalis). Tim saat awal mendaftar berstatus Pendaftar. Admin memeriksa berkas persyaratan satu per satu, kemudian mengubah status tim menjadi Peserta pada menu di bawah ini jika persyaratan telah terpenuhi. Tim berstatus Finalis dapat mengakses submission tahap final.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-sm text-b4">
              <span className="rounded-lg bg-neutral-200 px-md py-sm font-semibold">
                Total: {qualifications.data?.length ?? 0} Tim
              </span>
              <span className="rounded-lg bg-warning-400 px-md py-sm font-bold text-warning-1000">
                Pendaftar: {pendaftarCount}
              </span>
              <span className="rounded-lg bg-primary-200 px-md py-sm font-bold text-secondary-1000">
                Peserta: {pesertaCount}
              </span>
              <span className="rounded-lg bg-success-500 px-md py-sm font-bold text-success-1000">
                Finalis: {finalisCount}
              </span>
            </div>
          </div>

          <div className="mt-lg grid gap-md sm:grid-cols-2">
            <input
              type="text"
              className={control}
              placeholder="Cari nama tim, kode, atau ketua..."
              value={teamSearch}
              onChange={(e) => setTeamSearch(e.target.value)}
            />
            <select
              className={control}
              value={teamStatusFilter}
              onChange={(e) => setTeamStatusFilter(e.target.value)}
            >
              <option value="">Semua Status Tim</option>
              <option value="pendaftar">Pendaftar</option>
              <option value="peserta">Peserta</option>
              <option value="finalis">Finalis</option>
            </select>
          </div>

          {qualifications.isPending ? (
            <p className="mt-md" role="status">Memuat data tim...</p>
          ) : teamList.length ? (
            <div className="mt-md flex flex-col gap-sm">
              {teamList.map((team) => {
                const currentStatus = normalizeStatus(team.status);
                return (
                  <div
                    key={team.teamId}
                    className={`flex flex-wrap items-center justify-between gap-md rounded-2xl border p-md ${
                      currentStatus === "finalis"
                        ? "border-success-500 bg-success-100/30"
                        : currentStatus === "peserta"
                        ? "border-primary-400 bg-primary-100/30"
                        : "border-neutral-300 bg-neutral-50"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-sm">
                        <p className="font-ui text-b2 font-bold text-secondary-1000">{team.teamName}</p>
                        <span
                          className={`rounded-md px-sm py-xs text-b4 font-bold ${
                            currentStatus === "finalis"
                              ? "bg-success-500 text-success-1000"
                              : currentStatus === "peserta"
                              ? "bg-primary-200 text-secondary-1000"
                              : "bg-warning-400 text-warning-1000"
                          }`}
                        >
                          {teamStatusLabels[currentStatus]}
                        </span>
                      </div>
                      <p className="mt-xs text-b4 text-neutral-700">
                        Kode Tim: <span className="font-mono font-bold">{team.teamCode}</span> · Ketua: {team.leaderName}
                      </p>
                    </div>

                    <label className="flex items-center gap-sm text-b3 font-semibold text-secondary-1000">
                      <span className="sr-only">Status tim {team.teamName}</span>
                      <select
                        className={`${control} w-auto min-w-44`}
                        value={currentStatus}
                        disabled={qualify.isPending}
                        onChange={(event) =>
                          qualify.mutate({
                            teamId: team.teamId,
                            status: event.target.value as "pendaftar" | "peserta" | "finalis",
                          })
                        }
                      >
                        <option value="pendaftar">Pendaftar</option>
                        <option value="peserta">Peserta</option>
                        <option value="finalis">Finalis</option>
                      </select>
                    </label>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-md text-b3 text-neutral-800">
              {teamSearch || teamStatusFilter ? "Tidak ada tim yang sesuai filter." : "Belum ada tim yang mendaftar di kompetisi ini."}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
