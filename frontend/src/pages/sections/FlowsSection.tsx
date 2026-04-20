import { useMemo, useState } from 'react';
import { useTranslation } from '../../lib/i18n';
import { SectionHeader } from '../../components/SectionHeader';
import { LayersIcon, PlusIcon } from '../../components/Icons';
import ErrorState from '../../components/ErrorState';
import { useArchiveFlow, useCreateFlow, useFlows, usePublishFlow } from '../../hooks/useFlows';
import type { Flow, FlowTriggerType } from '@unisouq/shared';

function StatusPill({ status }: { status: Flow['status'] }) {
  const { t } = useTranslation();
  const style = useMemo(() => {
    switch (status) {
      case 'PUBLISHED':
        return { color: 'var(--teal)', bg: 'rgba(0,212,170,0.10)', label: t('flowsPublished') };
      case 'ARCHIVED':
        return { color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.06)', label: t('flowsArchived') };
      default:
        return { color: 'var(--gold)', bg: 'rgba(245,200,66,0.10)', label: t('flowsDraft') };
    }
  }, [status, t]);

  return (
    <span
      className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
      style={{ color: style.color, backgroundColor: style.bg }}
    >
      {style.label}
    </span>
  );
}

function CreateFlowSheet({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const create = useCreateFlow();
  const [name, setName] = useState('');
  const [triggerType, setTriggerType] = useState<FlowTriggerType>('TELEGRAM_COMMAND');
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    try {
      await create.mutateAsync({ name: name.trim() || t('flowsUntitled'), triggerType });
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Error');
    }
  };

  const triggerOptions: { value: FlowTriggerType; label: string }[] = [
    { value: 'TELEGRAM_COMMAND', label: t('flowsTriggerCommand') },
    { value: 'WEBHOOK', label: t('flowsTriggerWebhook') },
    { value: 'SCHEDULE', label: t('flowsTriggerSchedule') },
    { value: 'STARS_PAYMENT', label: t('flowsTriggerStars') },
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-end" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div
        className="w-full rounded-t-[20px] p-5 pb-8"
        style={{ backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm font-bold mb-4" style={{ color: 'var(--text)' }}>{t('flowsCreate')}</p>

        <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          {t('title')}
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mt-2 px-3 py-3 rounded-btn text-sm"
          placeholder={t('flowsNamePlaceholder')}
          style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }}
        />

        <div className="mt-4">
          <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            {t('flowsTrigger')}
          </label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {triggerOptions.map((o) => {
              const active = triggerType === o.value;
              return (
                <button
                  key={o.value}
                  onClick={() => setTriggerType(o.value)}
                  className="py-2.5 rounded-btn text-[11px] font-semibold"
                  style={{
                    backgroundColor: active ? 'var(--accent)' : 'rgba(255,255,255,0.04)',
                    color: active ? '#fff' : 'var(--text)',
                    border: `1px solid ${active ? 'transparent' : 'var(--border)'}`,
                    cursor: 'pointer',
                  }}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={submit}
          disabled={create.isPending}
          className="w-full mt-5 py-3.5 text-sm font-bold rounded-btn flex items-center justify-center gap-2 transition-opacity active:opacity-80"
          style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', opacity: create.isPending ? 0.6 : 1 }}
        >
          <PlusIcon size={16} color="#fff" />
          {t('flowsCreate')}
        </button>
        <button
          onClick={onClose}
          className="w-full py-2.5 mt-2 text-[11px] font-semibold rounded-btn"
          style={{ backgroundColor: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', cursor: 'pointer' }}
        >
          {t('cancel')}
        </button>
        {err && <p className="text-[10px] mt-2 text-center" style={{ color: '#ff6b6b' }}>{err}</p>}
      </div>
    </div>
  );
}

function FlowRow({ flow }: { flow: Flow }) {
  const { t } = useTranslation();
  const publish = usePublishFlow();
  const archive = useArchiveFlow();
  const [err, setErr] = useState<string | null>(null);

  const doPublish = async () => {
    setErr(null);
    try {
      await publish.mutateAsync(flow.id);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Error');
    }
  };

  const doArchive = async () => {
    setErr(null);
    try {
      await archive.mutateAsync(flow.id);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Error');
    }
  };

  const busy = publish.isPending || archive.isPending;

  return (
    <div className="rounded-card p-4" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
            {flow.name}
          </p>
          <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
            {t('flowsTriggerLabel', { trigger: flow.triggerType })}
          </p>
        </div>
        <StatusPill status={flow.status} />
      </div>

      <div className="flex items-center gap-2 mt-3">
        {flow.status === 'DRAFT' && (
          <button
            onClick={doPublish}
            disabled={busy}
            className="px-3 py-2 text-[11px] font-semibold rounded-btn"
            style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', opacity: busy ? 0.6 : 1 }}
          >
            {t('flowsPublish')}
          </button>
        )}
        {flow.status !== 'ARCHIVED' && (
          <button
            onClick={doArchive}
            disabled={busy}
            className="px-3 py-2 text-[11px] font-semibold rounded-btn"
            style={{ backgroundColor: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', cursor: 'pointer', opacity: busy ? 0.6 : 1 }}
          >
            {t('flowsArchive')}
          </button>
        )}
      </div>

      {err && <p className="text-[10px] mt-2" style={{ color: '#ff6b6b' }}>{err}</p>}
    </div>
  );
}

export function FlowsSection({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const flows = useFlows();
  const [creating, setCreating] = useState(false);

  return (
    <div className="px-4 pt-2 pb-24">
      <SectionHeader title={t('sectionFlows')} subtitle={t('sectionFlowsDesc')} onBack={onBack} backLabel={t('back')} />

      <button
        onClick={() => setCreating(true)}
        className="w-full mb-4 py-3.5 text-sm font-bold rounded-btn flex items-center justify-center gap-2 transition-opacity active:opacity-80"
        style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
      >
        <LayersIcon size={16} color="#fff" />
        {t('flowsCreate')}
      </button>

      {flows.isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
        </div>
      )}

      {flows.error && (
        <ErrorState message={flows.error instanceof Error ? flows.error.message : 'Error'} />
      )}

      {flows.data && flows.data.length === 0 && (
        <div className="flex flex-col items-center py-16">
          <LayersIcon size={32} color="var(--text-muted)" />
          <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>{t('flowsEmpty')}</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {flows.data?.map((f) => <FlowRow key={f.id} flow={f} />)}
      </div>

      {creating && <CreateFlowSheet onClose={() => setCreating(false)} />}
    </div>
  );
}
