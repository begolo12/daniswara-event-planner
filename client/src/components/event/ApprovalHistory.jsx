import React from 'react';
import { Check, X, Clock, AlertCircle, Edit2, Send } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { formatDateTime } from '../../utils/formatters';

const statusConfig = {
  approved: { icon: Check, color: 'green', label: 'Disetujui' },
  rejected: { icon: X, color: 'red', label: 'Ditolak' },
  pending: { icon: Clock, color: 'yellow', label: 'Menunggu' },
  revision: { icon: Edit2, color: 'orange', label: 'Revisi' },
  submitted: { icon: Send, color: 'blue', label: 'Diajukan' },
};

export default function ApprovalHistory({ approvals = [], onSubmit, onApprove, onReject }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-dark-900">Riwayat Persetujuan</h3>
        {onSubmit && (
          <Button size="sm" icon={<Send size={14} />} onClick={onSubmit}>
            Ajukan Persetujuan
          </Button>
        )}
      </div>

      {approvals.length === 0 ? (
        <div className="text-center py-12">
          <Clock size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-dark-500">Belum ada riwayat persetujuan</p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />

          <div className="space-y-6">
            {approvals.map((approval) => {
              const config = statusConfig[approval.status] || statusConfig.pending;
              const StatusIcon = config.icon;

              return (
                <div key={approval.id} className="relative pl-12">
                  {/* Circle node */}
                  <div
                    className={`absolute left-2.5 w-5 h-5 rounded-full bg-${config.color}-500 flex items-center justify-center ring-4 ring-white`}
                  >
                    <StatusIcon size={12} className="text-white" />
                  </div>

                  <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-dark-900">{approval.reviewer}</span>
                          <Badge color={config.color} size="sm">{config.label}</Badge>
                        </div>
                        <p className="text-xs text-dark-400 mt-0.5">
                          {formatDateTime(approval.date)}
                        </p>
                      </div>
                    </div>

                    {approval.notes && (
                      <p className="text-sm text-dark-600 bg-gray-50 rounded-lg p-3 mt-2">
                        {approval.notes}
                      </p>
                    )}

                    {/* Action buttons for pending items */}
                    {approval.status === 'pending' && (onApprove || onReject) && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                        {onApprove && (
                          <Button
                            size="sm"
                            variant="primary"
                            icon={<Check size={14} />}
                            onClick={() => onApprove(approval.id)}
                          >
                            Setujui
                          </Button>
                        )}
                        {onReject && (
                          <Button
                            size="sm"
                            variant="danger"
                            icon={<X size={14} />}
                            onClick={() => onReject(approval.id)}
                          >
                            Tolak
                          </Button>
                        )}
                      </div>
                    )}
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
