import React from 'react';

const colorClasses = {
  brand: 'bg-brand-600',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
};

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
};

export default function ProgressBar({
  value = 0,
  color = 'brand',
  size = 'md',
  showLabel = false,
  className = '',
}) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`flex-1 bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`${colorClasses[color]} rounded-full transition-all duration-500 h-full`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-dark-600 shrink-0">{Math.round(clamped)}%</span>
      )}
    </div>
  );
}
