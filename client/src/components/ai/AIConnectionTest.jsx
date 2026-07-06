import React from 'react';
import { Wifi, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import Button from '../ui/Button';

const statusConfig = {
  idle: {
    dotColor: 'bg-gray-400',
    textColor: 'text-dark-500',
    label: 'Belum diuji',
  },
  testing: {
    dotColor: 'bg-blue-500',
    textColor: 'text-blue-600',
    label: 'Mengujikan...',
  },
  success: {
    dotColor: 'bg-green-500',
    textColor: 'text-green-600',
    label: 'Terhubung',
  },
  error: {
    dotColor: 'bg-red-500',
    textColor: 'text-red-600',
    label: 'Gagal',
  },
};

export default function AIConnectionTest({ onTest, status = 'idle', message }) {
  const config = statusConfig[status] || statusConfig.idle;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Animated dot */}
          <div className="relative">
            <div className={`w-3 h-3 rounded-full ${config.dotColor} ${status === 'testing' ? 'animate-pulse' : ''}`} />
            {status === 'success' && (
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-30" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <Wifi size={16} className={config.textColor} />
              <span className={`text-sm font-medium ${config.textColor}`}>{config.label}</span>
            </div>
            {message && (
              <p className="text-xs text-dark-500 mt-0.5">{message}</p>
            )}
          </div>
        </div>

        <Button
          size="sm"
          variant={status === 'error' ? 'danger' : 'secondary'}
          loading={status === 'testing'}
          onClick={onTest}
          icon={
            status === 'success' ? <CheckCircle2 size={14} /> :
            status === 'error' ? <XCircle size={14} /> :
            <Wifi size={14} />
          }
        >
          Tes Koneksi AI
        </Button>
      </div>
    </div>
  );
}
