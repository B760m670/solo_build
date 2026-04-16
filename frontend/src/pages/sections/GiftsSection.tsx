import { useState } from 'react';
import { useTranslation } from '../../lib/i18n';
import { SectionHeader } from '../../components/SectionHeader';
import { GiftIcon } from '../../components/Icons';
import { useBuyGift, useGiftCatalog, useMyGifts } from '../../hooks/useGifts';
import type { Currency, Gift, GiftRarity } from '@unisouq/shared';

const RARITY_COLOR: Record<GiftRarity, string> = {
  COMMON: 'var(--text-muted)',
  RARE: 'var(--teal)',
  EPIC: 'var(--accent)',
  LEGENDARY: 'var(--gold)',
};

function GiftCard({ gift, onBuy }: { gift: Gift; onBuy: (gift: Gift) => void }) {
  const soldOut =
    gift.editionSize != null && gift.editionMinted >= gift.editionSize;
  return (
    <button
      onClick={() => !soldOut && onBuy(gift)}
      disabled={soldOut}
      className="text-left rounded-card p-3 flex flex-col"
      style={{
        backgroundColor: 'var(--surface)',
        border: `1px solid ${RARITY_COLOR[gift.rarity]}33`,
        cursor: soldOut ? 'default' : 'pointer',
        opacity: soldOut ? 0.5 : 1,
      }}
    >
      <div
        className="w-full aspect-square rounded-btn flex items-center justify-center mb-2 overflow-hidden"
        style={{ backgroundColor: 'var(--surface2)' }}
      >
        {gift.imageUrl ? (
          <img
            src={gift.imageUrl}
            alt={gift.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <GiftIcon size={32} color={RARITY_COLOR[gift.rarity]} />
        )}
      </div>
      <p className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>
        {gift.name}
      </p>
      <p
        className="text-[9px] uppercase tracking-wide mt-0.5"
        style={{ color: RARITY_COLOR[gift.rarity] }}
      >
        {gift.rarity}
      </p>
      <div className="mt-2 flex items-center gap-2">
        {gift.priceStars != null && (
          <span className="text-[10px] font-semibold" style={{ color: 'var(--gold)' }}>
            {gift.priceStars} ★
          </span>
        )}
        {gift.priceTon != null && (
          <span className="text-[10px] font-semibold" style={{ color: 'var(--teal)' }}>
            {gift.priceTon} TON
          </span>
        )}
      </div>
      {gift.editionSize != null && (
        <p className="text-[9px] mt-1" style={{ color: 'var(--text-muted)' }}>
          {gift.editionMinted}/{gift.editionSize}
        </p>
      )}
    </button>
  );
}

function BuySheet({
  gift,
  onClose,
}: {
  gift: Gift;
  onClose: () => void;
}) {
  const buy = useBuyGift();
  const [err, setErr] = useState<string | null>(null);

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
    <div
      className="fixed inset-0 z-40 flex items-end"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-card p-5"
        style={{ backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-base font-bold" style={{ color: 'var(--text)' }}>
          {gift.name}
        </p>
        <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
          {gift.description}
        </p>
        <div className="flex flex-col gap-2 mt-4">
          {gift.priceStars != null && (
            <button
              onClick={() => doBuy('STARS')}
              disabled={buy.isPending}
              className="w-full py-3 text-sm font-semibold rounded-btn"
              style={{
                backgroundColor: 'var(--gold)',
                color: '#000',
                border: 'none',
                cursor: 'pointer',
                opacity: buy.isPending ? 0.5 : 1,
              }}
            >
              {gift.priceStars} ★
            </button>
          )}
          {gift.priceTon != null && (
            <button
              onClick={() => doBuy('TON')}
              disabled={buy.isPending}
              className="w-full py-3 text-sm font-semibold rounded-btn"
              style={{
                backgroundColor: 'var(--teal)',
                color: '#000',
                border: 'none',
                cursor: 'pointer',
                opacity: buy.isPending ? 0.5 : 1,
              }}
            >
              {gift.priceTon} TON
            </button>
          )}
        </div>
        {err && (
          <p className="text-[11px] mt-2" style={{ color: '#ff6b6b' }}>
            {err}
          </p>
        )}
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
      <SectionHeader
        title={t('sectionGifts')}
        subtitle={t('sectionGiftsDesc')}
        onBack={onBack}
        backLabel={t('back')}
      />

      <div className="flex gap-2 mb-3">
        {(['shop', 'mine'] as const).map((key) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="flex-1 py-2 text-[11px] font-semibold rounded-btn"
              style={{
                backgroundColor: active ? 'var(--accent)' : 'var(--surface2)',
                color: active ? '#fff' : 'var(--text)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
              }}
            >
              {key === 'shop' ? t('shop') : t('mine')}
            </button>
          );
        })}
      </div>

      {tab === 'shop' && (
        <>
          {catalog.isLoading && (
            <p className="text-xs py-8 text-center" style={{ color: 'var(--text-muted)' }}>
              {t('loading')}
            </p>
          )}
          {catalog.data && catalog.data.length === 0 && (
            <p className="text-xs py-8 text-center" style={{ color: 'var(--text-muted)' }}>
              {t('emptyCatalog')}
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            {catalog.data?.map((g) => (
              <GiftCard key={g.id} gift={g} onBuy={setBuying} />
            ))}
          </div>
        </>
      )}

      {tab === 'mine' && (
        <>
          {mine.data && mine.data.length === 0 && (
            <p className="text-xs py-8 text-center" style={{ color: 'var(--text-muted)' }}>
              {t('emptyInventory')}
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            {mine.data?.map((ug) =>
              ug.gift ? (
                <div
                  key={ug.id}
                  className="rounded-card p-3"
                  style={{
                    backgroundColor: 'var(--surface)',
                    border: `1px solid ${RARITY_COLOR[ug.gift.rarity]}33`,
                  }}
                >
                  <div
                    className="w-full aspect-square rounded-btn flex items-center justify-center mb-2 overflow-hidden"
                    style={{ backgroundColor: 'var(--surface2)' }}
                  >
                    {ug.gift.imageUrl ? (
                      <img
                        src={ug.gift.imageUrl}
                        alt={ug.gift.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <GiftIcon size={32} color={RARITY_COLOR[ug.gift.rarity]} />
                    )}
                  </div>
                  <p className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>
                    {ug.gift.name}
                  </p>
                  <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    #{ug.serialNo}
                  </p>
                </div>
              ) : null,
            )}
          </div>
        </>
      )}

      {buying && <BuySheet gift={buying} onClose={() => setBuying(null)} />}
    </div>
  );
}
