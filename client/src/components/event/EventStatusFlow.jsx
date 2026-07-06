import React from 'react';
import { Check } from 'lucide-react';

const steps = [
  { key: 'draft', label: 'Draft' },
  { key: 'perencanaan', label: 'Perencanaan' },
  { key: 'menunggu_persetujuan', label: 'Menunggu Persetujuan' },
  { key: 'berlangsung', label: 'Berlangsung' },
  { key: 'selesai', label: 'Selesai' },
];

function getStepIndex(status) {
  const idx = steps.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

export default function EventStatusFlow({ currentStatus, className = '' }) {
  const currentIndex = getStepIndex(currentStatus);

  return (
    <div className={`w-full ${className}`}>
      {/* Desktop view */}
      <div className="hidden md:flex items-center w-full">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isUpcoming = idx > currentIndex;

          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all
                    ${isCompleted ? 'bg-green-500 text-white' : ''}
                    ${isCurrent ? 'bg-brand-600 text-white ring-4 ring-brand-100 animate-pulse' : ''}
                    ${isUpcoming ? 'bg-gray-200 text-gray-500' : ''}`}
                >
                  {isCompleted ? <Check size={18} /> : idx + 1}
                </div>
                <span
                  className={`text-xs text-center whitespace-nowrap
                    ${isCurrent ? 'font-bold text-brand-600' : ''}
                    ${isCompleted ? 'text-green-600 font-medium' : ''}
                    ${isUpcoming ? 'text-gray-400' : ''}`}
                >
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 mb-6
                    ${idx < currentIndex ? 'bg-green-500' : 'bg-gray-200'}`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile view */}
      <div className="md:hidden flex items-center justify-between bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold animate-pulse">
            {currentIndex + 1}
          </div>
          <div>
            <p className="text-xs text-dark-500">Status Saat Ini</p>
            <p className="font-semibold text-dark-900">{steps[currentIndex]?.label}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm text-dark-500">
          <span>{currentIndex + 1}/{steps.length}</span>
        </div>
      </div>
    </div>
  );
}
