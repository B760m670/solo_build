import { useState } from 'react';
import { ClockIcon } from '../components/Icons';
import { useTasks, useUserTasks, useStartTask, useCompleteTask } from '../hooks/useTasks';
import { CardSkeleton } from '../components/Skeleton';
import ErrorState, { EmptyState } from '../components/ErrorState';
import { useTranslation } from '../lib/i18n';
import type { Task, UserTask } from '@brabble/shared';

type Tab = 'all' | 'active' | 'completed';

function Tasks() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [proofModal, setProofModal] = useState<string | null>(null);
  const [proof, setProof] = useState('');
  const [submittedTaskId, setSubmittedTaskId] = useState<string | null>(null);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: t('tabAll') },
    { key: 'active', label: t('tabActive') },
    { key: 'completed', label: t('tabCompleted') },
  ];

  const categories = [
    { key: 'survey', label: t('catSurvey') },
    { key: 'review', label: t('catReview') },
    { key: 'test', label: t('catTest') },
    { key: 'subscribe', label: t('catSubscribe') },
  ];

  const tasksQuery = useTasks(activeCategory ?? undefined);
  const userTasksQuery = useUserTasks(
    activeTab === 'active' ? 'ACTIVE,SUBMITTED' : activeTab === 'completed' ? 'COMPLETED,REJECTED' : undefined,
  );
  const startTask = useStartTask();
  const completeTask = useCompleteTask();

  const showUserTasks = activeTab !== 'all';
  const query = showUserTasks ? userTasksQuery : tasksQuery;

  const handleStart = (taskId: string) => startTask.mutate(taskId);
  const handleRetry = (taskId: string) =>
    startTask.mutate(taskId, {
      onSuccess: () => {
        setProofModal(taskId);
        setProof('');
      },
    });

  const handleComplete = () => {
    if (!proofModal || !proof.trim()) return;
    completeTask.mutate(
      { taskId: proofModal, proof: proof.trim() },
      {
        onSuccess: () => {
          setSubmittedTaskId(proofModal);
          setProofModal(null);
          setProof('');
          setTimeout(() => setSubmittedTaskId(null), 2500);
        },
      },
    );
  };

  const userTaskMap = new Map<string, UserTask>();
  if (userTasksQuery.data) {
    for (const ut of userTasksQuery.data) userTaskMap.set(ut.taskId, ut);
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {submittedTaskId && (
        <div className="fixed top-4 left-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-card" style={{ backgroundColor: 'var(--teal)', color: '#000' }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          <span className="text-sm font-medium">{t('taskSubmitted')}</span>
        </div>
      )}

      <div className="flex gap-1 p-0.5 rounded-btn" style={{ backgroundColor: 'var(--surface)' }}>
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className="flex-1 py-2 text-xs font-medium rounded-btn transition-colors" style={{ backgroundColor: activeTab === tab.key ? 'var(--surface2)' : 'transparent', color: activeTab === tab.key ? 'var(--text)' : 'var(--text-muted)', border: 'none', cursor: 'pointer' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'all' && (
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {categories.map((cat) => (
            <button key={cat.key} onClick={() => setActiveCategory(activeCategory === cat.key ? null : cat.key)} className="shrink-0 px-3 py-1.5 text-[11px] font-medium rounded-full border capitalize" style={{ borderColor: activeCategory === cat.key ? 'var(--accent)' : 'var(--border)', color: activeCategory === cat.key ? 'var(--accent)' : 'var(--text-secondary)', background: activeCategory === cat.key ? 'rgba(108, 99, 255, 0.08)' : 'transparent', cursor: 'pointer' }}>
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {query.isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <CardSkeleton key={i} />)}</div>
      ) : query.isError ? (
        <ErrorState message={t('failedLoadTasks')} onRetry={() => query.refetch()} />
      ) : showUserTasks ? (
        (userTasksQuery.data?.length ?? 0) === 0 ? (
          <EmptyState message={t('noTasks', { tab: tabs.find((tb) => tb.key === activeTab)?.label ?? '' })} />
        ) : (
          <div className="space-y-3">
            {userTasksQuery.data!.map((ut) => (
              <UserTaskCard
                key={ut.id}
                userTask={ut}
                onComplete={() => { setProofModal(ut.taskId); setProof(''); }}
                onRetry={() => handleRetry(ut.taskId)}
              />
            ))}
          </div>
        )
      ) : (
        (tasksQuery.data?.length ?? 0) === 0 ? (
          <EmptyState message={t('noTasksAvailable')} />
        ) : (
          <div className="space-y-3">
            {tasksQuery.data!.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                userTask={userTaskMap.get(task.id)}
                onStart={() => handleStart(task.id)}
                onRetry={() => handleRetry(task.id)}
                onComplete={() => { setProofModal(task.id); setProof(''); }}
                isStarting={startTask.isPending}
              />
            ))}
          </div>
        )
      )}

      {proofModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={() => setProofModal(null)}>
          <div className="w-full max-w-md rounded-t-2xl p-6 space-y-4 safe-bottom" style={{ backgroundColor: 'var(--surface)' }} onClick={(e) => e.stopPropagation()}>
            <p className="text-base font-semibold" style={{ color: 'var(--text)' }}>{t('submitProof')}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('proofDescription')}</p>
            <textarea value={proof} onChange={(e) => setProof(e.target.value)} placeholder={t('proofPlaceholder')} rows={3} className="w-full p-3 rounded-btn text-sm outline-none resize-none border" style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)', caretColor: 'var(--accent)' }} />
            <div className="flex gap-3">
              <button onClick={() => setProofModal(null)} className="flex-1 py-2.5 text-sm font-medium rounded-btn border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'transparent', cursor: 'pointer' }}>{t('cancel')}</button>
              <button onClick={handleComplete} disabled={!proof.trim() || completeTask.isPending} className="flex-1 py-2.5 text-sm font-medium rounded-btn" style={{ backgroundColor: proof.trim() ? 'var(--accent)' : 'var(--surface2)', color: proof.trim() ? '#FFFFFF' : 'var(--text-muted)', border: 'none', cursor: proof.trim() ? 'pointer' : 'default' }}>
                {completeTask.isPending ? t('submitting') : t('submit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, userTask, onStart, onRetry, onComplete, isStarting }: { task: Task; userTask?: UserTask; onStart: () => void; onRetry: () => void; onComplete: () => void; isStarting: boolean }) {
  const { t } = useTranslation();
  const status = userTask?.status;
  const slotsLeft = task.totalSlots - task.filledSlots;
  const showRejected = status === 'REJECTED';

  return (
    <div className="rounded-card p-4 border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{task.brand}</p>
          <span className="inline-block text-[9px] px-1.5 py-0.5 rounded-full mt-1 capitalize" style={{ backgroundColor: 'rgba(108, 99, 255, 0.08)', color: 'var(--accent)' }}>{task.category}</span>
        </div>
        <span className="text-sm font-bold" style={{ color: 'var(--gold)' }}>+{task.reward} BRB</span>
      </div>
      <p className="text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>{task.title}</p>
      <p className="text-[11px] mb-3" style={{ color: 'var(--text-muted)' }}>{task.description}</p>
      {showRejected && userTask?.reviewNote && (
        <div className="mb-3 p-2 rounded-btn border" style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)' }}>
          <p className="text-[10px] font-medium mb-0.5" style={{ color: 'var(--text-secondary)' }}>{t('rejectedReason')}</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{userTask.reviewNote}</p>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
            <ClockIcon size={12} />
            <span className="text-[11px]">{t('min', { count: task.timeMinutes })}</span>
          </div>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t('slotsLeft', { count: slotsLeft })}</span>
        </div>
        {status === 'COMPLETED' ? (
          <span className="text-[11px] font-medium" style={{ color: 'var(--teal)' }}>{t('completed')}</span>
        ) : status === 'SUBMITTED' ? (
          <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>{t('pendingReview')}</span>
        ) : status === 'REJECTED' ? (
          <button onClick={onRetry} className="px-4 py-1.5 text-xs font-medium rounded-btn" style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}>{t('resubmit')}</button>
        ) : status === 'ACTIVE' ? (
          <button onClick={onComplete} className="px-4 py-1.5 text-xs font-medium rounded-btn" style={{ backgroundColor: 'var(--teal)', color: '#000', border: 'none', cursor: 'pointer' }}>{t('complete')}</button>
        ) : (
          <button onClick={onStart} disabled={isStarting || slotsLeft <= 0} className="px-4 py-1.5 text-xs font-medium rounded-btn" style={{ backgroundColor: slotsLeft > 0 ? 'var(--accent)' : 'var(--surface2)', color: slotsLeft > 0 ? '#FFFFFF' : 'var(--text-muted)', border: 'none', cursor: slotsLeft > 0 ? 'pointer' : 'default' }}>
            {isStarting ? t('starting') : slotsLeft > 0 ? t('start') : t('full')}
          </button>
        )}
      </div>
    </div>
  );
}

function UserTaskCard({ userTask, onComplete, onRetry }: { userTask: UserTask; onComplete: () => void; onRetry: () => void }) {
  const { t } = useTranslation();
  const task = userTask.task;
  if (!task) return null;

  const showRejected = userTask.status === 'REJECTED';

  return (
    <div className="rounded-card p-4 border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{task.brand}</p>
          <span className="inline-block text-[9px] px-1.5 py-0.5 rounded-full mt-1 capitalize" style={{ backgroundColor: 'rgba(108, 99, 255, 0.08)', color: 'var(--accent)' }}>{task.category}</span>
        </div>
        <span className="text-sm font-bold" style={{ color: 'var(--gold)' }}>+{task.reward} BRB</span>
      </div>
      <p className="text-sm font-medium mb-3" style={{ color: 'var(--text)' }}>{task.title}</p>
      {showRejected && userTask.reviewNote && (
        <div className="mb-3 p-2 rounded-btn border" style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)' }}>
          <p className="text-[10px] font-medium mb-0.5" style={{ color: 'var(--text-secondary)' }}>{t('rejectedReason')}</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{userTask.reviewNote}</p>
        </div>
      )}
      <div className="flex items-center justify-between">
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          {userTask.status === 'COMPLETED' && userTask.completedAt
            ? `${t('completed')} ${new Date(userTask.completedAt).toLocaleDateString()}`
            : userTask.status === 'SUBMITTED'
              ? t('pendingReview')
              : userTask.status === 'REJECTED'
                ? t('rejected')
              : t('inProgress')}
        </span>
        {userTask.status === 'ACTIVE' && (
          <button onClick={onComplete} className="px-4 py-1.5 text-xs font-medium rounded-btn" style={{ backgroundColor: 'var(--teal)', color: '#000', border: 'none', cursor: 'pointer' }}>{t('complete')}</button>
        )}
        {userTask.status === 'COMPLETED' && (
          <span className="text-[11px] font-medium" style={{ color: 'var(--teal)' }}>{t('done')}</span>
        )}
        {userTask.status === 'REJECTED' && (
          <button onClick={onRetry} className="px-4 py-1.5 text-xs font-medium rounded-btn" style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}>{t('resubmit')}</button>
        )}
      </div>
    </div>
  );
}

export default Tasks;
