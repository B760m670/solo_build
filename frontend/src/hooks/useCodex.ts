import { useEffect, useState } from 'react';
import { useUser } from './useUser';
import { useMyGifts } from './useGifts';
import type { ReputationTier } from '@unisouq/shared';

export type CodexRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface CodexCardDef {
  id: string;
  nameKey: string;
  taglineKey: string;
  storyKey: string;
  year: string;
  authorKey: string | null;
  rarity: CodexRarity;
  tint: string;
  iconBg: string;
  /** Icon key — resolved to an SVG component at render time */
  iconKey:
    | 'Star'
    | 'Diamond'
    | 'Wallet'
    | 'Gift'
    | 'Swap'
    | 'Crown'
    | 'Cpu'
    | 'Coins'
    | 'Code'
    | 'Id';
  /** i18n key explaining how to unlock this card (shown while locked) */
  unlockHintKey: string;
}

const TIER_ORDER: ReputationTier[] = ['NEW', 'TRUSTED', 'EXPERT', 'ELITE'];

function tierAtLeast(current: ReputationTier | undefined, required: ReputationTier): boolean {
  if (!current) return false;
  return TIER_ORDER.indexOf(current) >= TIER_ORDER.indexOf(required);
}

function hasActivePlus(premiumBadgeUntil: string | null | undefined): boolean {
  if (!premiumBadgeUntil) return false;
  return new Date(premiumBadgeUntil) > new Date();
}

const LEARN_STORAGE_KEY = 'unisouq_learn_completed';

function readLearnCompleted(): Set<string> {
  try {
    const raw = localStorage.getItem(LEARN_STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

/* ─── Card definitions ─── */

export const CODEX_CARDS: CodexCardDef[] = [
  {
    id: 'stars',
    nameKey: 'codexStarsName',
    taglineKey: 'codexStarsTag',
    storyKey: 'codexStarsStory',
    year: '2024',
    authorKey: 'codexStarsAuthor',
    rarity: 'COMMON',
    tint: 'var(--gold)',
    iconBg: 'rgba(245,200,66,0.14)',
    iconKey: 'Star',
    unlockHintKey: 'codexUnlockLessonStars',
  },
  {
    id: 'ton',
    nameKey: 'codexTonName',
    taglineKey: 'codexTonTag',
    storyKey: 'codexTonStory',
    year: '2018',
    authorKey: 'codexTonAuthor',
    rarity: 'RARE',
    tint: 'var(--teal)',
    iconBg: 'rgba(0,212,170,0.12)',
    iconKey: 'Diamond',
    unlockHintKey: 'codexUnlockLessonTon',
  },
  {
    id: 'tonconnect',
    nameKey: 'codexTonConnectName',
    taglineKey: 'codexTonConnectTag',
    storyKey: 'codexTonConnectStory',
    year: '2022',
    authorKey: 'codexTonConnectAuthor',
    rarity: 'COMMON',
    tint: 'var(--accent)',
    iconBg: 'rgba(108,99,255,0.12)',
    iconKey: 'Wallet',
    unlockHintKey: 'codexUnlockTonConnect',
  },
  {
    id: 'nft',
    nameKey: 'codexNftName',
    taglineKey: 'codexNftTag',
    storyKey: 'codexNftStory',
    year: '2017',
    authorKey: 'codexNftAuthor',
    rarity: 'RARE',
    tint: 'var(--gold)',
    iconBg: 'rgba(245,200,66,0.14)',
    iconKey: 'Gift',
    unlockHintKey: 'codexUnlockOwnGift',
  },
  {
    id: 'dex',
    nameKey: 'codexDexName',
    taglineKey: 'codexDexTag',
    storyKey: 'codexDexStory',
    year: '2018',
    authorKey: 'codexDexAuthor',
    rarity: 'EPIC',
    tint: 'var(--teal)',
    iconBg: 'rgba(0,212,170,0.12)',
    iconKey: 'Swap',
    unlockHintKey: 'codexUnlockLessonDex',
  },
  {
    id: 'jetton',
    nameKey: 'codexJettonName',
    taglineKey: 'codexJettonTag',
    storyKey: 'codexJettonStory',
    year: '2022',
    authorKey: 'codexJettonAuthor',
    rarity: 'RARE',
    tint: 'var(--accent)',
    iconBg: 'rgba(108,99,255,0.12)',
    iconKey: 'Coins',
    unlockHintKey: 'codexUnlockTierTrusted',
  },
  {
    id: 'smartcontract',
    nameKey: 'codexSmartContractName',
    taglineKey: 'codexSmartContractTag',
    storyKey: 'codexSmartContractStory',
    year: '2014',
    authorKey: 'codexSmartContractAuthor',
    rarity: 'EPIC',
    tint: 'var(--accent)',
    iconBg: 'rgba(108,99,255,0.12)',
    iconKey: 'Code',
    unlockHintKey: 'codexUnlockTierExpert',
  },
  {
    id: 'llm',
    nameKey: 'codexLlmName',
    taglineKey: 'codexLlmTag',
    storyKey: 'codexLlmStory',
    year: '2017',
    authorKey: 'codexLlmAuthor',
    rarity: 'RARE',
    tint: 'var(--accent)',
    iconBg: 'rgba(108,99,255,0.12)',
    iconKey: 'Cpu',
    unlockHintKey: 'codexUnlockLessonPlus',
  },
  {
    id: 'sbt',
    nameKey: 'codexSbtName',
    taglineKey: 'codexSbtTag',
    storyKey: 'codexSbtStory',
    year: '2022',
    authorKey: 'codexSbtAuthor',
    rarity: 'LEGENDARY',
    tint: 'var(--gold)',
    iconBg: 'rgba(245,200,66,0.14)',
    iconKey: 'Id',
    unlockHintKey: 'codexUnlockTierElite',
  },
  {
    id: 'plus',
    nameKey: 'codexPlusName',
    taglineKey: 'codexPlusTag',
    storyKey: 'codexPlusStory',
    year: '2026',
    authorKey: 'codexPlusAuthor',
    rarity: 'LEGENDARY',
    tint: 'var(--gold)',
    iconBg: 'rgba(245,200,66,0.14)',
    iconKey: 'Crown',
    unlockHintKey: 'codexUnlockPlus',
  },
];

export interface CodexCardState {
  def: CodexCardDef;
  unlocked: boolean;
}

/* ─── Hook ─── */

export function useCodex() {
  const userQ = useUser();
  const myGiftsQ = useMyGifts();

  // Learn completion lives in localStorage — we subscribe to the storage event
  // plus bump a local counter so the component re-evaluates after the user
  // completes a lesson in the same tab.
  const [learnTick, setLearnTick] = useState(0);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === LEARN_STORAGE_KEY) setLearnTick((v) => v + 1);
    };
    window.addEventListener('storage', onStorage);

    // Poll for same-tab updates (cheap; localStorage read is ~instant)
    const interval = window.setInterval(() => setLearnTick((v) => v + 1), 3000);

    return () => {
      window.removeEventListener('storage', onStorage);
      clearInterval(interval);
    };
  }, []);

  const user = userQ.data;
  const completedLearn = readLearnCompleted();
  const ownsAnyGift = (myGiftsQ.data?.length ?? 0) > 0;

  void learnTick; // referenced to re-run on tick

  const isUnlocked = (id: string): boolean => {
    switch (id) {
      case 'stars':
        return completedLearn.has('stars');
      case 'ton':
        return completedLearn.has('ton');
      case 'tonconnect':
        return completedLearn.has('tonconnect') || !!user?.tonAddress;
      case 'nft':
        return completedLearn.has('gifts') || ownsAnyGift;
      case 'dex':
        return completedLearn.has('dex');
      case 'jetton':
        return tierAtLeast(user?.reputationTier, 'TRUSTED');
      case 'smartcontract':
        return tierAtLeast(user?.reputationTier, 'EXPERT');
      case 'llm':
        return completedLearn.has('plus');
      case 'sbt':
        return tierAtLeast(user?.reputationTier, 'ELITE');
      case 'plus':
        return hasActivePlus(user?.premiumBadgeUntil);
      default:
        return false;
    }
  };

  const cards: CodexCardState[] = CODEX_CARDS.map((def) => ({
    def,
    unlocked: isUnlocked(def.id),
  }));

  const unlockedCount = cards.filter((c) => c.unlocked).length;

  return {
    cards,
    unlockedCount,
    total: CODEX_CARDS.length,
    isLoading: userQ.isLoading || myGiftsQ.isLoading,
  };
}
