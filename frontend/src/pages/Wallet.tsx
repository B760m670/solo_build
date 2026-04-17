import { useState } from 'react';
import { useTranslation } from '../lib/i18n';
import { useWallet, useWithdrawTon } from '../hooks/useWallet';
import { useUser } from '../hooks/useUser';
import { StarIcon, DiamondIcon, ClockIcon, SendIcon } from '../components/Icons';
import type { Transaction } from '@unisouq/shared';

/* ─── Transaction row ─── */
function TxRow({ tx }: { tx: Transaction }) {
  const { t } = useTranslation();
  const isPositive = tx.amount >= 0;
  const isTon = tx.currency === 'TON';
  const color = isPositive ? 'var(--teal)' : 'var(--text)';
  const iconColor = isTon ? 'var(--teal)' : 'var(--gold)';

  return (
    <div className="flex items-center gap-3 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${iconColor}12` }}
      >
        {isTon
          ? <DiamondIcon size={14} color={iconColor} />
          : <StarIcon size={14} color={iconColor} filled />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold truncate" style={{ color: 'var(--text)' }}>
          {t(`tx${tx.type}` as any)}
        </p>
        <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {new Date(tx.createdAt).toLocaleDateString()}{' '}
          {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <p className="text-[11px] font-bold" style={{ color }}>
        {isPositive ? '+' : ''}{tx.amount} {isTon ? 'TON' : 'Stars'}
      </p>
    </div>
  );
}

/* ─── Withdraw sheet ─── */
function WithdrawSheet({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const userQ = useUser();
  const withdraw = useWithdrawTon();
  const [amount, setAmount] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const tonAddress = userQ.data?.tonAddress ?? '';
  const numAmount = parseFloat(amount) || 0;
  const feeAmount = numAmount * 0.05;
  const netAmount = numAmount - feeAmount;

  const handleSubmit = async () => {
    setErr(null);
    try {
      await withdraw.mutateAsync({
        tonAddress,
        amount: numAmount,
        idempotencyKey: `w-${Date.now()}`,
      });
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Error');
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div
        className="w-full rounded-t-[20px] p-5 pb-8"
        style={{ backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-card flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'rgba(0,212,170,0.08)' }}
          >
            <SendIcon size={20} color="var(--teal)" />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{t('withdrawTon')}</p>
            {tonAddress ? (
              <p className="text-[9px] font-mono mt-0.5 truncate max-w-[200px]" style={{ color: 'var(--text-muted)' }}>
                {tonAddress}
              </p>
            ) : (
              <p className="text-[9px] mt-0.5" style={{ color: '#ff6b6b' }}>{t('noTonAddress')}</p>
            )}
          </div>
        </div>

        {/* Amount input */}
        <div className="mb-4">
          <label className="text-[10px] font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>
            {t('amount')} (TON)
          </label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="0.00"
            inputMode="decimal"
            className="w-full px-3 py-2.5 text-xs rounded-btn outline-none"
            style={{ backgroundColor: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' }}
          />
        </div>

        {/* Fee breakdown */}
        {numAmount > 0 && (
          <div
            className="rounded-btn p-3 mb-4 flex flex-col gap-1.5"
            style={{ backgroundColor: 'var(--surface2)', border: '1px solid var(--border)' }}
          >
            <div className="flex justify-between text-[11px]">
              <span style={{ color: 'var(--text-muted)' }}>{t('fee')}</span>
              <span style={{ color: 'var(--text)' }}>-{feeAmount.toFixed(2)} TON</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="font-semibold" style={{ color: 'var(--text-muted)' }}>{t('youReceive')}</span>
              <span className="font-bold" style={{ color: 'var(--teal)' }}>{netAmount.toFixed(2)} TON</span>
            </div>
          </div>
        )}

        {err && <p className="text-[10px] mb-3 text-center" style={{ color: '#ff6b6b' }}>{err}</p>}

        <button
          onClick={handleSubmit}
          disabled={!tonAddress || withdraw.isPending || numAmount <= 0}
          className="w-full py-3.5 text-sm font-bold rounded-btn flex items-center justify-center gap-2 transition-opacity active:opacity-80"
          style={{
            backgroundColor: 'var(--teal)',
            color: '#000',
            border: 'none',
            cursor: 'pointer',
            opacity: !tonAddress || withdraw.isPending || numAmount <= 0 ? 0.4 : 1,
          }}
        >
          <SendIcon size={16} color="#000" />
          {withdraw.isPending ? t('processing') : t('withdrawTon')}
        </button>
        <button
          onClick={onClose}
          className="w-full py-2.5 mt-2 text-[11px] font-semibold rounded-btn"
          style={{ backgroundColor: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', cursor: 'pointer' }}
        >
          {t('cancel')}
        </button>
      </div>
    </div>
  );
}

/* ─── Main ─── */
function Wallet() {
  const { t } = useTranslation();
  const q = useWallet();
  const [withdrawing, setWithdrawing] = useState(false);

  if (q.isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--gold)' }} />
      </div>
    );
  }
  if (q.isError || !q.data) {
    return <p className="text-xs text-center py-20" style={{ color: '#ff6b6b' }}>{t('failedLoadWallet')}</p>;
  }

  const w = q.data;

  return (
    <div className="px-4 pt-2 pb-24">
      {/* Stars balance card */}
      <div
        className="rounded-card p-4 mb-3 relative overflow-hidden"
        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="absolute inset-0 opacity-5" style={{ background: 'linear-gradient(135deg, var(--gold) 0%, transparent 60%)' }} />
        <div className="relative flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-card flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'rgba(245,200,66,0.12)' }}
          >
            <StarIcon size={24} color="var(--gold)" filled />
          </div>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>
              {t('starsBalance')}
            </p>
            <p className="text-xl font-bold mt-0.5" style={{ color: 'var(--gold)' }}>
              {w.starsBalance.toLocaleString()}
            </p>
          </div>
        </div>
        <p className="relative text-[9px] mt-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {t('starsNotWithdrawable')}
        </p>
      </div>

      {/* TON balance card */}
      <div
        className="rounded-card p-4 mb-3 relative overflow-hidden"
        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="absolute inset-0 opacity-5" style={{ background: 'linear-gradient(135deg, var(--teal) 0%, transparent 60%)' }} />
        <div className="relative flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-card flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'rgba(0,212,170,0.08)' }}
          >
            <DiamondIcon size={24} color="var(--teal)" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>
              {t('tonBalance')}
            </p>
            <p className="text-xl font-bold mt-0.5" style={{ color: 'var(--teal)' }}>
              {w.tonBalance.toFixed(2)} TON
            </p>
          </div>
          <button
            onClick={() => setWithdrawing(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold rounded-btn transition-opacity active:opacity-80"
            style={{ backgroundColor: 'rgba(0,212,170,0.12)', color: 'var(--teal)', border: 'none', cursor: 'pointer' }}
          >
            <SendIcon size={12} color="var(--teal)" />
            {t('withdrawTon')}
          </button>
        </div>
      </div>

      {/* Total earned */}
      <div
        className="rounded-card p-4 mb-5 relative overflow-hidden"
        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="absolute inset-0 opacity-[0.03]" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, transparent 60%)' }} />
        <div className="relative flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-card flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'rgba(108,99,255,0.08)' }}
          >
            <StarIcon size={18} color="var(--accent)" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>
              {t('totalEarnedStars')}
            </p>
            <p className="text-base font-bold mt-0.5" style={{ color: 'var(--text)' }}>
              {w.totalEarnedStars.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Transaction history */}
      <div className="mb-3 flex items-center gap-2">
        <ClockIcon size={14} color="var(--text-muted)" />
        <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          {t('recentActivity')}
        </p>
      </div>

      <div
        className="rounded-card overflow-hidden"
        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="px-3">
          {w.recentTransactions.length === 0 ? (
            <div className="flex flex-col items-center py-12">
              <ClockIcon size={28} color="var(--text-muted)" />
              <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>{t('nothingHere')}</p>
            </div>
          ) : (
            w.recentTransactions.map((tx) => <TxRow key={tx.id} tx={tx} />)
          )}
        </div>
      </div>

      {withdrawing && <WithdrawSheet onClose={() => setWithdrawing(false)} />}
    </div>
  );
}

export default Wallet;
