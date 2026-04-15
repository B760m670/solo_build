import { useState } from 'react';
import { useTranslation } from '../lib/i18n';
import {
  useAdminDashboard,
  useAdminPendingTasks,
  useAdminDisputes,
  useAdminApproveTask,
  useAdminRejectTask,
  useAdminCreateBrandTask,
} from '../hooks/useAdmin';
import type { TaskProofType } from '@unisouq/shared';

interface AdminProps {
  onBack: () => void;
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-card p-3" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-sm font-bold mt-1" style={{ color: 'var(--text)' }}>{value}</p>
    </div>
  );
}

function CreateBrandTaskSheet({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const create = useAdminCreateBrandTask();
  const [brandName, setBrandName] = useState('');
  const [brandLogo, setBrandLogo] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [proofType, setProofType] = useState<TaskProofType>('SCREENSHOT');
  const [rewardStars, setRewardStars] = useState('50');
  const [totalSlots, setTotalSlots] = useState('100');
  const [fundedTon, setFundedTon] = useState('0');
  const [err, setErr] = useState<string | null>(null);

  const inputStyle = {
    backgroundColor: 'var(--surface2)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
  };

  const canSubmit =
    brandName.trim().length >= 1 &&
    title.trim().length >= 1 &&
    description.trim().length >= 1 &&
    parseInt(rewardStars, 10) >= 1 &&
    parseInt(totalSlots, 10) >= 1;

  const handleSubmit = async () => {
    setErr(null);
    try {
      await create.mutateAsync({
        brandName: brandName.trim(),
        brandLogo: brandLogo.trim() || undefined,
        title: title.trim(),
        description: description.trim(),
        proofType,
        rewardStars: parseInt(rewardStars, 10),
        totalSlots: parseInt(totalSlots, 10),
        fundedTon: parseFloat(fundedTon) || 0,
      });
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Error');
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div
        className="w-full rounded-t-card p-5 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-base font-bold mb-3" style={{ color: 'var(--text)' }}>{t('createBrandTask')}</p>
        <div className="flex flex-col gap-2">
          <input
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder={t('brandName')}
            maxLength={64}
            className="px-3 py-2 text-sm rounded-btn outline-none"
            style={inputStyle}
          />
          <input
            value={brandLogo}
            onChange={(e) => setBrandLogo(e.target.value)}
            placeholder={t('brandLogoUrlOptional')}
            className="px-3 py-2 text-sm rounded-btn outline-none"
            style={inputStyle}
          />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('title')}
            maxLength={120}
            className="px-3 py-2 text-sm rounded-btn outline-none"
            style={inputStyle}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('description')}
            rows={4}
            maxLength={2000}
            className="px-3 py-2 text-sm rounded-btn outline-none resize-none"
            style={inputStyle}
          />
          <div>
            <p className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>{t('proofType')}</p>
            <div className="flex gap-2">
              {(['SCREENSHOT', 'LINK', 'TEXT'] as TaskProofType[]).map((p) => {
                const active = proofType === p;
                return (
                  <button
                    key={p}
                    onClick={() => setProofType(p)}
                    className="flex-1 py-2 text-[11px] font-semibold rounded-btn"
                    style={{
                      backgroundColor: active ? 'var(--accent)' : 'var(--surface2)',
                      color: active ? '#fff' : 'var(--text)',
                      border: '1px solid var(--border)',
                      cursor: 'pointer',
                    }}
                  >
                    {t(`proofType${p}`)}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>{t('rewardStarsLabel')}</p>
              <input
                value={rewardStars}
                onChange={(e) => setRewardStars(e.target.value.replace(/\D/g, ''))}
                inputMode="numeric"
                className="w-full px-3 py-2 text-sm rounded-btn outline-none"
                style={inputStyle}
              />
            </div>
            <div>
              <p className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>{t('totalSlots')}</p>
              <input
                value={totalSlots}
                onChange={(e) => setTotalSlots(e.target.value.replace(/\D/g, ''))}
                inputMode="numeric"
                className="w-full px-3 py-2 text-sm rounded-btn outline-none"
                style={inputStyle}
              />
            </div>
          </div>
          <div>
            <p className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>{t('fundedTonLabel')}</p>
            <input
              value={fundedTon}
              onChange={(e) => setFundedTon(e.target.value.replace(/[^0-9.]/g, ''))}
              inputMode="decimal"
              className="w-full px-3 py-2 text-sm rounded-btn outline-none"
              style={inputStyle}
            />
          </div>
        </div>
        {err && <p className="text-[11px] mt-2" style={{ color: '#ff6b6b' }}>{err}</p>}
        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-sm font-semibold rounded-btn"
            style={{ backgroundColor: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)', cursor: 'pointer' }}
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || create.isPending}
            className="flex-1 py-3 text-sm font-semibold rounded-btn"
            style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', opacity: !canSubmit || create.isPending ? 0.5 : 1 }}
          >
            {create.isPending ? t('creating') : t('publish')}
          </button>
        </div>
      </div>
    </div>
  );
}

function Admin({ onBack }: AdminProps) {
  const { t } = useTranslation();
  const dashboard = useAdminDashboard();
  const pending = useAdminPendingTasks();
  const disputes = useAdminDisputes();
  const approve = useAdminApproveTask();
  const reject = useAdminRejectTask();
  const [rejectFor, setRejectFor] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [creatingTask, setCreatingTask] = useState(false);

  return (
    <div className="px-4 pt-2 pb-24">
      <button
        onClick={onBack}
        className="text-[11px] font-medium mb-3"
        style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        ← {t('back')}
      </button>

      <p className="text-sm font-bold mb-3" style={{ color: 'var(--text)' }}>{t('platformStats')}</p>
      {dashboard.isLoading && <p className="text-xs py-4" style={{ color: 'var(--text-muted)' }}>{t('loading')}</p>}
      {dashboard.data && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          <StatCard label={t('users')} value={dashboard.data.users.total} />
          <StatCard label={t('last7days')} value={dashboard.data.users.recentSignups} />
          <StatCard label={t('activeListings')} value={`${dashboard.data.listings.active}/${dashboard.data.listings.total}`} />
          <StatCard label={t('totalOrders')} value={`${dashboard.data.orders.completed}/${dashboard.data.orders.total}`} />
          <StatCard label={t('gmvStars')} value={`${dashboard.data.economy.gmvStars} ★`} />
          <StatCard label={t('commissionStars')} value={`${dashboard.data.economy.commissionStars} ★`} />
        </div>
      )}

      {dashboard.data && (
        <div className="rounded-card p-3 mb-4" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="text-[11px] font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>{t('tierDistribution')}</p>
          <div className="grid grid-cols-4 gap-2">
            {(['NEW', 'TRUSTED', 'EXPERT', 'ELITE'] as const).map((tier) => (
              <div key={tier}>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t(`tier${tier}`)}</p>
                <p className="text-xs font-bold" style={{ color: 'var(--text)' }}>{dashboard.data.users.tiers[tier] ?? 0}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setCreatingTask(true)}
        className="w-full py-3 text-sm font-semibold rounded-btn mb-4"
        style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
      >
        + {t('createBrandTask')}
      </button>

      <p className="text-sm font-bold mb-2" style={{ color: 'var(--text)' }}>{t('taskReviewQueue')}</p>
      {pending.data && pending.data.length === 0 && (
        <p className="text-xs py-4" style={{ color: 'var(--text-muted)' }}>{t('noSubmissions')}</p>
      )}
      <div className="flex flex-col gap-2 mb-4">
        {pending.data?.map((ut) => (
          <div key={ut.id} className="rounded-card p-3" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
              {ut.task?.brandName} — {ut.task?.title}
            </p>
            <p className="text-[11px] mt-1 whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
              {ut.proof}
            </p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => approve.mutate(ut.id)}
                className="text-[11px] font-semibold px-3 py-1.5 rounded-btn flex-1"
                style={{ backgroundColor: 'var(--teal)', color: '#000', border: 'none', cursor: 'pointer' }}
              >
                {t('approve')}
              </button>
              <button
                onClick={() => setRejectFor(ut.id)}
                className="text-[11px] font-semibold px-3 py-1.5 rounded-btn flex-1"
                style={{ backgroundColor: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)', cursor: 'pointer' }}
              >
                {t('reject')}
              </button>
            </div>
            {rejectFor === ut.id && (
              <div className="mt-2 flex gap-2">
                <input
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder={t('rejectReasonPlaceholder')}
                  className="flex-1 px-3 py-2 text-xs rounded-btn outline-none"
                  style={{ backgroundColor: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' }}
                />
                <button
                  onClick={async () => {
                    await reject.mutateAsync({ userTaskId: ut.id, reason: rejectReason || undefined });
                    setRejectFor(null);
                    setRejectReason('');
                  }}
                  className="text-[11px] font-semibold px-3 py-2 rounded-btn"
                  style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
                >
                  {t('submit')}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-sm font-bold mb-2" style={{ color: 'var(--text)' }}>{t('disputes')}</p>
      {disputes.data && disputes.data.length === 0 && (
        <p className="text-xs py-4" style={{ color: 'var(--text-muted)' }}>{t('noDisputes')}</p>
      )}
      <div className="flex flex-col gap-2">
        {disputes.data?.map((o) => (
          <div key={o.id} className="rounded-card p-3" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{o.listing?.title ?? o.id}</p>
            <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
              {o.buyer?.firstName} → {o.seller?.firstName} · {o.priceStars} ★
            </p>
            {o.disputeReason && (
              <p className="text-[11px] mt-1 whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                {o.disputeReason}
              </p>
            )}
          </div>
        ))}
      </div>

      {creatingTask && <CreateBrandTaskSheet onClose={() => setCreatingTask(false)} />}
    </div>
  );
}

export default Admin;
