import { ChevronRightIcon } from './Icons';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  backLabel: string;
}

export function SectionHeader({ title, subtitle, onBack, backLabel }: SectionHeaderProps) {
  return (
    <div className="mb-4">
      <button
        onClick={onBack}
        className="text-[11px] mb-3 flex items-center gap-1"
        style={{
          color: 'var(--text-muted)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <ChevronRightIcon size={14} color="var(--text-muted)" className="rotate-180" />
        {backLabel}
      </button>
      <p className="text-[18px] font-bold tracking-tight" style={{ color: 'var(--text)' }}>
        {title}
      </p>
      {subtitle && (
        <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
