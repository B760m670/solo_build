import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';
import { useScrollDirection } from './hooks/useScrollDirection';
import { isTelegramContext } from './lib/telegram';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Onboarding from './components/Onboarding';
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import Market from './pages/Market';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

type Page = 'home' | 'tasks' | 'market' | 'profile' | 'admin';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

function App() {
  const [page, setPage] = useState<Page>('home');
  const [onboarded, setOnboarded] = useState(() => localStorage.getItem('brabble_onboarded') === '1');
  useTheme();
  const auth = useAuth();
  const navHidden = useScrollDirection(10);

  const handleOnboardingDone = () => {
    localStorage.setItem('brabble_onboarded', '1');
    setOnboarded(true);
  };

  if (!onboarded) {
    return <Onboarding onDone={handleOnboardingDone} />;
  }

  if (auth.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-2" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Connecting...</p>
      </div>
    );
  }

  if (!auth.isAuthenticated && !isTelegramContext()) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 px-6" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--surface2)' }}>
          <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <p className="text-base font-semibold" style={{ color: 'var(--text)' }}>Open in Telegram</p>
        <p className="text-xs text-center leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Brabble works as a Telegram Mini App.
          Open @brabble_bot in Telegram to get started.
        </p>
      </div>
    );
  }

  if (auth.error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-3 px-6" style={{ backgroundColor: 'var(--bg)' }}>
        <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Authentication failed</p>
        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>{auth.error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 text-xs font-medium rounded-btn"
          style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          Retry
        </button>
      </div>
    );
  }

  const navPage = page === 'admin' ? 'profile' : page;

  const renderPage = () => {
    switch (page) {
      case 'home': return <Home onNavigate={setPage} />;
      case 'tasks': return <Tasks />;
      case 'market': return <Market />;
      case 'admin': return <Admin onBack={() => setPage('profile')} />;
      case 'profile': return <Profile onAdminOpen={() => setPage('admin')} />;
    }
  };

  return (
    <>
      <Header />
      <main className="scroll-area">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav active={navPage} onNavigate={setPage} hidden={navHidden} />
    </>
  );
}

export default App;
