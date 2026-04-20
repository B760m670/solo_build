import { useState } from 'react';
import { useTranslation } from '../lib/i18n';
import { useUser } from '../hooks/useUser';
import { useReferrals } from '../hooks/useReferrals';
import { useMyGifts } from '../hooks/useGifts';
import { useCodex } from '../hooks/useCodex';
import { toggleTheme, getTheme } from '../hooks/useTheme';
import {
  ChevronRightIcon,
  CrownIcon,
  ShieldIcon,
  SunIcon,
  MoonIcon,
  SettingsIcon,
  CloseIcon,
  CopyIcon,
  StarIcon,
  DiamondIcon,
  WalletIcon,
  GiftIcon,
  SwapArrowsIcon,
  CpuIcon,
  CoinsIcon,
  CodeBracketIcon,
  IdCardIcon,
  LockIcon,
  BookOpenIcon,
} from '../components/Icons';
import type { ReputationTier } from '@unisouq/shared';

interface ProfileProps {
  onAdminOpen: () => void;
  onLearnOpen: () => void;
  canOpenAdmin: boolean;
}

function TierBadge({ tier }: { tier: ReputationTier }) {
  const { t } = useTranslation();
  const color =
    tier === 'ELITE'
      ? 'var(--gold)'
      : tier === 'EXPERT'
      ? 'var(--accent)'
      : tier === 'TRUSTED'
      ? 'var(--teal)'
      : 'var(--text-muted)';
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
      style={{ backgroundColor: `${color}22`, color, border: `1px solid ${color}44` }}
    >
      {t(`tier${tier}`)}
    </span>
  );
}

function Avatar({ url, fallback }: { url: string | null; fallback: string }) {
  const [failed, setFailed] = useState(false);
  if (url && !failed) {
    return (
      <img
        src={url}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="w-20 h-20 rounded-full object-cover"
        style={{ border: '2px solid var(--border)' }}
      />
    );
  }
  return (
    <div
      className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black"
      style={{ backgroundColor: 'var(--surface2)', color: 'var(--text)', border: '2px solid var(--border)' }}
    >
      {fallback}
    </div>
  );
}

function shortAddress(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 5)}\u2026${addr.slice(-5)}`;
}

const CODEX_ICON_MAP = {
  Star: StarIcon,
  Diamond: DiamondIcon,
  Wallet: WalletIcon,
  Gift: GiftIcon,
  Swap: SwapArrowsIcon,
  Crown: CrownIcon,
  Cpu: CpuIcon,
  Coins: CoinsIcon,
  Code: CodeBracketIcon,
  Id: IdCardIcon,
} as const;

/* ─── Settings sheet ─── */

function SettingsSheet({
  onClose,
  onAdminOpen,
  canOpenAdmin,
}: {
  onClose: () => void;
  onAdminOpen: () => void;
  canOpenAdmin: boolean;
}) {
  const { t, lang, setLang } = useTranslation();
  const [themeVersion, setThemeVersion] = useState(0);
  const theme = getTheme();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-card overflow-hidden"
        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <p className="display-label">{t('settings')}</p>
          <button
            onClick={onClose}
            aria-label={t('close')}
            className="w-8 h-8 flex items-center justify-center rounded-btn"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <CloseIcon size={16} color="var(--text-muted)" />
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-4 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 60px)' }}>
          {/* Language */}
          <div>
            <p className="text-[11px] mb-2" style={{ color: 'var(--text-muted)' }}>
              {t('language')}
            </p>
            <div className="flex gap-2">
              {(['en', 'ru'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className="flex-1 text-xs font-bold px-3 py-2 rounded-btn"
                  style={{
                    backgroundColor: lang === l ? 'var(--accent)' : 'var(--surface2)',
                    color: lang === l ? '#fff' : 'var(--text)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                  }}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div>
            <p className="text-[11px] mb-2" style={{ color: 'var(--text-muted)' }}>
              {t('theme')}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (getTheme() !== 'light') toggleTheme();
                  setThemeVersion((v) => v + 1);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-2 rounded-btn"
                style={{
                  backgroundColor: theme === 'light' ? 'var(--accent)' : 'var(--surface2)',
                  color: theme === 'light' ? '#fff' : 'var(--text)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                }}
              >
                <SunIcon size={12} color={theme === 'light' ? '#fff' : 'var(--text)'} />
                Light
              </button>
              <button
                onClick={() => {
                  if (getTheme() !== 'dark') toggleTheme();
                  setThemeVersion((v) => v + 1);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-2 rounded-btn"
                style={{
                  backgroundColor: theme === 'dark' ? 'var(--accent)' : 'var(--surface2)',
                  color: theme === 'dark' ? '#fff' : 'var(--text)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                }}
              >
                <MoonIcon size={12} color={theme === 'dark' ? '#fff' : 'var(--text)'} />
                Dark
              </button>
            </div>
            <span className="hidden">{themeVersion}</span>
          </div>

          {/* Admin */}
          {canOpenAdmin && (
            <button
              onClick={() => {
                onAdminOpen();
                onClose();
              }}
              className="flex items-center justify-between w-full px-4 py-3 rounded-btn"
              style={{
                backgroundColor: 'var(--surface2)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
              }}
            >
              <div className="flex items-center gap-2">
                <ShieldIcon size={14} color="var(--accent)" />
                <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
                  {t('adminPanel')}
                </span>
              </div>
              <ChevronRightIcon size={14} color="var(--text-muted)" />
            </button>
          )}

          <p className="text-[10px] leading-relaxed text-center" style={{ color: 'var(--text-muted)' }}>
            {t('disclaimer')}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Profile ─── */

function Profile({ onAdminOpen, onLearnOpen, canOpenAdmin }: ProfileProps) {
  const { t } = useTranslation();
  const userQ = useUser();
  const refQ = useReferrals();
  const myGiftsQ = useMyGifts();
  const { cards, unlockedCount, total } = useCodex();
  const [copied, setCopied] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (userQ.isLoading) {
    return (
      <p className="text-xs text-center py-20" style={{ color: 'var(--text-muted)' }}>
        {t('loading')}
      </p>
    );
  }
  if (!userQ.data) {
    return (
      <p className="text-xs text-center py-20" style={{ color: '#ff6b6b' }}>
        {t('failedLoadProfile')}
      </p>
    );
  }

  const u = userQ.data;
  const isPlus = !!u.premiumBadgeUntil && new Date(u.premiumBadgeUntil) > new Date();
  const myGifts = myGiftsQ.data ?? [];
  const unlockedCards = cards.filter((c) => c.unlocked);
  const codexPct = total > 0 ? Math.round((unlockedCount / total) * 100) : 0;

  const handleCopy = async () => {
    if (!refQ.data) return;
    await navigator.clipboard.writeText(refQ.data.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="px-4 pt-3 pb-24">
      {/* Top strip: label + gear */}
      <div className="flex items-center justify-between mb-4 px-1">
        <p className="display-subtitle">{t('identity')}</p>
        <button
          onClick={() => setSettingsOpen(true)}
          aria-label={t('openSettings')}
          className="w-9 h-9 flex items-center justify-center rounded-btn"
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            cursor: 'pointer',
          }}
        >
          <SettingsIcon size={16} color="var(--text-muted)" />
        </button>
      </div>

      {/* Hero */}
      <div
        className="rounded-card p-5 mb-3 flex flex-col items-center text-center relative overflow-hidden"
        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{ background: 'linear-gradient(135deg, var(--accent) 0%, transparent 60%)' }}
        />
        <div className="relative">
          <Avatar url={u.avatarUrl} fallback={u.firstName.slice(0, 1).toUpperCase()} />
        </div>
        <p className="relative display-title mt-3" style={{ color: 'var(--text)', fontSize: 22 }}>
          {u.firstName}
        </p>
        {u.username && (
          <p className="relative text-[11px] font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
            @{u.username}
          </p>
        )}
        <div className="relative flex items-center gap-1.5 mt-2.5">
          <TierBadge tier={u.reputationTier} />
          {isPlus && (
            <span
              className="text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider"
              style={{ backgroundColor: 'var(--gold)', color: '#000' }}
            >
              <CrownIcon size={10} color="#000" /> Plus
            </span>
          )}
        </div>
        <p className="relative text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>
          {t('memberSince')} {new Date(u.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Wallet row */}
      <div
        className="rounded-card px-4 py-3 mb-3 flex items-center gap-3"
        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div
          className="w-9 h-9 rounded-btn flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: u.tonAddress ? 'rgba(0,212,170,0.12)' : 'var(--surface2)' }}
        >
          <WalletIcon size={16} color={u.tonAddress ? 'var(--teal)' : 'var(--text-muted)'} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="display-label">{t('wallet')}</p>
          {u.tonAddress ? (
            <p className="text-[12px] font-mono mt-0.5" style={{ color: 'var(--text)' }}>
              {shortAddress(u.tonAddress)}
            </p>
          ) : (
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {t('walletNotLinked')} · {t('walletLinkHint')}
            </p>
          )}
        </div>
      </div>

      {/* Learn entry */}
      <button
        onClick={onLearnOpen}
        className="rounded-card px-4 py-3 mb-3 flex items-center gap-3 w-full"
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div
          className="w-9 h-9 rounded-btn flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'rgba(108,99,255,0.12)' }}
        >
          <BookOpenIcon size={16} color="var(--accent)" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="display-label">{t('sectionLearn')}</p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {t('sectionLearnDesc')}
          </p>
        </div>
        <ChevronRightIcon size={14} color="var(--text-muted)" />
      </button>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <StatTile label={t('xp')} value={u.reputationScore.toString()} color="var(--accent)" />
        <StatTile label={t('codexProgress')} value={`${codexPct}%`} sub={`${unlockedCount}/${total}`} color="var(--gold)" />
        <StatTile label={t('giftsOwned')} value={myGifts.length.toString()} color="var(--teal)" />
      </div>

      {/* My codex showcase */}
      <div className="mb-4">
        <p className="display-label mb-2 px-1">{t('myCodex')}</p>
        {unlockedCards.length === 0 ? (
          <EmptyShowcase icon={<LockIcon size={18} color="var(--text-muted)" />} text={t('emptyCodexShort')} />
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {unlockedCards.slice(0, 3).map((card) => {
              const Icon = CODEX_ICON_MAP[card.def.iconKey];
              return (
                <div
                  key={card.def.id}
                  className="rounded-card p-3 flex flex-col items-center relative overflow-hidden"
                  style={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    aspectRatio: '3 / 4',
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-[0.06]"
                    style={{ background: `linear-gradient(135deg, ${card.def.tint} 0%, transparent 70%)` }}
                  />
                  <div
                    className="relative w-10 h-10 rounded-btn flex items-center justify-center mb-1 mt-1"
                    style={{ backgroundColor: card.def.iconBg }}
                  >
                    <Icon size={18} color={card.def.tint} />
                  </div>
                  <p className="relative text-[9px] font-bold uppercase text-center mt-auto leading-tight" style={{ color: 'var(--text)' }}>
                    {card.def.id}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* My gifts showcase */}
      <div className="mb-4">
        <p className="display-label mb-2 px-1">{t('myGifts')}</p>
        {myGifts.length === 0 ? (
          <EmptyShowcase icon={<GiftIcon size={18} color="var(--text-muted)" />} text={t('emptyGiftsShort')} />
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {myGifts.slice(0, 3).map((ug) => (
              <div
                key={ug.id}
                className="rounded-card p-3 flex flex-col items-center relative overflow-hidden"
                style={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  aspectRatio: '3 / 4',
                }}
              >
                {ug.gift?.imageUrl ? (
                  <img
                    src={ug.gift.imageUrl}
                    alt=""
                    className="w-10 h-10 object-cover rounded-btn mt-1 mb-1"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-btn flex items-center justify-center mt-1 mb-1"
                    style={{ backgroundColor: 'rgba(245,200,66,0.12)' }}
                  >
                    <GiftIcon size={18} color="var(--gold)" />
                  </div>
                )}
                <p
                  className="text-[9px] font-bold uppercase text-center mt-auto leading-tight line-clamp-2"
                  style={{ color: 'var(--text)' }}
                >
                  {ug.gift?.name ?? '—'}
                </p>
                <p className="text-[8px] font-mono" style={{ color: 'var(--text-muted)' }}>
                  #{ug.serialNo}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Referral compact */}
      {refQ.data && (
        <div
          className="rounded-card px-4 py-3 flex items-center gap-3"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="flex-1 min-w-0">
            <p className="display-label mb-0.5">{t('referralProgram')}</p>
            <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
              {refQ.data.count} · {refQ.data.earnedStars} ★
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-btn uppercase tracking-wider"
            style={{
              backgroundColor: 'var(--surface2)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
            }}
          >
            <CopyIcon size={10} color="var(--text)" />
            {copied ? t('copied') : t('copyLink')}
          </button>
        </div>
      )}

      {settingsOpen && (
        <SettingsSheet
          onClose={() => setSettingsOpen(false)}
          onAdminOpen={onAdminOpen}
          canOpenAdmin={canOpenAdmin}
        />
      )}
    </div>
  );
}

function StatTile({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div
      className="rounded-card p-3 relative overflow-hidden"
      style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{ background: `linear-gradient(135deg, ${color} 0%, transparent 70%)` }}
      />
      <p className="relative display-label" style={{ fontSize: 9 }}>
        {label}
      </p>
      <p
        className="relative display-number mt-1"
        style={{ color, fontSize: 24 }}
      >
        {value}
      </p>
      {sub && (
        <p className="relative text-[9px] font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function EmptyShowcase({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div
      className="rounded-card px-4 py-5 flex items-center justify-center gap-2"
      style={{ backgroundColor: 'var(--surface)', border: '1px dashed var(--border)' }}
    >
      {icon}
      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
        {text}
      </p>
    </div>
  );
}

export default Profile;
