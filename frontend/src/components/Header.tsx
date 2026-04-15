import { useTranslation } from '../lib/i18n';
import NotificationsBell from './NotificationsBell';

function Header() {
  const { t } = useTranslation();

  return (
    <header className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: 'var(--bg)' }}>
      <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--text)' }}>
        {t('appName')}
      </span>
      <NotificationsBell />
    </header>
  );
}

export default Header;
