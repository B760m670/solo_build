import { useState } from 'react';
import { useTranslation } from '../lib/i18n';
import {
  useAdminDashboard,
  useAdminPendingTasks,
  useAdminDisputes,
  useAdminApproveTask,
  useAdminRejectTask,
} from '../hooks/useAdmin';

interface AdminProps {
  onBack: () => void;
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-card p-3" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-sm font-bold mt-1" style={{ color: 'var(--text)' }}>{value}</p>
    </div>
  );
}

function Admin({ onBack }: AdminProps) {
  const { t } = useTranslation();
  const dashboard = useAdminDashboard();
  const pending = useAdminPendingTasks();
  const disputes = useAdminDisputes();
  const approve = useAdminApproveTask();
  const reject = useAdminRejectTask();
  const [rejectFor, setRejectFor] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  return (
    <div className="px-4 pt-2 pb-24">
      <button
        onClick={onBack}
        className="text-[11px] font-medium mb-3"
        style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        ← {t('back')}
      </button>

      <p className="text-sm font-bold mb-3" style={{ color: 'var(--text)' }}>{t('platformStats')}</p>
      {dashboard.isLoading && <p className="text-xs py-4" style={{ color: 'var(--text-muted)' }}>{t('loading')}</p>}
      {dashboard.data && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          <StatCard label={t('users')} value={dashboard.data.users.total} />
          <StatCard label={t('last7days')} value={dashboard.data.users.recentSignups} />
          <StatCard label={t('activeListings')} value={`${dashboard.data.listings.active}/${dashboard.data.listings.total}`} />
          <StatCard label={t('totalOrders')} value={`${dashboard.data.orders.completed}/${dashboard.data.orders.total}`} />
          <StatCard label={t('gmvStars')} value={`${dashboard.data.economy.gmvStars} ★`} />
          <StatCard label={t('commissionStars')} value={`${dashboard.data.economy.commissionStars} ★`} />
        </div>
      )}

      {dashboard.data && (
        <div className="rounded-card p-3 mb-4" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="text-[11px] font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>{t('tierDistribution')}</p>
          <div className="grid grid-cols-4 gap-2">
            {(['NEW', 'TRUSTED', 'EXPERT', 'ELITE'] as const).map((tier) => (
              <div key={tier}>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t(`tier${tier}`)}</p>
                <p className="text-xs font-bold" style={{ color: 'var(--text)' }}>{dashboard.data.users.tiers[tier] ?? 0}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-sm font-bold mb-2" style={{ color: 'var(--text)' }}>{t('taskReviewQueue')}</p>
      {pending.data && pending.data.length === 0 && (
        <p className="text-xs py-4" style={{ color: 'var(--text-muted)' }}>{t('noSubmissions')}</p>
      )}
      <div className="flex flex-col gap-2 mb-4">
        {pending.data?.map((ut) => (
          <div key={ut.id} className="rounded-card p-3" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
              {ut.task?.brandName} — {ut.task?.title}
            </p>
            <p className="text-[11px] mt-1 whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
              {ut.proof}
            </p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => approve.mutate(ut.id)}
                className="text-[11px] font-semibold px-3 py-1.5 rounded-btn flex-1"
                style={{ backgroundColor: 'var(--teal)', color: '#000', border: 'none', cursor: 'pointer' }}
              >
                {t('approve')}
              </button>
              <button
                onClick={() => setRejectFor(ut.id)}
                className="text-[11px] font-semibold px-3 py-1.5 rounded-btn flex-1"
                style={{ backgroundColor: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)', cursor: 'pointer' }}
              >
                {t('reject')}
              </button>
            </div>
            {rejectFor === ut.id && (
              <div className="mt-2 flex gap-2">
                <input
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder={t('rejectReasonPlaceholder')}
                  className="flex-1 px-3 py-2 text-xs rounded-btn outline-none"
                  style={{ backgroundColor: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' }}
                />
                <button
                  onClick={async () => {
                    await reject.mutateAsync({ userTaskId: ut.id, reason: rejectReason || undefined });
                    setRejectFor(null);
                    setRejectReason('');
                  }}
                  className="text-[11px] font-semibold px-3 py-2 rounded-btn"
                  style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
                >
                  {t('submit')}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-sm font-bold mb-2" style={{ color: 'var(--text)' }}>{t('disputes')}</p>
      {disputes.data && disputes.data.length === 0 && (
        <p className="text-xs py-4" style={{ color: 'var(--text-muted)' }}>{t('noDisputes')}</p>
      )}
      <div className="flex flex-col gap-2">
        {disputes.data?.map((o) => (
          <div key={o.id} className="rounded-card p-3" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{o.listing?.title ?? o.id}</p>
            <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
              {o.buyer?.firstName} → {o.seller?.firstName} · {o.priceStars} ★
            </p>
            {o.disputeReason && (
              <p className="text-[11px] mt-1 whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                {o.disputeReason}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Admin;
