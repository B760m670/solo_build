import { useState } from 'react';
import { getTelegramUser } from '../lib/telegram';
import { SendIcon, ReceiveIcon, SwapIcon, ChevronRightIcon } from '../components/Icons';
import { useWallet } from '../hooks/useWallet';
import { useUserTasks } from '../hooks/useTasks';
import { WalletSkeleton, CardSkeleton } from '../components/Skeleton';
import ErrorState from '../components/ErrorState';
import { useTranslation } from '../lib/i18n';
import type { TranslationKeys } from '../lib/i18n/en';

type Page = 'home' | 'tasks' | 'market' | 'profile' | 'admin';

function Home({ onNavigate }: { onNavigate?: (page: Page) => void }) {
  const { t } = useTranslation();
  const user = getTelegramUser();
  const firstName = user?.first_name || 'User';
  const walletQuery = useWallet();
  const activeTasksQuery = useUserTasks('ACTIVE');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return t('greetingMorning');
    if (hour < 18) return t('greetingAfternoon');
    return t('greetingEvening');
  };

  const modules = [
    { name: t('moduleTasks'), desc: t('moduleTasksDesc'), status: t('statusActive'), page: 'tasks' as Page | null },
    { name: t('moduleMarket'), desc: t('moduleMarketDesc'), status: t('statusActive'), page: 'market' as Page | null },
    { name: t('moduleKnowledge'), desc: t('moduleKnowledgeDesc'), status: t('statusSoon'), page: null },
    { name: t('moduleServices'), desc: t('moduleServicesDesc'), status: t('statusSoon'), page: null },
  ];

  const txTypeMap: Record<string, TranslationKeys> = {
    TASK_REWARD: 'txTaskReward',
    MARKETPLACE_PURCHASE: 'txPurchase',
    MARKETPLACE_SALE: 'txSale',
    MARKETPLACE_COMMISSION: 'txCommission',
    REFERRAL_BONUS: 'txReferralBonus',
    WITHDRAWAL: 'txWithdrawal',
    WITHDRAWAL_FEE: 'txWithdrawalFee',
    PREMIUM_PURCHASE: 'txPremium',
    DEPOSIT: 'txDeposit',
  };

  return (
    <div className="px-4 py-4 space-y-6">
      {toast && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-btn text-xs font-medium"
          style={{ backgroundColor: 'var(--surface2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
        >
          {toast}
        </div>
      )}

      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        {getGreeting()}, {firstName}
      </p>

      {walletQuery.isLoading || (!walletQuery.data && !walletQuery.isError) ? (
        <WalletSkeleton />
      ) : walletQuery.isError ? (
        <ErrorState message={t('failedLoadWallet')} onRetry={() => walletQuery.refetch()} />
      ) : (
        <div className="relative overflow-hidden rounded-card p-5" style={{ backgroundColor: 'var(--surface2)' }}>
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
          />
          <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
            {t('brabbleWallet')}
          </p>
          <p className="text-[28px] font-bold" style={{ color: 'var(--text)' }}>
            {(walletQuery.data?.balance ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} BRB
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {t('totalEarned')}: {(walletQuery.data?.totalEarned ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} BRB
          </p>

          <div className="flex gap-2 mt-4">
            {[
              { label: t('send'), Icon: SendIcon },
              { label: t('receive'), Icon: ReceiveIcon },
              { label: t('swap'), Icon: SwapIcon },
            ].map(({ label, Icon }) => (
              <button
                key={label}
                onClick={() => showToast(t('comingSoon', { name: label }))}
                className="tap-target flex-1 flex items-center justify-center gap-1.5 py-2 rounded-btn text-xs font-medium border"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'transparent', cursor: 'pointer' }}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>{t('modules')}</p>
        <div className="grid grid-cols-2 gap-3">
          {modules.map((mod) => (
            <button
              key={mod.name}
              onClick={() => {
                if (mod.page && onNavigate) onNavigate(mod.page);
                else if (!mod.page) showToast(t('comingSoon', { name: mod.name }));
              }}
              className="rounded-card p-4 border text-left"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', cursor: mod.page ? 'pointer' : 'default' }}
            >
              <div className="w-8 h-8 rounded-lg mb-2" style={{ backgroundColor: 'var(--surface2)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{mod.name}</p>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{mod.desc}</p>
              <span
                className="inline-block mt-2 text-[9px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: mod.page ? 'rgba(0, 212, 170, 0.1)' : 'rgba(255, 255, 255, 0.04)',
                  color: mod.page ? 'var(--teal)' : 'var(--text-muted)',
                }}
              >
                {mod.status}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>{t('activeTasks')}</p>
        {activeTasksQuery.isLoading ? (
          <CardSkeleton />
        ) : (activeTasksQuery.data?.length ?? 0) === 0 ? (
          <div
            onClick={() => onNavigate?.('tasks')}
            className="flex items-center justify-between px-4 py-3 rounded-card border"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', cursor: 'pointer' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--text-muted)' }} />
              <div>
                <p className="text-sm" style={{ color: 'var(--text)' }}>{t('noActiveTasks')}</p>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{t('startEarning')}</p>
              </div>
            </div>
            <ChevronRightIcon size={16} color="var(--text-muted)" />
          </div>
        ) : (
          <div className="space-y-2">
            {activeTasksQuery.data!.map((ut) => (
              <div
                key={ut.id}
                onClick={() => onNavigate?.('tasks')}
                className="flex items-center justify-between px-4 py-3 rounded-card border"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', cursor: 'pointer' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--teal)' }} />
                  <div>
                    <p className="text-sm" style={{ color: 'var(--text)' }}>{ut.task?.title ?? t('tasks')}</p>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{ut.task?.brand ?? ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold" style={{ color: 'var(--gold)' }}>+{ut.task?.reward ?? 0} BRB</span>
                  <ChevronRightIcon size={16} color="var(--text-muted)" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {walletQuery.data?.recentTransactions && walletQuery.data.recentTransactions.length > 0 && (
        <div>
          <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>{t('recentActivity')}</p>
          <div className="space-y-1">
            {walletQuery.data.recentTransactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-4 py-2.5 rounded-card" style={{ backgroundColor: 'var(--surface)' }}>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text)' }}>
                    {txTypeMap[tx.type] ? t(txTypeMap[tx.type]) : tx.type}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{new Date(tx.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="text-xs font-bold" style={{ color: tx.amount > 0 ? 'var(--teal)' : 'var(--text-secondary)' }}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(0)} BRB
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
