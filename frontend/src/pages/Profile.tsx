import { useEffect, useState } from 'react';
import { ChevronRightIcon, SunIcon, MoonIcon, WalletIcon } from '../components/Icons';
import { toggleTheme, getTheme } from '../hooks/useTheme';
import { useUser, useUpdateUser } from '../hooks/useUser';
import { useWallet, useConnectWallet, useDisconnectWallet, useWithdraw } from '../hooks/useWallet';
import { useReferrals, useClaimReferralBonus } from '../hooks/useReferrals';
import { useUserTasks } from '../hooks/useTasks';
import { useCreateInvoice } from '../hooks/usePayments';
import { ProfileSkeleton } from '../components/Skeleton';
import ErrorState from '../components/ErrorState';
import { useTranslation, type Lang } from '../lib/i18n';
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';

type Modal = null | 'referrals' | 'premium' | 'withdraw' | 'wallet' | 'language' | 'about';

function Profile({ onAdminOpen }: { onAdminOpen?: () => void }) {
  const { t, lang, setLang } = useTranslation();
  const userQuery = useUser();
  const walletQuery = useWallet();
  const referralsQuery = useReferrals();
  const completedTasksQuery = useUserTasks('COMPLETED');
  const updateUser = useUpdateUser();
  const claimBonus = useClaimReferralBonus();
  const [theme, setTheme] = useState(getTheme());
  const [modal, setModal] = useState<Modal>(null);
  const [copied, setCopied] = useState(false);

  const handleThemeToggle = () => {
    toggleTheme();
    const newTheme = getTheme();
    setTheme(newTheme);
    updateUser.mutate({ theme: newTheme });
  };

  const handleMenuClick = (key: string) => {
    if (key === 'referrals') setModal('referrals');
    if (key === 'premium') setModal('premium');
    if (key === 'wallet') setModal('wallet');
    if (key === 'language') setModal('language');
    if (key === 'about') setModal('about');
    if (key === 'admin') onAdminOpen?.();
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLangSwitch = (l: Lang) => {
    setLang(l);
    updateUser.mutate({ language: l });
    setModal(null);
  };

  if (userQuery.isLoading || userQuery.fetchStatus === 'idle' && !userQuery.data) return <ProfileSkeleton />;
  if (userQuery.isError) {
    return <ErrorState message={t('failedLoadProfile')} onRetry={() => userQuery.refetch()} />;
  }

  const user = userQuery.data;
  if (!user) return <ProfileSkeleton />;
  const canOpenAdmin = !!onAdminOpen && (user.isAdmin || user.role === 'ADMIN' || user.role === 'MODERATOR');

  const balance = walletQuery.data?.balance ?? user.brbBalance;
  const totalEarned = walletQuery.data?.totalEarned ?? user.totalEarned;
  const tonWallet = walletQuery.data?.tonWallet ?? user.tonWallet;
  const completedCount = completedTasksQuery.data?.length ?? 0;
  const referralCount = referralsQuery.data?.count ?? user.referralCount;

  const menuItems = [
    { key: 'premium', label: user.isPremium ? t('premiumActive') : t('premium') },
    { key: 'wallet', label: tonWallet ? t('tonWalletConnected') : t('connectTonWallet') },
    { key: 'referrals', label: t('referrals') },
    { key: 'language', label: t('language') },
    { key: 'about', label: t('aboutBrabble') },
    ...(canOpenAdmin ? [{ key: 'admin', label: t('adminPanel') }] : []),
  ];

  return (
    <div className="px-4 py-4 space-y-6">
      <div className="flex flex-col items-center gap-2">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover" />
        ) : (
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
            style={{ backgroundColor: 'var(--surface2)', color: 'var(--text-secondary)' }}
          >
            {user.firstName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="text-center">
          <p className="text-base font-semibold" style={{ color: 'var(--text)' }}>
            {user.firstName} {user.lastName ?? ''}
          </p>
          {user.username && (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>@{user.username}</p>
          )}
          <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
            {t('memberSince')} {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
          </p>
          {user.isPremium && (
            <span
              className="inline-block mt-1 text-[9px] px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: 'rgba(245, 200, 66, 0.15)', color: 'var(--gold)' }}
            >
              {t('premium')}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: t('tasks'), value: String(completedCount) },
          { label: t('earned'), value: `${totalEarned.toFixed(0)} BRB` },
          { label: t('referrals'), value: String(referralCount) },
        ].map((stat) => (
          <div key={stat.label} className="rounded-card p-3 text-center border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>{stat.value}</p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-card p-4 border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{t('balance')}</p>
            <p className="text-xl font-bold" style={{ color: 'var(--text)' }}>
              {balance.toLocaleString(undefined, { maximumFractionDigits: 2 })} BRB
            </p>
          </div>
          <button
            onClick={() => balance >= 100 && setModal('withdraw')}
            className="px-4 py-2 text-xs font-medium rounded-btn border"
            style={{
              borderColor: balance >= 100 ? 'var(--accent)' : 'var(--border)',
              color: balance >= 100 ? 'var(--accent)' : 'var(--text-muted)',
              background: 'transparent',
              cursor: balance >= 100 ? 'pointer' : 'default',
            }}
          >
            {t('withdraw')}
          </button>
        </div>
        {tonWallet && (
          <div className="flex items-center gap-1.5 mt-2">
            <WalletIcon size={12} color="var(--teal)" />
            <p className="text-[10px] font-mono" style={{ color: 'var(--teal)' }}>
              {tonWallet.slice(0, 6)}...{tonWallet.slice(-4)}
            </p>
          </div>
        )}
        {balance < 100 && <p className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>{t('minWithdrawal')}</p>}
      </div>

      <div className="rounded-card border overflow-hidden" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        <button onClick={handleThemeToggle} className="tap-target w-full flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'none', cursor: 'pointer' }}>
          <span className="text-sm" style={{ color: 'var(--text)' }}>{t('theme')}</span>
          {theme === 'dark' ? <MoonIcon size={18} color="var(--text-secondary)" /> : <SunIcon size={18} color="var(--text-secondary)" />}
        </button>
        {menuItems.map((item, i) => (
          <button key={item.key} onClick={() => handleMenuClick(item.key)} className="tap-target w-full flex items-center justify-between px-4 py-3" style={{ borderBottom: i < menuItems.length - 1 ? '1px solid var(--border)' : 'none', background: 'none', cursor: 'pointer' }}>
            <span className="text-sm" style={{ color: 'var(--text)' }}>{item.label}</span>
            <ChevronRightIcon size={16} color="var(--text-muted)" />
          </button>
        ))}
      </div>

      <div className="px-2 pb-6">
        <p className="text-[10px] text-center leading-relaxed" style={{ color: 'var(--text-muted)' }}>{t('disclaimer')}</p>
      </div>

      {modal === 'referrals' && referralsQuery.data && (
        <BottomSheet onClose={() => setModal(null)} title={t('referrals')}>
          <div className="space-y-3">
            <Row label={t('referredFriends')} value={String(referralsQuery.data.count)} />
            <Row label={t('earnedFromReferrals')} value={`${referralsQuery.data.earned} BRB`} valueColor="var(--gold)" />
            <div className="rounded-btn p-3 border" style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)' }}>
              <p className="text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>{t('yourReferralLink')}</p>
              <p className="text-xs break-all font-mono" style={{ color: 'var(--accent)' }}>{referralsQuery.data.link}</p>
            </div>
            <button onClick={() => handleCopyLink(referralsQuery.data!.link)} className="w-full py-2.5 text-sm font-medium rounded-btn" style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF', border: 'none', cursor: 'pointer' }}>
              {copied ? t('copied') : t('copyLink')}
            </button>
            {user.referredBy && (
              <button onClick={() => claimBonus.mutate()} disabled={claimBonus.isPending} className="w-full py-2.5 text-sm font-medium rounded-btn border" style={{ borderColor: 'var(--teal)', color: 'var(--teal)', background: 'transparent', cursor: 'pointer' }}>
                {claimBonus.isPending ? t('claiming') : t('claimReferralBonus')}
              </button>
            )}
            {claimBonus.isError && <p className="text-[11px] text-center" style={{ color: '#FF3B30' }}>{claimBonus.error.message}</p>}
          </div>
        </BottomSheet>
      )}

      {modal === 'premium' && <PremiumModal onClose={() => setModal(null)} isPremium={user.isPremium} premiumExpiry={user.premiumExpiry} />}
      {modal === 'withdraw' && <WithdrawModal onClose={() => setModal(null)} balance={balance} tonWallet={tonWallet} />}
      {modal === 'wallet' && <WalletConnectModal onClose={() => setModal(null)} tonWallet={tonWallet} />}

      {modal === 'language' && (
        <BottomSheet onClose={() => setModal(null)} title={t('language')}>
          <div className="space-y-1">
            {([['en', 'English'], ['ru', 'Русский']] as [Lang, string][]).map(([code, label]) => (
              <button key={code} onClick={() => handleLangSwitch(code)} className="w-full flex items-center justify-between px-3 py-3 rounded-btn" style={{ background: lang === code ? 'rgba(108, 99, 255, 0.08)' : 'transparent', border: 'none', cursor: 'pointer' }}>
                <span className="text-sm" style={{ color: 'var(--text)' }}>{label}</span>
                {lang === code && (
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                )}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-center mt-2" style={{ color: 'var(--text-muted)' }}>{t('moreLanguages')}</p>
        </BottomSheet>
      )}

      {modal === 'about' && (
        <BottomSheet onClose={() => setModal(null)} title={t('aboutBrabble')}>
          <div className="space-y-3">
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{t('aboutDesc')}</p>
            <div className="space-y-2">
              <Row label={t('version')} value="1.0.0" />
              <Row label={t('blockchain')} value="TON" />
              <Row label={t('token')} value="BRB" />
            </div>
            <p className="text-[10px] text-center leading-relaxed" style={{ color: 'var(--text-muted)' }}>{t('disclaimer')}</p>
          </div>
        </BottomSheet>
      )}
    </div>
  );
}

function BottomSheet({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-t-2xl p-6 space-y-4 safe-bottom" style={{ backgroundColor: 'var(--surface)' }} onClick={(e) => e.stopPropagation()}>
        <p className="text-base font-semibold" style={{ color: 'var(--text)' }}>{title}</p>
        {children}
      </div>
    </div>
  );
}

function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span className="font-bold" style={{ color: valueColor || 'var(--text)' }}>{value}</span>
    </div>
  );
}

function PremiumModal({ onClose, isPremium, premiumExpiry }: { onClose: () => void; isPremium: boolean; premiumExpiry: string | null }) {
  const { t } = useTranslation();
  const createInvoice = useCreateInvoice();

  const features = [t('noCommission'), t('priorityAccess'), t('premiumBadge'), t('earlyAccess')];

  return (
    <BottomSheet onClose={onClose} title={t('premium')}>
      <div className="space-y-4">
        {isPremium && premiumExpiry && (
          <div className="rounded-btn p-3" style={{ backgroundColor: 'rgba(245, 200, 66, 0.08)' }}>
            <p className="text-xs font-medium" style={{ color: 'var(--gold)' }}>{t('activeUntil', { date: new Date(premiumExpiry).toLocaleDateString() })}</p>
          </div>
        )}
        <div className="space-y-2">
          {features.map((f) => (
            <div key={f} className="flex items-center gap-2">
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{f}</span>
            </div>
          ))}
        </div>
        {!isPremium && (
          <div className="space-y-2">
            <button onClick={() => createInvoice.mutate('PREMIUM_MONTHLY')} disabled={createInvoice.isPending} className="w-full py-3 text-sm font-medium rounded-btn" style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF', border: 'none', cursor: 'pointer' }}>
              {createInvoice.isPending ? t('loading') : t('monthlyPlan')}
            </button>
            <button onClick={() => createInvoice.mutate('PREMIUM_YEARLY')} disabled={createInvoice.isPending} className="w-full py-3 text-sm font-medium rounded-btn border" style={{ borderColor: 'var(--accent)', color: 'var(--accent)', background: 'transparent', cursor: 'pointer' }}>
              {t('yearlyPlan')}
            </button>
          </div>
        )}
        <p className="text-[10px] text-center" style={{ color: 'var(--text-muted)' }}>{t('paymentNote')}</p>
      </div>
    </BottomSheet>
  );
}

function WithdrawModal({ onClose, balance, tonWallet }: { onClose: () => void; balance: number; tonWallet: string | null }) {
  const { t } = useTranslation();
  const [address, setAddress] = useState(tonWallet || '');
  const [amount, setAmount] = useState('');
  const withdraw = useWithdraw();
  const [success, setSuccess] = useState(false);

  const numAmount = parseFloat(amount) || 0;
  const feeAmount = numAmount * 0.05;
  const netAmount = numAmount - feeAmount;
  const isValid = address.length > 10 && numAmount >= 100 && numAmount <= balance;

  const handleSubmit = () => {
    if (!isValid) return;
    withdraw.mutate(
      {
        tonAddress: address,
        amount: numAmount,
        idempotencyKey: `wd_${Date.now()}_${Math.round(numAmount * 100)}`,
      },
      { onSuccess: () => setSuccess(true) },
    );
  };

  if (success) {
    return (
      <BottomSheet onClose={onClose} title={t('withdrawalSubmitted')}>
        <div className="space-y-3 text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: 'rgba(0, 212, 170, 0.1)' }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('withdrawalSent', { amount: netAmount.toFixed(2) })}</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t('processingTime')}</p>
          <button onClick={onClose} className="w-full py-2.5 text-sm font-medium rounded-btn" style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF', border: 'none', cursor: 'pointer' }}>{t('done')}</button>
        </div>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet onClose={onClose} title={t('withdrawBRB')}>
      <div className="space-y-3">
        <div>
          <p className="text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>{t('tonAddress')}</p>
          <input type="text" placeholder={t('tonPlaceholder')} value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-3 py-2.5 rounded-btn text-sm outline-none border font-mono" style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)', caretColor: 'var(--accent)' }} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t('amount')}</p>
            <button onClick={() => setAmount(String(Math.floor(balance)))} className="text-[10px] font-medium" style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
              {t('maxBalance', { amount: balance.toFixed(0) })}
            </button>
          </div>
          <input type="number" placeholder={t('minAmount')} value={amount} onChange={(e) => setAmount(e.target.value)} min={100} max={balance} className="w-full px-3 py-2.5 rounded-btn text-sm outline-none border" style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)', caretColor: 'var(--accent)' }} />
        </div>
        {numAmount >= 100 && (
          <div className="space-y-1 pt-1">
            <Row label={t('amount')} value={`${numAmount.toFixed(2)} BRB`} />
            <Row label={t('fee')} value={`-${feeAmount.toFixed(2)} BRB`} />
            <div className="border-t pt-1" style={{ borderColor: 'var(--border)' }}>
              <Row label={t('youReceive')} value={`${netAmount.toFixed(2)} BRB`} valueColor="var(--teal)" />
            </div>
          </div>
        )}
        {withdraw.isError && <p className="text-[11px]" style={{ color: '#FF3B30' }}>{withdraw.error.message}</p>}
        <button onClick={handleSubmit} disabled={!isValid || withdraw.isPending} className="w-full py-2.5 text-sm font-medium rounded-btn" style={{ backgroundColor: isValid ? 'var(--accent)' : 'var(--surface2)', color: isValid ? '#FFFFFF' : 'var(--text-muted)', border: 'none', cursor: isValid ? 'pointer' : 'default' }}>
          {withdraw.isPending ? t('processing') : t('withdraw')}
        </button>
      </div>
    </BottomSheet>
  );
}

function WalletConnectModal({ onClose, tonWallet }: { onClose: () => void; tonWallet: string | null }) {
  const { t } = useTranslation();
  const [tonConnectUI] = useTonConnectUI();
  const walletAddress = useTonAddress();
  const connect = useConnectWallet();
  const disconnect = useDisconnectWallet();

  useEffect(() => {
    if (walletAddress && !tonWallet && !connect.isPending) {
      connect.mutate(walletAddress, { onSuccess: onClose });
    }
  }, [walletAddress, tonWallet, connect, onClose]);

  if (tonWallet) {
    return (
      <BottomSheet onClose={onClose} title="TON Wallet">
        <div className="space-y-4">
          <div className="rounded-btn p-3 border" style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)' }}>
            <p className="text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>{t('connectedWallet')}</p>
            <p className="text-xs break-all font-mono" style={{ color: 'var(--teal)' }}>{tonWallet}</p>
          </div>
          <button onClick={() => disconnect.mutate(undefined, { onSuccess: onClose })} disabled={disconnect.isPending} className="w-full py-2.5 text-sm font-medium rounded-btn border" style={{ borderColor: '#FF3B30', color: '#FF3B30', background: 'transparent', cursor: 'pointer' }}>
            {disconnect.isPending ? t('disconnecting') : t('disconnectWallet')}
          </button>
        </div>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet onClose={onClose} title={t('connectTonWallet')}>
      <div className="space-y-3">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('connectWalletDescTonConnect')}</p>
        {walletAddress ? (
          <div className="rounded-btn p-3 border" style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)' }}>
            <p className="text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>{t('connectedWallet')}</p>
            <p className="text-xs break-all font-mono" style={{ color: 'var(--teal)' }}>{walletAddress}</p>
          </div>
        ) : null}
        {connect.isError && <p className="text-[11px]" style={{ color: '#FF3B30' }}>{connect.error.message}</p>}
        <button
          onClick={async () => {
            await tonConnectUI.openModal();
          }}
          disabled={connect.isPending}
          className="w-full py-2.5 text-sm font-medium rounded-btn"
          style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF', border: 'none', cursor: 'pointer' }}
        >
          {connect.isPending ? t('connecting2') : t('connectViaTonConnect')}
        </button>
      </div>
    </BottomSheet>
  );
}

export default Profile;
