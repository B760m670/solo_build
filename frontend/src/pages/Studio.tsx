import { useState } from 'react';
import { useTranslation } from '../lib/i18n';
import {
  CryptoIcon,
  SparklesIcon,
  GamepadIcon,
  UsersIcon,
  GiftIcon,
  PaletteIcon,
  CrownIcon,
  ChevronRightIcon,
} from '../components/Icons';

type SectionKey = 'crypto' | 'ai' | 'games' | 'social' | 'gifts' | 'themes' | 'plus';

interface SectionDef {
  key: SectionKey;
  titleKey: 'sectionCrypto' | 'sectionAi' | 'sectionGames' | 'sectionSocial' | 'sectionGifts' | 'sectionThemes' | 'sectionPlus';
  descKey:
    | 'sectionCryptoDesc'
    | 'sectionAiDesc'
    | 'sectionGamesDesc'
    | 'sectionSocialDesc'
    | 'sectionGiftsDesc'
    | 'sectionThemesDesc'
    | 'sectionPlusDesc';
  icon: typeof CryptoIcon;
  tint: string;
}

const SECTIONS: SectionDef[] = [
  { key: 'crypto', titleKey: 'sectionCrypto', descKey: 'sectionCryptoDesc', icon: CryptoIcon, tint: 'var(--gold)' },
  { key: 'ai', titleKey: 'sectionAi', descKey: 'sectionAiDesc', icon: SparklesIcon, tint: 'var(--accent)' },
  { key: 'games', titleKey: 'sectionGames', descKey: 'sectionGamesDesc', icon: GamepadIcon, tint: 'var(--teal)' },
  { key: 'social', titleKey: 'sectionSocial', descKey: 'sectionSocialDesc', icon: UsersIcon, tint: 'var(--accent)' },
  { key: 'gifts', titleKey: 'sectionGifts', descKey: 'sectionGiftsDesc', icon: GiftIcon, tint: 'var(--gold)' },
  { key: 'themes', titleKey: 'sectionThemes', descKey: 'sectionThemesDesc', icon: PaletteIcon, tint: 'var(--teal)' },
  { key: 'plus', titleKey: 'sectionPlus', descKey: 'sectionPlusDesc', icon: CrownIcon, tint: 'var(--gold)' },
];

function SectionPlaceholder({ section, onBack }: { section: SectionDef; onBack: () => void }) {
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
          {t(section.titleKey)}
        </p>
        <p className="text-[11px] max-w-[260px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {t(section.descKey)}
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
  const [active, setActive] = useState<SectionKey | null>(null);

  if (active) {
    const section = SECTIONS.find((s) => s.key === active)!;
    return <SectionPlaceholder section={section} onBack={() => setActive(null)} />;
  }

  return (
    <div className="px-4 pt-2 pb-24">
      <div className="mb-4 px-1">
        <p className="text-[20px] font-bold tracking-tight" style={{ color: 'var(--text)' }}>
          {t('studioTitle')}
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {t('studioSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.key}
              onClick={() => setActive(s.key)}
              className="text-left rounded-card p-4 flex flex-col gap-3 aspect-square"
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
              }}
            >
              <div
                className="w-10 h-10 rounded-btn flex items-center justify-center"
                style={{ backgroundColor: 'var(--surface2)' }}
              >
                <Icon size={20} color={s.tint} />
              </div>
              <div className="mt-auto">
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                  {t(s.titleKey)}
                </p>
                <p className="text-[10px] mt-0.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                  {t(s.descKey)}
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
