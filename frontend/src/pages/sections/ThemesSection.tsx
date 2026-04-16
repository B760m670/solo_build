import { useState } from 'react';
import { useTranslation } from '../../lib/i18n';
import { SectionHeader } from '../../components/SectionHeader';
import { PaletteIcon } from '../../components/Icons';
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
    <div className="flex gap-1 mt-2">
      {colors.map((c, i) => (
        <div
          key={i}
          className="w-5 h-5 rounded-full"
          style={{ backgroundColor: c, border: '1px solid rgba(255,255,255,0.1)' }}
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
  return (
    <div
      className="rounded-card p-3"
      style={{
        backgroundColor: 'var(--surface)',
        border: active ? '2px solid var(--accent)' : '1px solid var(--border)',
      }}
    >
      <div
        className="w-full aspect-[2/1] rounded-btn flex items-center justify-center mb-2 overflow-hidden"
        style={{ backgroundColor: (theme.palette as ThemePalette).bg }}
      >
        {theme.previewUrl ? (
          <img
            src={theme.previewUrl}
            alt={theme.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <PaletteIcon size={24} color={(theme.palette as ThemePalette).accent} />
        )}
      </div>
      <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
        {theme.name}
      </p>
      {theme.plusOnly && (
        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--gold)', color: '#000' }}>
          PLUS
        </span>
      )}
      <PalettePreview palette={theme.palette as ThemePalette} />

      <div className="mt-2">
        {owned ? (
          <button
            onClick={() => onActivate(active ? null : theme.id)}
            className="w-full py-2 text-[11px] font-semibold rounded-btn"
            style={{
              backgroundColor: active ? 'var(--surface2)' : 'var(--accent)',
              color: active ? 'var(--text)' : '#fff',
              border: '1px solid var(--border)',
              cursor: 'pointer',
            }}
          >
            {active ? t('active') : t('activate')}
          </button>
        ) : (
          <button
            onClick={() => onBuy(theme)}
            className="w-full py-2 text-[11px] font-semibold rounded-btn"
            style={{
              backgroundColor: 'var(--surface2)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
            }}
          >
            {theme.priceStars != null ? `${theme.priceStars} ★` : ''}
            {theme.priceStars != null && theme.priceTon != null ? ' / ' : ''}
            {theme.priceTon != null ? `${theme.priceTon} TON` : ''}
          </button>
        )}
      </div>
    </div>
  );
}

function BuySheet({ theme, onClose }: { theme: Theme; onClose: () => void }) {
  const buy = useBuyTheme();
  const [err, setErr] = useState<string | null>(null);

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
          {theme.name}
        </p>
        {theme.description && (
          <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
            {theme.description}
          </p>
        )}
        <div className="flex flex-col gap-2 mt-4">
          {theme.priceStars != null && (
            <button
              onClick={() => doBuy('STARS')}
              disabled={buy.isPending}
              className="w-full py-3 text-sm font-semibold rounded-btn"
              style={{ backgroundColor: 'var(--gold)', color: '#000', border: 'none', cursor: 'pointer', opacity: buy.isPending ? 0.5 : 1 }}
            >
              {theme.priceStars} ★
            </button>
          )}
          {theme.priceTon != null && (
            <button
              onClick={() => doBuy('TON')}
              disabled={buy.isPending}
              className="w-full py-3 text-sm font-semibold rounded-btn"
              style={{ backgroundColor: 'var(--teal)', color: '#000', border: 'none', cursor: 'pointer', opacity: buy.isPending ? 0.5 : 1 }}
            >
              {theme.priceTon} TON
            </button>
          )}
        </div>
        {err && <p className="text-[11px] mt-2" style={{ color: '#ff6b6b' }}>{err}</p>}
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
