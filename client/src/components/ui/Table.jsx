import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export default function Table({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'Tidak ada data',
  onRowClick,
  emptyIcon,
  sortKey,
  sortDirection,
  onSort,
}) {
  if (loading) {
    return (
      <div className="overflow-x-auto rounded-xl border border-gray-100 -mx-4 px-4 sm:mx-0 sm:px-0">
        <table className="w-full text-sm" aria-label="Loading table">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left font-medium text-dark-500 whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((i) => (
              <tr key={i} className="border-t border-gray-50">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          {emptyIcon && <div className="text-gray-300 mb-3">{emptyIcon}</div>}
          <p className="text-dark-500 text-sm">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 -mx-4 px-4 sm:mx-0 sm:px-0" role="table">
      <table className="w-full text-sm min-w-[600px]" aria-label="Data table">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left font-medium text-dark-500 whitespace-nowrap
                  ${col.sortable ? 'cursor-pointer select-none hover:text-dark-700' : ''}`}
                onClick={() => col.sortable && onSort && onSort(col.key)}
                scope="col"
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    sortDirection === 'asc'
                      ? <ChevronUp size={14} className="text-brand-600" />
                      : <ChevronDown size={14} className="text-brand-600" />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((row, idx) => (
            <tr
              key={row.id || idx}
              className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick && onRowClick(row)}
              role={onRowClick ? 'button' : undefined}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-dark-700 whitespace-nowrap">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
