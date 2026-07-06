import React from 'react';
import { Edit2, Trash2, GripVertical, Clock } from 'lucide-react';
import Badge from '../ui/Badge';

const viewModeColumns = {
  full: ['waktu', 'agenda', 'pic', 'kebutuhan_teknis', 'catatan'],
  mc: ['waktu', 'agenda', 'catatan'],
  direksi: ['waktu', 'agenda', 'pic'],
};

const columnHeaders = {
  waktu: 'Waktu',
  agenda: 'Agenda',
  pic: 'PIC',
  kebutuhan_teknis: 'Kebutuhan Teknis',
  catatan: 'Catatan',
};

export default function RundownTable({ items = [], onEdit, onDelete, onReorder, viewMode = 'full' }) {
  const visibleColumns = viewModeColumns[viewMode] || viewModeColumns.full;

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="w-12 px-4 py-3 text-left text-xs font-semibold text-dark-500">#</th>
              {visibleColumns.includes('waktu') && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500">
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} />
                    Waktu
                  </div>
                </th>
              )}
              {visibleColumns.includes('agenda') && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500">Agenda</th>
              )}
              {visibleColumns.includes('pic') && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500">PIC</th>
              )}
              {visibleColumns.includes('kebutuhan_teknis') && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500">Kebutuhan Teknis</th>
              )}
              {visibleColumns.includes('catatan') && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500">Catatan</th>
              )}
              <th className="w-24 px-4 py-3 text-center text-xs font-semibold text-dark-500">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map((item, index) => (
              <tr
                key={item.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 text-dark-400">{index + 1}</td>
                {visibleColumns.includes('waktu') && (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-dark-400" />
                      <span className="text-dark-700">
                        {item.startTime} - {item.endTime}
                      </span>
                    </div>
                  </td>
                )}
                {visibleColumns.includes('agenda') && (
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-dark-900">{item.agenda}</p>
                      {item.speaker && (
                        <p className="text-xs text-dark-400 mt-0.5">{item.speaker}</p>
                      )}
                    </div>
                  </td>
                )}
                {visibleColumns.includes('pic') && (
                  <td className="px-4 py-3 text-dark-600">{item.pic || '-'}</td>
                )}
                {visibleColumns.includes('kebutuhan_teknis') && (
                  <td className="px-4 py-3 text-dark-600">{item.kebutuhanTeknis || '-'}</td>
                )}
                {visibleColumns.includes('catatan') && (
                  <td className="px-4 py-3 text-dark-500 text-xs">{item.catatan || '-'}</td>
                )}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    {onReorder && (
                      <button className="p-1 rounded text-dark-300 hover:text-dark-500 cursor-grab">
                        <GripVertical size={14} />
                      </button>
                    )}
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
            ))}
          </tbody>
        </table>
      </div>

      {items.length === 0 && (
        <div className="text-center py-12 text-dark-500">
          Belum ada rundown
        </div>
      )}
    </div>
  );
}
