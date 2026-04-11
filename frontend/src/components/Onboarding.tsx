import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../lib/i18n';

interface OnboardingProps {
  onDone: () => void;
}

const icons = [
  <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>,
  <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>,
  <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>,
];

const titleKeys = ['onboardTitle1', 'onboardTitle2', 'onboardTitle3'] as const;
const descKeys = ['onboardDesc1', 'onboardDesc2', 'onboardDesc3'] as const;

const slideVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

function Onboarding({ onDone }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const { t } = useTranslation();
  const isLast = step === icons.length - 1;

  const handleNext = () => {
    if (isLast) onDone();
    else setStep((s) => s + 1);
  };

  return (
    <div
      className="flex flex-col items-center justify-between h-full px-6 py-10 safe-bottom"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <div className="flex-1 flex flex-col items-center justify-center max-w-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex flex-col items-center text-center"
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
              style={{ backgroundColor: 'var(--surface2)' }}
            >
              {icons[step]}
            </div>
            <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text)' }}>
              {t(titleKeys[step])}
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {t(descKeys[step])}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2 mb-6">
        {icons.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === step ? 20 : 6,
              height: 6,
              backgroundColor: i === step ? 'var(--accent)' : 'var(--surface2)',
            }}
          />
        ))}
      </div>

      <button
        onClick={handleNext}
        className="w-full max-w-sm py-3.5 text-sm font-semibold rounded-btn"
        style={{
          backgroundColor: isLast ? 'var(--accent)' : 'var(--surface2)',
          color: isLast ? '#FFFFFF' : 'var(--text)',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {isLast ? t('onboardAccept') : t('onboardNext')}
      </button>

      {!isLast && (
        <button
          onClick={onDone}
          className="mt-3 text-xs"
          style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {t('onboardSkip')}
        </button>
      )}
    </div>
  );
}

export default Onboarding;
