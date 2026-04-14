import { useState } from 'react';
import { getTelegramUser } from '../lib/telegram';
import { SendIcon, ReceiveIcon, SwapIcon, ChevronRightIcon, TasksModuleIcon, MarketModuleIcon, KnowledgeIcon, ServicesIcon } from '../components/Icons';
import { useSendBrb, useWallet } from '../hooks/useWallet';
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
  const [modal, setModal] = useState<null | 'send' | 'receive'>(null);
  const [recipient, setRecipient] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendNote, setSendNote] = useState('');
  const sendBrb = useSendBrb();

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
    { name: t('moduleTasks'), desc: t('moduleTasksDesc'), status: t('statusActive'), page: 'tasks' as Page | null, Icon: TasksModuleIcon, color: 'var(--accent)' },
    { name: t('moduleMarket'), desc: t('moduleMarketDesc'), status: t('statusActive'), page: 'market' as Page | null, Icon: MarketModuleIcon, color: 'var(--teal)' },
    { name: t('moduleKnowledge'), desc: t('moduleKnowledgeDesc'), status: t('statusSoon'), page: null, Icon: KnowledgeIcon, color: 'var(--gold)' },
    { name: t('moduleServices'), desc: t('moduleServicesDesc'), status: t('statusSoon'), page: null, Icon: ServicesIcon, color: 'var(--text-muted)' },
  ];

  const txTypeMap: Record<string, TranslationKeys> = {
    TASK_REWARD: 'txTaskReward',
    MARKETPLACE_PURCHASE: 'txPurchase',
    MARKETPLACE_SALE: 'txSale',
    MARKETPLACE_COMMISSION: 'txCommission',
    REFERRAL_BONUS: 'txReferralBonus',
    WITHDRAWAL: 'txWithdrawal',
    WITHDRAWAL_FEE: 'txWithdrawalFee',
    BRB_TRANSFER_OUT: 'txTransferOut',
    BRB_TRANSFER_IN: 'txTransferIn',
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
              { label: t('send'), Icon: SendIcon, onClick: () => setModal('send') },
              { label: t('receive'), Icon: ReceiveIcon, onClick: () => setModal('receive') },
              { label: t('swap'), Icon: SwapIcon },
            ].map(({ label, Icon, onClick }) => (
              <button
                key={label}
                onClick={() => (onClick ? onClick() : showToast(t('comingSoon', { name: label })))}
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
              <div className="w-8 h-8 rounded-lg mb-2 flex items-center justify-center" style={{ backgroundColor: 'var(--surface2)' }}>
                <mod.Icon size={18} color={mod.color} />
              </div>
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

      {modal === 'receive' && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={() => setModal(null)}>
          <div className="w-full max-w-md rounded-t-2xl p-6 space-y-4 safe-bottom" style={{ backgroundColor: 'var(--surface)' }} onClick={(e) => e.stopPropagation()}>
            <p className="text-base font-semibold" style={{ color: 'var(--text)' }}>{t('receive')}</p>
            {walletQuery.data?.tonWallet ? (
              <>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('receiveDesc')}</p>
                <div className="rounded-btn p-3 border" style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)' }}>
                  <p className="text-xs break-all font-mono" style={{ color: 'var(--teal)' }}>{walletQuery.data.tonWallet}</p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(walletQuery.data!.tonWallet!);
                    showToast(t('copied'));
                  }}
                  className="w-full py-2.5 text-sm font-medium rounded-btn"
                  style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
                >
                  {t('copyAddress')}
                </button>
              </>
            ) : (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('connectWalletToReceive')}</p>
            )}
          </div>
        </div>
      )}

      {modal === 'send' && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={() => setModal(null)}>
          <div className="w-full max-w-md rounded-t-2xl p-6 space-y-4 safe-bottom" style={{ backgroundColor: 'var(--surface)' }} onClick={(e) => e.stopPropagation()}>
            <p className="text-base font-semibold" style={{ color: 'var(--text)' }}>{t('sendBrb')}</p>
            <input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder={t('recipientPlaceholder')} className="w-full px-3 py-2.5 rounded-btn text-sm outline-none border" style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }} />
            <input value={sendAmount} onChange={(e) => setSendAmount(e.target.value)} inputMode="decimal" placeholder={t('amount')} className="w-full px-3 py-2.5 rounded-btn text-sm outline-none border" style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }} />
            <input value={sendNote} onChange={(e) => setSendNote(e.target.value)} placeholder={t('noteOptional')} className="w-full px-3 py-2.5 rounded-btn text-sm outline-none border" style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }} />
            {sendBrb.isError && (
              <p className="text-[11px]" style={{ color: '#FF3B30' }}>{sendBrb.error.message}</p>
            )}
            <button
              onClick={() => {
                const amount = parseFloat(sendAmount);
                if (!recipient.trim() || !Number.isFinite(amount) || amount <= 0) return;
                sendBrb.mutate(
                  { recipient: recipient.trim(), amount, note: sendNote.trim() || undefined },
                  {
                    onSuccess: () => {
                      setModal(null);
                      setRecipient('');
                      setSendAmount('');
                      setSendNote('');
                      showToast(t('transferSent'));
                    },
                  },
                );
              }}
              disabled={sendBrb.isPending}
              className="w-full py-2.5 text-sm font-medium rounded-btn"
              style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              {sendBrb.isPending ? t('processing') : t('send')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
