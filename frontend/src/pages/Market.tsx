import { useState } from 'react';
import { useTranslation } from '../lib/i18n';
import { useListings, useListing, useCreateListing } from '../hooks/useMarketplace';
import { usePlaceOrder } from '../hooks/useOrders';
import type { Listing, ListingCategory, ReputationTier } from '@unisouq/shared';
import { PlusIcon, SearchIcon } from '../components/Icons';

const CATEGORIES: (ListingCategory | null)[] = [null, 'DESIGN', 'WRITING', 'DEVELOPMENT', 'MARKETING', 'VIDEO', 'OTHER'];

function TierBadge({ tier }: { tier: ReputationTier }) {
  const { t } = useTranslation();
  const color = tier === 'ELITE' ? 'var(--gold)' : tier === 'EXPERT' ? 'var(--accent)' : tier === 'TRUSTED' ? 'var(--teal)' : 'var(--text-muted)';
  return (
    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--surface2)', color }}>
      {t(`tier${tier}`)}
    </span>
  );
}

function ListingDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const { t } = useTranslation();
  const q = useListing(id);
  const place = usePlaceOrder();
  const [err, setErr] = useState<string | null>(null);

  const listing = q.data;
  if (!listing) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('loading')}</p>
      </div>
    );
  }

  const handleOrder = async () => {
    setErr(null);
    try {
      const result = await place.mutateAsync(listing.id);
      if (result.status === 'paid') {
        onClose();
      } else if (result.status === 'failed') {
        setErr(t('paymentFailed'));
      } else if (result.status === 'cancelled') {
        setErr(t('paymentCancelled'));
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Error');
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div
        className="w-full rounded-t-card p-5 max-h-[85vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-base font-bold mb-1" style={{ color: 'var(--text)' }}>{listing.title}</p>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {listing.seller?.firstName ?? '—'}
          </span>
          {listing.seller?.reputationTier && <TierBadge tier={listing.seller.reputationTier} />}
        </div>
        <p className="text-xs mb-4 whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
          {listing.description}
        </p>
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-bold" style={{ color: 'var(--gold)' }}>
            {listing.priceStars} ★
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {t('deliveryDays', { days: listing.deliveryDays })}
          </span>
        </div>
        <p className="text-[10px] mb-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {t('payWithTelegramStars')}
        </p>
        {err && <p className="text-[11px] mb-2" style={{ color: '#ff6b6b' }}>{err}</p>}
        <button
          onClick={handleOrder}
          disabled={place.isPending}
          className="w-full py-3 text-sm font-semibold rounded-btn"
          style={{
            backgroundColor: 'var(--accent)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            opacity: place.isPending ? 0.6 : 1,
          }}
        >
          {place.isPending ? t('processing') : t('orderNow')}
        </button>
        <button
          onClick={onClose}
          className="w-full py-2 text-xs mt-2"
          style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {t('close')}
        </button>
      </div>
    </div>
  );
}

function CreateListingSheet({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const create = useCreateListing();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ListingCategory>('DEVELOPMENT');
  const [priceStars, setPriceStars] = useState('100');
  const [deliveryDays, setDeliveryDays] = useState('3');
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async () => {
    setErr(null);
    try {
      await create.mutateAsync({
        title,
        description,
        category,
        priceStars: parseInt(priceStars, 10),
        deliveryDays: parseInt(deliveryDays, 10),
      });
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Error');
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div
        className="w-full rounded-t-card p-5 max-h-[85vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-base font-bold mb-3" style={{ color: 'var(--text)' }}>{t('createListing')}</p>
        <div className="flex flex-col gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('title')}
            className="px-3 py-2 text-sm rounded-btn outline-none"
            style={{ backgroundColor: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' }}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('description')}
            rows={4}
            className="px-3 py-2 text-sm rounded-btn outline-none resize-none"
            style={{ backgroundColor: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' }}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ListingCategory)}
            className="px-3 py-2 text-sm rounded-btn outline-none"
            style={{ backgroundColor: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' }}
          >
            {(['DESIGN', 'WRITING', 'DEVELOPMENT', 'MARKETING', 'VIDEO', 'OTHER'] as ListingCategory[]).map((c) => (
              <option key={c} value={c}>{t(`cat${c}`)}</option>
            ))}
          </select>
          <input
            value={priceStars}
            onChange={(e) => setPriceStars(e.target.value.replace(/\D/g, ''))}
            placeholder={t('priceStars')}
            inputMode="numeric"
            className="px-3 py-2 text-sm rounded-btn outline-none"
            style={{ backgroundColor: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' }}
          />
          <input
            value={deliveryDays}
            onChange={(e) => setDeliveryDays(e.target.value.replace(/\D/g, ''))}
            placeholder={t('deliveryDaysLabel')}
            inputMode="numeric"
            className="px-3 py-2 text-sm rounded-btn outline-none"
            style={{ backgroundColor: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' }}
          />
        </div>
        {err && <p className="text-[11px] mt-2" style={{ color: '#ff6b6b' }}>{err}</p>}
        <button
          onClick={handleSubmit}
          disabled={create.isPending}
          className="w-full mt-4 py-3 text-sm font-semibold rounded-btn"
          style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', opacity: create.isPending ? 0.6 : 1 }}
        >
          {create.isPending ? t('creating') : t('publish')}
        </button>
        <button
          onClick={onClose}
          className="w-full py-2 text-xs mt-2"
          style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {t('close')}
        </button>
      </div>
    </div>
  );
}

function ListingCard({ listing, onOpen }: { listing: Listing; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="text-left rounded-card p-3 flex flex-col gap-2"
      style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer' }}
    >
      <p className="text-sm font-semibold line-clamp-2" style={{ color: 'var(--text)' }}>{listing.title}</p>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          {listing.seller?.firstName ?? '—'}
        </span>
        {listing.seller?.reputationTier && <TierBadge tier={listing.seller.reputationTier} />}
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-sm font-bold" style={{ color: 'var(--gold)' }}>{listing.priceStars} ★</span>
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          {listing.averageRating > 0 ? `${listing.averageRating.toFixed(1)} (${listing.reviewCount})` : '—'}
        </span>
      </div>
    </button>
  );
}

function Market() {
  const { t } = useTranslation();
  const [category, setCategory] = useState<ListingCategory | null>(null);
  const [search, setSearch] = useState('');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const q = useListings({ category: category ?? undefined, search: search || undefined });

  return (
    <div className="px-4 pt-2 pb-24">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 flex items-center gap-2 rounded-btn px-3 py-2" style={{ backgroundColor: 'var(--surface2)', border: '1px solid var(--border)' }}>
          <SearchIcon size={14} color="var(--text-muted)" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchMarketplace')}
            className="flex-1 bg-transparent text-xs outline-none"
            style={{ color: 'var(--text)' }}
          />
        </div>
        <button
          onClick={() => setCreating(true)}
          className="w-9 h-9 rounded-btn flex items-center justify-center"
          style={{ backgroundColor: 'var(--accent)', border: 'none', cursor: 'pointer' }}
        >
          <PlusIcon size={16} color="#fff" />
        </button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto mb-4 -mx-4 px-4 no-scrollbar">
        {CATEGORIES.map((c) => {
          const isActive = c === category;
          return (
            <button
              key={c ?? 'all'}
              onClick={() => setCategory(c)}
              className="text-[11px] font-medium px-3 py-1.5 rounded-full whitespace-nowrap"
              style={{
                backgroundColor: isActive ? 'var(--accent)' : 'var(--surface2)',
                color: isActive ? '#fff' : 'var(--text-muted)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
              }}
            >
              {c ? t(`cat${c}`) : t('catAll')}
            </button>
          );
        })}
      </div>

      {q.isLoading && <p className="text-xs text-center py-8" style={{ color: 'var(--text-muted)' }}>{t('loading')}</p>}
      {q.isError && <p className="text-xs text-center py-8" style={{ color: '#ff6b6b' }}>{t('failedLoadListings')}</p>}
      {q.data && q.data.length === 0 && <p className="text-xs text-center py-8" style={{ color: 'var(--text-muted)' }}>{t('noListings')}</p>}

      {q.data && q.data.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {q.data.map((l) => (
            <ListingCard key={l.id} listing={l} onOpen={() => setDetailId(l.id)} />
          ))}
        </div>
      )}

      {detailId && <ListingDetail id={detailId} onClose={() => setDetailId(null)} />}
      {creating && <CreateListingSheet onClose={() => setCreating(false)} />}
    </div>
  );
}

export default Market;
