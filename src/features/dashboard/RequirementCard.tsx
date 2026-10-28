'use client';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Accordion from '@radix-ui/react-accordion';
import { Icon } from '@iconify/react/offline';
import { useDashboardDetailStore } from '@/stores/useDashboardDetailStore';
import { useRequirementActions } from '@/hooks/useRequirements';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { createDocumentObjectUrl } from '@/services/requirementService';
import { ApiError } from '@/services/authService';
import { getErrorEntry } from '@/constants/errorMessages';
import { Toast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { formatWibDate } from '@/utils/formatDate';
import type { RequirementItem } from '@/types/requirement';
import { validateDocument } from '@/utils/validateDocument';

export function RequirementCard({ item, competitionId }: { item: RequirementItem; competitionId: string }) {
  const { upload, remove, refresh } = useRequirementActions(competitionId, item.requirementId);
  const handleError = useErrorHandler();
  const closeDetail = useDashboardDetailStore(state => state.close);
  const input = useRef<HTMLInputElement>(null);
  const lastAction = useRef<{ type: 'upload'; file: File } | { type: 'remove' } | null>(null);
  const { setValue, setError, clearErrors, formState: { errors } } = useForm<{ file: File }>();
  const [toast, setToast] = useState<string | null>(null);
  const [serverLock, setServerLock] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const expired = now >= new Date(item.dueDate).getTime();
  const lock = expired ? getErrorEntry('DEADLINE_PASSED').message : item.status === 'accepted' ? getErrorEntry('REQUIREMENT_LOCKED').message : serverLock;
  const busy = upload.isPending || remove.isPending;
  const disabled = Boolean(lock) || busy;
  const onError = (error: Error) => {
    const apiError = error instanceof ApiError ? error : new ApiError('SERVER_ERROR', error.message);
    if (apiError.code === 'REQUIREMENT_LOCKED' || apiError.code === 'DEADLINE_PASSED') {
      setServerLock(getErrorEntry(apiError.code).message);
      void refresh();
    }
    handleError(apiError, {
      redirectTo: '/login?redirect=%2Fdashboard',
      onInlineField: message => setError('file', { message }),
      onInlineBanner: message => setError('file', { message }),
      onToast: setToast,
    });
    if (apiError.code === 'NOT_FOUND') closeDetail();
  };
  const acceptFile = (file?: File) => {
    if (!file || disabled) return;
    clearErrors('file');
    const code = validateDocument(file, item.acceptedFormats);
    if (code) { setError('file', { message: getErrorEntry(code).message }); return; }
    setValue('file', file);
    setToast(null);
    lastAction.current = { type: 'upload', file };
    upload.mutate(file, { onError, onSuccess: () => { lastAction.current = null; } });
  };
  const removeFile = () => {
    if (disabled) return;
    clearErrors('file'); setToast(null);
    lastAction.current = { type: 'remove' };
    remove.mutate(undefined, { onError, onSuccess: () => { lastAction.current = null; } });
  };
  const retry = () => {
    if (disabled) return;
    setToast(null);
    if (lastAction.current?.type === 'upload') acceptFile(lastAction.current.file);
    else if (lastAction.current?.type === 'remove') removeFile();
    else void refresh();
  };
  const file = item.status === 'rejected' ? null : item.file;
  const [documentLink, setDocumentLink] = useState<{ source: string; url: string } | null>(null);
  const fileUrl = file?.url;
  useEffect(() => {
    if (!fileUrl?.startsWith('data:')) return;
    let active = true;
    let objectUrl: string | undefined;
    void createDocumentObjectUrl(fileUrl).then(url => {
      objectUrl = url;
      if (active) setDocumentLink({ source: fileUrl, url });
      else URL.revokeObjectURL(url);
    }).catch(() => { /* Keep the original link if a development fixture cannot be decoded. */ });
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [fileUrl]);
  const viewUrl = documentLink?.source === fileUrl ? documentLink?.url : fileUrl;
  const statusStyle = item.status === 'accepted' ? 'bg-success-100 text-success-1000' : item.status === 'rejected' ? 'bg-error-400 text-error-1000' : 'bg-warning-400 text-warning-1000';
  const statusLabel = item.status === 'accepted' ? 'Accepted' : item.status === 'rejected' ? 'Rejected' : 'Pending';
  return (
    <Accordion.Item value={item.requirementId} className="rounded-xl bg-neutral-100 p-6 shadow-sm md:rounded-[36px]">
      <Accordion.Header>
        <Accordion.Trigger className="group flex w-full flex-wrap items-center justify-between gap-3 text-left focus-visible:outline-2 focus-visible:outline-primary-600">
          <span className="font-ui text-b2 font-bold text-secondary-1000">{item.name}</span>
          <span className="flex flex-wrap items-center gap-2 text-b4">
            <span className="rounded-lg bg-primary-100 px-3 py-2 text-primary-1000">{item.type === 'group' ? 'Group Task' : 'Individual Task'}</span>
            <span className={`rounded-lg px-3 py-2 ${statusStyle}`}>{statusLabel}</span>
            <Icon icon="mdi:chevron-down" className="size-5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </span>
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content className="accordion-content overflow-hidden">
        <div className="flex flex-col gap-4 pt-6">
          <div className={`w-full rounded-lg px-3 py-2 text-b3 ${statusStyle}`}>
            {item.status === 'accepted' ? 'Dokumen telah disetujui.' : item.status === 'rejected' ? 'Dokumen ditolak. Silakan unggah ulang.' : 'Dokumen menunggu pemeriksaan.'}
            {item.rejectionReason && <p className="mt-1">{item.rejectionReason}</p>}
          </div>
          <p className="flex items-center gap-2 text-b3 text-neutral-700"><Icon icon="mdi:calendar-range" className="size-4" />{formatWibDate(item.dueDate)}</p>
          {lock && <p role="status" className="rounded-lg bg-error-500/20 px-3 py-2 text-b3 text-error-1000">{expired && <strong>Deadline passed. </strong>}{lock}</p>}
          <p className="whitespace-pre-line text-b3 text-neutral-700">{item.instructions}</p>
          <input ref={input} type="file" tabIndex={-1} aria-invalid={Boolean(errors.file)} aria-describedby={errors.file ? `${item.requirementId}-error` : undefined} aria-label={`Upload ${item.name}`} className="sr-only" disabled={disabled}
            accept={item.acceptedFormats.map(format => `.${format}`).join(',')}
            onChange={event => { acceptFile(event.target.files?.[0]); event.target.value = ''; }} />
          <div role="group" aria-label={`Document ${item.name}`} aria-busy={busy}
            onClick={event => { if (!file && !disabled && !(event.target as Element).closest('button, a, input')) input.current?.click(); }}
            onDragOver={event => event.preventDefault()}
            onDrop={event => { event.preventDefault(); acceptFile(event.dataTransfer.files[0]); }}
            className={`flex min-h-70 flex-col items-center justify-center gap-3 rounded-3xl border-2 p-6 text-center md:rounded-[36px] md:px-8 md:py-10 ${errors.file ? 'border-error-500 bg-error-100' : busy ? 'border-primary-500 bg-primary-100' : file ? 'border-primary-600' : 'border-dashed border-neutral-300'} ${disabled ? 'cursor-default' : 'cursor-pointer'}`}>
            {busy ? <p role="status" className="text-b3 text-secondary-1000">{upload.isPending ? 'Mengupload...' : 'Menghapus...'}</p> : file ? <>
              <div className="flex gap-2">
                <a aria-label={`View ${item.name}`} href={viewUrl} target="_blank" rel="noopener noreferrer" className="flex size-10 items-center justify-center rounded-lg text-primary-600 hover:bg-primary-100 hover:text-primary-800"><Icon icon="mdi:eye" className="size-5" /></a>
                <button aria-label={`Edit ${item.name}`} disabled={disabled} onClick={() => input.current?.click()} className="flex size-10 items-center justify-center rounded-lg text-primary-600 hover:bg-primary-100 disabled:opacity-50"><Icon icon="mdi:pencil-outline" className="size-5" /></button>
                <button aria-label={`Remove ${item.name}`} disabled={disabled} onClick={removeFile} className="flex size-10 items-center justify-center rounded-lg text-primary-600 hover:bg-primary-100 disabled:opacity-50"><Icon icon="mdi:trash-can-outline" className="size-5" /></button>
              </div>
              {/\.(jpe?g|png)$/i.test(file.fileName) ? <Image src={file.url} alt={"Preview " + item.name} width={320} height={180} unoptimized className="max-h-48 w-full object-contain" /> : <Icon icon="mdi:file-check-outline" className="size-12 text-primary-600" />}
              <p className="font-heading text-h6 text-secondary-1000">File telah <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">terupload!</span></p>
              <p className="w-full break-words font-ui text-b3 text-neutral-700">{file.fileName}</p>
            </> : <>
              <Icon icon="mdi:cloud-upload-outline" className="size-12 text-primary-600" />
              <button type="button" disabled={disabled} onClick={() => input.current?.click()} className="text-b3 text-secondary-1000 disabled:cursor-default">Tarik atau pilih file — bukti akan langsung terupload otomatis</button>
            </>}
            <p className="text-b4 text-neutral-700">{item.acceptedFormats.join(', ').toUpperCase()}, maks 500KB</p>
            {errors.file && <p id={`${item.requirementId}-error`} role="alert" className="text-b3 text-error-1000">{errors.file.message}</p>}
          </div>
          {toast && <><Toast status="error" title={toast} onDismiss={() => setToast(null)} /><Button size="sm" variant="ghost" disabled={disabled} onClick={retry}>Coba lagi</Button></>}
        </div>
      </Accordion.Content>
    </Accordion.Item>
  );
}
