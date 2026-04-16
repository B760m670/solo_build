import { useState } from 'react';
import { useTranslation } from '../../lib/i18n';
import { SectionHeader } from '../../components/SectionHeader';
import { PaletteIcon, StarIcon, DiamondIcon, CheckIcon, CrownIcon, LockIcon } from '../../components/Icons';
import {
  useThemeCatalog,
  useMyThemes,
  useBuyTheme,
  useActivateTheme,
} from '../../hooks/useThemes';
import type { Currency, Theme, ThemePalette } from '@unisouq/shared';

function PalettePreview({ palette }: { palette: ThemePalette }) {
  const colors = [palette.bg, palette.surface, palette.accent, palette.teal, palette.gold];
  return (
    <div className="flex gap-1.5 mt-2">
      {colors.map((c, i) => (
        <div
          key={i}
          className="w-5 h-5 rounded-full transition-transform hover:scale-110"
          style={{ backgroundColor: c, border: '1px solid rgba(255,255,255,0.1)', boxShadow: `0 0 6px ${c}33` }}
        />
      ))}
    </div>
  );
}

function ThemeCard({
  theme,
  owned,
  active,
  onBuy,
  onActivate,
}: {
  theme: Theme;
  owned: boolean;
  active: boolean;
  onBuy: (theme: Theme) => void;
  onActivate: (themeId: string | null) => void;
}) {
  const { t } = useTranslation();
  const palette = theme.palette as ThemePalette;

  return (
    <div
      className="rounded-card overflow-hidden transition-transform active:scale-[0.97]"
      style={{
        backgroundColor: 'var(--surface)',
        border: active ? '2px solid var(--accent)' : '1px solid var(--border)',
      }}
    >
      {/* Preview area */}
      <div
        className="w-full aspect-[2/1] flex items-center justify-center relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${palette.bg} 0%, ${palette.surface || palette.bg} 50%, ${palette.accent} 100%)`,
        }}
      >
        {theme.previewUrl ? (
          <img src={theme.previewUrl} alt={theme.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <PaletteIcon size={28} color={palette.accent} />
        )}
        {/* Active badge */}
        {active && (
          <span
            className="absolute top-2 left-2 text-[8px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1"
            style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
          >
            <CheckIcon size={8} color="#fff" />
            Active
          </span>
        )}
        {/* Plus-only badge */}
        {theme.plusOnly && (
          <span
            className="absolute top-2 right-2 text-[8px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1"
            style={{ backgroundColor: 'var(--gold)', color: '#000' }}
          >
            <CrownIcon size={8} color="#000" />
            Plus
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-[11px] font-semibold truncate" style={{ color: 'var(--text)' }}>
          {theme.name}
        </p>
        {theme.description && (
          <p className="text-[9px] mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>
            {theme.description}
          </p>
        )}
        <PalettePreview palette={palette} />

        <div className="mt-3">
          {owned ? (
            <button
              onClick={() => onActivate(active ? null : theme.id)}
              className="w-full py-2 text-[11px] font-bold rounded-btn flex items-center justify-center gap-1.5 transition-opacity active:opacity-80"
              style={{
                backgroundColor: active ? 'transparent' : 'var(--accent)',
                color: active ? 'var(--text-muted)' : '#fff',
                border: active ? '1px solid var(--border)' : 'none',
                cursor: 'pointer',
              }}
            >
              {active ? (
                <>
                  <CheckIcon size={12} color="var(--text-muted)" />
                  {t('active')}
                </>
              ) : (
                t('activate')
              )}
            </button>
          ) : (
            <button
              onClick={() => onBuy(theme)}
              className="w-full py-2 text-[11px] font-bold rounded-btn flex items-center justify-center gap-2 transition-opacity active:opacity-80"
              style={{
                backgroundColor: 'var(--surface2)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
              }}
            >
              {theme.plusOnly && <LockIcon size={10} color="var(--gold)" />}
              {theme.priceStars != null && (
                <span className="flex items-center gap-0.5" style={{ color: 'var(--gold)' }}>
                  <StarIcon size={10} color="var(--gold)" filled />
                  {theme.priceStars}
                </span>
              )}
              {theme.priceStars != null && theme.priceTon != null && (
                <span style={{ color: 'var(--text-muted)' }}>/</span>
              )}
              {theme.priceTon != null && (
                <span className="flex items-center gap-0.5" style={{ color: 'var(--teal)' }}>
                  <DiamondIcon size={10} color="var(--teal)" />
                  {theme.priceTon}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function BuySheet({ theme, onClose }: { theme: Theme; onClose: () => void }) {
  const { t } = useTranslation();
  const buy = useBuyTheme();
  const [err, setErr] = useState<string | null>(null);
  const palette = theme.palette as ThemePalette;

  const doBuy = async (currency: Currency) => {
    setErr(null);
    try {
      await buy.mutateAsync({ themeId: theme.id, currency });
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
        {/* Theme preview */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-14 h-14 rounded-card flex items-center justify-center shrink-0 overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${palette.bg} 0%, ${palette.accent} 100%)`,
            }}
          >
            {theme.previewUrl ? (
              <img src={theme.previewUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <PaletteIcon size={24} color={palette.accent} />
            )}
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{theme.name}</p>
            {theme.plusOnly && (
              <span
                className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full inline-flex items-center gap-1"
                style={{ backgroundColor: 'var(--gold)', color: '#000' }}
              >
                <CrownIcon size={8} color="#000" />
                Plus
              </span>
            )}
          </div>
        </div>
        {theme.description && (
          <p className="text-[11px] mb-4 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {theme.description}
          </p>
        )}
        <PalettePreview palette={palette} />

        {/* Buy buttons */}
        <div className="flex flex-col gap-2 mt-4">
          {theme.priceStars != null && (
            <button
              onClick={() => doBuy('STARS')}
              disabled={buy.isPending}
              className="w-full py-3.5 text-sm font-bold rounded-btn flex items-center justify-center gap-2 transition-opacity active:opacity-80"
              style={{ backgroundColor: 'var(--gold)', color: '#000', border: 'none', cursor: 'pointer', opacity: buy.isPending ? 0.5 : 1 }}
            >
              <StarIcon size={16} color="#000" filled />
              {theme.priceStars} Stars
            </button>
          )}
          {theme.priceTon != null && (
            <button
              onClick={() => doBuy('TON')}
              disabled={buy.isPending}
              className="w-full py-3.5 text-sm font-bold rounded-btn flex items-center justify-center gap-2 transition-opacity active:opacity-80"
              style={{ backgroundColor: 'var(--teal)', color: '#000', border: 'none', cursor: 'pointer', opacity: buy.isPending ? 0.5 : 1 }}
            >
              <DiamondIcon size={16} color="#000" />
              {theme.priceTon} TON
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

export function ThemesSection({
  onBack,
  activeThemeId,
}: {
  onBack: () => void;
  activeThemeId: string | null;
}) {
  const { t } = useTranslation();
  const catalog = useThemeCatalog();
  const mine = useMyThemes();
  const activate = useActivateTheme();
  const [buying, setBuying] = useState<Theme | null>(null);

  const ownedIds = new Set(mine.data?.map((ut) => ut.themeId) ?? []);

  return (
    <div className="px-4 pt-2 pb-24">
      <SectionHeader
        title={t('sectionThemes')}
        subtitle={t('sectionThemesDesc')}
        onBack={onBack}
        backLabel={t('back')}
      />

      {catalog.isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
        </div>
      )}
      {catalog.data && catalog.data.length === 0 && (
        <div className="flex flex-col items-center py-16">
          <PaletteIcon size={32} color="var(--text-muted)" />
          <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>{t('emptyCatalog')}</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        {catalog.data?.map((th) => (
          <ThemeCard
            key={th.id}
            theme={th}
            owned={ownedIds.has(th.id)}
            active={activeThemeId === th.id}
            onBuy={setBuying}
            onActivate={(id) => activate.mutate(id)}
          />
        ))}
      </div>

      {buying && <BuySheet theme={buying} onClose={() => setBuying(null)} />}
    </div>
  );
}
