import React from 'react';
import { Edit2, Trash2, Plus, AlertTriangle, Check } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { formatCurrency } from '../../utils/formatters';

export default function BudgetTable({ items = [], onEdit, onDelete, onAdd, onUpdateActual }) {
  const groupedByCategory = items.reduce((acc, item) => {
    const cat = item.category || 'Lainnya';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const categories = Object.keys(groupedByCategory);

  const totalPlanned = items.reduce((sum, i) => sum + (Number(i.plannedCost) || 0), 0);
  const totalActual = items.reduce((sum, i) => sum + (Number(i.actualCost) || 0), 0);
  const totalDiff = totalPlanned - totalActual;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-dark-900">Anggaran</h3>
        {onAdd && (
          <Button size="sm" icon={<Plus size={14} />} onClick={onAdd}>
            Tambah Item
          </Button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500">Kategori</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500">Item</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-dark-500">Anggaran</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-dark-500">Biaya Aktual</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-dark-500">Selisih</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-dark-500">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-dark-500">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map((cat) => {
                const catItems = groupedByCategory[cat];
                const catPlanned = catItems.reduce((s, i) => s + (Number(i.plannedCost) || 0), 0);
                const catActual = catItems.reduce((s, i) => s + (Number(i.actualCost) || 0), 0);
                const catDiff = catPlanned - catActual;

                return (
                  <React.Fragment key={cat}>
                    {/* Category subtotal */}
                    <tr className="bg-gray-50/80">
                      <td className="px-4 py-2 font-semibold text-dark-700" colSpan={2}>
                        {cat}
                      </td>
                      <td className="px-4 py-2 text-right font-medium text-dark-700">
                        {formatCurrency(catPlanned)}
                      </td>
                      <td className="px-4 py-2 text-right font-medium text-dark-700">
                        {formatCurrency(catActual)}
                      </td>
                      <td className={`px-4 py-2 text-right font-medium ${catDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(catDiff)}
                      </td>
                      <td />
                      <td />
                    </tr>

                    {/* Category items */}
                    {catItems.map((item) => {
                      const planned = Number(item.plannedCost) || 0;
                      const actual = Number(item.actualCost) || 0;
                      const diff = planned - actual;
                      const isOverBudget = diff < 0;

                      return (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-dark-500">{item.category}</td>
                          <td className="px-4 py-3 font-medium text-dark-900">{item.name}</td>
                          <td className="px-4 py-3 text-right text-dark-700">{formatCurrency(planned)}</td>
                          <td className="px-4 py-3 text-right">
                            {onUpdateActual ? (
                              <button
                                onClick={() => onUpdateActual(item)}
                                className="text-dark-700 hover:text-brand-600 transition-colors"
                              >
                                {formatCurrency(actual)}
                              </button>
                            ) : (
                              <span className="text-dark-700">{formatCurrency(actual)}</span>
                            )}
                          </td>
                          <td className={`px-4 py-3 text-right font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                            {isOverBudget ? '-' : '+'}{formatCurrency(Math.abs(diff))}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {isOverBudget ? (
                              <Badge color="red" size="sm">
                                <AlertTriangle size={10} className="mr-1" />
                                Over
                              </Badge>
                            ) : (
                              <Badge color="green" size="sm">
                                <Check size={10} className="mr-1" />
                                OK
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              {onEdit && (
                                <button
                                  onClick={() => onEdit(item)}
                                  className="p-1 rounded text-dark-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                                >
                                  <Edit2 size={14} />
                                </button>
                              )}
                              {onDelete && (
                                <button
                                  onClick={() => onDelete(item.id)}
                                  className="p-1 rounded text-dark-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>

            {/* Grand total */}
            <tfoot>
              <tr className="bg-gray-100 border-t border-gray-200">
                <td className="px-4 py-3 font-bold text-dark-900" colSpan={2}>
                  Total
                </td>
                <td className="px-4 py-3 text-right font-bold text-dark-900">
                  {formatCurrency(totalPlanned)}
                </td>
                <td className="px-4 py-3 text-right font-bold text-dark-900">
                  {formatCurrency(totalActual)}
                </td>
                <td className={`px-4 py-3 text-right font-bold ${totalDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalDiff >= 0 ? '+' : '-'}{formatCurrency(Math.abs(totalDiff))}
                </td>
                <td />
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {items.length === 0 && (
        <div className="text-center py-12 text-dark-500">
          Belum ada data anggaran
        </div>
      )}
    </div>
  );
}
