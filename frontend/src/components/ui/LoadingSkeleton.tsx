import React from 'react';

export const LoadingSkeleton: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg ${className}`}
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
      <div className="flex items-center justify-between">
        <LoadingSkeleton className="h-6 w-28" />
        <LoadingSkeleton className="h-6 w-12" />
      </div>
      <LoadingSkeleton className="h-4 w-3/4" />
      <LoadingSkeleton className="h-4 w-1/2" />
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between">
        <LoadingSkeleton className="h-4 w-16" />
        <LoadingSkeleton className="h-4 w-20" />
      </div>
    </div>
  );
};
