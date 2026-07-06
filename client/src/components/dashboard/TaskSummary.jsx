import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

const COLORS = {
  completed: '#22C55E',
  inProgress: '#3B82F6',
  notStarted: '#9CA3AF',
};

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2">
      <p className="text-sm font-medium text-dark-900">{entry.name}: {entry.value}</p>
    </div>
  );
}

function CustomLegend({ payload }) {
  return (
    <div className="flex items-center justify-center gap-4 mt-4">
      {payload?.map((entry) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-xs text-dark-600">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function TaskSummary({ data = {} }) {
  const { total = 0, completed = 0, inProgress = 0, notStarted = 0 } = data;

  const chartData = [
    { name: 'Selesai', value: completed },
    { name: 'Berlangsung', value: inProgress },
    { name: 'Belum Dimulai', value: notStarted },
  ].filter((d) => d.value > 0);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h3 className="font-semibold text-dark-900 mb-4">Ringkasan Tugas</h3>

      {total === 0 ? (
        <div className="text-center py-12 text-dark-500 text-sm">
          Belum ada tugas
        </div>
      ) : (
        <div className="relative">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={
                      entry.name === 'Selesai' ? COLORS.completed :
                      entry.name === 'Berlangsung' ? COLORS.inProgress :
                      COLORS.notStarted
                    }
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-3xl font-bold text-dark-900">{total}</p>
              <p className="text-xs text-dark-500">Total</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
