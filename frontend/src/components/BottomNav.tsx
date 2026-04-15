import { MarketIcon, TasksIcon, WalletIcon, ProfileIcon } from './Icons';
import { useTranslation } from '../lib/i18n';

export type NavPage = 'market' | 'tasks' | 'wallet' | 'profile';

interface BottomNavProps {
  active: NavPage;
  onNavigate: (page: NavPage) => void;
  hidden?: boolean;
}

const tabs: { key: NavPage; labelKey: 'navMarket' | 'navTasks' | 'navWallet' | 'navProfile'; icon: typeof MarketIcon }[] = [
  { key: 'market', labelKey: 'navMarket', icon: MarketIcon },
  { key: 'tasks', labelKey: 'navTasks', icon: TasksIcon },
  { key: 'wallet', labelKey: 'navWallet', icon: WalletIcon },
  { key: 'profile', labelKey: 'navProfile', icon: ProfileIcon },
];

function BottomNav({ active, onNavigate, hidden }: BottomNavProps) {
  const { t } = useTranslation();

  return (
    <nav
      className="safe-bottom flex items-center justify-around border-t"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        backgroundColor: 'var(--bg)',
        borderColor: 'var(--border)',
        paddingTop: '8px',
        paddingBottom: '8px',
        transition: 'transform 0.3s ease',
        transform: hidden ? 'translateY(100%)' : 'translateY(0)',
      }}
    >
      {tabs.map(({ key, labelKey, icon: Icon }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            className="tap-target flex flex-col items-center gap-0.5"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <Icon size={22} color={isActive ? 'var(--accent)' : 'var(--text-muted)'} />
            <span
              className="text-[10px] font-medium"
              style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}
            >
              {t(labelKey)}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNav;
