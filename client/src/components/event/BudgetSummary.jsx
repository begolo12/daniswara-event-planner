import React from 'react';
import { Wallet, TrendingUp, TrendingDown, Percent } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import ProgressBar from '../ui/ProgressBar';

const statCards = [
  { key: 'totalPlanned', label: 'Total Anggaran', icon: Wallet, color: 'brand' },
  { key: 'totalActual', label: 'Total Aktual', icon: TrendingUp, color: 'blue' },
  { key: 'remaining', label: 'Sisa', icon: TrendingDown, color: null },
  { key: 'percentUsed', label: 'Persentase', icon: Percent, color: 'purple' },
];

function StatItem({ label, value, icon: Icon, color, isRemaining }) {
  const displayValue = isRemaining
    ? formatCurrency(value)
    : label === 'Persentase'
      ? `${Math.round(value || 0)}%`
      : formatCurrency(value);

  const isNegative = isRemaining && value < 0;
  const dynamicColor = isRemaining
    ? (isNegative ? 'red' : 'green')
    : color;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg bg-${dynamicColor}-100 flex items-center justify-center`}>
          <Icon size={20} className={`text-${dynamicColor}-600`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-dark-500">{label}</p>
          <p className={`text-lg font-bold ${isNegative ? 'text-red-600' : 'text-dark-900'}`}>
            {displayValue}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function BudgetSummary({ summary = {}, categoryData = [] }) {
  const { totalPlanned = 0, totalActual = 0, remaining = 0, percentUsed = 0 } = summary;

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatItem
            key={card.key}
            label={card.label}
            value={summary[card.key]}
            icon={card.icon}
            color={card.color}
            isRemaining={card.key === 'remaining'}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h4 className="text-sm font-semibold text-dark-700 mb-3">Anggaran vs Aktual</h4>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-dark-500">Anggaran</span>
              <span className="font-medium text-dark-700">{formatCurrency(totalPlanned)}</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gray-400 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-dark-500">Aktual</span>
              <span className="font-medium text-dark-700">{formatCurrency(totalActual)}</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${totalActual > totalPlanned ? 'bg-red-500' : 'bg-brand-600'}`}
                style={{ width: `${Math.min(100, percentUsed)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      {categoryData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h4 className="text-sm font-semibold text-dark-700 mb-4">Per Kategori</h4>
          <div className="space-y-3">
            {categoryData.map((cat) => {
              const catPercent = cat.planned > 0 ? Math.round((cat.actual / cat.planned) * 100) : 0;
              const isOver = cat.actual > cat.planned;

              return (
                <div key={cat.name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-dark-600">{cat.name}</span>
                    <span className={`font-medium ${isOver ? 'text-red-600' : 'text-dark-700'}`}>
                      {formatCurrency(cat.actual)} / {formatCurrency(cat.planned)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-red-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(100, catPercent)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
