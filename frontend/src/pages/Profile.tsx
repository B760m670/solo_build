import { useState } from 'react';
import { useTranslation } from '../lib/i18n';
import { useUser, useUpdateSettings } from '../hooks/useUser';
import { useReferrals } from '../hooks/useReferrals';
import { useMyListings } from '../hooks/useMarketplace';
import { useBoostListing, usePurchasePremium } from '../hooks/usePurchases';
import { toggleTheme } from '../hooks/useTheme';
import type { Listing, ReputationTier } from '@unisouq/shared';

interface ProfileProps {
  onAdminOpen: () => void;
  onOrdersOpen: () => void;
  canOpenAdmin: boolean;
}

function TierBadge({ tier }: { tier: ReputationTier }) {
  const { t } = useTranslation();
  const color = tier === 'ELITE' ? 'var(--gold)' : tier === 'EXPERT' ? 'var(--accent)' : tier === 'TRUSTED' ? 'var(--teal)' : 'var(--text-muted)';
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--surface2)', color }}>
      {t(`tier${tier}`)}
    </span>
  );
}

function MyListingRow({ listing }: { listing: Listing }) {
  const { t } = useTranslation();
  const boost = useBoostListing();
  const [err, setErr] = useState<string | null>(null);
  const activeBoost = listing.featuredUntil && new Date(listing.featuredUntil) > new Date();

  const handleBoost = async () => {
    setErr(null);
    try {
      const status = await boost.mutateAsync(listing.id);
      if (status === 'failed') setErr(t('paymentFailed'));
      if (status === 'cancelled') setErr(t('paymentCancelled'));
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Error');
    }
  };

  return (
    <div
      className="rounded-btn p-2.5 mb-2 flex items-center justify-between gap-2"
      style={{ backgroundColor: 'var(--surface2)', border: '1px solid var(--border)' }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>{listing.title}</p>
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          {listing.priceStars} ★
          {activeBoost && ` · ${t('boosted')}`}
        </p>
        {err && <p className="text-[10px] mt-1" style={{ color: '#ff6b6b' }}>{err}</p>}
      </div>
      <button
        onClick={handleBoost}
        disabled={boost.isPending}
        className="text-[11px] font-semibold px-2.5 py-1 rounded-btn whitespace-nowrap"
        style={{
          backgroundColor: 'var(--gold)',
          color: '#000',
          border: 'none',
          cursor: 'pointer',
          opacity: boost.isPending ? 0.6 : 1,
        }}
      >
        {t('boost')}
      </button>
    </div>
  );
}

function Profile({ onAdminOpen, onOrdersOpen, canOpenAdmin }: ProfileProps) {
  const { t, lang, setLang } = useTranslation();
  const userQ = useUser();
  const refQ = useReferrals();
  const myListingsQ = useMyListings();
  const premium = usePurchasePremium();
  const update = useUpdateSettings();
  const [tonInput, setTonInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [premiumErr, setPremiumErr] = useState<string | null>(null);

  if (userQ.isLoading) {
    return <p className="text-xs text-center py-20" style={{ color: 'var(--text-muted)' }}>{t('loading')}</p>;
  }
  if (!userQ.data) {
    return <p className="text-xs text-center py-20" style={{ color: '#ff6b6b' }}>{t('failedLoadProfile')}</p>;
  }

  const u = userQ.data;
  const tonDisplay = tonInput || u.tonAddress || '';
  const isPremium = !!u.premiumBadgeUntil && new Date(u.premiumBadgeUntil) > new Date();

  const handlePremium = async () => {
    setPremiumErr(null);
    try {
      const status = await premium.mutateAsync();
      if (status === 'failed') setPremiumErr(t('paymentFailed'));
      if (status === 'cancelled') setPremiumErr(t('paymentCancelled'));
    } catch (e) {
      setPremiumErr(e instanceof Error ? e.message : 'Error');
    }
  };

  const handleSaveTon = async () => {
    if (!tonInput) return;
    await update.mutateAsync({ tonAddress: tonInput });
    setTonInput('');
  };

  const handleCopy = async () => {
    if (!refQ.data) return;
    await navigator.clipboard.writeText(refQ.data.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="px-4 pt-2 pb-24">
      <div className="rounded-card p-4 mb-3 flex items-center gap-3" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        {u.avatarUrl ? (
          <img src={u.avatarUrl} alt="" className="w-14 h-14 rounded-full" />
        ) : (
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold" style={{ backgroundColor: 'var(--surface2)', color: 'var(--text)' }}>
            {u.firstName.slice(0, 1)}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{u.firstName}</p>
            <TierBadge tier={u.reputationTier} />
            {isPremium && (
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--gold)', color: '#000' }}
              >
                {t('premium')}
              </span>
            )}
          </div>
          {u.username && <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>@{u.username}</p>}
        </div>
      </div>

      <div className="rounded-card p-4 mb-3" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <p className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>
          {t('reputation')}: {u.reputationScore} / 1000
        </p>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface2)' }}>
          <div className="h-full" style={{ width: `${Math.min(100, u.reputationScore / 10)}%`, backgroundColor: 'var(--accent)' }} />
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t('completedDeals')}</p>
            <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{u.completedDeals}</p>
          </div>
          <div>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t('averageRating')}</p>
            <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>
              {u.averageRating > 0 ? u.averageRating.toFixed(1) : '—'}
            </p>
          </div>
          <div>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t('totalEarnedStars')}</p>
            <p className="text-sm font-bold" style={{ color: 'var(--gold)' }}>{u.totalEarnedStars} ★</p>
          </div>
        </div>
      </div>

      <p className="text-[11px] font-semibold mt-4 mb-2" style={{ color: 'var(--text-muted)' }}>{t('referralProgram')}</p>
      <div className="rounded-card p-3 mb-3" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        {refQ.data ? (
          <>
            <p className="text-[10px] font-mono mb-2 truncate" style={{ color: 'var(--text)' }}>{refQ.data.link}</p>
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <div>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t('referredFriends')}</p>
                  <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{refQ.data.count}</p>
                </div>
                <div>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t('earnedFromReferrals')}</p>
                  <p className="text-sm font-bold" style={{ color: 'var(--gold)' }}>{refQ.data.earnedStars} ★</p>
                </div>
              </div>
              <button
                onClick={handleCopy}
                className="text-[11px] font-semibold px-3 py-1.5 rounded-btn"
                style={{ backgroundColor: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)', cursor: 'pointer' }}
              >
                {copied ? t('copied') : t('copyLink')}
              </button>
            </div>
          </>
        ) : (
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{t('loading')}</p>
        )}
      </div>

      <p className="text-[11px] font-semibold mt-4 mb-2" style={{ color: 'var(--text-muted)' }}>{t('settings')}</p>
      <div className="rounded-card p-3 mb-3 flex flex-col gap-3" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: 'var(--text)' }}>{t('language')}</span>
          <div className="flex gap-1">
            {(['en', 'ru'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-btn"
                style={{
                  backgroundColor: lang === l ? 'var(--accent)' : 'var(--surface2)',
                  color: lang === l ? '#fff' : 'var(--text-muted)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: 'var(--text)' }}>{t('theme')}</span>
          <button
            onClick={toggleTheme}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-btn"
            style={{ backgroundColor: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)', cursor: 'pointer' }}
          >
            {t('theme')}
          </button>
        </div>
        <div>
          <span className="text-xs" style={{ color: 'var(--text)' }}>{t('setTonAddress')}</span>
          <div className="flex gap-2 mt-1">
            <input
              value={tonInput}
              onChange={(e) => setTonInput(e.target.value)}
              placeholder={tonDisplay || t('tonPlaceholder')}
              className="flex-1 px-3 py-2 text-xs rounded-btn outline-none font-mono"
              style={{ backgroundColor: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' }}
            />
            <button
              onClick={handleSaveTon}
              disabled={!tonInput || update.isPending}
              className="text-[11px] font-semibold px-3 py-2 rounded-btn"
              style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', opacity: update.isPending ? 0.6 : 1 }}
            >
              {t('save')}
            </button>
          </div>
        </div>
      </div>

      {myListingsQ.data && myListingsQ.data.length > 0 && (
        <>
          <p className="text-[11px] font-semibold mt-4 mb-2" style={{ color: 'var(--text-muted)' }}>{t('myListings')}</p>
          <div className="rounded-card p-3 mb-3" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            {myListingsQ.data.map((l) => (
              <MyListingRow key={l.id} listing={l} />
            ))}
          </div>
        </>
      )}

      {!isPremium && (
        <button
          onClick={handlePremium}
          disabled={premium.isPending}
          className="w-full py-3 text-sm font-semibold rounded-btn mb-2"
          style={{ backgroundColor: 'var(--gold)', color: '#000', border: 'none', cursor: 'pointer', opacity: premium.isPending ? 0.6 : 1 }}
        >
          {premium.isPending ? t('processing') : t('getPremiumBadge')}
        </button>
      )}
      {premiumErr && <p className="text-[11px] mb-2" style={{ color: '#ff6b6b' }}>{premiumErr}</p>}

      <button
        onClick={onOrdersOpen}
        className="w-full py-3 text-sm font-semibold rounded-btn mb-3"
        style={{ backgroundColor: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)', cursor: 'pointer' }}
      >
        {t('myOrders')}
      </button>

      {canOpenAdmin && (
        <button
          onClick={onAdminOpen}
          className="w-full py-3 text-sm font-semibold rounded-btn mb-3"
          style={{ backgroundColor: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)', cursor: 'pointer' }}
        >
          {t('adminPanel')}
        </button>
      )}

      <p className="text-[10px] text-center leading-relaxed mt-4" style={{ color: 'var(--text-muted)' }}>
        {t('disclaimer')}
      </p>
    </div>
  );
}

export default Profile;
