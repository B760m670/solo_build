import { useState, useMemo } from 'react';
import { useTranslation } from '../lib/i18n';
import { useUser } from '../hooks/useUser';
import { useCodex } from '../hooks/useCodex';
import { useMyGifts } from '../hooks/useGifts';
import {
  CryptoIcon,
  SparklesIcon,
  GamepadIcon,
  UsersIcon,
  GiftIcon,
  PaletteIcon,
  BookOpenIcon,
  ArchiveIcon,
  LayersIcon,
  ChevronRightIcon,
  WalletIcon,
  ArrowUpIcon,
} from '../components/Icons';
import { GiftsSection } from './sections/GiftsSection';
import { ThemesSection } from './sections/ThemesSection';
import { CommunitySection } from './sections/CommunitySection';
import { AiSection } from './sections/AiSection';
import { CryptoSection } from './sections/CryptoSection';
import { LearnSection } from './sections/LearnSection';
import { CodexSection } from './sections/CodexSection';
import { FlowsSection } from './sections/FlowsSection';

type SectionKey = 'crypto' | 'ai' | 'flows' | 'games' | 'community' | 'gifts' | 'themes' | 'learn' | 'codex';

interface SectionDef {
  key: SectionKey;
  titleKey: string;
  descKey: string;
  icon: typeof CryptoIcon;
  tint: string;
  iconBg: string;
  live: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tk = (s: string) => s as any;

const SECTION_MAP: Record<SectionKey, SectionDef> = {
  crypto: { key: 'crypto', titleKey: 'sectionCrypto', descKey: 'sectionCryptoDesc', icon: CryptoIcon, tint: 'var(--gold)', iconBg: 'rgba(245,200,66,0.12)', live: true },
  ai: { key: 'ai', titleKey: 'sectionAi', descKey: 'sectionAiDesc', icon: SparklesIcon, tint: 'var(--accent)', iconBg: 'rgba(108,99,255,0.12)', live: true },
  flows: { key: 'flows', titleKey: 'sectionFlows', descKey: 'sectionFlowsDesc', icon: LayersIcon, tint: 'var(--orange)', iconBg: 'rgba(251,146,60,0.12)', live: true },
  community: { key: 'community', titleKey: 'sectionCommunity', descKey: 'sectionCommunityDesc', icon: UsersIcon, tint: 'var(--teal)', iconBg: 'rgba(0,212,170,0.12)', live: true },
  gifts: { key: 'gifts', titleKey: 'sectionGifts', descKey: 'sectionGiftsDesc', icon: GiftIcon, tint: 'var(--pink)', iconBg: 'rgba(236,72,153,0.12)', live: true },
  learn: { key: 'learn', titleKey: 'sectionLearn', descKey: 'sectionLearnDesc', icon: BookOpenIcon, tint: 'var(--lime)', iconBg: 'rgba(163,230,53,0.12)', live: true },
  codex: { key: 'codex', titleKey: 'sectionCodex', descKey: 'sectionCodexDesc', icon: ArchiveIcon, tint: 'var(--violet)', iconBg: 'rgba(167,139,250,0.14)', live: true },
  themes: { key: 'themes', titleKey: 'sectionThemes', descKey: 'sectionThemesDesc', icon: PaletteIcon, tint: 'var(--azure)', iconBg: 'rgba(56,189,248,0.12)', live: true },
  games: { key: 'games', titleKey: 'sectionGames', descKey: 'sectionGamesDesc', icon: GamepadIcon, tint: 'var(--coral)', iconBg: 'rgba(255,107,107,0.12)', live: false },
};

const DAILY: SectionKey[] = ['community', 'crypto', 'ai', 'flows'];
const DISCOVER: SectionKey[] = ['gifts', 'learn', 'codex', 'themes', 'games'];

/* ─── Hero CTA ─── */

interface HeroCTA {
  target: SectionKey;
  icon: typeof CryptoIcon;
  tint: string;
  iconBg: string;
  titleKey: string;
  bodyKey: string;
  actionKey: string;
  stat?: { label: string; value: string };
}

function useHeroCTA(): HeroCTA {
  const { data: user } = useUser();
  const myGiftsQ = useMyGifts();
  const { unlockedCount, total } = useCodex();

  return useMemo<HeroCTA>(() => {
    const hasWallet = !!user?.tonAddress;
    const giftCount = myGiftsQ.data?.length ?? 0;

    if (unlockedCount === 0) {
      return {
        target: 'learn',
        icon: BookOpenIcon,
        tint: 'var(--lime)',
        iconBg: 'rgba(163,230,53,0.14)',
        titleKey: 'heroLearnTitle',
        bodyKey: 'heroLearnBody',
        actionKey: 'heroLearnAction',
      };
    }
    if (!hasWallet) {
      return {
        target: 'crypto',
        icon: WalletIcon,
        tint: 'var(--teal)',
        iconBg: 'rgba(0,212,170,0.14)',
        titleKey: 'heroWalletTitle',
        bodyKey: 'heroWalletBody',
        actionKey: 'heroWalletAction',
      };
    }
    if (giftCount === 0) {
      return {
        target: 'gifts',
        icon: GiftIcon,
        tint: 'var(--pink)',
        iconBg: 'rgba(236,72,153,0.14)',
        titleKey: 'heroGiftsTitle',
        bodyKey: 'heroGiftsBody',
        actionKey: 'heroGiftsAction',
      };
    }
    if (unlockedCount < total) {
      return {
        target: 'codex',
        icon: ArchiveIcon,
        tint: 'var(--violet)',
        iconBg: 'rgba(167,139,250,0.16)',
        titleKey: 'heroCodexTitle',
        bodyKey: 'heroCodexBody',
        actionKey: 'heroCodexAction',
        stat: { label: 'codex', value: `${unlockedCount} / ${total}` },
      };
    }
    return {
      target: 'community',
      icon: UsersIcon,
      tint: 'var(--teal)',
      iconBg: 'rgba(0,212,170,0.14)',
      titleKey: 'heroCommunityTitle',
      bodyKey: 'heroCommunityBody',
      actionKey: 'heroCommunityAction',
    };
  }, [user?.tonAddress, myGiftsQ.data, unlockedCount, total]);
}

function HeroCard({ cta, onOpen }: { cta: HeroCTA; onOpen: (k: SectionKey) => void }) {
  const { t } = useTranslation();
  const Icon = cta.icon;

  return (
    <button
      onClick={() => onOpen(cta.target)}
      className="web3-card-heavy w-full text-left rounded-card p-5 mb-5 relative overflow-hidden transition-transform active:scale-[0.995]"
      style={{
        backgroundColor: 'var(--surface)',
        border: `1px solid ${cta.tint}22`,
        cursor: 'pointer',
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.1,
          background: `linear-gradient(135deg, ${cta.tint} 0%, transparent 55%)`,
        }}
      />
      <div className="relative flex items-start gap-3 mb-4">
        <div
          className="w-11 h-11 rounded-btn flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: cta.iconBg }}
        >
          <Icon size={22} color={cta.tint} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="display-label" style={{ color: cta.tint }}>
            {t('heroNow')}
          </p>
          <p className="text-[16px] font-black leading-tight mt-0.5" style={{ color: 'var(--text)' }}>
            {t(tk(cta.titleKey))}
          </p>
        </div>
        {cta.stat && (
          <div className="text-right flex-shrink-0">
            <p className="display-label" style={{ fontSize: 9 }}>
              {cta.stat.label}
            </p>
            <p className="display-number mt-0.5" style={{ fontSize: 20, color: cta.tint }}>
              {cta.stat.value}
            </p>
          </div>
        )}
      </div>
      <p className="relative text-[11px] leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
        {t(tk(cta.bodyKey))}
      </p>
      <div className="relative flex items-center justify-between">
        <span
          className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-btn flex items-center gap-1.5"
          style={{ backgroundColor: cta.tint, color: '#000' }}
        >
          {t(tk(cta.actionKey))}
          <ArrowUpIcon size={10} color="#000" className="rotate-90" />
        </span>
      </div>
    </button>
  );
}

/* ─── Section cards ─── */

function DailyCard({ section, onOpen }: { section: SectionDef; onOpen: (k: SectionKey) => void }) {
  const { t } = useTranslation();
  const Icon = section.icon;
  return (
    <button
      onClick={() => onOpen(section.key)}
      className="web3-card-heavy text-left rounded-card p-4 flex flex-col gap-3 aspect-square relative overflow-hidden transition-transform active:scale-[0.98]"
      style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        cursor: 'pointer',
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{ background: `linear-gradient(135deg, ${section.tint} 0%, transparent 60%)` }}
      />
      <div
        className="relative w-10 h-10 rounded-btn flex items-center justify-center"
        style={{ backgroundColor: section.iconBg }}
      >
        <Icon size={20} color={section.tint} />
      </div>
      <div className="relative mt-auto">
        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
          {t(tk(section.titleKey))}
        </p>
        <p className="text-[10px] mt-0.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
          {t(tk(section.descKey))}
        </p>
      </div>
    </button>
  );
}

function DiscoverChip({ section, onOpen }: { section: SectionDef; onOpen: (k: SectionKey) => void }) {
  const { t } = useTranslation();
  const Icon = section.icon;
  return (
    <button
      onClick={() => onOpen(section.key)}
      className="text-left rounded-card p-3 flex flex-col items-center gap-2 relative overflow-hidden transition-transform active:scale-[0.96]"
      style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        cursor: 'pointer',
        flex: '0 0 auto',
        width: 84,
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{ background: `linear-gradient(135deg, ${section.tint} 0%, transparent 70%)` }}
      />
      <div
        className="relative w-9 h-9 rounded-btn flex items-center justify-center"
        style={{ backgroundColor: section.iconBg }}
      >
        <Icon size={16} color={section.tint} />
      </div>
      <p
        className="relative text-[10px] font-bold text-center leading-tight uppercase tracking-wider"
        style={{ color: 'var(--text)' }}
      >
        {t(tk(section.titleKey))}
      </p>
    </button>
  );
}

/* ─── Coming soon / Main ─── */

function ComingSoon({ section, onBack }: { section: SectionDef; onBack: () => void }) {
  const { t } = useTranslation();
  const Icon = section.icon;
  return (
    <div className="px-5 pt-4 pb-24">
      <button
        onClick={onBack}
        className="text-[11px] mb-6 flex items-center gap-1"
        style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <ChevronRightIcon size={14} color="var(--text-muted)" className="rotate-180" />
        {t('back')}
      </button>
      <div className="flex flex-col items-center text-center pt-12">
        <div
          className="w-16 h-16 rounded-card flex items-center justify-center mb-4"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <Icon size={28} color={section.tint} />
        </div>
        <p className="text-base font-semibold mb-1" style={{ color: 'var(--text)' }}>
          {t(tk(section.titleKey))}
        </p>
        <p className="text-[11px] max-w-[260px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {t(tk(section.descKey))}
        </p>
        <p className="text-[10px] mt-6" style={{ color: 'var(--text-muted)' }}>
          {t('comingSoon')}
        </p>
      </div>
    </div>
  );
}

function Studio() {
  const { t } = useTranslation();
  const user = useUser();
  const hero = useHeroCTA();
  const [active, setActive] = useState<SectionKey | null>(null);

  const onBack = () => setActive(null);

  if (active) {
    const section = SECTION_MAP[active];

    switch (active) {
      case 'crypto':
        return <CryptoSection onBack={onBack} />;
      case 'ai':
        return <AiSection onBack={onBack} />;
      case 'flows':
        return <FlowsSection onBack={onBack} />;
      case 'gifts':
        return <GiftsSection onBack={onBack} />;
      case 'themes':
        return (
          <ThemesSection
            onBack={onBack}
            activeThemeId={user.data?.activeThemeId ?? null}
          />
        );
      case 'community':
        return (
          <CommunitySection
            onBack={onBack}
            currentUserId={user.data?.id ?? ''}
          />
        );
      case 'learn':
        return <LearnSection onBack={onBack} />;
      case 'codex':
        return <CodexSection onBack={onBack} />;
      default:
        return <ComingSoon section={section} onBack={onBack} />;
    }
  }

  return (
    <div className="px-4 pt-3 pb-24">
      <div className="mb-5 px-1">
        <p className="display-subtitle mb-1.5">{t('studioSubtitle')}</p>
        <p className="display-title" style={{ color: 'var(--text)' }}>
          {t('studioTitle')}
        </p>
      </div>

      <HeroCard cta={hero} onOpen={setActive} />

      <p className="display-label px-1 mb-2.5">{t('groupDaily')}</p>
      <div className="grid grid-cols-2 gap-3 mb-5">
        {DAILY.map((key) => (
          <DailyCard key={key} section={SECTION_MAP[key]} onOpen={setActive} />
        ))}
      </div>

      <p className="display-label px-1 mb-2.5">{t('groupDiscover')}</p>
      <div
        className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {DISCOVER.map((key) => (
          <DiscoverChip key={key} section={SECTION_MAP[key]} onOpen={setActive} />
        ))}
      </div>
    </div>
  );
}

export default Studio;
