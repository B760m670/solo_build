import { useEffect, useState } from 'react';
import {
  useAdminApproveSubmission,
  useAdminApproveWithdrawal,
  useAdminCreateTask,
  useAdminDashboard,
  useAdminFailWithdrawal,
  useAdminRejectSubmission,
  useAdminSendWithdrawal,
  useAdminTaskSubmissions,
  useAdminTasks,
  useAdminToggleTask,
  useAdminUsers,
  useAdminWithdrawals,
} from '../hooks/useAdmin';
import ErrorState from '../components/ErrorState';
import Skeleton from '../components/Skeleton';
import { useTranslation } from '../lib/i18n';

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-card p-3 border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
      <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>{value}</p>
      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{label}</p>
      {sub && <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  );
}

function Admin({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const dashboard = useAdminDashboard();
  const users = useAdminUsers();
  const tasks = useAdminTasks();
  const createTask = useAdminCreateTask();
  const toggleTask = useAdminToggleTask();
  const submissions = useAdminTaskSubmissions();
  const approve = useAdminApproveSubmission();
  const reject = useAdminRejectSubmission();
  const [withdrawalStatus, setWithdrawalStatus] = useState<'PENDING' | 'APPROVED' | 'SENT' | 'FAILED' | undefined>(undefined);
  const withdrawals = useAdminWithdrawals(withdrawalStatus);
  const approveWithdrawal = useAdminApproveWithdrawal();
  const sendWithdrawal = useAdminSendWithdrawal();
  const failWithdrawal = useAdminFailWithdrawal();
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    category: 'survey',
    verificationType: 'MANUAL',
    reward: '10',
    timeMinutes: '5',
    brand: 'Brabble',
    sponsorName: '',
    sponsorType: 'PLATFORM',
    sponsorBudgetCurrency: 'TON',
    sponsorBudgetAmount: '',
    kpiName: '',
    kpiTarget: '',
    kpiUnit: '',
    minReputation: '0',
    minAccountAgeDays: '0',
    cooldownSeconds: '0',
    requiredProofFields: 'text',
    totalSlots: '100',
    expiresAt: '',
    isActive: true,
  });

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(id);
  }, [toast]);

  if (dashboard.isError) {
    return <ErrorState message={t('adminRequired')} onRetry={onBack} />;
  }

  return (
    <div className="px-4 py-4 space-y-6">
      {toast && (
        <div className="fixed top-4 left-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-card" style={{ backgroundColor: 'var(--teal)', color: '#000' }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base font-semibold" style={{ color: 'var(--text)' }}>{t('adminPanel')}</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t('platformStats')}</p>
        </div>
        <button
          onClick={onBack}
          className="px-3 py-1.5 text-xs rounded-btn border"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'transparent', cursor: 'pointer' }}
        >
          {t('back')}
        </button>
      </div>

      {dashboard.isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} height={70} rounded="card" />)}
        </div>
      ) : dashboard.data ? (
        <>
          {/* Users */}
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>{t('users')}</p>
            <div className="grid grid-cols-3 gap-3">
              <StatCard label={t('total')} value={dashboard.data.users.total} />
              <StatCard label={t('premium')} value={dashboard.data.users.premium} />
              <StatCard label={t('last7days')} value={dashboard.data.users.recentSignups} />
            </div>
          </div>

          {/* Economy */}
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>{t('economy')}</p>
            <div className="grid grid-cols-2 gap-3">
              <StatCard label={t('brbCirculation')} value={`${dashboard.data.economy.totalBrbInCirculation.toFixed(0)}`} />
              <StatCard label={t('totalBrbEarned')} value={`${dashboard.data.economy.totalBrbEarned.toFixed(0)}`} />
              <StatCard label={t('transactions')} value={dashboard.data.economy.totalTransactions} />
              <StatCard label={t('commissionRevenue')} value={`${dashboard.data.marketplace.commissionRevenue.toFixed(0)} BRB`} />
            </div>
          </div>

          {/* Tasks */}
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>{t('tasks')}</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <StatCard label={t('totalTasks')} value={dashboard.data.tasks.total} />
              <StatCard label={t('completed')} value={dashboard.data.tasks.completed} />
            </div>
            {dashboard.data.tasks.topTasks.length > 0 && (
              <div className="rounded-card border overflow-hidden" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                <p className="px-3 py-2 text-[10px] font-medium" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                  {t('topTasks')}
                </p>
                {dashboard.data.tasks.topTasks.map((task, i) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between px-3 py-2"
                    style={{ borderBottom: i < dashboard.data!.tasks.topTasks.length - 1 ? '1px solid var(--border)' : 'none' }}
                  >
                    <div>
                      <p className="text-xs" style={{ color: 'var(--text)' }}>{task.title}</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{task.brand}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                        {task.filledSlots}/{task.totalSlots}
                      </p>
                      <p className="text-[10px]" style={{ color: 'var(--gold)' }}>+{task.reward} BRB</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Marketplace */}
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>{t('marketplace')}</p>
            <div className="grid grid-cols-2 gap-3">
              <StatCard label={t('activeListings')} value={dashboard.data.marketplace.activeListings} />
              <StatCard label={t('totalOrders')} value={dashboard.data.marketplace.totalOrders} />
            </div>
          </div>

          {/* Tasks Management */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{t('manageTasks')}</p>
              <button
                onClick={() => setCreateTaskOpen(true)}
                className="px-3 py-1.5 text-[11px] font-medium rounded-btn"
                style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
              >
                {t('newTask')}
              </button>
            </div>
            {tasks.isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} height={56} rounded="card" />)}
              </div>
            ) : tasks.data && tasks.data.length > 0 ? (
              <div className="rounded-card border overflow-hidden" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                {tasks.data.map((task, i) => (
                  <div
                    key={task.id}
                    className="px-3 py-2.5"
                    style={{ borderBottom: i < tasks.data!.length - 1 ? '1px solid var(--border)' : 'none' }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate" style={{ color: 'var(--text)' }}>{task.title}</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          {task.brand} • {task.category} • +{task.reward} BRB
                        </p>
                      </div>
                      <button
                        onClick={() => toggleTask.mutate(task.id)}
                        disabled={toggleTask.isPending}
                        className="px-3 py-1.5 text-[11px] font-medium rounded-btn border"
                        style={{
                          borderColor: task.isActive ? 'var(--teal)' : 'var(--border)',
                          color: task.isActive ? 'var(--teal)' : 'var(--text-secondary)',
                          background: 'transparent',
                          cursor: 'pointer',
                        }}
                      >
                        {task.isActive ? t('active') : t('inactive')}
                      </button>
                    </div>
                    {(task.sponsorBudgetAmount ?? null) !== null && task.sponsorBudgetCurrency && (
                      <div className="mt-2 rounded-btn border p-2" style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)' }}>
                        <div className="flex items-center justify-between text-[10px]">
                          <span style={{ color: 'var(--text-muted)' }}>{t('sponsorBudget')}</span>
                          <span style={{ color: 'var(--text-secondary)' }}>
                            {task.sponsorBudgetSpent.toFixed(2)} / {task.sponsorBudgetAmount!.toFixed(2)} {task.sponsorBudgetCurrency}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full mt-1" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              width: `${Math.min(100, (task.sponsorBudgetSpent / (task.sponsorBudgetAmount || 1)) * 100)}%`,
                              backgroundColor: task.sponsorBudgetSpent >= (task.sponsorBudgetAmount || 0) ? '#FF3B30' : 'var(--teal)',
                            }}
                          />
                        </div>
                        <p className="text-[10px] mt-1" style={{ color: task.sponsorBudgetSpent >= (task.sponsorBudgetAmount || 0) ? '#FF3B30' : 'var(--text-muted)' }}>
                          {task.sponsorBudgetSpent >= (task.sponsorBudgetAmount || 0)
                            ? t('budgetExhausted')
                            : t('budgetRemaining', { amount: ((task.sponsorBudgetAmount || 0) - task.sponsorBudgetSpent).toFixed(2), currency: task.sponsorBudgetCurrency })}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t('noTasksAvailable')}</p>
            )}
          </div>

          {/* Task Submissions */}
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>{t('taskReviewQueue')}</p>
            {submissions.isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} height={64} rounded="card" />)}
              </div>
            ) : submissions.data && submissions.data.length > 0 ? (
              <div className="rounded-card border overflow-hidden" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                {submissions.data.map((s, i) => (
                  <div
                    key={s.id}
                    className="px-3 py-2.5"
                    style={{ borderBottom: i < submissions.data!.length - 1 ? '1px solid var(--border)' : 'none' }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate" style={{ color: 'var(--text)' }}>
                          {s.task.title}
                        </p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          {s.task.brand} • +{s.task.reward} BRB • {s.user.username ? `@${s.user.username}` : s.user.firstName}
                        </p>
                        {s.proof && (
                          <p className="text-[10px] mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                            {s.proof}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 flex gap-2">
                        <button
                          onClick={() =>
                            approve.mutate(s.id, {
                              onSuccess: () => {
                                setToast(t('approved'));
                                setTimeout(() => setToast(null), 2500);
                              },
                            })
                          }
                          disabled={approve.isPending || reject.isPending}
                          className="px-3 py-1.5 text-[11px] font-medium rounded-btn"
                          style={{ backgroundColor: 'var(--teal)', color: '#000', border: 'none', cursor: 'pointer' }}
                        >
                          {t('approve')}
                        </button>
                        <button
                          onClick={() => {
                            setRejectModalId(s.id);
                            setRejectReason('');
                          }}
                          disabled={approve.isPending || reject.isPending}
                          className="px-3 py-1.5 text-[11px] font-medium rounded-btn border"
                          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'transparent', cursor: 'pointer' }}
                        >
                          {t('reject')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t('noSubmissions')}</p>
            )}
          </div>

          {/* Withdrawals Queue */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{t('withdrawalsQueue')}</p>
              <select
                value={withdrawalStatus ?? ''}
                onChange={(e) => setWithdrawalStatus((e.target.value || undefined) as typeof withdrawalStatus)}
                className="px-2 py-1 text-[11px] rounded-btn border"
                style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                <option value="">{t('allStatuses')}</option>
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="SENT">SENT</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>
            {withdrawals.isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} height={64} rounded="card" />)}
              </div>
            ) : withdrawals.data && withdrawals.data.length > 0 ? (
              <div className="rounded-card border overflow-hidden" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                {withdrawals.data.map((w, i) => (
                  <div
                    key={w.id}
                    className="px-3 py-2.5"
                    style={{ borderBottom: i < withdrawals.data!.length - 1 ? '1px solid var(--border)' : 'none' }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate" style={{ color: 'var(--text)' }}>
                          {w.user.username ? `@${w.user.username}` : w.user.firstName} • {w.netAmount.toFixed(2)} BRB
                        </p>
                        <p className="text-[10px] font-mono truncate" style={{ color: 'var(--text-muted)' }}>{w.tonAddress}</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          {w.status} • {new Date(w.createdAt).toLocaleString()}
                        </p>
                        {w.externalTxId && (
                          <p className="text-[10px] font-mono truncate" style={{ color: 'var(--teal)' }}>
                            TX: {w.externalTxId}
                          </p>
                        )}
                        {w.failureReason && (
                          <p className="text-[10px]" style={{ color: '#FF3B30' }}>
                            {w.failureReason}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 flex gap-2">
                        {w.status === 'PENDING' && (
                          <button
                            onClick={() => approveWithdrawal.mutate(w.id, { onSuccess: () => setToast(t('approved')) })}
                            className="px-3 py-1.5 text-[11px] font-medium rounded-btn"
                            style={{ backgroundColor: 'var(--teal)', color: '#000', border: 'none', cursor: 'pointer' }}
                          >
                            {t('approve')}
                          </button>
                        )}
                        {w.status === 'APPROVED' && (
                          <button
                            onClick={() => sendWithdrawal.mutate(w.id, { onSuccess: () => setToast(t('sent')) })}
                            className="px-3 py-1.5 text-[11px] font-medium rounded-btn"
                            style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
                          >
                            {t('send')}
                          </button>
                        )}
                        {w.status !== 'FAILED' && w.status !== 'SENT' && (
                          <button
                            onClick={() => failWithdrawal.mutate({ withdrawalId: w.id, reason: 'Marked failed by admin' }, { onSuccess: () => setToast(t('failed')) })}
                            className="px-3 py-1.5 text-[11px] font-medium rounded-btn border"
                            style={{ borderColor: '#FF3B30', color: '#FF3B30', background: 'transparent', cursor: 'pointer' }}
                          >
                            {t('fail')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t('noWithdrawals')}</p>
            )}
          </div>
        </>
      ) : null}

      {/* Recent Users */}
      {users.data && users.data.length > 0 && (
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>{t('recentUsers')}</p>
          <div className="rounded-card border overflow-hidden" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            {users.data.map((u, i) => (
              <div
                key={u.id}
                className="flex items-center justify-between px-3 py-2.5"
                style={{ borderBottom: i < users.data!.length - 1 ? '1px solid var(--border)' : 'none' }}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>
                      {u.firstName}
                    </p>
                    {u.isPremium && (
                      <span className="text-[8px] px-1 py-0.5 rounded" style={{ backgroundColor: 'rgba(245,200,66,0.15)', color: 'var(--gold)' }}>
                        {t('pro')}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {u.username ? `@${u.username}` : `ID: ${u.telegramId}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono" style={{ color: 'var(--accent)' }}>
                    {u.brbBalance.toFixed(0)} BRB
                  </p>
                  <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                    {u._count.tasks}t / {u._count.listings}l
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {rejectModalId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={() => setRejectModalId(null)}>
          <div className="w-full max-w-md rounded-t-2xl p-6 space-y-4 safe-bottom" style={{ backgroundColor: 'var(--surface)' }} onClick={(e) => e.stopPropagation()}>
            <p className="text-base font-semibold" style={{ color: 'var(--text)' }}>{t('rejectReasonTitle')}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('rejectReasonDesc')}</p>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder={t('rejectReasonPlaceholder')} rows={3} className="w-full p-3 rounded-btn text-sm outline-none resize-none border" style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)', caretColor: 'var(--accent)' }} />
            <div className="flex gap-3">
              <button onClick={() => setRejectModalId(null)} className="flex-1 py-2.5 text-sm font-medium rounded-btn border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'transparent', cursor: 'pointer' }}>{t('cancel')}</button>
              <button
                onClick={() => {
                  const id = rejectModalId;
                  reject.mutate(
                    { userTaskId: id, reason: rejectReason },
                    {
                      onSuccess: () => {
                        setRejectModalId(null);
                        setRejectReason('');
                        setToast(t('rejected'));
                        setTimeout(() => setToast(null), 2500);
                      },
                    },
                  );
                }}
                disabled={reject.isPending}
                className="flex-1 py-2.5 text-sm font-medium rounded-btn"
                style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF', border: 'none', cursor: 'pointer' }}
              >
                {reject.isPending ? t('processing') : t('reject')}
              </button>
            </div>
          </div>
        </div>
      )}

      {createTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={() => setCreateTaskOpen(false)}>
          <div className="w-full max-w-md rounded-t-2xl p-6 space-y-4 safe-bottom" style={{ backgroundColor: 'var(--surface)' }} onClick={(e) => e.stopPropagation()}>
            <p className="text-base font-semibold" style={{ color: 'var(--text)' }}>{t('newTask')}</p>
            <div className="space-y-2">
              <input value={taskForm.title} onChange={(e) => setTaskForm((s) => ({ ...s, title: e.target.value }))} placeholder={t('taskTitle')} className="w-full px-3 py-2.5 rounded-btn text-sm outline-none border" style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }} />
              <textarea value={taskForm.description} onChange={(e) => setTaskForm((s) => ({ ...s, description: e.target.value }))} placeholder={t('taskDescription')} rows={3} className="w-full p-3 rounded-btn text-sm outline-none resize-none border" style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }} />
              <div className="grid grid-cols-2 gap-2">
                <select value={taskForm.category} onChange={(e) => setTaskForm((s) => ({ ...s, category: e.target.value }))} className="w-full px-3 py-2.5 rounded-btn text-sm outline-none border" style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                  <option value="survey">{t('catSurvey')}</option>
                  <option value="review">{t('catReview')}</option>
                  <option value="test">{t('catTest')}</option>
                  <option value="subscribe">{t('catSubscribe')}</option>
                </select>
                <input value={taskForm.brand} onChange={(e) => setTaskForm((s) => ({ ...s, brand: e.target.value }))} placeholder={t('brand')} className="w-full px-3 py-2.5 rounded-btn text-sm outline-none border" style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input value={taskForm.sponsorName} onChange={(e) => setTaskForm((s) => ({ ...s, sponsorName: e.target.value }))} placeholder="Sponsor name" className="w-full px-3 py-2.5 rounded-btn text-sm outline-none border" style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }} />
                <input value={taskForm.sponsorType} onChange={(e) => setTaskForm((s) => ({ ...s, sponsorType: e.target.value }))} placeholder="Sponsor type" className="w-full px-3 py-2.5 rounded-btn text-sm outline-none border" style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={taskForm.sponsorBudgetCurrency} onChange={(e) => setTaskForm((s) => ({ ...s, sponsorBudgetCurrency: e.target.value }))} className="w-full px-3 py-2.5 rounded-btn text-sm outline-none border" style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                  <option value="TON">TON</option>
                  <option value="STARS">STARS</option>
                </select>
                <input value={taskForm.sponsorBudgetAmount} onChange={(e) => setTaskForm((s) => ({ ...s, sponsorBudgetAmount: e.target.value }))} placeholder="Sponsor budget amount" inputMode="decimal" className="w-full px-3 py-2.5 rounded-btn text-sm outline-none border" style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input value={taskForm.kpiName} onChange={(e) => setTaskForm((s) => ({ ...s, kpiName: e.target.value }))} placeholder="KPI name" className="w-full px-3 py-2.5 rounded-btn text-sm outline-none border" style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }} />
                <input value={taskForm.kpiTarget} onChange={(e) => setTaskForm((s) => ({ ...s, kpiTarget: e.target.value }))} placeholder="KPI target" className="w-full px-3 py-2.5 rounded-btn text-sm outline-none border" style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }} />
                <input value={taskForm.kpiUnit} onChange={(e) => setTaskForm((s) => ({ ...s, kpiUnit: e.target.value }))} placeholder="KPI unit" className="w-full px-3 py-2.5 rounded-btn text-sm outline-none border" style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input value={taskForm.minReputation} onChange={(e) => setTaskForm((s) => ({ ...s, minReputation: e.target.value }))} placeholder="Min rep" inputMode="numeric" className="w-full px-3 py-2.5 rounded-btn text-sm outline-none border" style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }} />
                <input value={taskForm.minAccountAgeDays} onChange={(e) => setTaskForm((s) => ({ ...s, minAccountAgeDays: e.target.value }))} placeholder="Min age days" inputMode="numeric" className="w-full px-3 py-2.5 rounded-btn text-sm outline-none border" style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }} />
                <input value={taskForm.cooldownSeconds} onChange={(e) => setTaskForm((s) => ({ ...s, cooldownSeconds: e.target.value }))} placeholder="Cooldown sec" inputMode="numeric" className="w-full px-3 py-2.5 rounded-btn text-sm outline-none border" style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }} />
              </div>
              <input value={taskForm.requiredProofFields} onChange={(e) => setTaskForm((s) => ({ ...s, requiredProofFields: e.target.value }))} placeholder="Required proof fields (comma separated)" className="w-full px-3 py-2.5 rounded-btn text-sm outline-none border" style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }} />
              <select value={taskForm.verificationType} onChange={(e) => setTaskForm((s) => ({ ...s, verificationType: e.target.value }))} className="w-full px-3 py-2.5 rounded-btn text-sm outline-none border" style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                <option value="MANUAL">{t('verifyManual')}</option>
                <option value="AUTO_CONNECT_WALLET">{t('verifyWallet')}</option>
                <option value="AUTO_FIRST_LISTING">{t('verifyFirstListing')}</option>
                <option value="AUTO_FIRST_PURCHASE">{t('verifyFirstPurchase')}</option>
              </select>
              <div className="grid grid-cols-3 gap-2">
                <input value={taskForm.reward} onChange={(e) => setTaskForm((s) => ({ ...s, reward: e.target.value }))} placeholder={t('reward')} inputMode="decimal" className="w-full px-3 py-2.5 rounded-btn text-sm outline-none border" style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }} />
                <input value={taskForm.timeMinutes} onChange={(e) => setTaskForm((s) => ({ ...s, timeMinutes: e.target.value }))} placeholder={t('minutes')} inputMode="numeric" className="w-full px-3 py-2.5 rounded-btn text-sm outline-none border" style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }} />
                <input value={taskForm.totalSlots} onChange={(e) => setTaskForm((s) => ({ ...s, totalSlots: e.target.value }))} placeholder={t('slots')} inputMode="numeric" className="w-full px-3 py-2.5 rounded-btn text-sm outline-none border" style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }} />
              </div>
              <input value={taskForm.expiresAt} onChange={(e) => setTaskForm((s) => ({ ...s, expiresAt: e.target.value }))} placeholder={t('expiresAt')} className="w-full px-3 py-2.5 rounded-btn text-sm outline-none border font-mono" style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCreateTaskOpen(false)} className="flex-1 py-2.5 text-sm font-medium rounded-btn border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'transparent', cursor: 'pointer' }}>{t('cancel')}</button>
              <button
                onClick={() => {
                  const payload = {
                    title: taskForm.title.trim(),
                    description: taskForm.description.trim(),
                    category: taskForm.category,
                    verificationType: taskForm.verificationType,
                    reward: parseFloat(taskForm.reward) || 0,
                    timeMinutes: parseInt(taskForm.timeMinutes, 10) || 1,
                    brand: taskForm.brand.trim() || 'Brabble',
                    sponsorName: taskForm.sponsorName.trim() || undefined,
                    sponsorType: taskForm.sponsorType.trim() || undefined,
                    sponsorBudgetCurrency: (taskForm.sponsorBudgetAmount.trim() ? taskForm.sponsorBudgetCurrency : undefined) as 'TON' | 'STARS' | undefined,
                    sponsorBudgetAmount: taskForm.sponsorBudgetAmount.trim() ? parseFloat(taskForm.sponsorBudgetAmount) : undefined,
                    kpiName: taskForm.kpiName.trim() || undefined,
                    kpiTarget: taskForm.kpiTarget.trim() ? parseFloat(taskForm.kpiTarget) : undefined,
                    kpiUnit: taskForm.kpiUnit.trim() || undefined,
                    minReputation: parseInt(taskForm.minReputation, 10) || 0,
                    minAccountAgeDays: parseInt(taskForm.minAccountAgeDays, 10) || 0,
                    cooldownSeconds: parseInt(taskForm.cooldownSeconds, 10) || 0,
                    verificationPolicy: {
                      proofType: 'TEXT' as const,
                      requiredFields: taskForm.requiredProofFields.split(',').map((x) => x.trim()).filter(Boolean),
                      autoCheckRules: [],
                      minTextLength: 10,
                    },
                    totalSlots: parseInt(taskForm.totalSlots, 10) || 100,
                    expiresAt: taskForm.expiresAt.trim() ? taskForm.expiresAt.trim() : undefined,
                    isActive: taskForm.isActive,
                  };
                  createTask.mutate(payload, {
                    onSuccess: () => {
                      setToast(t('taskCreated'));
                      setTimeout(() => setToast(null), 2500);
                      setCreateTaskOpen(false);
                      setTaskForm((s) => ({ ...s, title: '', description: '' }));
                    },
                  });
                }}
                disabled={createTask.isPending}
                className="flex-1 py-2.5 text-sm font-medium rounded-btn"
                style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF', border: 'none', cursor: 'pointer' }}
              >
                {createTask.isPending ? t('processing') : t('create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
