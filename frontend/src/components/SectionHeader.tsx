import { ChevronRightIcon } from './Icons';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  backLabel: string;
}

export function SectionHeader({ title, subtitle, onBack, backLabel }: SectionHeaderProps) {
  return (
    <div className="mb-5">
      <button
        onClick={onBack}
        className="text-[11px] mb-4 flex items-center gap-1 uppercase tracking-wider font-semibold"
        style={{
          color: 'var(--text-muted)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <ChevronRightIcon size={12} color="var(--text-muted)" className="rotate-180" />
        {backLabel}
      </button>
      {subtitle && (
        <p className="display-subtitle mb-1.5">
          {subtitle}
        </p>
      )}
      <p className="display-title" style={{ color: 'var(--text)' }}>
        {title}
      </p>
    </div>
  );
}
