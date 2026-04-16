import { useState } from 'react';
import { useTranslation } from '../../lib/i18n';
import { SectionHeader } from '../../components/SectionHeader';
import {
  StarIcon,
  DiamondIcon,
  ClockIcon,
  SendIcon,
  CopyIcon,
  CheckIcon,
  WalletIcon,
} from '../../components/Icons';
import { useWallet, useTransactions, useWithdrawTon } from '../../hooks/useWallet';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import type { Transaction, TransactionType } from '@unisouq/shared';

/* ─── Transaction type display ─── */
interface TxMeta { label: string; color: string }
const TX_LABELS: Record<TransactionType, TxMeta> = {
  GIFT_PURCHASE: { label: 'Gift Purchase', color: 'var(--gold)' },
  PLUS_SUBSCRIPTION: { label: 'Plus Subscription', color: 'var(--gold)' },
  THEME_PURCHASE: { label: 'Theme Purchase', color: 'var(--teal)' },
  SOCIAL_BOOST: { label: 'Social Boost', color: 'var(--accent)' },
  AI_USAGE: { label: 'AI Usage', color: 'var(--accent)' },
  REFERRAL_BONUS: { label: 'Referral Bonus', color: 'var(--teal)' },
  TON_WITHDRAWAL: { label: 'TON Withdrawal', color: '#ff6b6b' },
  TON_DEPOSIT: { label: 'TON Deposit', color: 'var(--teal)' },
};

function TxRow({ tx }: { tx: Transaction }) {
  const info = TX_LABELS[tx.type] || { label: tx.type, color: 'var(--text-muted)' };
  const isPositive = tx.amount > 0;
  const isTon = tx.currency === 'TON';

  return (
    <div className="flex items-center gap-3 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${info.color}12` }}>
        {isTon ? <DiamondIcon size={14} color={info.color} /> : <StarIcon size={14} color={info.color} filled />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold truncate" style={{ color: 'var(--text)' }}>{info.label}</p>
        <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <p className="text-[11px] font-bold" style={{ color: isPositive ? 'var(--teal)' : 'var(--text)' }}>
        {isPositive ? '+' : ''}{tx.amount} {tx.currency === 'TON' ? 'TON' : 'Stars'}
      </p>
    </div>
  );
}

/* ─── Withdraw sheet ─── */
function WithdrawSheet({ connectedAddress, onClose }: { connectedAddress: string; onClose: () => void }) {
  const { t } = useTranslation();
  const withdraw = useWithdrawTon();
  const [amount, setAmount] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const doWithdraw = async () => {
    setErr(null);
    const a = parseFloat(amount);
    if (isNaN(a) || a <= 0) {
      setErr('Enter a valid amount');
      return;
    }
    try {
      await withdraw.mutateAsync({ tonAddress: connectedAddress, amount: a });
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
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-card flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(0,212,170,0.08)' }}>
            <SendIcon size={20} color="var(--teal)" />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>Withdraw TON</p>
            <p className="text-[9px] font-mono mt-0.5 truncate max-w-[200px]" style={{ color: 'var(--text-muted)' }}>
              {connectedAddress}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-[10px] font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>
            Amount (TON)
          </label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            type="number"
            step="0.01"
            min="0"
            className="w-full px-3 py-2.5 text-xs rounded-btn outline-none"
            style={{ backgroundColor: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' }}
          />
        </div>

        <button
          onClick={doWithdraw}
          disabled={withdraw.isPending}
          className="w-full py-3.5 text-sm font-bold rounded-btn flex items-center justify-center gap-2 transition-opacity active:opacity-80"
          style={{ backgroundColor: 'var(--teal)', color: '#000', border: 'none', cursor: 'pointer', opacity: withdraw.isPending ? 0.5 : 1 }}
        >
          <SendIcon size={16} color="#000" />
          Withdraw
        </button>
        <button
          onClick={onClose}
          className="w-full py-2.5 mt-2 text-[11px] font-semibold rounded-btn"
          style={{ backgroundColor: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', cursor: 'pointer' }}
        >
          {t('cancel')}
        </button>
        {err && <p className="text-[10px] mt-2 text-center" style={{ color: '#ff6b6b' }}>{err}</p>}
      </div>
    </div>
  );
}

/* ─── Main ─── */
export function CryptoSection({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const wallet = useWallet();
  const transactions = useTransactions();
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [copied, setCopied] = useState(false);

  // TON Connect
  const [tonConnectUI] = useTonConnectUI();
  const connectedAddress = useTonAddress(false); // raw address

  const connectWallet = () => tonConnectUI.openModal();
  const disconnectWallet = () => tonConnectUI.disconnect();

  const copyAddress = async () => {
    if (!connectedAddress) return;
    await navigator.clipboard.writeText(connectedAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortAddr = connectedAddress
    ? connectedAddress.slice(0, 6) + '...' + connectedAddress.slice(-4)
    : '';

  return (
    <div className="px-4 pt-2 pb-24">
      <SectionHeader title={t('sectionCrypto')} subtitle={t('sectionCryptoDesc')} onBack={onBack} backLabel={t('back')} />

      {/* TON Connect wallet card */}
      <div
        className="rounded-card p-4 mb-4 relative overflow-hidden"
        style={{ backgroundColor: 'var(--surface)', border: connectedAddress ? '1px solid var(--teal)' : '1px solid var(--border)' }}
      >
        {connectedAddress && (
          <div className="absolute inset-0 opacity-5" style={{ background: 'linear-gradient(135deg, var(--teal) 0%, transparent 60%)' }} />
        )}
        <div className="relative flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-card flex items-center justify-center shrink-0"
            style={{ backgroundColor: connectedAddress ? 'rgba(0,212,170,0.12)' : 'var(--surface2)' }}
          >
            <WalletIcon size={18} color={connectedAddress ? 'var(--teal)' : 'var(--text-muted)'} />
          </div>
          {connectedAddress ? (
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--teal)' }}>
                TON Wallet Connected
              </p>
              <p className="text-[11px] font-mono mt-0.5" style={{ color: 'var(--text)' }}>{shortAddr}</p>
            </div>
          ) : (
            <div className="flex-1">
              <p className="text-[11px] font-semibold" style={{ color: 'var(--text)' }}>Connect TON Wallet</p>
              <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Tonkeeper, MyTonWallet, etc.</p>
            </div>
          )}
          {connectedAddress ? (
            <button
              onClick={disconnectWallet}
              className="text-[9px] font-semibold px-2 py-1 rounded-btn transition-opacity active:opacity-80"
              style={{ backgroundColor: 'var(--surface2)', color: 'var(--text-muted)', border: '1px solid var(--border)', cursor: 'pointer' }}
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={connectWallet}
              className="text-[10px] font-bold px-3 py-1.5 rounded-btn transition-opacity active:opacity-80"
              style={{ backgroundColor: 'var(--teal)', color: '#000', border: 'none', cursor: 'pointer' }}
            >
              Connect
            </button>
          )}
        </div>
      </div>

      {/* Balance cards */}
      {wallet.isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--gold)' }} />
        </div>
      )}

      {wallet.data && (
        <div className="flex flex-col gap-3 mb-5">
          {/* Stars balance */}
          <div className="rounded-card p-4 relative overflow-hidden" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="absolute inset-0 opacity-5" style={{ background: 'linear-gradient(135deg, var(--gold) 0%, transparent 60%)' }} />
            <div className="relative flex items-center gap-3">
              <div className="w-12 h-12 rounded-card flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(245,200,66,0.12)' }}>
                <StarIcon size={24} color="var(--gold)" filled />
              </div>
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>Telegram Stars</p>
                <p className="text-xl font-bold mt-0.5" style={{ color: 'var(--gold)' }}>{wallet.data.starsBalance.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* TON balance */}
          <div className="rounded-card p-4 relative overflow-hidden" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="absolute inset-0 opacity-5" style={{ background: 'linear-gradient(135deg, var(--teal) 0%, transparent 60%)' }} />
            <div className="relative flex items-center gap-3">
              <div className="w-12 h-12 rounded-card flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(0,212,170,0.08)' }}>
                <DiamondIcon size={24} color="var(--teal)" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>TON</p>
                <p className="text-xl font-bold mt-0.5" style={{ color: 'var(--teal)' }}>{wallet.data.tonBalance.toFixed(2)}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => connectedAddress ? setShowWithdraw(true) : connectWallet()}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[9px] font-bold rounded-btn transition-opacity active:opacity-80"
                  style={{ backgroundColor: 'rgba(0,212,170,0.12)', color: 'var(--teal)', border: 'none', cursor: 'pointer' }}
                >
                  <SendIcon size={10} color="var(--teal)" />
                  Send
                </button>
                <button
                  onClick={connectedAddress ? copyAddress : connectWallet}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[9px] font-bold rounded-btn transition-opacity active:opacity-80"
                  style={{ backgroundColor: 'var(--surface2)', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}
                >
                  {copied ? (
                    <>
                      <CheckIcon size={10} color="var(--teal)" />
                      <span style={{ color: 'var(--teal)' }}>Copied</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon size={10} color="var(--text-muted)" />
                      Receive
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction history */}
      <div className="mb-3 flex items-center gap-2">
        <ClockIcon size={14} color="var(--text-muted)" />
        <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Transaction History
        </p>
      </div>

      {transactions.isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
        </div>
      )}
      {transactions.data && transactions.data.length === 0 && (
        <div className="flex flex-col items-center py-12">
          <ClockIcon size={28} color="var(--text-muted)" />
          <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>No transactions yet</p>
        </div>
      )}
      <div className="rounded-card overflow-hidden" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="px-3">
          {transactions.data?.map((tx) => <TxRow key={tx.id} tx={tx} />)}
        </div>
      </div>

      {showWithdraw && connectedAddress && (
        <WithdrawSheet connectedAddress={connectedAddress} onClose={() => setShowWithdraw(false)} />
      )}
    </div>
  );
}
