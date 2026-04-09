interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

function ErrorState({ message = 'Something went wrong', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: 'rgba(255, 59, 48, 0.1)' }}
      >
        <svg
          width={20}
          height={20}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#FF3B30"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </div>
      <p
        className="text-sm text-center mb-1"
        style={{ color: 'var(--text-secondary)' }}
      >
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 px-5 py-2 text-xs font-medium rounded-btn border"
          style={{
            borderColor: 'var(--border)',
            color: 'var(--accent)',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message = 'Nothing here yet' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: 'var(--surface2)' }}
      >
        <svg
          width={20}
          height={20}
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-muted)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="9" y1="9" x2="15" y2="15" />
          <line x1="15" y1="9" x2="9" y2="15" />
        </svg>
      </div>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        {message}
      </p>
    </div>
  );
}

export default ErrorState;
