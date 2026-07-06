import React from 'react';

export default function Card({
  children,
  className = '',
  padding = 'p-6',
  hover = false,
  onClick,
}) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 ${padding}
        ${hover ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}
        ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
