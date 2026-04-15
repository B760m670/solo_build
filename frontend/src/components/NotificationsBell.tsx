import { useEffect, useState } from 'react';
import { useTranslation } from '../lib/i18n';
import { BellIcon } from './Icons';
import {
  useNotifications,
  useUnreadCount,
  useMarkAllRead,
} from '../hooks/useNotifications';

function NotificationsSheet({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const q = useNotifications();
  const markAll = useMarkAllRead();

  useEffect(() => {
    // Mark everything read as soon as the panel opens.
    markAll.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm h-full overflow-y-auto"
        style={{ backgroundColor: 'var(--surface)', borderLeft: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sticky top-0 px-4 py-3 flex items-center justify-between"
          style={{ backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
        >
          <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{t('notifications')}</p>
          <button
            onClick={onClose}
            className="text-[11px]"
            style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {t('close')}
          </button>
        </div>

        {q.isLoading && (
          <p className="text-xs text-center py-10" style={{ color: 'var(--text-muted)' }}>{t('loading')}</p>
        )}

        {q.data && q.data.length === 0 && (
          <p className="text-xs text-center py-10" style={{ color: 'var(--text-muted)' }}>{t('noNotifications')}</p>
        )}

        <div className="px-3 py-2">
          {q.data?.map((n) => (
            <div
              key={n.id}
              className="rounded-btn p-3 mb-2"
              style={{
                backgroundColor: n.readAt ? 'var(--surface2)' : 'var(--surface2)',
                border: n.readAt ? '1px solid var(--border)' : '1px solid var(--accent)',
              }}
            >
              <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{n.title}</p>
              <p className="text-[11px] mt-0.5 whitespace-pre-wrap break-words" style={{ color: 'var(--text-muted)' }}>
                {n.body}
              </p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function NotificationsBell() {
  const unread = useUnreadCount();
  const [open, setOpen] = useState(false);
  const count = unread.data?.count ?? 0;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative w-9 h-9 rounded-btn flex items-center justify-center"
        style={{ backgroundColor: 'var(--surface2)', border: '1px solid var(--border)', cursor: 'pointer' }}
      >
        <BellIcon size={16} color="var(--text)" />
        {count > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[9px] font-bold"
            style={{ backgroundColor: 'var(--accent)', color: '#fff', border: '1px solid var(--bg)' }}
          >
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>
      {open && <NotificationsSheet onClose={() => setOpen(false)} />}
    </>
  );
}
