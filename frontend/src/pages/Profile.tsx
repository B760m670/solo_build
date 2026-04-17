import { useState } from 'react';
import { useTranslation } from '../lib/i18n';
import { useUser } from '../hooks/useUser';
import { useReferrals } from '../hooks/useReferrals';
import { toggleTheme, getTheme, setStyle, getStyle } from '../hooks/useTheme';
import { ChevronRightIcon, CrownIcon, ShieldIcon, SunIcon, MoonIcon } from '../components/Icons';
import type { ReputationTier } from '@unisouq/shared';

interface ProfileProps {
  onAdminOpen: () => void;
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
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: 'var(--surface2)', color }}
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
        className="w-16 h-16 rounded-full object-cover"
        style={{ border: '1px solid var(--border)' }}
      />
    );
  }
  return (
    <div
      className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
      style={{ backgroundColor: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' }}
    >
      {fallback}
    </div>
  );
}

function Row({
  label,
  onClick,
  children,
  chevron = true,
}: {
  label: string;
  onClick?: () => void;
  children?: React.ReactNode;
  chevron?: boolean;
}) {
  const content = (
    <>
      <span className="text-xs" style={{ color: 'var(--text)' }}>
        {label}
      </span>
      <div className="flex items-center gap-2">
        {children}
        {onClick && chevron && <ChevronRightIcon size={14} color="var(--text-muted)" />}
      </div>
    </>
  );
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        {content}
      </button>
    );
  }
  return <div className="w-full flex items-center justify-between px-4 py-3">{content}</div>;
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-card mb-3 overflow-hidden"
      style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, backgroundColor: 'var(--border)' }} />;
}

function Profile({ onAdminOpen, canOpenAdmin }: ProfileProps) {
  const { t, lang, setLang } = useTranslation();
  const userQ = useUser();
  const refQ = useReferrals();
  const [copied, setCopied] = useState(false);
  const [currentStyle, setCurrentStyle] = useState(getStyle);

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

  const handleCopy = async () => {
    if (!refQ.data) return;
    await navigator.clipboard.writeText(refQ.data.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="px-4 pt-4 pb-24">
      {/* Hero */}
      <div className="flex flex-col items-center text-center mb-6">
        <Avatar url={u.avatarUrl} fallback={u.firstName.slice(0, 1).toUpperCase()} />
        <p className="text-base font-bold mt-3" style={{ color: 'var(--text)' }}>
          {u.firstName}
        </p>
        {u.username && (
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            @{u.username}
          </p>
        )}
        <div className="flex items-center gap-1.5 mt-2">
          <TierBadge tier={u.reputationTier} />
          {isPlus && (
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
              style={{ backgroundColor: 'var(--gold)', color: '#000' }}
            >
              <CrownIcon size={10} color="#000" /> Plus
            </span>
          )}
        </div>
        <p className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>
          {t('memberSince')} {new Date(u.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Reputation strip */}
      <Section>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {t('reputation')}
            </span>
            <span className="text-[11px] font-semibold" style={{ color: 'var(--text)' }}>
              {u.reputationScore} / 1000
            </span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface2)' }}>
            <div
              className="h-full"
              style={{
                width: `${Math.min(100, u.reputationScore / 10)}%`,
                backgroundColor: 'var(--accent)',
              }}
            />
          </div>
        </div>
      </Section>

      {/* Unisouq Plus */}
      {!isPlus && (
        <Section>
          <div className="px-4 py-4 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-btn flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--surface2)' }}
            >
              <CrownIcon size={18} color="var(--gold)" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
                {t('unisouqPlus')}
              </p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                {t('unisouqPlusPitch')}
              </p>
            </div>
            <ChevronRightIcon size={14} color="var(--text-muted)" />
          </div>
        </Section>
      )}

      {/* Settings */}
      <p
        className="text-[10px] font-semibold uppercase tracking-wider mb-2 px-1"
        style={{ color: 'var(--text-muted)' }}
      >
        {t('settings')}
      </p>
      <Section>
        <Row label={t('language')} chevron={false}>
          <div className="flex gap-1">
            {(['en', 'ru'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-btn"
                style={{
                  backgroundColor: lang === l ? 'var(--accent)' : 'var(--surface2)',
                  color: lang === l ? '#fff' : 'var(--text-muted)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </Row>
        <Divider />
        <Row label={t('theme')} chevron={false}>
          <div className="flex gap-1">
            <button
              onClick={() => {
                if (getTheme() !== 'light') toggleTheme();
              }}
              className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-btn"
              style={{
                backgroundColor: getTheme() === 'light' ? 'var(--accent)' : 'var(--surface2)',
                color: getTheme() === 'light' ? '#fff' : 'var(--text-muted)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
              }}
            >
              <SunIcon size={10} color={getTheme() === 'light' ? '#fff' : 'var(--text-muted)'} />
            </button>
            <button
              onClick={() => {
                if (getTheme() !== 'dark') toggleTheme();
              }}
              className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-btn"
              style={{
                backgroundColor: getTheme() === 'dark' ? 'var(--accent)' : 'var(--surface2)',
                color: getTheme() === 'dark' ? '#fff' : 'var(--text-muted)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
              }}
            >
              <MoonIcon size={10} color={getTheme() === 'dark' ? '#fff' : 'var(--text-muted)'} />
            </button>
          </div>
        </Row>
        <Divider />
        <Row label={t('displayStyle')} chevron={false}>
          <div className="flex gap-1">
            {(['default', 'web3'] as const).map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStyle(s);
                  setCurrentStyle(s);
                }}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-btn"
                style={{
                  backgroundColor: currentStyle === s ? 'var(--accent)' : 'var(--surface2)',
                  color: currentStyle === s ? '#fff' : 'var(--text-muted)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                }}
              >
                {s === 'default' ? t('styleDefault') : t('styleWeb3')}
              </button>
            ))}
          </div>
        </Row>
      </Section>

      {/* Referral */}
      <p
        className="text-[10px] font-semibold uppercase tracking-wider mb-2 px-1"
        style={{ color: 'var(--text-muted)' }}
      >
        {t('referralProgram')}
      </p>
      <Section>
        {refQ.data ? (
          <div className="px-4 py-3">
            <p className="text-[10px] font-mono mb-2 truncate" style={{ color: 'var(--text)' }}>
              {refQ.data.link}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <div>
                  <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                    {t('referredFriends')}
                  </p>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
                    {refQ.data.count}
                  </p>
                </div>
                <div>
                  <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                    {t('earnedFromReferrals')}
                  </p>
                  <p className="text-xs font-semibold" style={{ color: 'var(--gold)' }}>
                    {refQ.data.earnedStars} ★
                  </p>
                </div>
              </div>
              <button
                onClick={handleCopy}
                className="text-[10px] font-semibold px-3 py-1.5 rounded-btn"
                style={{
                  backgroundColor: 'var(--surface2)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                }}
              >
                {copied ? t('copied') : t('copyLink')}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-[11px] px-4 py-3" style={{ color: 'var(--text-muted)' }}>
            {t('loading')}
          </p>
        )}
      </Section>

      {/* Admin */}
      {canOpenAdmin && (
        <Section>
          <Row label={t('adminPanel')} onClick={onAdminOpen}>
            <ShieldIcon size={14} color="var(--accent)" />
          </Row>
        </Section>
      )}

      <p className="text-[10px] text-center leading-relaxed mt-6 px-4" style={{ color: 'var(--text-muted)' }}>
        {t('disclaimer')}
      </p>
    </div>
  );
}

export default Profile;
