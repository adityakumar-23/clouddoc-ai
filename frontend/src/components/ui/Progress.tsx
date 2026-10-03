import React from 'react';

export interface ProgressProps {
  value: number; // 0 to 100
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'brand' | 'success' | 'warning';
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  showLabel = false,
  size = 'md',
  variant = 'brand',
  className = '',
}) => {
  const clamped = Math.min(100, Math.max(0, value));

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const variants = {
    brand: 'bg-brand-600',
    success: 'bg-emerald-600',
    warning: 'bg-amber-500',
  };

  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className={`${heights[size]} ${variants[variant]} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
          <span>Processing</span>
          <span>{clamped}%</span>
        </div>
      )}
    </div>
  );
};
