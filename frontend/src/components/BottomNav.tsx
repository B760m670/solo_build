import { HomeIcon, TasksIcon, MarketIcon, ProfileIcon } from './Icons';

type Page = 'home' | 'tasks' | 'market' | 'profile';

interface BottomNavProps {
  active: Page;
  onNavigate: (page: Page) => void;
}

const tabs: { key: Page; label: string; icon: typeof HomeIcon }[] = [
  { key: 'home', label: 'Home', icon: HomeIcon },
  { key: 'tasks', label: 'Tasks', icon: TasksIcon },
  { key: 'market', label: 'Market', icon: MarketIcon },
  { key: 'profile', label: 'Profile', icon: ProfileIcon },
];

function BottomNav({ active, onNavigate }: BottomNavProps) {
  return (
    <nav
      className="safe-bottom flex items-center justify-around border-t"
      style={{
        backgroundColor: 'var(--bg)',
        borderColor: 'var(--border)',
        paddingTop: '8px',
        paddingBottom: '8px',
      }}
    >
      {tabs.map(({ key, label, icon: Icon }) => {
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
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNav;
