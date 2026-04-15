import { useState } from 'react';
import { useTranslation } from '../lib/i18n';
import { useWallet, useWithdrawTon } from '../hooks/useWallet';
import { useUser } from '../hooks/useUser';
import type { Transaction } from '@unisouq/shared';

function TxRow({ tx }: { tx: Transaction }) {
  const { t } = useTranslation();
  const sign = tx.amount >= 0 ? '+' : '';
  const color = tx.amount >= 0 ? 'var(--teal)' : 'var(--text)';
  return (
    <div className="flex items-center justify-between py-2.5 border-b" style={{ borderColor: 'var(--border)' }}>
      <div>
        <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>
          {t(`tx${tx.type}` as any)}
        </p>
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          {new Date(tx.createdAt).toLocaleDateString()}
        </p>
      </div>
      <span className="text-xs font-semibold" style={{ color }}>
        {sign}{tx.amount} {tx.currency === 'STARS' ? '★' : 'TON'}
      </span>
    </div>
  );
}

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
        className="w-full rounded-t-card p-5"
        style={{ backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-base font-bold mb-3" style={{ color: 'var(--text)' }}>{t('withdrawTon')}</p>
        {!tonAddress && (
          <p className="text-[11px] mb-2" style={{ color: '#ff6b6b' }}>{t('noTonAddress')}</p>
        )}
        {tonAddress && (
          <p className="text-[10px] mb-2 font-mono truncate" style={{ color: 'var(--text-muted)' }}>
            {tonAddress}
          </p>
        )}
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
          placeholder={t('amount')}
          inputMode="decimal"
          className="w-full px-3 py-2 text-sm rounded-btn outline-none"
          style={{ backgroundColor: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' }}
        />
        {numAmount > 0 && (
          <div className="mt-3 flex flex-col gap-1 text-[11px]">
            <div className="flex justify-between"><span style={{ color: 'var(--text-muted)' }}>{t('fee')}</span><span style={{ color: 'var(--text)' }}>-{feeAmount.toFixed(2)}</span></div>
            <div className="flex justify-between"><span style={{ color: 'var(--text-muted)' }}>{t('youReceive')}</span><span style={{ color: 'var(--teal)' }}>{netAmount.toFixed(2)} TON</span></div>
          </div>
        )}
        {err && <p className="text-[11px] mt-2" style={{ color: '#ff6b6b' }}>{err}</p>}
        <button
          onClick={handleSubmit}
          disabled={!tonAddress || withdraw.isPending || numAmount <= 0}
          className="w-full mt-4 py-3 text-sm font-semibold rounded-btn"
          style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', opacity: withdraw.isPending ? 0.6 : 1 }}
        >
          {withdraw.isPending ? t('processing') : t('withdrawTon')}
        </button>
        <button
          onClick={onClose}
          className="w-full py-2 text-xs mt-2"
          style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {t('close')}
        </button>
      </div>
    </div>
  );
}

function Wallet() {
  const { t } = useTranslation();
  const q = useWallet();
  const [withdrawing, setWithdrawing] = useState(false);

  if (q.isLoading) {
    return <p className="text-xs text-center py-20" style={{ color: 'var(--text-muted)' }}>{t('loading')}</p>;
  }
  if (q.isError || !q.data) {
    return <p className="text-xs text-center py-20" style={{ color: '#ff6b6b' }}>{t('failedLoadWallet')}</p>;
  }

  const w = q.data;

  return (
    <div className="px-4 pt-2 pb-24">
      <div className="rounded-card p-4 mb-3" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{t('starsBalance')}</p>
        <p className="text-2xl font-bold mt-1" style={{ color: 'var(--gold)' }}>{w.starsBalance} ★</p>
        <p className="text-[10px] mt-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {t('starsNotWithdrawable')}
        </p>
      </div>

      <div className="rounded-card p-4 mb-4" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{t('tonBalance')}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: 'var(--teal)' }}>{w.tonBalance.toFixed(2)} TON</p>
          </div>
          <button
            onClick={() => setWithdrawing(true)}
            className="text-[11px] font-semibold px-3 py-1.5 rounded-btn"
            style={{ backgroundColor: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)', cursor: 'pointer' }}
          >
            {t('withdrawTon')}
          </button>
        </div>
      </div>

      <p className="text-[11px] font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>
        {t('recentActivity')}
      </p>
      <div className="rounded-card px-3" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        {w.recentTransactions.length === 0 ? (
          <p className="text-xs text-center py-6" style={{ color: 'var(--text-muted)' }}>{t('nothingHere')}</p>
        ) : (
          w.recentTransactions.map((tx) => <TxRow key={tx.id} tx={tx} />)
        )}
      </div>

      {withdrawing && <WithdrawSheet onClose={() => setWithdrawing(false)} />}
    </div>
  );
}

export default Wallet;
