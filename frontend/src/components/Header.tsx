import { useState } from 'react';
import { useTranslation } from '../lib/i18n';
import { CrownIcon } from './Icons';
import NotificationsBell from './NotificationsBell';
import { PlusSection } from '../pages/sections/PlusSection';

function Header() {
  const { t } = useTranslation();
  const [plusOpen, setPlusOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: 'var(--bg)' }}>
        <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--text)' }}>
          {t('appName')}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPlusOpen(true)}
            className="relative w-9 h-9 rounded-btn flex items-center justify-center"
            style={{ backgroundColor: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.2)', cursor: 'pointer' }}
          >
            <CrownIcon size={16} color="var(--gold)" />
          </button>
          <NotificationsBell />
        </div>
      </header>
      {plusOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: 'var(--bg)' }}>
          <PlusSection onBack={() => setPlusOpen(false)} />
        </div>
      )}
    </>
  );
}

export default Header;
