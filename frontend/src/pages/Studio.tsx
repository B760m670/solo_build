import { useState } from 'react';
import { useTranslation } from '../lib/i18n';
import { useUser } from '../hooks/useUser';
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

const SECTIONS: SectionDef[] = [
  { key: 'crypto', titleKey: 'sectionCrypto', descKey: 'sectionCryptoDesc', icon: CryptoIcon, tint: 'var(--gold)', iconBg: 'rgba(245,200,66,0.12)', live: true },
  { key: 'ai', titleKey: 'sectionAi', descKey: 'sectionAiDesc', icon: SparklesIcon, tint: 'var(--accent)', iconBg: 'rgba(108,99,255,0.12)', live: true },
  { key: 'flows', titleKey: 'sectionFlows', descKey: 'sectionFlowsDesc', icon: LayersIcon, tint: 'var(--accent)', iconBg: 'rgba(108,99,255,0.12)', live: true },
  { key: 'games', titleKey: 'sectionGames', descKey: 'sectionGamesDesc', icon: GamepadIcon, tint: 'var(--coral)', iconBg: 'rgba(255,107,107,0.12)', live: false },
  { key: 'community', titleKey: 'sectionCommunity', descKey: 'sectionCommunityDesc', icon: UsersIcon, tint: 'var(--teal)', iconBg: 'rgba(0,212,170,0.12)', live: true },
  { key: 'gifts', titleKey: 'sectionGifts', descKey: 'sectionGiftsDesc', icon: GiftIcon, tint: 'var(--pink)', iconBg: 'rgba(236,72,153,0.12)', live: true },
  { key: 'themes', titleKey: 'sectionThemes', descKey: 'sectionThemesDesc', icon: PaletteIcon, tint: 'var(--azure)', iconBg: 'rgba(56,189,248,0.12)', live: true },
  { key: 'learn', titleKey: 'sectionLearn', descKey: 'sectionLearnDesc', icon: BookOpenIcon, tint: 'var(--lime)', iconBg: 'rgba(163,230,53,0.12)', live: true },
  { key: 'codex', titleKey: 'sectionCodex', descKey: 'sectionCodexDesc', icon: ArchiveIcon, tint: 'var(--violet)', iconBg: 'rgba(167,139,250,0.14)', live: true },
];

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
  const [active, setActive] = useState<SectionKey | null>(null);

  const onBack = () => setActive(null);

  if (active) {
    const section = SECTIONS.find((s) => s.key === active)!;

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
      <div className="mb-6 px-1">
        <p className="display-subtitle mb-1.5">{t('studioSubtitle')}</p>
        <p className="display-title" style={{ color: 'var(--text)' }}>
          {t('studioTitle')}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.key}
              onClick={() => setActive(s.key)}
              className="web3-card-heavy text-left rounded-card p-4 flex flex-col gap-3 aspect-square relative overflow-hidden transition-transform active:scale-[0.98]"
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
              }}
            >
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{ background: `linear-gradient(135deg, ${s.tint} 0%, transparent 60%)` }}
              />
              <div
                className="relative w-10 h-10 rounded-btn flex items-center justify-center"
                style={{ backgroundColor: s.iconBg }}
              >
                <Icon size={20} color={s.tint} />
              </div>
              <div className="relative mt-auto">
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                  {t(tk(s.titleKey))}
                </p>
                <p className="text-[10px] mt-0.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                  {t(tk(s.descKey))}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Studio;
