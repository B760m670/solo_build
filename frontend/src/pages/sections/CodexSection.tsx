import { useState } from 'react';
import { useTranslation } from '../../lib/i18n';
import { SectionHeader } from '../../components/SectionHeader';
import {
  StarIcon,
  DiamondIcon,
  WalletIcon,
  GiftIcon,
  SwapArrowsIcon,
  CrownIcon,
  CpuIcon,
  CoinsIcon,
  CodeBracketIcon,
  IdCardIcon,
  LockIcon,
} from '../../components/Icons';
import { useCodex, type CodexCardDef, type CodexCardState, type CodexRarity } from '../../hooks/useCodex';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tk = (s: string) => s as any;

const RARITY_COLOR: Record<CodexRarity, string> = {
  COMMON: 'var(--text-muted)',
  RARE: 'var(--teal)',
  EPIC: 'var(--accent)',
  LEGENDARY: 'var(--gold)',
};

const RARITY_KEY: Record<CodexRarity, string> = {
  COMMON: 'rarityCommon',
  RARE: 'rarityRare',
  EPIC: 'rarityEpic',
  LEGENDARY: 'rarityLegendary',
};

type IconKey = CodexCardDef['iconKey'];

function getIcon(key: IconKey) {
  switch (key) {
    case 'Star':
      return StarIcon;
    case 'Diamond':
      return DiamondIcon;
    case 'Wallet':
      return WalletIcon;
    case 'Gift':
      return GiftIcon;
    case 'Swap':
      return SwapArrowsIcon;
    case 'Crown':
      return CrownIcon;
    case 'Cpu':
      return CpuIcon;
    case 'Coins':
      return CoinsIcon;
    case 'Code':
      return CodeBracketIcon;
    case 'Id':
      return IdCardIcon;
  }
}

/* ─── Card detail view ─── */

function CardDetail({ card, onBack }: { card: CodexCardState; onBack: () => void }) {
  const { t } = useTranslation();
  const { def, unlocked } = card;
  const Icon = getIcon(def.iconKey);
  const rarityColor = RARITY_COLOR[def.rarity];

  return (
    <>
      <SectionHeader
        title={unlocked ? t(tk(def.nameKey)) : t('codexLocked')}
        subtitle={unlocked ? t(tk(def.taglineKey)) : t('codexLockedSubtitle')}
        onBack={onBack}
        backLabel={t('sectionCodex')}
      />

      {/* Hero card */}
      <div
        className="rounded-card p-6 mb-4 relative overflow-hidden flex flex-col items-center"
        style={{
          backgroundColor: 'var(--surface)',
          border: `1px solid ${unlocked ? rarityColor : 'var(--border)'}`,
          minHeight: 220,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            opacity: unlocked ? 0.08 : 0.02,
            background: `linear-gradient(135deg, ${def.tint} 0%, transparent 70%)`,
          }}
        />

        {/* Rarity tag */}
        <div className="relative flex items-center justify-between w-full mb-6">
          <span
            className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
            style={{
              backgroundColor: `${rarityColor}22`,
              color: rarityColor,
              border: `1px solid ${rarityColor}44`,
            }}
          >
            {t(tk(RARITY_KEY[def.rarity]))}
          </span>
          <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
            {def.year}
          </span>
        </div>

        {/* Artwork */}
        <div
          className="relative w-24 h-24 rounded-card flex items-center justify-center mb-4"
          style={{
            backgroundColor: unlocked ? def.iconBg : 'var(--surface2)',
            border: `1px solid ${unlocked ? rarityColor : 'var(--border)'}`,
          }}
        >
          {unlocked ? (
            <Icon size={44} color={def.tint} />
          ) : (
            <LockIcon size={32} color="var(--text-muted)" />
          )}
        </div>

        <p
          className="relative display-title mb-1 text-center"
          style={{ color: unlocked ? 'var(--text)' : 'var(--text-muted)' }}
        >
          {unlocked ? t(tk(def.nameKey)) : '???'}
        </p>
        <p className="relative text-[11px] text-center" style={{ color: 'var(--text-muted)' }}>
          {unlocked ? t(tk(def.taglineKey)) : t('codexLockedTagline')}
        </p>
      </div>

      {/* Body */}
      {unlocked ? (
        <>
          {def.authorKey && (
            <div
              className="rounded-card p-4 mb-3"
              style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <p className="display-label mb-1">{t('codexAuthor')}</p>
              <p className="text-[12px] font-semibold" style={{ color: 'var(--text)' }}>
                {t(tk(def.authorKey))}
              </p>
            </div>
          )}

          <div
            className="rounded-card p-4"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <p className="display-label mb-2">{t('codexStory')}</p>
            <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {t(tk(def.storyKey))}
            </p>
          </div>
        </>
      ) : (
        <div
          className="rounded-card p-4 flex gap-3"
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
          }}
        >
          <LockIcon size={16} color="var(--text-muted)" className="mt-0.5 shrink-0" />
          <div>
            <p className="display-label mb-1.5">{t('codexHowToUnlock')}</p>
            <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text)' }}>
              {t(tk(def.unlockHintKey))}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Grid view ─── */

function CodexGrid({
  cards,
  onSelect,
}: {
  cards: CodexCardState[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card) => {
        const Icon = getIcon(card.def.iconKey);
        const rarityColor = RARITY_COLOR[card.def.rarity];
        return (
          <button
            key={card.def.id}
            onClick={() => onSelect(card.def.id)}
            className="text-left rounded-card p-4 flex flex-col items-center relative overflow-hidden transition-transform active:scale-[0.98]"
            style={{
              backgroundColor: 'var(--surface)',
              border: `1px solid ${card.unlocked ? rarityColor : 'var(--border)'}`,
              cursor: 'pointer',
              aspectRatio: '3 / 4',
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                opacity: card.unlocked ? 0.06 : 0.015,
                background: `linear-gradient(135deg, ${card.def.tint} 0%, transparent 70%)`,
              }}
            />

            {/* Rarity pip top-left */}
            <span
              className="absolute top-2 left-2 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
              style={{
                backgroundColor: `${rarityColor}22`,
                color: rarityColor,
              }}
            >
              {card.def.rarity.slice(0, 1)}
            </span>

            {/* Artwork */}
            <div
              className="relative w-14 h-14 rounded-card flex items-center justify-center mt-3 mb-2"
              style={{
                backgroundColor: card.unlocked ? card.def.iconBg : 'var(--surface2)',
                border: `1px solid ${card.unlocked ? rarityColor : 'var(--border)'}`,
              }}
            >
              {card.unlocked ? (
                <Icon size={26} color={card.def.tint} />
              ) : (
                <LockIcon size={18} color="var(--text-muted)" />
              )}
            </div>

            <p
              className="relative text-[11px] font-bold text-center mt-auto leading-tight"
              style={{ color: card.unlocked ? 'var(--text)' : 'var(--text-muted)' }}
            >
              {card.unlocked ? card.def.id.toUpperCase() : '???'}
            </p>
            <p
              className="relative text-[9px] font-mono mt-0.5"
              style={{ color: 'var(--text-muted)' }}
            >
              {card.unlocked ? card.def.year : '----'}
            </p>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Main ─── */

export function CodexSection({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const { cards, unlockedCount, total, isLoading } = useCodex();
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeCard = activeId ? cards.find((c) => c.def.id === activeId) ?? null : null;

  if (isLoading) {
    return (
      <div className="px-4 pt-2 pb-24">
        <SectionHeader
          title={t('sectionCodex')}
          subtitle={t('sectionCodexDesc')}
          onBack={onBack}
          backLabel={t('back')}
        />
        <div className="flex items-center justify-center py-20">
          <div
            className="w-5 h-5 border-2 rounded-full animate-spin"
            style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-2 pb-24">
      {activeCard ? (
        <CardDetail card={activeCard} onBack={() => setActiveId(null)} />
      ) : (
        <>
          <SectionHeader
            title={t('sectionCodex')}
            subtitle={t('sectionCodexDesc')}
            onBack={onBack}
            backLabel={t('back')}
          />

          {/* Progress strip */}
          <div
            className="rounded-card p-4 mb-4 relative overflow-hidden"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{ background: 'linear-gradient(135deg, var(--accent) 0%, transparent 60%)' }}
            />
            <div className="relative flex items-center justify-between mb-2">
              <p className="display-label">{t('codexCollection')}</p>
              <p className="text-[11px] font-bold" style={{ color: 'var(--text)' }}>
                {unlockedCount} / {total}
              </p>
            </div>
            <div
              className="relative h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: 'var(--surface2)' }}
            >
              <div
                className="h-full transition-all"
                style={{
                  width: `${Math.round((unlockedCount / total) * 100)}%`,
                  backgroundColor: 'var(--accent)',
                }}
              />
            </div>
          </div>

          <CodexGrid cards={cards} onSelect={setActiveId} />
        </>
      )}
    </div>
  );
}
