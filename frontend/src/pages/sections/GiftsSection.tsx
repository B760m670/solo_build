import { useState } from 'react';
import { useTranslation } from '../../lib/i18n';
import { SectionHeader } from '../../components/SectionHeader';
import { GiftIcon, StarIcon, DiamondIcon, FireIcon } from '../../components/Icons';
import { useBuyGift, useGiftCatalog, useMyGifts } from '../../hooks/useGifts';
import type { Currency, Gift, GiftRarity } from '@unisouq/shared';

const RARITY_STYLE: Record<GiftRarity, { color: string; bg: string; label: string }> = {
  COMMON: { color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.04)', label: 'Common' },
  RARE: { color: 'var(--teal)', bg: 'rgba(0,212,170,0.08)', label: 'Rare' },
  EPIC: { color: 'var(--accent)', bg: 'rgba(108,99,255,0.08)', label: 'Epic' },
  LEGENDARY: { color: 'var(--gold)', bg: 'rgba(245,200,66,0.08)', label: 'Legendary' },
};

function GiftCard({ gift, onBuy }: { gift: Gift; onBuy: (g: Gift) => void }) {
  const rarity = RARITY_STYLE[gift.rarity];
  const soldOut = gift.editionSize != null && gift.editionMinted >= gift.editionSize;

  return (
    <button
      onClick={() => !soldOut && onBuy(gift)}
      disabled={soldOut}
      className="text-left rounded-card overflow-hidden transition-transform active:scale-[0.97]"
      style={{
        backgroundColor: 'var(--surface)',
        border: `1px solid ${rarity.color}22`,
        cursor: soldOut ? 'default' : 'pointer',
        opacity: soldOut ? 0.5 : 1,
      }}
    >
      {/* Image area */}
      <div
        className="w-full aspect-square flex items-center justify-center relative"
        style={{ backgroundColor: rarity.bg }}
      >
        {gift.imageUrl ? (
          <img src={gift.imageUrl} alt={gift.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <GiftIcon size={40} color={rarity.color} />
        )}
        {/* Rarity badge */}
        <span
          className="absolute top-2 left-2 text-[8px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full"
          style={{ backgroundColor: `${rarity.color}20`, color: rarity.color }}
        >
          {rarity.label}
        </span>
        {gift.rarity === 'LEGENDARY' && (
          <div className="absolute top-2 right-2">
            <FireIcon size={14} color="var(--gold)" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-[11px] font-semibold truncate" style={{ color: 'var(--text)' }}>
          {gift.name}
        </p>
        <p className="text-[9px] mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>
          {gift.description}
        </p>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            {gift.priceStars != null && (
              <span className="flex items-center gap-0.5 text-[10px] font-bold" style={{ color: 'var(--gold)' }}>
                <StarIcon size={10} color="var(--gold)" filled />
                {gift.priceStars}
              </span>
            )}
            {gift.priceTon != null && (
              <span className="flex items-center gap-0.5 text-[10px] font-bold" style={{ color: 'var(--teal)' }}>
                <DiamondIcon size={10} color="var(--teal)" />
                {gift.priceTon}
              </span>
            )}
          </div>
          {gift.editionSize != null && (
            <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>
              {gift.editionMinted}/{gift.editionSize}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function BuySheet({ gift, onClose }: { gift: Gift; onClose: () => void }) {
  const { t } = useTranslation();
  const buy = useBuyGift();
  const [err, setErr] = useState<string | null>(null);
  const rarity = RARITY_STYLE[gift.rarity];

  const doBuy = async (currency: Currency) => {
    setErr(null);
    try {
      await buy.mutateAsync({ giftId: gift.id, currency });
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
        {/* Gift preview */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-14 h-14 rounded-card flex items-center justify-center shrink-0 overflow-hidden"
            style={{ backgroundColor: rarity.bg }}
          >
            {gift.imageUrl ? (
              <img src={gift.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <GiftIcon size={24} color={rarity.color} />
            )}
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{gift.name}</p>
            <span
              className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: `${rarity.color}20`, color: rarity.color }}
            >
              {rarity.label}
            </span>
          </div>
        </div>
        <p className="text-[11px] mb-4 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {gift.description}
        </p>

        {/* Buy buttons */}
        <div className="flex flex-col gap-2">
          {gift.priceStars != null && (
            <button
              onClick={() => doBuy('STARS')}
              disabled={buy.isPending}
              className="w-full py-3.5 text-sm font-bold rounded-btn flex items-center justify-center gap-2 transition-opacity active:opacity-80"
              style={{ backgroundColor: 'var(--gold)', color: '#000', border: 'none', cursor: 'pointer', opacity: buy.isPending ? 0.5 : 1 }}
            >
              <StarIcon size={16} color="#000" filled />
              {gift.priceStars} Stars
            </button>
          )}
          {gift.priceTon != null && (
            <button
              onClick={() => doBuy('TON')}
              disabled={buy.isPending}
              className="w-full py-3.5 text-sm font-bold rounded-btn flex items-center justify-center gap-2 transition-opacity active:opacity-80"
              style={{ backgroundColor: 'var(--teal)', color: '#000', border: 'none', cursor: 'pointer', opacity: buy.isPending ? 0.5 : 1 }}
            >
              <DiamondIcon size={16} color="#000" />
              {gift.priceTon} TON
            </button>
          )}
        </div>
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

export function GiftsSection({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const catalog = useGiftCatalog();
  const mine = useMyGifts();
  const [buying, setBuying] = useState<Gift | null>(null);
  const [tab, setTab] = useState<'shop' | 'mine'>('shop');

  return (
    <div className="px-4 pt-2 pb-24">
      <SectionHeader title={t('sectionGifts')} subtitle={t('sectionGiftsDesc')} onBack={onBack} backLabel={t('back')} />

      {/* Tabs */}
      <div className="flex gap-1 mb-4 p-1 rounded-btn" style={{ backgroundColor: 'var(--surface)' }}>
        {(['shop', 'mine'] as const).map((key) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="flex-1 py-2 text-[11px] font-semibold rounded-btn transition-colors flex items-center justify-center gap-1.5"
              style={{
                backgroundColor: active ? 'var(--accent)' : 'transparent',
                color: active ? '#fff' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {key === 'shop' ? <GiftIcon size={13} color={active ? '#fff' : 'var(--text-muted)'} /> : null}
              {key === 'shop' ? t('shop') : t('mine')}
            </button>
          );
        })}
      </div>

      {tab === 'shop' && (
        <>
          {catalog.isLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
            </div>
          )}
          {catalog.data && catalog.data.length === 0 && (
            <div className="flex flex-col items-center py-16">
              <GiftIcon size={32} color="var(--text-muted)" />
              <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>{t('emptyCatalog')}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            {catalog.data?.map((g) => <GiftCard key={g.id} gift={g} onBuy={setBuying} />)}
          </div>
        </>
      )}

      {tab === 'mine' && (
        <>
          {mine.data && mine.data.length === 0 && (
            <div className="flex flex-col items-center py-16">
              <GiftIcon size={32} color="var(--text-muted)" />
              <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>{t('emptyInventory')}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            {mine.data?.map((ug) => ug.gift ? (
              <div key={ug.id} className="rounded-card overflow-hidden" style={{ backgroundColor: 'var(--surface)', border: `1px solid ${RARITY_STYLE[ug.gift.rarity].color}22` }}>
                <div className="w-full aspect-square flex items-center justify-center" style={{ backgroundColor: RARITY_STYLE[ug.gift.rarity].bg }}>
                  {ug.gift.imageUrl ? (
                    <img src={ug.gift.imageUrl} alt={ug.gift.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <GiftIcon size={40} color={RARITY_STYLE[ug.gift.rarity].color} />
                  )}
                </div>
                <div className="p-3">
                  <p className="text-[11px] font-semibold truncate" style={{ color: 'var(--text)' }}>{ug.gift.name}</p>
                  <p className="text-[9px] mt-0.5 font-mono" style={{ color: 'var(--text-muted)' }}>#{ug.serialNo}</p>
                </div>
              </div>
            ) : null)}
          </div>
        </>
      )}

      {buying && <BuySheet gift={buying} onClose={() => setBuying(null)} />}
    </div>
  );
}
