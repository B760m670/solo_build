import { useState, useEffect, useMemo } from 'react';
import { BellIcon } from './Icons';
import { useTranslation } from '../lib/i18n';

interface Notification {
  id: string;
  type: 'system' | 'progress' | 'recommendation' | 'news';
  title: string;
  titleRu: string;
  desc: string;
  descRu: string;
  timestamp: number;
}

const defaultNotifications: Notification[] = [
  { id: '1', type: 'system', title: 'Welcome to Brabble!', titleRu: 'Добро пожаловать в Brabble!', desc: 'Complete your first task to earn BRB tokens.', descRu: 'Выполните первое задание, чтобы заработать BRB.', timestamp: Date.now() - 5000 },
  { id: '2', type: 'news', title: 'Marketplace is live', titleRu: 'Маркетплейс запущен', desc: 'Buy and sell digital goods with BRB.', descRu: 'Покупайте и продавайте цифровые товары за BRB.', timestamp: Date.now() - 3600000 },
  { id: '3', type: 'recommendation', title: 'Invite friends', titleRu: 'Пригласите друзей', desc: 'Get 50 BRB for each referral.', descRu: 'Получите 50 BRB за каждого приглашённого.', timestamp: Date.now() - 7200000 },
];

function formatTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return new Date(timestamp).toLocaleDateString();
}

function Header() {
  const { t, lang } = useTranslation();
  const [showNotif, setShowNotif] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('readNotifications');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  useEffect(() => {
    localStorage.setItem('readNotifications', JSON.stringify(Array.from(readNotificationIds)));
  }, [readNotificationIds]);

  const sortedNotifications = useMemo(() => {
    return [...defaultNotifications].sort((a, b) => b.timestamp - a.timestamp);
  }, []);

  const unreadCount = useMemo(() => {
    return sortedNotifications.filter(n => !readNotificationIds.has(n.id)).length;
  }, [sortedNotifications, readNotificationIds]);

  const handleOpenNotifications = () => {
    setShowNotif(true);
    const unreadIds = sortedNotifications
      .filter(n => !readNotificationIds.has(n.id))
      .map(n => n.id);
    if (unreadIds.length > 0) {
      setReadNotificationIds(prev => new Set([...prev, ...unreadIds]));
    }
  };

  return (
    <>
      <header className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: 'var(--bg)' }}>
        <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--text)' }}>
          {t('appName')}
        </span>
        <button
          onClick={handleOpenNotifications}
          className="relative w-8 h-8 flex items-center justify-center rounded-full"
          style={{ backgroundColor: 'var(--surface2)', border: 'none', cursor: 'pointer' }}
        >
          <BellIcon size={16} color="var(--text-secondary)" />
          {unreadCount > 0 && (
            <span
              className="absolute top-0 right-0 w-2 h-2 rounded-full"
              style={{ backgroundColor: 'var(--teal)' }}
            />
          )}
        </button>
      </header>

      {showNotif && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-14"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowNotif(false)}
        >
          <div
            className="w-full max-w-sm mx-4 rounded-card overflow-hidden border"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                {lang === 'ru' ? 'Уведомления' : 'Notifications'}
              </p>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {sortedNotifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {lang === 'ru' ? 'Уведомлений нет' : 'No notifications'}
                  </p>
                </div>
              ) : (
                sortedNotifications.map((n) => (
                  <div
                    key={n.id}
                    className="px-4 py-3 border-b transition-colors"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: readNotificationIds.has(n.id) ? 'transparent' : 'rgba(108, 99, 255, 0.04)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>
                            {lang === 'ru' ? n.titleRu : n.title}
                          </p>
                          {!readNotificationIds.has(n.id) && (
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: 'var(--accent)' }}
                            />
                          )}
                        </div>
                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {lang === 'ru' ? n.descRu : n.desc}
                        </p>
                      </div>
                      <span className="text-[10px] shrink-0" style={{ color: 'var(--text-muted)' }}>
                        {formatTime(n.timestamp)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
