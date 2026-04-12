import { useAdminDashboard, useAdminUsers } from '../hooks/useAdmin';
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

  if (dashboard.isError) {
    return <ErrorState message={t('adminRequired')} onRetry={onBack} />;
  }

  return (
    <div className="px-4 py-4 space-y-6">
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
    </div>
  );
}

export default Admin;
