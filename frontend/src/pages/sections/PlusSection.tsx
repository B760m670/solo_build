import { useState } from 'react';
import { useTranslation } from '../../lib/i18n';
import { SectionHeader } from '../../components/SectionHeader';
import { CrownIcon } from '../../components/Icons';
import { usePlusPlans, useMyPlus, useSubscribePlus } from '../../hooks/usePlus';
import type { Currency, PlusPlan } from '@unisouq/shared';

function PlanCard({
  plan,
  onSelect,
}: {
  plan: PlusPlan;
  onSelect: (plan: PlusPlan) => void;
}) {
  return (
    <button
      onClick={() => onSelect(plan)}
      className="text-left rounded-card p-4"
      style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        cursor: 'pointer',
      }}
    >
      <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>
        {plan.name}
      </p>
      <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
        {plan.durationDays} days
      </p>
      <div className="flex items-center gap-3 mt-3">
        {plan.priceStars != null && (
          <span className="text-[11px] font-semibold" style={{ color: 'var(--gold)' }}>
            {plan.priceStars} ★
          </span>
        )}
        {plan.priceTon != null && (
          <span className="text-[11px] font-semibold" style={{ color: 'var(--teal)' }}>
            {plan.priceTon} TON
          </span>
        )}
      </div>
    </button>
  );
}

function SubscribeSheet({
  plan,
  onClose,
}: {
  plan: PlusPlan;
  onClose: () => void;
}) {
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
        <div className="flex items-center gap-2 mb-1">
          <CrownIcon size={18} color="var(--gold)" />
          <p className="text-base font-bold" style={{ color: 'var(--text)' }}>
            {plan.name}
          </p>
        </div>
        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
          {plan.durationDays} days of Unisouq Plus
        </p>
        <div className="flex flex-col gap-2 mt-4">
          {plan.priceStars != null && (
            <button
              onClick={() => doSub('STARS')}
              disabled={subscribe.isPending}
              className="w-full py-3 text-sm font-semibold rounded-btn"
              style={{ backgroundColor: 'var(--gold)', color: '#000', border: 'none', cursor: 'pointer', opacity: subscribe.isPending ? 0.5 : 1 }}
            >
              {plan.priceStars} ★
            </button>
          )}
          {plan.priceTon != null && (
            <button
              onClick={() => doSub('TON')}
              disabled={subscribe.isPending}
              className="w-full py-3 text-sm font-semibold rounded-btn"
              style={{ backgroundColor: 'var(--teal)', color: '#000', border: 'none', cursor: 'pointer', opacity: subscribe.isPending ? 0.5 : 1 }}
            >
              {plan.priceTon} TON
            </button>
          )}
        </div>
        {err && <p className="text-[11px] mt-2" style={{ color: '#ff6b6b' }}>{err}</p>}
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

      {isActive && (
        <div
          className="rounded-card p-4 mb-4 flex items-center gap-3"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--gold)' }}
        >
          <CrownIcon size={24} color="var(--gold)" />
          <div>
            <p className="text-xs font-bold" style={{ color: 'var(--gold)' }}>
              Unisouq Plus
            </p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              Active until{' '}
              {new Date(me.data!.activeUntil!).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}

      {plans.isLoading && (
        <p className="text-xs py-8 text-center" style={{ color: 'var(--text-muted)' }}>
          {t('loading')}
        </p>
      )}
      <div className="flex flex-col gap-3">
        {plans.data?.map((p) => (
          <PlanCard key={p.id} plan={p} onSelect={setSelected} />
        ))}
      </div>

      {!plans.isLoading && plans.data && plans.data.length === 0 && (
        <p className="text-xs py-8 text-center" style={{ color: 'var(--text-muted)' }}>
          {t('emptyCatalog')}
        </p>
      )}

      {selected && (
        <SubscribeSheet plan={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
