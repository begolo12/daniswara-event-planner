import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendLabel,
  color = 'brand',
}) {
  const isPositive = trend > 0;
  const isNegative = trend < 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl bg-${color}-100 flex items-center justify-center`}>
          {Icon && <Icon size={22} className={`text-${color}-600`} />}
        </div>

        {trend != null && (
          <div className={`flex items-center gap-1 text-sm font-medium
            ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-dark-500'}`}>
            {isPositive && <TrendingUp size={14} />}
            {isNegative && <TrendingDown size={14} />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>

      <p className="text-2xl font-bold text-dark-900 mb-0.5">{value}</p>
      <p className="text-sm text-dark-500">{label}</p>

      {trendLabel && (
        <p className="text-xs text-dark-400 mt-2">{trendLabel}</p>
      )}
    </div>
  );
}
