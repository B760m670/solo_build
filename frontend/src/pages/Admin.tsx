import { useTranslation } from '../lib/i18n';
import {
  useAdminDashboard,
  useAdminPendingWithdrawals,
  useAdminProcessWithdrawal,
} from '../hooks/useAdmin';

interface AdminProps {
  onBack: () => void;
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      className="rounded-card p-3"
      style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
      <p className="text-sm font-bold mt-1" style={{ color: 'var(--text)' }}>
        {value}
      </p>
    </div>
  );
}

function Admin({ onBack }: AdminProps) {
  const { t } = useTranslation();
  const dashboard = useAdminDashboard();
  const pending = useAdminPendingWithdrawals();
  const process = useAdminProcessWithdrawal();

  return (
    <div className="px-4 pt-2 pb-24">
      <button
        onClick={onBack}
        className="text-[11px] font-medium mb-3"
        style={{
          color: 'var(--text-muted)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        ← {t('back')}
      </button>

      <p className="text-sm font-bold mb-3" style={{ color: 'var(--text)' }}>
        {t('platformStats')}
      </p>
      {dashboard.isLoading && (
        <p className="text-xs py-4" style={{ color: 'var(--text-muted)' }}>
          {t('loading')}
        </p>
      )}
      {dashboard.data && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          <StatCard label={t('users')} value={dashboard.data.users.total} />
          <StatCard label={t('last7days')} value={dashboard.data.users.recentSignups} />
          <StatCard
            label="Active Plus"
            value={dashboard.data.users.activePlus}
          />
          <StatCard
            label="Gifts"
            value={`${dashboard.data.gifts.active}/${dashboard.data.gifts.total}`}
          />
          <StatCard label="Themes" value={dashboard.data.themes.active} />
          <StatCard label="Posts" value={dashboard.data.social.posts} />
          <StatCard
            label="Pending withdrawals"
            value={dashboard.data.withdrawals.pending}
          />
        </div>
      )}

      {dashboard.data && (
        <div
          className="rounded-card p-3 mb-4"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <p
            className="text-[11px] font-semibold mb-2"
            style={{ color: 'var(--text-muted)' }}
          >
            {t('tierDistribution')}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {(['NEW', 'TRUSTED', 'EXPERT', 'ELITE'] as const).map((tier) => (
              <div key={tier}>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {t(`tier${tier}`)}
                </p>
                <p className="text-xs font-bold" style={{ color: 'var(--text)' }}>
                  {dashboard.data.users.tiers[tier] ?? 0}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-sm font-bold mb-2" style={{ color: 'var(--text)' }}>
        Pending withdrawals
      </p>
      {pending.data && pending.data.length === 0 && (
        <p className="text-xs py-4" style={{ color: 'var(--text-muted)' }}>
          {t('noSubmissions')}
        </p>
      )}
      <div className="flex flex-col gap-2">
        {pending.data?.map((w) => (
          <div
            key={w.id}
            className="rounded-card p-3"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
              {w.netAmount} TON → {w.tonAddress.slice(0, 8)}…{w.tonAddress.slice(-6)}
            </p>
            <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
              Gross {w.grossAmount} · fee {w.feeAmount}
            </p>
            <button
              onClick={() => process.mutate(w.id)}
              disabled={process.isPending}
              className="mt-2 text-[11px] font-semibold px-3 py-1.5 rounded-btn"
              style={{
                backgroundColor: 'var(--accent)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                opacity: process.isPending ? 0.5 : 1,
              }}
            >
              Process
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Admin;
