import { useState } from 'react';
import { BellIcon } from './Icons';
import { useTranslation } from '../lib/i18n';

const notifications = [
  { id: '1', title: 'Welcome to Brabble!', titleRu: 'Добро пожаловать в Brabble!', desc: 'Complete your first task to earn BRB tokens.', descRu: 'Выполните первое задание, чтобы заработать BRB.', time: 'now' },
  { id: '2', title: 'Marketplace is live', titleRu: 'Маркетплейс запущен', desc: 'Buy and sell digital goods with BRB.', descRu: 'Покупайте и продавайте цифровые товары за BRB.', time: '1h' },
  { id: '3', title: 'Invite friends', titleRu: 'Пригласите друзей', desc: 'Get 50 BRB for each referral.', descRu: 'Получите 50 BRB за каждого приглашённого.', time: '2h' },
];

function Header() {
  const { t, lang } = useTranslation();
  const [showNotif, setShowNotif] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: 'var(--bg)' }}>
        <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--text)' }}>
          {t('appName')}
        </span>
        <button
          onClick={() => setShowNotif(true)}
          className="relative w-8 h-8 flex items-center justify-center rounded-full"
          style={{ backgroundColor: 'var(--surface2)', border: 'none', cursor: 'pointer' }}
        >
          <BellIcon size={16} color="var(--text-secondary)" />
          <span
            className="absolute top-0 right-0 w-2 h-2 rounded-full"
            style={{ backgroundColor: 'var(--teal)' }}
          />
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
              {notifications.map((n) => (
                <div key={n.id} className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>
                        {lang === 'ru' ? n.titleRu : n.title}
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {lang === 'ru' ? n.descRu : n.desc}
                      </p>
                    </div>
                    <span className="text-[10px] shrink-0" style={{ color: 'var(--text-muted)' }}>{n.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
