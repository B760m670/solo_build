import { useState } from 'react';
import { useTranslation } from '../../lib/i18n';
import { SectionHeader } from '../../components/SectionHeader';
import { CrownIcon, StarIcon, DiamondIcon, CheckIcon, InfinityIcon, SparklesIcon, PaletteIcon, GiftIcon } from '../../components/Icons';
import { usePlusPlans, useMyPlus, useSubscribePlus } from '../../hooks/usePlus';
import type { Currency, PlusPlan } from '@unisouq/shared';

const PERKS = [
  { icon: InfinityIcon, label: 'Unlimited AI', color: 'var(--accent)' },
  { icon: PaletteIcon, label: 'Premium themes', color: 'var(--teal)' },
  { icon: GiftIcon, label: 'Gift discounts', color: 'var(--gold)' },
  { icon: SparklesIcon, label: 'Verified badge', color: 'var(--accent)' },
];

function PlanCard({ plan, onSelect }: { plan: PlusPlan; onSelect: (plan: PlusPlan) => void }) {
  const isPopular = plan.durationDays >= 28 && plan.durationDays <= 31;
  return (
    <button
      onClick={() => onSelect(plan)}
      className="text-left rounded-card p-4 transition-transform active:scale-[0.97] relative overflow-hidden"
      style={{
        backgroundColor: 'var(--surface)',
        border: isPopular ? '1px solid var(--gold)' : '1px solid var(--border)',
        cursor: 'pointer',
      }}
    >
      {isPopular && (
        <span
          className="absolute top-0 right-0 text-[7px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-bl-card"
          style={{ backgroundColor: 'var(--gold)', color: '#000' }}
        >
          Popular
        </span>
      )}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-btn flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${isPopular ? 'var(--gold)' : 'var(--accent)'}15` }}
        >
          <CrownIcon size={20} color={isPopular ? 'var(--gold)' : 'var(--accent)'} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>
            {plan.name}
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {plan.durationDays} days
          </p>
        </div>
        <div className="text-right">
          {plan.priceStars != null && (
            <span className="flex items-center gap-0.5 text-[11px] font-bold" style={{ color: 'var(--gold)' }}>
              <StarIcon size={11} color="var(--gold)" filled />
              {plan.priceStars}
            </span>
          )}
          {plan.priceTon != null && (
            <span className="flex items-center gap-0.5 text-[10px] font-bold mt-0.5" style={{ color: 'var(--teal)' }}>
              <DiamondIcon size={10} color="var(--teal)" />
              {plan.priceTon}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function SubscribeSheet({ plan, onClose }: { plan: PlusPlan; onClose: () => void }) {
  const { t } = useTranslation();
  const subscribe = useSubscribePlus();
  const [err, setErr] = useState<string | null>(null);

  const doSub = async (currency: Currency) => {
    setErr(null);
    try {
      await subscribe.mutateAsync({ planId: plan.id, currency });
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
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-card flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'rgba(245,200,66,0.12)' }}
          >
            <CrownIcon size={24} color="var(--gold)" />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{plan.name}</p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {plan.durationDays} days of Unisouq Plus
            </p>
          </div>
        </div>

        {/* Perks list */}
        <div className="flex flex-col gap-2 mb-4">
          {PERKS.map((perk, i) => {
            const Icon = perk.icon;
            return (
              <div key={i} className="flex items-center gap-2">
                <Icon size={14} color={perk.color} />
                <span className="text-[11px]" style={{ color: 'var(--text)' }}>{perk.label}</span>
              </div>
            );
          })}
        </div>

        {/* Buy buttons */}
        <div className="flex flex-col gap-2">
          {plan.priceStars != null && (
            <button
              onClick={() => doSub('STARS')}
              disabled={subscribe.isPending}
              className="w-full py-3.5 text-sm font-bold rounded-btn flex items-center justify-center gap-2 transition-opacity active:opacity-80"
              style={{ backgroundColor: 'var(--gold)', color: '#000', border: 'none', cursor: 'pointer', opacity: subscribe.isPending ? 0.5 : 1 }}
            >
              <StarIcon size={16} color="#000" filled />
              {plan.priceStars} Stars
            </button>
          )}
          {plan.priceTon != null && (
            <button
              onClick={() => doSub('TON')}
              disabled={subscribe.isPending}
              className="w-full py-3.5 text-sm font-bold rounded-btn flex items-center justify-center gap-2 transition-opacity active:opacity-80"
              style={{ backgroundColor: 'var(--teal)', color: '#000', border: 'none', cursor: 'pointer', opacity: subscribe.isPending ? 0.5 : 1 }}
            >
              <DiamondIcon size={16} color="#000" />
              {plan.priceTon} TON
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

export function PlusSection({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const plans = usePlusPlans();
  const me = useMyPlus();
  const [selected, setSelected] = useState<PlusPlan | null>(null);

  const isActive =
    me.data?.activeUntil && new Date(me.data.activeUntil) > new Date();

  return (
    <div className="px-4 pt-2 pb-24">
      <SectionHeader
        title={t('sectionPlus')}
        subtitle={t('sectionPlusDesc')}
        onBack={onBack}
        backLabel={t('back')}
      />

      {/* Active subscription banner */}
      {isActive && (
        <div
          className="rounded-card p-4 mb-5 flex items-center gap-3 relative overflow-hidden"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--gold)' }}
        >
          <div
            className="absolute inset-0 opacity-5"
            style={{ background: 'linear-gradient(135deg, var(--gold) 0%, transparent 60%)' }}
          />
          <div
            className="w-12 h-12 rounded-card flex items-center justify-center shrink-0 relative"
            style={{ backgroundColor: 'rgba(245,200,66,0.12)' }}
          >
            <CrownIcon size={24} color="var(--gold)" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold" style={{ color: 'var(--gold)' }}>
                Unisouq Plus
              </p>
              <CheckIcon size={14} color="var(--teal)" />
            </div>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Active until{' '}
              {new Date(me.data!.activeUntil!).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}

      {/* Perks showcase */}
      {!isActive && (
        <div
          className="rounded-card p-4 mb-5"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <CrownIcon size={18} color="var(--gold)" />
            <p className="text-xs font-bold" style={{ color: 'var(--text)' }}>
              Unlock Premium
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {PERKS.map((perk, i) => {
              const Icon = perk.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-btn p-2"
                  style={{ backgroundColor: 'var(--surface2)' }}
                >
                  <Icon size={14} color={perk.color} />
                  <span className="text-[10px] font-medium" style={{ color: 'var(--text)' }}>{perk.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Plans */}
      {plans.isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--gold)' }} />
        </div>
      )}
      <div className="flex flex-col gap-3">
        {plans.data?.map((p) => (
          <PlanCard key={p.id} plan={p} onSelect={setSelected} />
        ))}
      </div>

      {!plans.isLoading && plans.data && plans.data.length === 0 && (
        <div className="flex flex-col items-center py-16">
          <CrownIcon size={32} color="var(--text-muted)" />
          <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>{t('emptyCatalog')}</p>
        </div>
      )}

      {selected && (
        <SubscribeSheet plan={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
