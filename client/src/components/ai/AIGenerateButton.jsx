import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
};

export default function AIGenerateButton({
  onClick,
  loading = false,
  label = 'Generate',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
}) {
  const isDisabled = disabled || loading;

  const variantClasses = variant === 'primary'
    ? 'bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white shadow-sm'
    : 'bg-gray-100 text-dark-700 hover:bg-gray-200 border border-gray-200';

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center font-medium rounded-lg transition-all
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500
        ${variantClasses}
        ${sizeClasses[size]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}`}
    >
      {loading ? (
        <Loader2 size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} className="animate-spin" />
      ) : (
        <Sparkles size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
      )}
      {loading ? 'Generating...' : label}
    </button>
  );
}
