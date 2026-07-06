import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import Button from '../ui/Button';

function EditTextarea({ value, onChange }) {
  return (
    <textarea
      value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
      onChange={(e) => onChange(e.target.value)}
      rows={12}
      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-dark-800 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-y"
    />
  );
}

function EditTable({ value, onChange }) {
  const items = Array.isArray(value) ? value : value?.items || [];
  const [rows, setRows] = useState(items);

  useEffect(() => {
    setRows(Array.isArray(value) ? value : value?.items || []);
  }, [value]);

  const handleCellChange = (rowIdx, key, val) => {
    const updated = [...rows];
    updated[rowIdx] = { ...updated[rowIdx], [key]: val };
    setRows(updated);
    if (onChange) onChange(updated);
  };

  const addRow = () => {
    const updated = [...rows, {}];
    setRows(updated);
    if (onChange) onChange(updated);
  };

  const removeRow = (idx) => {
    const updated = rows.filter((_, i) => i !== idx);
    setRows(updated);
    if (onChange) onChange(updated);
  };

  const keys = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-50">
              {keys.map((key) => (
                <th key={key} className="px-3 py-2 text-left text-xs font-semibold text-dark-500 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </th>
              ))}
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {keys.map((key) => (
                  <td key={key} className="px-3 py-1">
                    <input
                      value={row[key] || ''}
                      onChange={(e) => handleCellChange(rowIdx, key, e.target.value)}
                      className="w-full border border-gray-200 rounded px-2 py-1 text-sm text-dark-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </td>
                ))}
                <td className="px-2 py-1">
                  <button
                    onClick={() => removeRow(rowIdx)}
                    className="p-1 rounded text-dark-400 hover:text-red-600 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button size="sm" variant="ghost" onClick={addRow}>
        + Tambah Baris
      </Button>
    </div>
  );
}

const tableSections = ['timeline', 'rundown', 'checklist', 'budget', 'tasks', 'risks', 'documents'];

export default function AIResultEditor({ section, data, onSave, onCancel }) {
  const [edited, setEdited] = useState(data);

  const isTable = tableSections.includes(section);

  const handleSave = () => {
    if (onSave) onSave(section, edited);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h4 className="font-medium text-dark-900 mb-3 capitalize">
          Edit: {section.replace(/([A-Z])/g, ' $1').trim()}
        </h4>

        {isTable ? (
          <EditTable value={edited} onChange={setEdited} />
        ) : (
          <EditTextarea value={edited} onChange={setEdited} />
        )}
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="ghost" icon={<X size={16} />} onClick={onCancel}>
          Batal
        </Button>
        <Button icon={<Save size={16} />} onClick={handleSave}>
          Simpan
        </Button>
      </div>
    </div>
  );
}
