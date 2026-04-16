import { useState } from 'react';
import { useTranslation } from '../lib/i18n';
import {
  useAdminDashboard,
  useAdminPendingWithdrawals,
  useAdminProcessWithdrawal,
  useAdminCreateGift,
  useAdminRetireGift,
  useAdminCreateTheme,
  useAdminRetireTheme,
  useAdminCreatePlan,
  useAdminRetirePlan,
} from '../hooks/useAdmin';
import { useGiftCatalog } from '../hooks/useGifts';
import { useThemeCatalog } from '../hooks/useThemes';
import { usePlusPlans } from '../hooks/usePlus';
import type { Gift, Theme, PlusPlan } from '@unisouq/shared';

interface AdminProps {
  onBack: () => void;
}

type AdminTab = 'dashboard' | 'gifts' | 'themes' | 'plus' | 'withdrawals';

const TABS: { key: AdminTab; label: string }[] = [
  { key: 'dashboard', label: 'Stats' },
  { key: 'gifts', label: 'Gifts' },
  { key: 'themes', label: 'Themes' },
  { key: 'plus', label: 'Plus' },
  { key: 'withdrawals', label: 'Withdrawals' },
];

/* ─── Shared ─── */

const inputStyle = {
  backgroundColor: 'var(--surface2)',
  color: 'var(--text)',
  border: '1px solid var(--border)',
};

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-card p-3" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-sm font-bold mt-1" style={{ color: 'var(--text)' }}>{value}</p>
    </div>
  );
}

/* ─── Dashboard ─── */

function DashboardTab() {
  const { t } = useTranslation();
  const dashboard = useAdminDashboard();

  if (dashboard.isLoading) return <p className="text-xs py-4" style={{ color: 'var(--text-muted)' }}>{t('loading')}</p>;
  if (!dashboard.data) return null;

  const d = dashboard.data;
  return (
    <>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <StatCard label={t('users')} value={d.users.total} />
        <StatCard label={t('last7days')} value={d.users.recentSignups} />
        <StatCard label="Active Plus" value={d.users.activePlus} />
        <StatCard label="Gifts" value={`${d.gifts.active}/${d.gifts.total}`} />
        <StatCard label="Themes" value={d.themes.active} />
        <StatCard label="Posts" value={d.social.posts} />
        <StatCard label="Pending W." value={d.withdrawals.pending} />
      </div>
      <div className="rounded-card p-3" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <p className="text-[11px] font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>{t('tierDistribution')}</p>
        <div className="grid grid-cols-4 gap-2">
          {(['NEW', 'TRUSTED', 'EXPERT', 'ELITE'] as const).map((tier) => (
            <div key={tier}>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t(`tier${tier}`)}</p>
              <p className="text-xs font-bold" style={{ color: 'var(--text)' }}>{d.users.tiers[tier] ?? 0}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ─── Gifts CRUD ─── */

function GiftsTab() {
  const { t } = useTranslation();
  const catalog = useGiftCatalog();
  const create = useAdminCreateGift();
  const retire = useAdminRetireGift();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', imageUrl: '', rarity: 'COMMON', priceStars: '', priceTon: '', editionSize: '' });
  const [err, setErr] = useState<string | null>(null);

  const handleCreate = async () => {
    setErr(null);
    try {
      await create.mutateAsync({
        name: form.name.trim(),
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim(),
        rarity: form.rarity,
        priceStars: form.priceStars ? parseInt(form.priceStars, 10) : undefined,
        priceTon: form.priceTon ? parseFloat(form.priceTon) : undefined,
        editionSize: form.editionSize ? parseInt(form.editionSize, 10) : undefined,
      });
      setAdding(false);
      setForm({ name: '', description: '', imageUrl: '', rarity: 'COMMON', priceStars: '', priceTon: '', editionSize: '' });
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Error');
    }
  };

  return (
    <>
      <button
        onClick={() => setAdding(!adding)}
        className="w-full py-2.5 text-[11px] font-semibold rounded-btn mb-3"
        style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
      >
        + New Gift
      </button>

      {adding && (
        <div className="rounded-card p-3 mb-3 flex flex-col gap-2" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="px-3 py-2 text-xs rounded-btn outline-none" style={inputStyle} />
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="px-3 py-2 text-xs rounded-btn outline-none" style={inputStyle} />
          <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="Image URL" className="px-3 py-2 text-xs rounded-btn outline-none" style={inputStyle} />
          <select value={form.rarity} onChange={(e) => setForm({ ...form, rarity: e.target.value })} className="px-3 py-2 text-xs rounded-btn outline-none" style={inputStyle}>
            {['COMMON', 'RARE', 'EPIC', 'LEGENDARY'].map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <div className="grid grid-cols-3 gap-2">
            <input value={form.priceStars} onChange={(e) => setForm({ ...form, priceStars: e.target.value.replace(/\D/g, '') })} placeholder="Stars" inputMode="numeric" className="px-2 py-2 text-xs rounded-btn outline-none" style={inputStyle} />
            <input value={form.priceTon} onChange={(e) => setForm({ ...form, priceTon: e.target.value.replace(/[^0-9.]/g, '') })} placeholder="TON" inputMode="decimal" className="px-2 py-2 text-xs rounded-btn outline-none" style={inputStyle} />
            <input value={form.editionSize} onChange={(e) => setForm({ ...form, editionSize: e.target.value.replace(/\D/g, '') })} placeholder="Edition" inputMode="numeric" className="px-2 py-2 text-xs rounded-btn outline-none" style={inputStyle} />
          </div>
          {err && <p className="text-[10px]" style={{ color: '#ff6b6b' }}>{err}</p>}
          <button
            onClick={handleCreate}
            disabled={!form.name.trim() || !form.description.trim() || !form.imageUrl.trim() || create.isPending}
            className="py-2 text-[11px] font-semibold rounded-btn"
            style={{ backgroundColor: 'var(--teal)', color: '#000', border: 'none', cursor: 'pointer', opacity: create.isPending ? 0.5 : 1 }}
          >
            {create.isPending ? t('creating') : t('publish')}
          </button>
        </div>
      )}

      {catalog.isLoading && <p className="text-xs py-4" style={{ color: 'var(--text-muted)' }}>{t('loading')}</p>}
      <div className="flex flex-col gap-2">
        {catalog.data?.map((g: Gift) => (
          <div key={g.id} className="rounded-card p-3 flex items-center gap-3" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="w-10 h-10 rounded-btn overflow-hidden shrink-0" style={{ backgroundColor: 'var(--surface2)' }}>
              {g.imageUrl && <img src={g.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>{g.name}</p>
              <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                {g.rarity} · {g.editionMinted}/{g.editionSize ?? '∞'} · {g.priceStars ?? '-'} ★
              </p>
            </div>
            <button
              onClick={() => retire.mutate(g.id)}
              className="text-[10px] px-2 py-1 rounded-btn shrink-0"
              style={{ backgroundColor: 'var(--surface2)', color: 'var(--text-muted)', border: '1px solid var(--border)', cursor: 'pointer' }}
            >
              Retire
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

/* ─── Themes CRUD ─── */

function ThemesTab() {
  const { t } = useTranslation();
  const catalog = useThemeCatalog();
  const create = useAdminCreateTheme();
  const retire = useAdminRetireTheme();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', previewUrl: '', priceStars: '', priceTon: '', plusOnly: false,
    bg: '#000000', surface: '#0D0D0D', surface2: '#111111', border: 'rgba(255,255,255,0.06)',
    accent: '#6C63FF', teal: '#00D4AA', gold: '#F5C842', text: '#FFFFFF', textMuted: 'rgba(255,255,255,0.25)',
  });
  const [err, setErr] = useState<string | null>(null);

  const handleCreate = async () => {
    setErr(null);
    try {
      await create.mutateAsync({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        previewUrl: form.previewUrl.trim() || undefined,
        palette: {
          bg: form.bg, surface: form.surface, surface2: form.surface2, border: form.border,
          accent: form.accent, teal: form.teal, gold: form.gold, text: form.text, textMuted: form.textMuted,
        },
        priceStars: form.priceStars ? parseInt(form.priceStars, 10) : undefined,
        priceTon: form.priceTon ? parseFloat(form.priceTon) : undefined,
        plusOnly: form.plusOnly,
      });
      setAdding(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Error');
    }
  };

  return (
    <>
      <button
        onClick={() => setAdding(!adding)}
        className="w-full py-2.5 text-[11px] font-semibold rounded-btn mb-3"
        style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
      >
        + New Theme
      </button>

      {adding && (
        <div className="rounded-card p-3 mb-3 flex flex-col gap-2" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="px-3 py-2 text-xs rounded-btn outline-none" style={inputStyle} />
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description (optional)" className="px-3 py-2 text-xs rounded-btn outline-none" style={inputStyle} />
          <input value={form.previewUrl} onChange={(e) => setForm({ ...form, previewUrl: e.target.value })} placeholder="Preview URL (optional)" className="px-3 py-2 text-xs rounded-btn outline-none" style={inputStyle} />
          <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Palette</p>
          <div className="grid grid-cols-3 gap-2">
            {(['bg', 'surface', 'surface2', 'accent', 'teal', 'gold'] as const).map((key) => (
              <div key={key} className="flex items-center gap-1">
                <input type="color" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="w-6 h-6 rounded border-0 p-0 cursor-pointer" />
                <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{key}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input value={form.priceStars} onChange={(e) => setForm({ ...form, priceStars: e.target.value.replace(/\D/g, '') })} placeholder="Stars" inputMode="numeric" className="px-2 py-2 text-xs rounded-btn outline-none" style={inputStyle} />
            <input value={form.priceTon} onChange={(e) => setForm({ ...form, priceTon: e.target.value.replace(/[^0-9.]/g, '') })} placeholder="TON" inputMode="decimal" className="px-2 py-2 text-xs rounded-btn outline-none" style={inputStyle} />
          </div>
          <label className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--text)' }}>
            <input type="checkbox" checked={form.plusOnly} onChange={(e) => setForm({ ...form, plusOnly: e.target.checked })} />
            Plus only
          </label>
          {err && <p className="text-[10px]" style={{ color: '#ff6b6b' }}>{err}</p>}
          <button
            onClick={handleCreate}
            disabled={!form.name.trim() || create.isPending}
            className="py-2 text-[11px] font-semibold rounded-btn"
            style={{ backgroundColor: 'var(--teal)', color: '#000', border: 'none', cursor: 'pointer', opacity: create.isPending ? 0.5 : 1 }}
          >
            {create.isPending ? t('creating') : t('publish')}
          </button>
        </div>
      )}

      {catalog.isLoading && <p className="text-xs py-4" style={{ color: 'var(--text-muted)' }}>{t('loading')}</p>}
      <div className="flex flex-col gap-2">
        {catalog.data?.map((th: Theme) => (
          <div key={th.id} className="rounded-card p-3 flex items-center gap-3" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex gap-0.5 shrink-0">
              {[
                (th.palette as unknown as Record<string, string>).bg,
                (th.palette as unknown as Record<string, string>).accent,
                (th.palette as unknown as Record<string, string>).teal,
              ].map((c, i) => (
                <div key={i} className="w-4 h-4 rounded-full" style={{ backgroundColor: c, border: '1px solid rgba(255,255,255,0.1)' }} />
              ))}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>
                {th.name} {th.plusOnly ? '(Plus)' : ''}
              </p>
              <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                {th.priceStars ?? '-'} ★ · {th.priceTon ?? '-'} TON
              </p>
            </div>
            <button
              onClick={() => retire.mutate(th.id)}
              className="text-[10px] px-2 py-1 rounded-btn shrink-0"
              style={{ backgroundColor: 'var(--surface2)', color: 'var(--text-muted)', border: '1px solid var(--border)', cursor: 'pointer' }}
            >
              Retire
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

/* ─── Plus Plans CRUD ─── */

function PlusTab() {
  const { t } = useTranslation();
  const plans = usePlusPlans();
  const create = useAdminCreatePlan();
  const retire = useAdminRetirePlan();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', durationDays: '30', priceStars: '', priceTon: '', priceFiat: '' });
  const [err, setErr] = useState<string | null>(null);

  const handleCreate = async () => {
    setErr(null);
    try {
      await create.mutateAsync({
        name: form.name.trim(),
        durationDays: parseInt(form.durationDays, 10),
        priceStars: form.priceStars ? parseInt(form.priceStars, 10) : undefined,
        priceTon: form.priceTon ? parseFloat(form.priceTon) : undefined,
        priceFiat: form.priceFiat ? parseFloat(form.priceFiat) : undefined,
      });
      setAdding(false);
      setForm({ name: '', durationDays: '30', priceStars: '', priceTon: '', priceFiat: '' });
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Error');
    }
  };

  return (
    <>
      <button
        onClick={() => setAdding(!adding)}
        className="w-full py-2.5 text-[11px] font-semibold rounded-btn mb-3"
        style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
      >
        + New Plan
      </button>

      {adding && (
        <div className="rounded-card p-3 mb-3 flex flex-col gap-2" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Plan name (e.g. Monthly)" className="px-3 py-2 text-xs rounded-btn outline-none" style={inputStyle} />
          <input value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: e.target.value.replace(/\D/g, '') })} placeholder="Duration (days)" inputMode="numeric" className="px-3 py-2 text-xs rounded-btn outline-none" style={inputStyle} />
          <div className="grid grid-cols-3 gap-2">
            <input value={form.priceStars} onChange={(e) => setForm({ ...form, priceStars: e.target.value.replace(/\D/g, '') })} placeholder="Stars" inputMode="numeric" className="px-2 py-2 text-xs rounded-btn outline-none" style={inputStyle} />
            <input value={form.priceTon} onChange={(e) => setForm({ ...form, priceTon: e.target.value.replace(/[^0-9.]/g, '') })} placeholder="TON" inputMode="decimal" className="px-2 py-2 text-xs rounded-btn outline-none" style={inputStyle} />
            <input value={form.priceFiat} onChange={(e) => setForm({ ...form, priceFiat: e.target.value.replace(/[^0-9.]/g, '') })} placeholder="Fiat $" inputMode="decimal" className="px-2 py-2 text-xs rounded-btn outline-none" style={inputStyle} />
          </div>
          {err && <p className="text-[10px]" style={{ color: '#ff6b6b' }}>{err}</p>}
          <button
            onClick={handleCreate}
            disabled={!form.name.trim() || !form.durationDays || create.isPending}
            className="py-2 text-[11px] font-semibold rounded-btn"
            style={{ backgroundColor: 'var(--teal)', color: '#000', border: 'none', cursor: 'pointer', opacity: create.isPending ? 0.5 : 1 }}
          >
            {create.isPending ? t('creating') : t('publish')}
          </button>
        </div>
      )}

      {plans.isLoading && <p className="text-xs py-4" style={{ color: 'var(--text-muted)' }}>{t('loading')}</p>}
      <div className="flex flex-col gap-2">
        {plans.data?.map((p: PlusPlan) => (
          <div key={p.id} className="rounded-card p-3 flex items-center gap-3" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{p.name}</p>
              <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                {p.durationDays}d · {p.priceStars ?? '-'} ★ · {p.priceTon ?? '-'} TON
              </p>
            </div>
            <button
              onClick={() => retire.mutate(p.id)}
              className="text-[10px] px-2 py-1 rounded-btn shrink-0"
              style={{ backgroundColor: 'var(--surface2)', color: 'var(--text-muted)', border: '1px solid var(--border)', cursor: 'pointer' }}
            >
              Retire
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

/* ─── Withdrawals ─── */

function WithdrawalsTab() {
  const { t } = useTranslation();
  const pending = useAdminPendingWithdrawals();
  const process = useAdminProcessWithdrawal();

  return (
    <>
      {pending.data && pending.data.length === 0 && (
        <p className="text-xs py-4" style={{ color: 'var(--text-muted)' }}>{t('noSubmissions')}</p>
      )}
      <div className="flex flex-col gap-2">
        {pending.data?.map((w) => (
          <div key={w.id} className="rounded-card p-3" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
              {w.netAmount} TON → {w.tonAddress.slice(0, 8)}…{w.tonAddress.slice(-6)}
            </p>
            <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
              Gross {w.grossAmount} · fee {w.feeAmount}
            </p>
            <button
              onClick={() => process.mutate(w.id)}
              disabled={process.isPending}
              className="mt-2 text-[11px] font-semibold px-3 py-1.5 rounded-btn"
              style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', opacity: process.isPending ? 0.5 : 1 }}
            >
              Process
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

/* ─── Main ─── */

function Admin({ onBack }: AdminProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<AdminTab>('dashboard');

  return (
    <div className="px-4 pt-2 pb-24">
      <button
        onClick={onBack}
        className="text-[11px] font-medium mb-3"
        style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        ← {t('back')}
      </button>

      <div className="flex gap-1.5 mb-4 overflow-x-auto no-scrollbar">
        {TABS.map((tb) => {
          const active = tab === tb.key;
          return (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className="px-3 py-1.5 text-[10px] font-semibold rounded-btn whitespace-nowrap shrink-0"
              style={{
                backgroundColor: active ? 'var(--accent)' : 'var(--surface2)',
                color: active ? '#fff' : 'var(--text-muted)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
              }}
            >
              {tb.label}
            </button>
          );
        })}
      </div>

      {tab === 'dashboard' && <DashboardTab />}
      {tab === 'gifts' && <GiftsTab />}
      {tab === 'themes' && <ThemesTab />}
      {tab === 'plus' && <PlusTab />}
      {tab === 'withdrawals' && <WithdrawalsTab />}
    </div>
  );
}

export default Admin;
