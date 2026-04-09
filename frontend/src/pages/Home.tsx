import { getTelegramUser } from '../lib/telegram';
import { SendIcon, ReceiveIcon, SwapIcon, ChevronRightIcon } from '../components/Icons';
import { useWallet } from '../hooks/useWallet';
import { useUserTasks } from '../hooks/useTasks';
import { WalletSkeleton, CardSkeleton } from '../components/Skeleton';
import ErrorState from '../components/ErrorState';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const modules = [
  { name: 'Tasks', desc: 'Earn BRB', status: 'Active' },
  { name: 'Market', desc: 'Buy & sell', status: 'Active' },
  { name: 'Knowledge', desc: 'Learn & earn', status: 'Soon' },
  { name: 'Services', desc: 'Web3 tools', status: 'Soon' },
];

function Home() {
  const user = getTelegramUser();
  const firstName = user?.first_name || 'User';
  const walletQuery = useWallet();
  const activeTasksQuery = useUserTasks('ACTIVE');

  return (
    <div className="px-4 py-4 space-y-6">
      {/* Greeting */}
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        {getGreeting()}, {firstName}
      </p>

      {/* Wallet Card */}
      {walletQuery.isLoading ? (
        <WalletSkeleton />
      ) : walletQuery.isError ? (
        <ErrorState message="Failed to load wallet" onRetry={() => walletQuery.refetch()} />
      ) : (
        <div
          className="relative overflow-hidden rounded-card p-5"
          style={{ backgroundColor: 'var(--surface2)' }}
        >
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
            style={{
              background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
              transform: 'translate(30%, -30%)',
            }}
          />
          <p
            className="text-[10px] uppercase tracking-widest mb-2"
            style={{ color: 'var(--text-muted)' }}
          >
            Brabble Wallet
          </p>
          <p className="text-[28px] font-bold" style={{ color: 'var(--text)' }}>
            {(walletQuery.data?.balance ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} BRB
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Total earned: {(walletQuery.data?.totalEarned ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} BRB
          </p>

          <div className="flex gap-2 mt-4">
            {[
              { label: 'Send', Icon: SendIcon },
              { label: 'Receive', Icon: ReceiveIcon },
              { label: 'Swap', Icon: SwapIcon },
            ].map(({ label, Icon }) => (
              <button
                key={label}
                className="tap-target flex-1 flex items-center justify-center gap-1.5 py-2 rounded-btn text-xs font-medium border"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modules Grid */}
      <div>
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
          Modules
        </p>
        <div className="grid grid-cols-2 gap-3">
          {modules.map((mod) => (
            <div
              key={mod.name}
              className="rounded-card p-4 border"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="w-8 h-8 rounded-lg mb-2" style={{ backgroundColor: 'var(--surface2)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                {mod.name}
              </p>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {mod.desc}
              </p>
              <span
                className="inline-block mt-2 text-[9px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor:
                    mod.status === 'Active'
                      ? 'rgba(0, 212, 170, 0.1)'
                      : 'rgba(255, 255, 255, 0.04)',
                  color:
                    mod.status === 'Active'
                      ? 'var(--teal)'
                      : 'var(--text-muted)',
                }}
              >
                {mod.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Active Tasks */}
      <div>
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
          Active Tasks
        </p>
        {activeTasksQuery.isLoading ? (
          <CardSkeleton />
        ) : (activeTasksQuery.data?.length ?? 0) === 0 ? (
          <div
            className="flex items-center justify-between px-4 py-3 rounded-card border"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--text-muted)' }} />
              <div>
                <p className="text-sm" style={{ color: 'var(--text)' }}>No active tasks</p>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Start earning BRB</p>
              </div>
            </div>
            <ChevronRightIcon size={16} color="var(--text-muted)" />
          </div>
        ) : (
          <div className="space-y-2">
            {activeTasksQuery.data!.map((ut) => (
              <div
                key={ut.id}
                className="flex items-center justify-between px-4 py-3 rounded-card border"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--teal)' }} />
                  <div>
                    <p className="text-sm" style={{ color: 'var(--text)' }}>
                      {ut.task?.title ?? 'Task'}
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {ut.task?.brand ?? ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold" style={{ color: 'var(--gold)' }}>
                    +{ut.task?.reward ?? 0} BRB
                  </span>
                  <ChevronRightIcon size={16} color="var(--text-muted)" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      {walletQuery.data?.recentTransactions && walletQuery.data.recentTransactions.length > 0 && (
        <div>
          <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
            Recent Activity
          </p>
          <div className="space-y-1">
            {walletQuery.data.recentTransactions.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between px-4 py-2.5 rounded-card"
                style={{ backgroundColor: 'var(--surface)' }}
              >
                <div>
                  <p className="text-xs" style={{ color: 'var(--text)' }}>
                    {formatTxType(tx.type)}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className="text-xs font-bold"
                  style={{ color: tx.amount > 0 ? 'var(--teal)' : 'var(--text-secondary)' }}
                >
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

function formatTxType(type: string): string {
  const map: Record<string, string> = {
    TASK_REWARD: 'Task reward',
    MARKETPLACE_PURCHASE: 'Purchase',
    MARKETPLACE_SALE: 'Sale',
    MARKETPLACE_COMMISSION: 'Commission',
    REFERRAL_BONUS: 'Referral bonus',
    WITHDRAWAL: 'Withdrawal',
    WITHDRAWAL_FEE: 'Withdrawal fee',
    PREMIUM_PURCHASE: 'Premium',
    DEPOSIT: 'Deposit',
  };
  return map[type] ?? type;
}

export default Home;
