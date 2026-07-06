import React from 'react';
import { Loader2, ArrowRight } from 'lucide-react';
import Button from './AIGenerateButton';

export default function AIGeneratorCard({ icon: Icon, title, description, onClick, loading = false }) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-all cursor-pointer group
        ${loading ? 'animate-pulse' : ''}`}
      onClick={!loading ? onClick : undefined}
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          {loading ? (
            <Loader2 size={28} className="text-brand-600 animate-spin" />
          ) : (
            Icon && <Icon size={28} className="text-brand-600" />
          )}
        </div>

        <h3 className="font-semibold text-dark-900 mb-1">{title}</h3>
        <p className="text-sm text-dark-500 mb-4 leading-relaxed">{description}</p>

        <AIGenerateButton
          onClick={onClick}
          loading={loading}
          size="sm"
          label="Generate"
        />
      </div>
    </div>
  );
}
