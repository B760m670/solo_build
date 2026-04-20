import { useState } from 'react';
import { useTranslation } from '../../lib/i18n';
import { SectionHeader } from '../../components/SectionHeader';
import {
  StarIcon,
  DiamondIcon,
  CodeBracketIcon,
  LayersIcon,
  CompassIcon,
  SwapArrowsIcon,
  ChevronRightIcon,
  GlobeIcon,
  LinkChainIcon,
  WalletIcon,
} from '../../components/Icons';
import { useTonAddress } from '@tonconnect/ui-react';

/* ─── Sub-section types ─── */
type CryptoTab = 'hub' | 'dapps' | 'multichain' | 'explorer' | 'swap';

interface SubDef {
  key: CryptoTab;
  titleKey: string;
  descKey: string;
  icon: typeof WalletIcon;
  tint: string;
  iconBg: string;
  gradient: string;
}

const CRYPTO_SUBS: SubDef[] = [
  {
    key: 'dapps',
    titleKey: 'cryptoDapps',
    descKey: 'cryptoDappsDesc',
    icon: CodeBracketIcon,
    tint: 'var(--accent)',
    iconBg: 'rgba(108,99,255,0.10)',
    gradient: 'linear-gradient(135deg, rgba(108,99,255,0.12) 0%, rgba(108,99,255,0.02) 100%)',
  },
  {
    key: 'swap',
    titleKey: 'cryptoSwap',
    descKey: 'cryptoSwapDesc',
    icon: SwapArrowsIcon,
    tint: 'var(--gold)',
    iconBg: 'rgba(245,200,66,0.12)',
    gradient: 'linear-gradient(135deg, rgba(245,200,66,0.12) 0%, rgba(245,200,66,0.02) 100%)',
  },
  {
    key: 'multichain',
    titleKey: 'cryptoMultichain',
    descKey: 'cryptoMultichainDesc',
    icon: LayersIcon,
    tint: '#ff6b6b',
    iconBg: 'rgba(255,107,107,0.10)',
    gradient: 'linear-gradient(135deg, rgba(255,107,107,0.12) 0%, rgba(255,107,107,0.02) 100%)',
  },
  {
    key: 'explorer',
    titleKey: 'cryptoExplorer',
    descKey: 'cryptoExplorerDesc',
    icon: CompassIcon,
    tint: 'var(--teal)',
    iconBg: 'rgba(0,212,170,0.10)',
    gradient: 'linear-gradient(135deg, rgba(0,212,170,0.12) 0%, rgba(0,212,170,0.02) 100%)',
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tk = (s: string) => s as any;

/* ─── dApps sub-section ─── */
interface DApp {
  name: string;
  desc: string;
  icon: typeof WalletIcon;
  tint: string;
  url: string;
  featured?: boolean;
}

const TON_DAPPS: DApp[] = [
  { name: 'STON.fi', desc: 'DEX on TON', icon: SwapArrowsIcon, tint: 'var(--teal)', url: 'https://ston.fi', featured: true },
  { name: 'DeDust', desc: 'AMM DEX Protocol', icon: DiamondIcon, tint: 'var(--accent)', url: 'https://dedust.io', featured: true },
  { name: 'Getgems', desc: 'NFT Marketplace', icon: StarIcon, tint: 'var(--gold)', url: 'https://getgems.io', featured: true },
  { name: 'TON DNS', desc: 'Decentralized domains', icon: GlobeIcon, tint: 'var(--teal)', url: 'https://dns.ton.org' },
  { name: 'Tonviewer', desc: 'Blockchain explorer', icon: CompassIcon, tint: 'var(--accent)', url: 'https://tonviewer.com' },
  { name: 'TON Staking', desc: 'Stake TON tokens', icon: LayersIcon, tint: '#ff6b6b', url: 'https://ton.org/stake' },
];

function DAppsView() {
  const { t } = useTranslation();
  const featured = TON_DAPPS.filter((d) => d.featured);
  const all = TON_DAPPS;

  return (
    <>
      {/* Featured */}
      <div className="mb-3 flex items-center gap-2">
        <StarIcon size={14} color="var(--gold)" filled />
        <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          {t(tk('dappsFeatured'))}
        </p>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-3 mb-4 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
        {featured.map((dapp) => {
          const Icon = dapp.icon;
          return (
            <a
              key={dapp.name}
              href={dapp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 w-[140px] rounded-card p-3 relative overflow-hidden flex flex-col gap-2 transition-transform active:scale-[0.97]"
              style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', textDecoration: 'none' }}
            >
              <div className="absolute inset-0 opacity-[0.04]" style={{ background: `linear-gradient(135deg, ${dapp.tint} 0%, transparent 60%)` }} />
              <div className="relative w-10 h-10 rounded-btn flex items-center justify-center" style={{ backgroundColor: `${dapp.tint}15` }}>
                <Icon size={20} color={dapp.tint} />
              </div>
              <div className="relative">
                <p className="text-[11px] font-bold" style={{ color: 'var(--text)' }}>{dapp.name}</p>
                <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{dapp.desc}</p>
              </div>
            </a>
          );
        })}
      </div>

      {/* All apps */}
      <div className="mb-3 flex items-center gap-2">
        <CodeBracketIcon size={14} color="var(--text-muted)" />
        <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          {t(tk('dappsAll'))}
        </p>
      </div>
      <div className="rounded-card overflow-hidden" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        {all.map((dapp, i) => {
          const Icon = dapp.icon;
          return (
            <a
              key={dapp.name}
              href={dapp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-3 transition-opacity active:opacity-80"
              style={{
                borderBottom: i < all.length - 1 ? '1px solid var(--border)' : 'none',
                textDecoration: 'none',
              }}
            >
              <div className="w-9 h-9 rounded-btn flex items-center justify-center shrink-0" style={{ backgroundColor: `${dapp.tint}15` }}>
                <Icon size={16} color={dapp.tint} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold" style={{ color: 'var(--text)' }}>{dapp.name}</p>
                <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{dapp.desc}</p>
              </div>
              <ChevronRightIcon size={14} color="var(--text-muted)" />
            </a>
          );
        })}
      </div>
    </>
  );
}

/* ─── Multi-chain sub-section ─── */
interface Chain {
  name: string;
  symbol: string;
  tint: string;
  status: 'active' | 'soon';
}

const CHAINS: Chain[] = [
  { name: 'The Open Network', symbol: 'TON', tint: 'var(--teal)', status: 'active' },
  { name: 'Ethereum', symbol: 'ETH', tint: '#627EEA', status: 'soon' },
  { name: 'BNB Chain', symbol: 'BNB', tint: '#F3BA2F', status: 'soon' },
  { name: 'Solana', symbol: 'SOL', tint: '#9945FF', status: 'soon' },
  { name: 'Polygon', symbol: 'MATIC', tint: '#8247E5', status: 'soon' },
  { name: 'Tron', symbol: 'TRX', tint: '#FF0013', status: 'soon' },
];

function MultichainView() {
  const { t } = useTranslation();

  return (
    <>
      {/* Connected */}
      <div className="mb-3 flex items-center gap-2">
        <LinkChainIcon size={14} color="var(--teal)" />
        <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          {t(tk('multichainConnected'))}
        </p>
      </div>
      {CHAINS.filter((c) => c.status === 'active').map((chain) => (
        <div
          key={chain.symbol}
          className="rounded-card p-4 mb-4 relative overflow-hidden"
          style={{ backgroundColor: 'var(--surface)', border: `1px solid ${chain.tint}` }}
        >
          <div className="absolute inset-0 opacity-5" style={{ background: `linear-gradient(135deg, ${chain.tint} 0%, transparent 60%)` }} />
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${chain.tint}18` }}>
              <span className="text-xs font-bold" style={{ color: chain.tint }}>{chain.symbol.slice(0, 2)}</span>
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-semibold" style={{ color: 'var(--text)' }}>{chain.name}</p>
              <p className="text-[9px] font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>{chain.symbol}</p>
            </div>
            <span className="text-[8px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${chain.tint}15`, color: chain.tint }}>
              Active
            </span>
          </div>
        </div>
      ))}

      {/* Available networks */}
      <div className="mb-3 flex items-center gap-2">
        <LayersIcon size={14} color="var(--text-muted)" />
        <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          {t(tk('multichainAvailable'))}
        </p>
      </div>
      <div className="rounded-card overflow-hidden" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        {CHAINS.filter((c) => c.status === 'soon').map((chain, i, arr) => (
          <div
            key={chain.symbol}
            className="flex items-center gap-3 px-3 py-3"
            style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}
          >
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${chain.tint}12` }}>
              <span className="text-[10px] font-bold" style={{ color: chain.tint }}>{chain.symbol.slice(0, 2)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold" style={{ color: 'var(--text)' }}>{chain.name}</p>
              <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{chain.symbol}</p>
            </div>
            <span className="text-[8px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--surface2)', color: 'var(--text-muted)' }}>
              {t('comingSoon')}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

/* ─── Explorer sub-section ─── */
function ExplorerView() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const connectedAddress = useTonAddress(false);
  const shortAddr = connectedAddress
    ? connectedAddress.slice(0, 8) + '...' + connectedAddress.slice(-6)
    : '';

  const openTonviewer = (query?: string) => {
    const url = query
      ? `https://tonviewer.com/${encodeURIComponent(query)}`
      : 'https://tonviewer.com';
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* Search bar */}
      <div
        className="rounded-card p-3 mb-4 flex items-center gap-2"
        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <CompassIcon size={16} color="var(--text-muted)" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search.trim() && openTonviewer(search.trim())}
          placeholder={t(tk('explorerSearch'))}
          className="flex-1 text-xs outline-none bg-transparent"
          style={{ color: 'var(--text)' }}
        />
        {search.trim() && (
          <button
            onClick={() => openTonviewer(search.trim())}
            className="text-[9px] font-bold px-2.5 py-1 rounded-btn"
            style={{ backgroundColor: 'var(--teal)', color: '#000', border: 'none', cursor: 'pointer' }}
          >
            Go
          </button>
        )}
      </div>

      {/* Your wallet card */}
      {connectedAddress && (
        <div
          className="rounded-card p-4 mb-4 relative overflow-hidden transition-transform active:scale-[0.99]"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer' }}
          onClick={() => openTonviewer(connectedAddress)}
        >
          <div className="absolute inset-0 opacity-[0.04]" style={{ background: 'linear-gradient(135deg, var(--teal) 0%, transparent 60%)' }} />
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 rounded-card flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(0,212,170,0.10)' }}>
              <WalletIcon size={18} color="var(--teal)" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>
                Your Wallet
              </p>
              <p className="text-[11px] font-mono mt-0.5" style={{ color: 'var(--text)' }}>{shortAddr}</p>
            </div>
            <ChevronRightIcon size={14} color="var(--text-muted)" />
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="mb-3 flex items-center gap-2">
        <GlobeIcon size={14} color="var(--text-muted)" />
        <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Quick Links
        </p>
      </div>
      <div className="rounded-card overflow-hidden" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        {[
          { label: 'Tonviewer', desc: 'Full blockchain explorer', url: 'https://tonviewer.com', tint: 'var(--teal)' },
          { label: 'TONScan', desc: 'Blocks, transactions, validators', url: 'https://tonscan.org', tint: 'var(--accent)' },
          { label: 'TON API', desc: 'Developer API reference', url: 'https://tonapi.io', tint: 'var(--gold)' },
        ].map((link, i, arr) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-3 transition-opacity active:opacity-80"
            style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', textDecoration: 'none' }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${link.tint}12` }}>
              <CompassIcon size={14} color={link.tint} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold" style={{ color: 'var(--text)' }}>{link.label}</p>
              <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{link.desc}</p>
            </div>
            <ChevronRightIcon size={14} color="var(--text-muted)" />
          </a>
        ))}
      </div>
    </>
  );
}

/* ─── Swap sub-section ─── */
function SwapView() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div
        className="w-16 h-16 rounded-card flex items-center justify-center mb-4 relative overflow-hidden"
        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="absolute inset-0 opacity-[0.06]" style={{ background: 'linear-gradient(135deg, var(--gold) 0%, transparent 60%)' }} />
        <SwapArrowsIcon size={28} color="var(--gold)" />
      </div>
      <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{t(tk('swapTitle'))}</p>
      <p className="text-[11px] mt-1.5 text-center max-w-[240px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        {t(tk('swapDesc'))}
      </p>

      {/* Quick DEX links */}
      <div className="flex gap-2 mt-6">
        {[
          { name: 'STON.fi', url: 'https://app.ston.fi/swap', tint: 'var(--teal)' },
          { name: 'DeDust', url: 'https://dedust.io/swap', tint: 'var(--accent)' },
        ].map((dex) => (
          <a
            key={dex.name}
            href={dex.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-btn text-[11px] font-bold flex items-center gap-1.5 transition-opacity active:opacity-80"
            style={{ backgroundColor: `${dex.tint}12`, color: dex.tint, textDecoration: 'none', border: `1px solid ${dex.tint}20` }}
          >
            <SwapArrowsIcon size={12} color={dex.tint} />
            {dex.name}
          </a>
        ))}
      </div>

      <p className="text-[9px] mt-4 px-3 py-1.5 rounded-btn leading-relaxed text-center max-w-[260px]" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--surface)' }}>
        Swaps are performed on external DEX protocols. Unisouq does not custody funds during swaps.
      </p>
    </div>
  );
}

/* ─── Crypto Hub grid ─── */
function CryptoHub({ onSelect }: { onSelect: (key: CryptoTab) => void }) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-3">
      {CRYPTO_SUBS.map((sub) => {
        const Icon = sub.icon;
        return (
          <button
            key={sub.key}
            onClick={() => onSelect(sub.key)}
            className="web3-card-heavy text-left rounded-card p-4 flex flex-col gap-3 relative overflow-hidden transition-transform active:scale-[0.98]"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer' }}
          >
            <div className="absolute inset-0 opacity-60" style={{ background: sub.gradient }} />
            <div className="relative">
              <div className="w-10 h-10 rounded-btn flex items-center justify-center mb-3" style={{ backgroundColor: sub.iconBg }}>
                <Icon size={20} color={sub.tint} />
              </div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                {t(tk(sub.titleKey))}
              </p>
              <p className="text-[10px] mt-0.5 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {t(tk(sub.descKey))}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Main ─── */
export function CryptoSection({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<CryptoTab>('hub');

  const handleSubBack = () => setActiveTab('hub');
  const activeSubDef = CRYPTO_SUBS.find((s) => s.key === activeTab);

  return (
    <div className="px-4 pt-2 pb-24">
      {activeTab === 'hub' ? (
        <>
          <SectionHeader
            title={t('sectionCrypto')}
            subtitle={t('sectionCryptoDesc')}
            onBack={onBack}
            backLabel={t('back')}
          />
          <CryptoHub onSelect={setActiveTab} />
        </>
      ) : (
        <>
          <SectionHeader
            title={activeSubDef ? t(tk(activeSubDef.titleKey)) : ''}
            subtitle={activeSubDef ? t(tk(activeSubDef.descKey)) : ''}
            onBack={handleSubBack}
            backLabel={t('sectionCrypto')}
          />
          {activeTab === 'dapps' && <DAppsView />}
          {activeTab === 'multichain' && <MultichainView />}
          {activeTab === 'explorer' && <ExplorerView />}
          {activeTab === 'swap' && <SwapView />}
        </>
      )}
    </div>
  );
}
