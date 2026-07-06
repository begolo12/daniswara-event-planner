import React from 'react';
import Button from './Button';

export default function EmptyState({
  icon: Icon,
  title = 'Tidak ada data',
  message,
  action,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`}>
      {Icon && <div className="text-gray-300 mb-4"><Icon size={48} strokeWidth={1.5} /></div>}
      <h3 className="text-base font-semibold text-dark-700 mb-1">{title}</h3>
      {message && <p className="text-sm text-dark-400 max-w-sm">{message}</p>}
      {action && (
        <div className="mt-4">
          {typeof action === 'object' && action.label && action.onClick ? (
            <Button variant="primary" onClick={action.onClick}>{action.label}</Button>
          ) : (
            action
          )}
        </div>
      )}
    </div>
  );
}
