interface ProgressBarProps {
  value: number; // 0-100
  colorClass?: string;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  colorClass = 'bg-brand-500',
  size = 'md',
  showLabel = false,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value));
  const h = size === 'sm' ? 'h-1.5' : 'h-2.5';
  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 ${h} rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden`}>
        <div
          className={`${h} rounded-full ${colorClass} transition-all duration-500 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 tabular-nums w-10 text-right">
          {pct.toFixed(0)}%
        </span>
      )}
    </div>
  );
}
