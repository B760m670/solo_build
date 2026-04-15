import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';
import { useUser } from './hooks/useUser';
import { useScrollDirection } from './hooks/useScrollDirection';
import { isTelegramContext } from './lib/telegram';
import { I18nContext, getStoredLang, setStoredLang, createT, type Lang } from './lib/i18n';
import Header from './components/Header';
import BottomNav, { type NavPage } from './components/BottomNav';
import Onboarding from './components/Onboarding';
import Market from './pages/Market';
import Tasks from './pages/Tasks';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

type Page = NavPage | 'admin';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

function App() {
  const [page, setPage] = useState<Page>('market');
  const [onboarded, setOnboarded] = useState(() => localStorage.getItem('unisouq_onboarded') === '1');
  const [lang, setLangState] = useState<Lang>(getStoredLang);
  useTheme();
  const auth = useAuth();
  const userQuery = useUser();
  const navHidden = useScrollDirection(10);

  const i18n = useMemo(() => {
    const t = createT(lang);
    const setLang = (l: Lang) => {
      setStoredLang(l);
      setLangState(l);
    };
    return { lang, setLang, t };
  }, [lang]);

  const { t } = i18n;
  const canOpenAdmin = !!userQuery.data?.isAdmin
    || userQuery.data?.role === 'ADMIN'
    || userQuery.data?.role === 'MODERATOR';

  const handleOnboardingDone = () => {
    localStorage.setItem('unisouq_onboarded', '1');
    setOnboarded(true);
  };

  if (!onboarded) {
    return (
      <I18nContext.Provider value={i18n}>
        <Onboarding onDone={handleOnboardingDone} />
      </I18nContext.Provider>
    );
  }

  if (auth.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-2" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('connecting')}</p>
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
        <p className="text-base font-semibold" style={{ color: 'var(--text)' }}>{t('openInTelegram')}</p>
        <p className="text-xs text-center leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-muted)' }}>
          {t('openInTelegramDesc')}
        </p>
      </div>
    );
  }

  if (auth.error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-3 px-6" style={{ backgroundColor: 'var(--bg)' }}>
        <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{t('authFailed')}</p>
        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>{auth.error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 text-xs font-medium rounded-btn"
          style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          {t('retry')}
        </button>
      </div>
    );
  }

  const navPage: NavPage = page === 'admin' ? 'profile' : page;

  const renderPage = () => {
    switch (page) {
      case 'market': return <Market />;
      case 'tasks': return <Tasks />;
      case 'wallet': return <Wallet />;
      case 'admin': return canOpenAdmin ? <Admin onBack={() => setPage('profile')} /> : <Profile onAdminOpen={() => setPage('admin')} canOpenAdmin={false} />;
      case 'profile': return <Profile onAdminOpen={() => setPage('admin')} canOpenAdmin={canOpenAdmin} />;
    }
  };

  return (
    <I18nContext.Provider value={i18n}>
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
      <BottomNav active={navPage} onNavigate={(p) => setPage(p)} hidden={navHidden} />
    </I18nContext.Provider>
  );
}

export default App;
