import React, { useState } from 'react';
import { Check, ChevronDown, ChevronRight, Edit2, Trash2, Plus } from 'lucide-react';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';

const CHECKLIST_CATEGORIES = [
  { key: 'dokumen', label: 'Dokumen' },
  { key: 'perlengkapan', label: 'Perlengkapan' },
  { key: 'logistik', label: 'Logistik' },
  { key: 'teknis', label: 'Teknis' },
  { key: 'personel', label: 'Personel' },
  { key: 'lainnya', label: 'Lainnya' },
];

export default function ChecklistGrouped({ items = [], onToggle, onEdit, onDelete, onAdd }) {
  const [collapsed, setCollapsed] = useState({});

  const toggleCollapse = (cat) => {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const total = items.length;
  const completed = items.filter((i) => i.checked).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const grouped = CHECKLIST_CATEGORIES.reduce((acc, cat) => {
    acc[cat.key] = items.filter((i) => i.category === cat.key);
    return acc;
  }, {});

  // Also catch items with unknown categories
  const knownKeys = new Set(CHECKLIST_CATEGORIES.map((c) => c.key));
  const uncategorized = items.filter((i) => !knownKeys.has(i.category));

  return (
    <div className="space-y-4">
      {/* Overall progress */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-dark-900">Checklist</h3>
          <span className="text-sm text-dark-500">{completed}/{total} selesai</span>
        </div>
        <ProgressBar value={percent} color="brand" showLabel />
      </div>

      {onAdd && (
        <div className="flex justify-end">
          <Button size="sm" icon={<Plus size={14} />} onClick={onAdd}>
            Tambah Item
          </Button>
        </div>
      )}

      {/* Grouped items */}
      {CHECKLIST_CATEGORIES.map((cat) => {
        const catItems = grouped[cat.key];
        if (!catItems.length) return null;

        const catCompleted = catItems.filter((i) => i.checked).length;
        const catPercent = Math.round((catCompleted / catItems.length) * 100);
        const isCollapsed = collapsed[cat.key];

        return (
          <div key={cat.key} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <button
              onClick={() => toggleCollapse(cat.key)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {isCollapsed ? (
                  <ChevronRight size={16} className="text-dark-400" />
                ) : (
                  <ChevronDown size={16} className="text-dark-400" />
                )}
                <span className="font-medium text-dark-800">{cat.label}</span>
                <span className="text-xs text-dark-400">
                  {catCompleted}/{catItems.length}
                </span>
              </div>
              <ProgressBar value={catPercent} size="sm" className="w-24" />
            </button>

            {!isCollapsed && (
              <div className="divide-y divide-gray-50 border-t border-gray-100">
                {catItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    <button
                      onClick={() => onToggle && onToggle(item.id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                        ${item.checked
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-brand-500'}`}
                    >
                      {item.checked && <Check size={12} />}
                    </button>

                    <span
                      className={`flex-1 text-sm
                        ${item.checked ? 'line-through text-dark-400' : 'text-dark-800'}`}
                    >
                      {item.label}
                    </span>

                    <div className="flex items-center gap-0.5 shrink-0">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(item)}
                          className="p-1 rounded text-dark-400 hover:text-brand-600 transition-colors"
                        >
                          <Edit2 size={12} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(item.id)}
                          className="p-1 rounded text-dark-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Uncategorized items */}
      {uncategorized.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <span className="font-medium text-dark-800">Lainnya</span>
          </div>
          <div className="divide-y divide-gray-50">
            {uncategorized.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50"
              >
                <button
                  onClick={() => onToggle && onToggle(item.id)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                    ${item.checked
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-brand-500'}`}
                >
                  {item.checked && <Check size={12} />}
                </button>
                <span
                  className={`flex-1 text-sm
                    ${item.checked ? 'line-through text-dark-400' : 'text-dark-800'}`}
                >
                  {item.label}
                </span>
                <div className="flex items-center gap-0.5 shrink-0">
                  {onEdit && (
                    <button onClick={() => onEdit(item)} className="p-1 rounded text-dark-400 hover:text-brand-600">
                      <Edit2 size={12} />
                    </button>
                  )}
                  {onDelete && (
                    <button onClick={() => onDelete(item.id)} className="p-1 rounded text-dark-400 hover:text-red-600">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
