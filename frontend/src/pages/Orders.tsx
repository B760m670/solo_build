import { useState } from 'react';
import { useTranslation } from '../lib/i18n';
import { useUser } from '../hooks/useUser';
import {
  useMyOrders,
  useAcceptOrder,
  useDeliverOrder,
  useCompleteOrder,
  useDisputeOrder,
  useCancelOrder,
  type OrderRole,
} from '../hooks/useOrders';
import { useCreateReview } from '../hooks/useReviews';
import type { Order, OrderStatus } from '@unisouq/shared';

interface OrdersProps {
  onBack: () => void;
}

const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: 'var(--text-muted)',
  PAID: 'var(--teal)',
  IN_PROGRESS: 'var(--accent)',
  DELIVERED: 'var(--accent)',
  COMPLETED: 'var(--teal)',
  DISPUTED: '#ff6b6b',
  CANCELLED: 'var(--text-muted)',
  REFUNDED: 'var(--text-muted)',
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useTranslation();
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: 'var(--surface2)', color: STATUS_COLOR[status] }}
    >
      {t(`status${status}`)}
    </span>
  );
}

function OrderCard({ order, role }: { order: Order; role: 'buyer' | 'seller' }) {
  const { t } = useTranslation();
  const accept = useAcceptOrder();
  const deliver = useDeliverOrder();
  const complete = useCompleteOrder();
  const dispute = useDisputeOrder();
  const cancel = useCancelOrder();
  const review = useCreateReview();

  const [deliverText, setDeliverText] = useState('');
  const [disputeText, setDisputeText] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [mode, setMode] = useState<'idle' | 'deliver' | 'dispute' | 'review'>('idle');

  const counterparty = role === 'buyer' ? order.seller : order.buyer;
  const title = order.listing?.title ?? order.listingId;

  const canAccept = role === 'seller' && order.status === 'PAID';
  const canDeliver = role === 'seller' && order.status === 'IN_PROGRESS';
  const canComplete = role === 'buyer' && order.status === 'DELIVERED';
  const canDispute = order.status === 'DELIVERED' || order.status === 'IN_PROGRESS';
  const canCancel = order.status === 'PENDING' || order.status === 'PAID';
  const canReview = order.status === 'COMPLETED';

  const submitDeliver = async () => {
    if (deliverText.trim().length < 1) return;
    await deliver.mutateAsync({ id: order.id, body: { deliverable: deliverText.trim() } });
    setDeliverText('');
    setMode('idle');
  };
  const submitDispute = async () => {
    if (disputeText.trim().length < 10) return;
    await dispute.mutateAsync({ id: order.id, body: { reason: disputeText.trim() } });
    setDisputeText('');
    setMode('idle');
  };
  const submitReview = async () => {
    await review.mutateAsync({ orderId: order.id, rating, comment: comment.trim() || undefined });
    setComment('');
    setMode('idle');
  };

  const btn = (label: string, onClick: () => void, primary = false, disabled = false) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="text-[11px] font-semibold px-3 py-1.5 rounded-btn"
      style={{
        backgroundColor: primary ? 'var(--accent)' : 'var(--surface2)',
        color: primary ? '#fff' : 'var(--text)',
        border: primary ? 'none' : '1px solid var(--border)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {label}
    </button>
  );

  return (
    <div
      className="rounded-card p-3 mb-2"
      style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-sm font-semibold flex-1 truncate" style={{ color: 'var(--text)' }}>
          {title}
        </p>
        <StatusBadge status={order.status} />
      </div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
          {counterparty?.firstName ?? ''}
          {counterparty?.username ? ` · @${counterparty.username}` : ''}
        </p>
        <p className="text-[11px] font-bold" style={{ color: 'var(--gold)' }}>
          {order.priceStars} ★
        </p>
      </div>

      {order.deliverable && (
        <div
          className="rounded-btn p-2 mb-2 text-[11px] whitespace-pre-wrap break-words"
          style={{ backgroundColor: 'var(--surface2)', color: 'var(--text)' }}
        >
          {order.deliverable}
        </div>
      )}

      {order.disputeReason && (
        <div
          className="rounded-btn p-2 mb-2 text-[11px] whitespace-pre-wrap break-words"
          style={{ backgroundColor: 'var(--surface2)', color: '#ff6b6b' }}
        >
          {order.disputeReason}
        </div>
      )}

      {mode === 'deliver' && (
        <div className="mb-2">
          <textarea
            value={deliverText}
            onChange={(e) => setDeliverText(e.target.value)}
            placeholder={t('deliverablePlaceholder')}
            rows={3}
            className="w-full px-3 py-2 text-xs rounded-btn outline-none resize-none"
            style={{ backgroundColor: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' }}
          />
          <div className="flex gap-2 mt-2 justify-end">
            {btn(t('cancel'), () => setMode('idle'))}
            {btn(t('deliver'), submitDeliver, true, deliver.isPending || !deliverText.trim())}
          </div>
        </div>
      )}

      {mode === 'dispute' && (
        <div className="mb-2">
          <textarea
            value={disputeText}
            onChange={(e) => setDisputeText(e.target.value)}
            placeholder={t('disputePlaceholder')}
            rows={3}
            className="w-full px-3 py-2 text-xs rounded-btn outline-none resize-none"
            style={{ backgroundColor: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' }}
          />
          <div className="flex gap-2 mt-2 justify-end">
            {btn(t('cancel'), () => setMode('idle'))}
            {btn(t('openDispute'), submitDispute, true, dispute.isPending || disputeText.trim().length < 10)}
          </div>
        </div>
      )}

      {mode === 'review' && (
        <div className="mb-2">
          <p className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>{t('rating')}</p>
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setRating(n)}
                className="w-8 h-8 rounded-btn text-sm font-bold"
                style={{
                  backgroundColor: n <= rating ? 'var(--gold)' : 'var(--surface2)',
                  color: n <= rating ? '#000' : 'var(--text-muted)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                }}
              >
                {n}
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('commentOptional')}
            rows={2}
            className="w-full px-3 py-2 text-xs rounded-btn outline-none resize-none"
            style={{ backgroundColor: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' }}
          />
          <div className="flex gap-2 mt-2 justify-end">
            {btn(t('cancel'), () => setMode('idle'))}
            {btn(t('leaveReview'), submitReview, true, review.isPending)}
          </div>
        </div>
      )}

      {mode === 'idle' && (
        <div className="flex flex-wrap gap-2 justify-end">
          {canAccept && btn(t('accept'), () => accept.mutate({ id: order.id }), true, accept.isPending)}
          {canDeliver && btn(t('deliver'), () => setMode('deliver'), true)}
          {canComplete && btn(t('markComplete'), () => complete.mutate({ id: order.id }), true, complete.isPending)}
          {canDispute && btn(t('openDispute'), () => setMode('dispute'))}
          {canCancel && btn(t('cancel'), () => cancel.mutate({ id: order.id, body: {} }), false, cancel.isPending)}
          {canReview && btn(t('leaveReview'), () => setMode('review'), true)}
        </div>
      )}
    </div>
  );
}

function Orders({ onBack }: OrdersProps) {
  const { t } = useTranslation();
  const userQ = useUser();
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const apiRole: OrderRole = role;
  const ordersQ = useMyOrders(apiRole);

  const me = userQ.data;

  return (
    <div className="px-4 pt-2 pb-24">
      <button
        onClick={onBack}
        className="text-[11px] font-medium mb-3"
        style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        ← {t('back')}
      </button>

      <p className="text-sm font-bold mb-3" style={{ color: 'var(--text)' }}>{t('myOrders')}</p>

      <div className="flex gap-2 mb-3">
        {(['buyer', 'seller'] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className="flex-1 text-[11px] font-semibold py-2 rounded-btn"
            style={{
              backgroundColor: role === r ? 'var(--accent)' : 'var(--surface2)',
              color: role === r ? '#fff' : 'var(--text-muted)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
            }}
          >
            {t(r === 'buyer' ? 'buying' : 'selling')}
          </button>
        ))}
      </div>

      {ordersQ.isLoading && (
        <p className="text-xs text-center py-10" style={{ color: 'var(--text-muted)' }}>{t('loading')}</p>
      )}

      {ordersQ.data && ordersQ.data.length === 0 && (
        <p className="text-xs text-center py-10" style={{ color: 'var(--text-muted)' }}>{t('noOrders')}</p>
      )}

      {ordersQ.data?.map((o) => {
        const asRole: 'buyer' | 'seller' = me && o.sellerId === me.id ? 'seller' : 'buyer';
        return <OrderCard key={o.id} order={o} role={asRole} />;
      })}
    </div>
  );
}

export default Orders;
