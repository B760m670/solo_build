import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';
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
  useAuth();

  const handleOnboardingDone = () => {
    localStorage.setItem('brabble_onboarded', '1');
    setOnboarded(true);
  };

  if (!onboarded) {
    return <Onboarding onDone={handleOnboardingDone} />;
  }

  const navPage = page === 'admin' ? 'profile' : page;

  const renderPage = () => {
    switch (page) {
      case 'home': return <Home />;
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
      <BottomNav active={navPage} onNavigate={setPage} />
    </>
  );
}

export default App;
