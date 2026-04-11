import { HomeIcon, TasksIcon, MarketIcon, ProfileIcon } from './Icons';
import { useTranslation } from '../lib/i18n';

type Page = 'home' | 'tasks' | 'market' | 'profile';

interface BottomNavProps {
  active: Page;
  onNavigate: (page: Page) => void;
  hidden?: boolean;
}

const tabs: { key: Page; labelKey: 'navHome' | 'navTasks' | 'navMarket' | 'navProfile'; icon: typeof HomeIcon }[] = [
  { key: 'home', labelKey: 'navHome', icon: HomeIcon },
  { key: 'tasks', labelKey: 'navTasks', icon: TasksIcon },
  { key: 'market', labelKey: 'navMarket', icon: MarketIcon },
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
            <Icon
              size={22}
              color={isActive ? 'var(--accent)' : 'var(--text-muted)'}
            />
            <span
              className="text-[10px] font-medium"
              style={{
                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              }}
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
