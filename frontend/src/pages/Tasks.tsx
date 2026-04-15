import { useState } from 'react';
import { useTranslation } from '../lib/i18n';
import {
  useAvailableTasks,
  useMyTasks,
  useStartTask,
  useSubmitTaskProof,
} from '../hooks/useTasks';
import type { Task, UserTask, UserTaskStatus, TaskProofType } from '@unisouq/shared';

type Tab = 'available' | UserTaskStatus;
const TABS: Tab[] = ['available', 'ACTIVE', 'DELIVERED', 'APPROVED', 'REJECTED'];

function proofLabel(t: (k: any) => string, p: TaskProofType) {
  return t(`proof${p}`);
}

function TaskCard({ task, onStart, starting }: { task: Task; onStart: () => void; starting: boolean }) {
  const { t } = useTranslation();
  const full = task.filledSlots >= task.totalSlots;
  return (
    <div className="rounded-card p-3 flex flex-col gap-2" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-[10px] uppercase font-semibold" style={{ color: 'var(--text-muted)' }}>{task.brandName}</p>
          <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--text)' }}>{task.title}</p>
        </div>
        <span className="text-sm font-bold shrink-0" style={{ color: 'var(--gold)' }}>+{task.rewardStars} ★</span>
      </div>
      <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{task.description}</p>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          {proofLabel(t, task.proofType)} · {t('slotsLeft', { count: Math.max(0, task.totalSlots - task.filledSlots) })}
        </span>
        <button
          onClick={onStart}
          disabled={full || starting}
          className="text-[11px] font-semibold px-3 py-1.5 rounded-btn"
          style={{
            backgroundColor: full ? 'var(--surface2)' : 'var(--accent)',
            color: '#fff',
            border: 'none',
            cursor: full ? 'not-allowed' : 'pointer',
            opacity: starting ? 0.6 : 1,
          }}
        >
          {full ? t('full') : starting ? t('processing') : t('startTask')}
        </button>
      </div>
    </div>
  );
}

function MyTaskCard({ ut, onSubmit }: { ut: UserTask; onSubmit: (id: string) => void }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-card p-3 flex flex-col gap-2" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-[10px] uppercase font-semibold" style={{ color: 'var(--text-muted)' }}>{ut.task?.brandName}</p>
          <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--text)' }}>{ut.task?.title}</p>
        </div>
        <span className="text-sm font-bold shrink-0" style={{ color: 'var(--gold)' }}>+{ut.task?.rewardStars ?? 0} ★</span>
      </div>
      {ut.rejectReason && (
        <p className="text-[11px]" style={{ color: '#ff6b6b' }}>
          {t('rejectedReason')}: {ut.rejectReason}
        </p>
      )}
      {(ut.status === 'ACTIVE' || ut.status === 'REJECTED') && (
        <button
          onClick={() => onSubmit(ut.id)}
          className="text-[11px] font-semibold px-3 py-1.5 rounded-btn self-start"
          style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          {t('submitProof')}
        </button>
      )}
    </div>
  );
}

function ProofSheet({ userTaskId, onClose }: { userTaskId: string; onClose: () => void }) {
  const { t } = useTranslation();
  const submit = useSubmitTaskProof();
  const [proof, setProof] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async () => {
    setErr(null);
    try {
      await submit.mutateAsync({ userTaskId, proof });
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Error');
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div
        className="w-full rounded-t-card p-5"
        style={{ backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-base font-bold mb-3" style={{ color: 'var(--text)' }}>{t('submitProof')}</p>
        <textarea
          value={proof}
          onChange={(e) => setProof(e.target.value)}
          placeholder={t('proofPlaceholder')}
          rows={4}
          className="w-full px-3 py-2 text-sm rounded-btn outline-none resize-none"
          style={{ backgroundColor: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' }}
        />
        {err && <p className="text-[11px] mt-2" style={{ color: '#ff6b6b' }}>{err}</p>}
        <button
          onClick={handleSubmit}
          disabled={submit.isPending || !proof.trim()}
          className="w-full mt-3 py-3 text-sm font-semibold rounded-btn"
          style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', opacity: submit.isPending ? 0.6 : 1 }}
        >
          {submit.isPending ? t('submitting') : t('submit')}
        </button>
        <button
          onClick={onClose}
          className="w-full py-2 text-xs mt-2"
          style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {t('close')}
        </button>
      </div>
    </div>
  );
}

function Tasks() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('available');
  const [proofFor, setProofFor] = useState<string | null>(null);

  const availableQ = useAvailableTasks();
  const mineQ = useMyTasks(tab === 'available' ? undefined : (tab as UserTaskStatus));
  const start = useStartTask();

  const tabLabel = (x: Tab) => {
    if (x === 'available') return t('availableTasks');
    if (x === 'ACTIVE') return t('tabActive');
    if (x === 'DELIVERED') return t('tabDelivered');
    if (x === 'APPROVED') return t('tabApproved');
    return t('tabRejected');
  };

  return (
    <div className="px-4 pt-2 pb-24">
      <div className="flex gap-1.5 overflow-x-auto mb-4 -mx-4 px-4 no-scrollbar">
        {TABS.map((x) => {
          const isActive = tab === x;
          return (
            <button
              key={x}
              onClick={() => setTab(x)}
              className="text-[11px] font-medium px-3 py-1.5 rounded-full whitespace-nowrap"
              style={{
                backgroundColor: isActive ? 'var(--accent)' : 'var(--surface2)',
                color: isActive ? '#fff' : 'var(--text-muted)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
              }}
            >
              {tabLabel(x)}
            </button>
          );
        })}
      </div>

      {tab === 'available' && (
        <>
          {availableQ.isLoading && <p className="text-xs text-center py-8" style={{ color: 'var(--text-muted)' }}>{t('loading')}</p>}
          {availableQ.isError && <p className="text-xs text-center py-8" style={{ color: '#ff6b6b' }}>{t('failedLoadTasks')}</p>}
          {availableQ.data && availableQ.data.length === 0 && <p className="text-xs text-center py-8" style={{ color: 'var(--text-muted)' }}>{t('noTasks')}</p>}
          <div className="flex flex-col gap-3">
            {availableQ.data?.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStart={async () => {
                  try {
                    await start.mutateAsync(task.id);
                    setTab('ACTIVE');
                  } catch {
                    /* noop */
                  }
                }}
                starting={start.isPending}
              />
            ))}
          </div>
        </>
      )}

      {tab !== 'available' && (
        <>
          {mineQ.isLoading && <p className="text-xs text-center py-8" style={{ color: 'var(--text-muted)' }}>{t('loading')}</p>}
          {mineQ.data && mineQ.data.length === 0 && <p className="text-xs text-center py-8" style={{ color: 'var(--text-muted)' }}>{t('noTasks')}</p>}
          <div className="flex flex-col gap-3">
            {mineQ.data?.map((ut) => (
              <MyTaskCard key={ut.id} ut={ut} onSubmit={setProofFor} />
            ))}
          </div>
        </>
      )}

      {proofFor && <ProofSheet userTaskId={proofFor} onClose={() => setProofFor(null)} />}
    </div>
  );
}

export default Tasks;
