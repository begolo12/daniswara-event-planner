import React from 'react';
import { Plus, Edit2, Trash2, Building2, Phone, Mail, Globe } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

const statusConfig = {
  pending: { label: 'Menunggu', color: 'yellow' },
  confirmed: { label: 'Dikonfirmasi', color: 'green' },
  completed: { label: 'Selesai', color: 'blue' },
  cancelled: { label: 'Dibatalkan', color: 'gray' },
};

export default function VendorList({ vendors = [], onEdit, onDelete, onAdd, onStatusChange }) {
  if (!vendors.length) {
    return (
      <div className="text-center py-12">
        <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-dark-500 mb-4">Belum ada vendor</p>
        {onAdd && (
          <Button icon={<Plus size={16} />} onClick={onAdd}>
            Tambah Vendor
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-dark-900">Vendor ({vendors.length})</h3>
        {onAdd && (
          <Button size="sm" icon={<Plus size={14} />} onClick={onAdd}>
            Tambah Vendor
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vendors.map((vendor) => {
          const status = statusConfig[vendor.status] || statusConfig.pending;

          return (
            <div
              key={vendor.id}
              className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-dark-900 truncate">{vendor.name}</h4>
                  {vendor.category && (
                    <p className="text-xs text-dark-500 mt-0.5">{vendor.category}</p>
                  )}
                </div>
                <Badge color={status.color} size="sm">{status.label}</Badge>
              </div>

              <div className="space-y-1.5 mb-4">
                {vendor.contact && (
                  <div className="flex items-center gap-2 text-sm text-dark-600">
                    <Phone size={12} className="shrink-0 text-dark-400" />
                    <span className="truncate">{vendor.contact}</span>
                  </div>
                )}
                {vendor.email && (
                  <div className="flex items-center gap-2 text-sm text-dark-600">
                    <Mail size={12} className="shrink-0 text-dark-400" />
                    <span className="truncate">{vendor.email}</span>
                  </div>
                )}
                {vendor.website && (
                  <div className="flex items-center gap-2 text-sm text-dark-600">
                    <Globe size={12} className="shrink-0 text-dark-400" />
                    <span className="truncate">{vendor.website}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  {onStatusChange && (
                    <select
                      value={vendor.status}
                      onChange={(e) => onStatusChange(vendor.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-dark-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="pending">Menunggu</option>
                      <option value="confirmed">Dikonfirmasi</option>
                      <option value="completed">Selesai</option>
                      <option value="cancelled">Dibatalkan</option>
                    </select>
                  )}
                </div>
                <div className="flex items-center gap-0.5">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(vendor)}
                      className="p-1.5 rounded-lg text-dark-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(vendor.id)}
                      className="p-1.5 rounded-lg text-dark-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
