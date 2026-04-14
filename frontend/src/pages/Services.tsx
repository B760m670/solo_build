import { useMemo, useState } from 'react';
import { useDecodeTonTransaction, useInspectTonAddress } from '../hooks/useServices';
import ErrorState from '../components/ErrorState';
import { useTranslation } from '../lib/i18n';
import { useWallet, useWalletPolicy } from '../hooks/useWallet';
import { useCreateInvoice } from '../hooks/usePayments';

function Services() {
  const { t } = useTranslation();
  const wallet = useWallet();
  const policy = useWalletPolicy();
  const createInvoice = useCreateInvoice();
  const [address, setAddress] = useState('');
  const [txRef, setTxRef] = useState('');
  const [showTrustTools, setShowTrustTools] = useState(false);
  const inspect = useInspectTonAddress();
  const decode = useDecodeTonTransaction();
  const brbBalance = wallet.data?.balance ?? 0;

  const currentTier = useMemo(() => {
    const tiers = [...(policy.data?.sellerCommissionTiers ?? [])].sort(
      (a, b) => a.minBrbBalance - b.minBrbBalance,
    );
    let active = tiers[0] ?? { minBrbBalance: 0, commissionRate: 0.03 };
    for (const tier of tiers) {
      if (brbBalance >= tier.minBrbBalance) active = tier;
    }
    const next = tiers.find((tier) => tier.minBrbBalance > brbBalance) ?? null;
    return { active, next };
  }, [policy.data, brbBalance]);

  return (
    <div className="px-4 py-4 space-y-5">
      <div>
        <p className="text-base font-semibold" style={{ color: 'var(--text)' }}>{t('servicesTitle')}</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{t('servicesSubtitleProduct')}</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div className="rounded-card p-4 border space-y-2" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{t('servicesBrbUtilityTitle')}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('servicesBrbUtilityDesc')}</p>
          <p className="text-lg font-bold" style={{ color: 'var(--gold)' }}>{brbBalance.toFixed(2)} BRB</p>
          <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
            {t('servicesCurrentFeeTier', { fee: (currentTier.active.commissionRate * 100).toFixed(2) })}
          </p>
          {currentTier.next ? (
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {t('servicesNextTierAt', { amount: currentTier.next.minBrbBalance })}
            </p>
          ) : (
            <p className="text-[11px]" style={{ color: 'var(--teal)' }}>{t('servicesTopTier')}</p>
          )}
        </div>

        <div className="rounded-card p-4 border space-y-2" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{t('servicesStarsTitle')}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('servicesStarsDesc')}</p>
          <div className="flex gap-2">
            <button
              onClick={() => createInvoice.mutate('PREMIUM_MONTHLY')}
              disabled={createInvoice.isPending}
              className="flex-1 py-2 text-xs font-medium rounded-btn"
              style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              {t('monthlyPlan')}
            </button>
            <button
              onClick={() => createInvoice.mutate('PREMIUM_YEARLY')}
              disabled={createInvoice.isPending}
              className="flex-1 py-2 text-xs font-medium rounded-btn border"
              style={{ backgroundColor: 'transparent', borderColor: 'var(--accent)', color: 'var(--accent)', cursor: 'pointer' }}
            >
              {t('yearlyPlan')}
            </button>
          </div>
        </div>

        <div className="rounded-card p-4 border space-y-2" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{t('servicesTonTitle')}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('servicesTonDesc')}</p>
          <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
            {policy.data?.withdrawal
              ? t('servicesTonWithdrawalRule', {
                min: policy.data.withdrawal.minBrb,
                fee: (policy.data.withdrawal.feeRate * 100).toFixed(0),
              })
              : t('loading')}
          </p>
        </div>
      </div>

      <div className="rounded-card border overflow-hidden" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        <button
          onClick={() => setShowTrustTools((s) => !s)}
          className="w-full px-4 py-3 text-left"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{t('servicesTrustTools')}</p>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{t('servicesTrustToolsDesc')}</p>
        </button>
        {showTrustTools && (
          <div className="px-4 pb-4 space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{t('tonAddressInspector')}</p>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="EQ... / UQ... / 0:..."
                className="w-full px-3 py-2.5 rounded-btn text-sm outline-none border font-mono"
                style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
              <button
                onClick={() => inspect.mutate(address.trim())}
                disabled={!address.trim() || inspect.isPending}
                className="w-full py-2 text-xs font-medium rounded-btn"
                style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
              >
                {inspect.isPending ? t('processing') : t('inspectAddress')}
              </button>
              {inspect.isError && <ErrorState message={inspect.error.message} />}
              {inspect.data && (
                <p className="text-[11px]" style={{ color: inspect.data.isValid ? 'var(--teal)' : '#FF3B30' }}>
                  {inspect.data.isValid ? t('addressValid') : t('addressInvalid')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{t('txDecoder')}</p>
              <input
                value={txRef}
                onChange={(e) => setTxRef(e.target.value)}
                placeholder={t('txDecoderPlaceholder')}
                className="w-full px-3 py-2.5 rounded-btn text-sm outline-none border font-mono"
                style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
              <button
                onClick={() => decode.mutate(txRef.trim())}
                disabled={!txRef.trim() || decode.isPending}
                className="w-full py-2 text-xs font-medium rounded-btn"
                style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
              >
                {decode.isPending ? t('processing') : t('decodeTx')}
              </button>
              {decode.isError && <ErrorState message={decode.error.message} />}
              {decode.data && (
                <div className="flex flex-wrap gap-2">
                  <a href={decode.data.explorerLinks.tonviewer} target="_blank" rel="noreferrer" className="text-[11px]" style={{ color: 'var(--accent)' }}>Tonviewer</a>
                  <a href={decode.data.explorerLinks.tonscan} target="_blank" rel="noreferrer" className="text-[11px]" style={{ color: 'var(--accent)' }}>Tonscan</a>
                  <a href={decode.data.explorerLinks.dton} target="_blank" rel="noreferrer" className="text-[11px]" style={{ color: 'var(--accent)' }}>dTon</a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Services;
