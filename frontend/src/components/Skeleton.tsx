interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'sm' | 'md' | 'lg' | 'full' | 'card';
}

function Skeleton({ className = '', width, height, rounded = 'md' }: SkeletonProps) {
  const radiusMap = {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
    card: 'var(--radius-card)',
  };

  return (
    <div
      className={`animate-pulse ${className}`}
      style={{
        width: width ?? '100%',
        height: height ?? 16,
        borderRadius: radiusMap[rounded],
        backgroundColor: 'var(--surface2)',
      }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div
      className="rounded-card p-4 border space-y-3"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center justify-between">
        <Skeleton width={80} height={12} />
        <Skeleton width={60} height={14} />
      </div>
      <Skeleton height={16} />
      <Skeleton width="70%" height={12} />
      <div className="flex items-center justify-between pt-1">
        <Skeleton width={60} height={12} />
        <Skeleton width={70} height={30} rounded="lg" />
      </div>
    </div>
  );
}

export function ListingSkeleton() {
  return (
    <div
      className="rounded-card border overflow-hidden"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <Skeleton height={112} rounded="sm" />
      <div className="p-3 space-y-2">
        <Skeleton height={14} />
        <Skeleton width={60} height={16} />
        <Skeleton width={50} height={10} />
      </div>
    </div>
  );
}

export function WalletSkeleton() {
  return (
    <div
      className="rounded-card p-5 space-y-3"
      style={{ backgroundColor: 'var(--surface2)' }}
    >
      <Skeleton width={100} height={10} />
      <Skeleton width={140} height={28} />
      <Skeleton width={80} height={11} />
      <div className="flex gap-2 pt-2">
        <Skeleton height={36} rounded="lg" />
        <Skeleton height={36} rounded="lg" />
        <Skeleton height={36} rounded="lg" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6 px-4 py-4">
      <div className="flex flex-col items-center gap-2">
        <Skeleton width={64} height={64} rounded="full" />
        <Skeleton width={100} height={16} />
        <Skeleton width={60} height={12} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-card p-3 border space-y-2"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <Skeleton width={40} height={20} />
            <Skeleton width={30} height={10} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Skeleton;
