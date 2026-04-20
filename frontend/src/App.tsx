import { lazy, Suspense, useState, useMemo } from 'react';
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

const Studio = lazy(() => import('./pages/Studio'));
const Wallet = lazy(() => import('./pages/Wallet'));
const Profile = lazy(() => import('./pages/Profile'));
const Admin = lazy(() => import('./pages/Admin'));

type Page = NavPage | 'admin';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

function App() {
  const [page, setPage] = useState<Page>('studio');
  const [onboarded, setOnboarded] = useState(() => localStorage.getItem('unisouq_onboarded') === '1');
  const [lang, setLangState] = useState<Lang>(getStoredLang);
  useTheme();
  const auth = useAuth();
  const userQuery = useUser(auth.isAuthenticated);
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
      <div className="flex flex-col items-center justify-center h-screen" style={{ backgroundColor: 'var(--bg)' }}>
        {/* Logo mark */}
        <div className="splash-logo mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center relative overflow-hidden"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="absolute inset-0 splash-glow" />
            <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
            </svg>
          </div>
        </div>
        {/* Brand name */}
        <p className="splash-text text-sm font-bold tracking-[0.2em] uppercase" style={{ color: 'var(--text)' }}>
          UNISOUQ
        </p>
        {/* Subtle loading bar */}
        <div className="mt-6 w-12 h-[2px] rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface2)' }}>
          <div className="h-full rounded-full splash-bar" style={{ backgroundColor: 'var(--accent)' }} />
        </div>
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
          onClick={() => auth.retry()}
          disabled={auth.isLoading}
          className="mt-2 px-4 py-2 text-xs font-medium rounded-btn"
          style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', opacity: auth.isLoading ? 0.5 : 1 }}
        >
          {t('retry')}
        </button>
      </div>
    );
  }

  const navPage: NavPage = page === 'admin' ? 'profile' : page;

  const renderPage = () => {
    switch (page) {
      case 'studio':
        return <Studio onNavigate={(t) => setPage(t)} />;
      case 'wallet':
        return <Wallet />;
      case 'admin':
        return canOpenAdmin ? (
          <Admin onBack={() => setPage('profile')} />
        ) : (
          <Profile onAdminOpen={() => setPage('admin')} canOpenAdmin={false} />
        );
      case 'profile':
        return <Profile onAdminOpen={() => setPage('admin')} canOpenAdmin={canOpenAdmin} />;
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
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-20">
                  <div
                    className="w-5 h-5 border-2 rounded-full animate-spin"
                    style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }}
                  />
                </div>
              }
            >
              {renderPage()}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav active={navPage} onNavigate={(p) => setPage(p)} hidden={navHidden} />
    </I18nContext.Provider>
  );
}

export default App;
