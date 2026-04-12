import { useState } from 'react';
import { SearchIcon, PlusIcon } from '../components/Icons';
import { useListings, useCreateListing, useBuyListing } from '../hooks/useMarketplace';
import { useWallet } from '../hooks/useWallet';
import { ListingSkeleton } from '../components/Skeleton';
import ErrorState, { EmptyState } from '../components/ErrorState';
import { useTranslation } from '../lib/i18n';
import type { Listing } from '@brabble/shared';
import type { TranslationKeys } from '../lib/i18n/en';

const categories: { key: string; label: TranslationKeys }[] = [
  { key: 'All', label: 'catAll' },
  { key: 'Digital', label: 'catDigital' },
  { key: 'Services', label: 'catServices' },
  { key: 'NFT', label: 'catNFT' },
  { key: 'Other', label: 'catOther' },
];

function Market() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [buyConfirm, setBuyConfirm] = useState<Listing | null>(null);

  const listingsQuery = useListings(debouncedSearch || undefined, activeCategory !== 'All' ? activeCategory : undefined);
  const buyListing = useBuyListing();
  const walletQuery = useWallet();

  // Simple debounce on search
  const handleSearch = (value: string) => {
    setSearch(value);
    const w = window as unknown as Record<string, ReturnType<typeof setTimeout>>;
    clearTimeout(w.__brabbleSearchTimeout);
    w.__brabbleSearchTimeout = setTimeout(() => {
      setDebouncedSearch(value);
    }, 400);
  };

  const handleBuy = () => {
    if (!buyConfirm) return;
    buyListing.mutate(buyConfirm.id, {
      onSuccess: () => setBuyConfirm(null),
    });
  };

  const balance = walletQuery.data?.balance ?? 0;

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Search */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-btn border"
        style={{ borderColor: 'var(--border)', backgroundColor: 'transparent' }}
      >
        <SearchIcon size={16} color="var(--text-muted)" />
        <input
          type="text"
          placeholder={t('searchMarketplace')}
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: 'var(--text)', caretColor: 'var(--accent)' }}
        />
      </div>

      {/* Category Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className="shrink-0 px-3 py-1.5 text-[11px] font-medium rounded-full border"
            style={{
              borderColor: activeCategory === cat.key ? 'var(--accent)' : 'var(--border)',
              color: activeCategory === cat.key ? 'var(--accent)' : 'var(--text-secondary)',
              background: activeCategory === cat.key ? 'rgba(108, 99, 255, 0.08)' : 'transparent',
              cursor: 'pointer',
            }}
          >
            {t(cat.label)}
          </button>
        ))}
      </div>

      {/* Listings Grid */}
      {listingsQuery.isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => <ListingSkeleton key={i} />)}
        </div>
      ) : listingsQuery.isError ? (
        <ErrorState message={t('failedLoadListings')} onRetry={() => listingsQuery.refetch()} />
      ) : (listingsQuery.data?.length ?? 0) === 0 ? (
        <EmptyState message={t('noListings')} />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {listingsQuery.data!.map((listing) => (
            <button
              key={listing.id}
              onClick={() => setBuyConfirm(listing)}
              className="rounded-card border overflow-hidden text-left"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                cursor: 'pointer',
              }}
            >
              <div className="h-28 w-full" style={{ backgroundColor: 'var(--surface2)' }} />
              <div className="p-3">
                <p className="text-xs font-medium line-clamp-2 mb-1" style={{ color: 'var(--text)' }}>
                  {listing.title}
                </p>
                <p className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
                  {listing.price} BRB
                </p>
                {listing.seller && (
                  <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                    @{listing.seller.username || listing.seller.firstName}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* FAB — Create Listing */}
      <button
        onClick={() => setShowCreate(true)}
        className="fixed bottom-20 right-4 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
        style={{ backgroundColor: 'var(--accent)', border: 'none', cursor: 'pointer' }}
      >
        <PlusIcon size={20} color="#FFFFFF" />
      </button>

      {/* Buy Confirmation Modal */}
      {buyConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={() => setBuyConfirm(null)}
        >
          <div
            className="w-full max-w-md rounded-t-2xl p-6 space-y-4 safe-bottom"
            style={{ backgroundColor: 'var(--surface)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-base font-semibold" style={{ color: 'var(--text)' }}>
              {t('confirmPurchase')}
            </p>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-secondary)' }}>{t('item')}</span>
                <span style={{ color: 'var(--text)' }}>{buyConfirm.title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-secondary)' }}>{t('price')}</span>
                <span className="font-bold" style={{ color: 'var(--accent)' }}>
                  {buyConfirm.price} BRB
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-secondary)' }}>{t('yourBalance')}</span>
                <span style={{ color: balance >= buyConfirm.price ? 'var(--teal)' : '#FF3B30' }}>
                  {balance.toFixed(0)} BRB
                </span>
              </div>
              {balance < buyConfirm.price && (
                <p className="text-[11px]" style={{ color: '#FF3B30' }}>
                  {t('insufficientBalance')}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setBuyConfirm(null)}
                className="flex-1 py-2.5 text-sm font-medium rounded-btn border"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'transparent', cursor: 'pointer' }}
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleBuy}
                disabled={balance < buyConfirm.price || buyListing.isPending}
                className="flex-1 py-2.5 text-sm font-medium rounded-btn"
                style={{
                  backgroundColor: balance >= buyConfirm.price ? 'var(--accent)' : 'var(--surface2)',
                  color: balance >= buyConfirm.price ? '#FFFFFF' : 'var(--text-muted)',
                  border: 'none',
                  cursor: balance >= buyConfirm.price ? 'pointer' : 'default',
                }}
              >
                {buyListing.isPending ? t('processing') : t('buyNow')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Listing Modal */}
      {showCreate && (
        <CreateListingModal onClose={() => setShowCreate(false)} />
      )}
    </div>
  );
}

function CreateListingModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Digital');
  const createListing = useCreateListing();

  const handleSubmit = () => {
    if (!title.trim() || !description.trim() || !price) return;
    createListing.mutate(
      {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category,
        images: [],
      },
      { onSuccess: onClose },
    );
  };

  const isValid = title.trim() && description.trim() && parseFloat(price) > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-2xl p-6 space-y-4 safe-bottom max-h-[85vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-base font-semibold" style={{ color: 'var(--text)' }}>
          {t('createListing')}
        </p>

        <div className="space-y-3">
          <input
            type="text"
            placeholder={t('title')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            className="w-full px-3 py-2.5 rounded-btn text-sm outline-none border"
            style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)', caretColor: 'var(--accent)' }}
          />
          <textarea
            placeholder={t('description')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={2000}
            className="w-full px-3 py-2.5 rounded-btn text-sm outline-none border resize-none"
            style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)', caretColor: 'var(--accent)' }}
          />
          <input
            type="number"
            placeholder={t('priceBRB')}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min={1}
            className="w-full px-3 py-2.5 rounded-btn text-sm outline-none border"
            style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)', caretColor: 'var(--accent)' }}
          />
          <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {categories.slice(1).map((cat) => (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className="shrink-0 px-3 py-1.5 text-[11px] font-medium rounded-full border"
                style={{
                  borderColor: category === cat.key ? 'var(--accent)' : 'var(--border)',
                  color: category === cat.key ? 'var(--accent)' : 'var(--text-secondary)',
                  background: category === cat.key ? 'rgba(108, 99, 255, 0.08)' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                {t(cat.label)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium rounded-btn border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'transparent', cursor: 'pointer' }}
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || createListing.isPending}
            className="flex-1 py-2.5 text-sm font-medium rounded-btn"
            style={{
              backgroundColor: isValid ? 'var(--accent)' : 'var(--surface2)',
              color: isValid ? '#FFFFFF' : 'var(--text-muted)',
              border: 'none',
              cursor: isValid ? 'pointer' : 'default',
            }}
          >
            {createListing.isPending ? t('creating') : t('listItem')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Market;
