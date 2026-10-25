'use client';
import { useEffect, useState } from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { useCompetition } from '@/hooks/useCompetitions';
import { useMyTeam } from '@/hooks/useTeam';
import { useRequirements } from '@/hooks/useRequirements';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useDashboardDetailStore } from '@/stores/useDashboardDetailStore';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { CountdownTimer } from '@/components/ui/CountdownTimer';
import { ActivityTeamActions } from './ActivityTeamActions';
import { RequirementCard } from './RequirementCard';
import { CompetitionDetailContactSection } from '@/features/competitions/CompetitionDetailContactSection';
import { discordInviteUrl } from '@/features/competitions/competitionsContent';

export function DashboardActivityDetail({ slug }: { slug: string }) {
  const close = useDashboardDetailStore(state => state.close);
  const competition = useCompetition(slug);
  const team = useMyTeam(competition.data?.id, Boolean(competition.data));
  const requirements = useRequirements(competition.data?.id);
  const handleError = useErrorHandler();
  const [message, setMessage] = useState<string | null>(null);
  const error = competition.error ?? team.error ?? requirements.error;
  useEffect(() => {
    if (error) {
      handleError(error, { onToast: setMessage, redirectTo: '/login?redirect=%2Fdashboard' });
      if ('code' in error && error.code === 'NOT_FOUND') close();
    }
  }, [error, handleError, close]);
  const refresh = () => { void competition.refetch(); void team.refetch(); void requirements.refetch(); };
  const data = competition.data;
  return <div className="wrap-anywhere flex min-w-0 flex-col gap-6">
    <Button variant="ghost" size="sm" onClick={close} className="self-start">Back</Button>
    {message && <Toast status="error" title={message} onDismiss={() => setMessage(null)} />}
    {error ? <Button onClick={refresh} className="self-start">Coba lagi</Button> : !data ? <div role="status" className="h-40 animate-pulse rounded-xl bg-neutral-200">Memuat aktivitas...</div> : <>
      <section className="flex flex-col gap-4 rounded-xl bg-secondary-1000 p-6 text-neutral-100 md:rounded-[36px] md:p-8">
        <h1 className="text-h5 md:text-h3">{data.name}</h1>
        <p className="text-b3">{data.description}</p>
        <div className="flex flex-wrap gap-3">
          {data.guidebookUrl ? <a href={data.guidebookUrl} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-primary-100 px-4 py-2 font-ui text-b3 text-secondary-1000">Lihat Guidebook</a> : <Button size="sm" disabled>Lihat Guidebook</Button>}
          <a href={discordInviteUrl} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-primary-100 px-4 py-2 font-ui text-b3 text-secondary-1000">Join Discord</a>
        </div>
        <div className="-mx-6 flex justify-center md:mx-0"><CountdownTimer targetDate={new Date(data.deadline)} /></div>
      </section>
      <div className="grid min-w-0 gap-6 xl:grid-cols-3">
      <div className="flex min-w-0 flex-col gap-6 xl:col-span-2">
      <section className="flex flex-col gap-3 rounded-xl bg-neutral-100 p-6 shadow-sm md:rounded-[36px]">
        <h2 className="text-h5 text-secondary-1000">Your Team</h2>
        {team.isPending ? <p role="status">Memuat tim...</p> : team.data ? <>
          <h3 className="font-ui text-b2 font-bold text-secondary-1000">{team.data.teamName}</h3>
          <p className="break-words text-b3 text-neutral-700">Team Code: {team.data.teamCode}</p>
                    <div className="flex flex-wrap gap-2 text-b4">
            {team.data.batch && <span className="rounded-lg bg-primary-100 px-3 py-2 text-primary-1000">{team.data.batch}</span>}
            {team.data.status && <span className={`rounded-lg px-3 py-2 ${team.data.status === 'verified' ? 'bg-success-500 text-success-1000' : 'bg-warning-400 text-warning-1000'}`}>{team.data.status === 'verified' ? 'Verified' : 'Pending'}</span>}
            <span className="rounded-lg bg-neutral-200 px-3 py-2 text-neutral-700">{team.data.visibility}</span>
          </div>
          {team.data.leader && <p className="text-b3 text-neutral-700">Team Leader: {team.data.leader.name}</p>}
          <ActivityTeamActions id={data.id} team={team.data} />
        </> : <p className="text-b3 text-neutral-700">Belum ada tim untuk kompetisi ini.</p>}
      </section>
      <section className="flex min-w-0 flex-col gap-4">
        <h2 className="text-h5 text-secondary-1000 md:text-h4">Registration Requirements</h2>
        {requirements.isPending ? <p role="status">Memuat persyaratan...</p> : requirements.data?.length ? <Accordion.Root type="multiple" className="flex flex-col gap-4">{requirements.data.map(item => <RequirementCard key={item.requirementId} competitionId={data.id} item={item} />)}</Accordion.Root> : <p className="text-b3 text-neutral-700">Belum ada persyaratan.</p>}
      </section>
      </div>
      <aside>
      <section className="rounded-xl bg-neutral-100 p-6 shadow-sm md:rounded-[36px]">
        <h2 className="mb-4 text-h5 text-secondary-1000">Timeline</h2>
        <ol className="flex flex-col gap-3 text-b3 text-neutral-700">{data.timeline.map((item, index) => <li key={index}><strong>{item.date}</strong> — {item.label}</li>)}</ol>
      </section>
      </aside>
      </div>
      <CompetitionDetailContactSection />
    </>}
  </div>;
}
