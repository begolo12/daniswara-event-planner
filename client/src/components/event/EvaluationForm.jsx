import React, { useState } from 'react';
import { Star, Send, BarChart3 } from 'lucide-react';
import Button from '../ui/Button';

const ratingFields = [
  { key: 'communication', label: 'Komunikasi' },
  { key: 'timeliness', label: 'Ketepatan Waktu' },
  { key: 'quality', label: 'Kualitas' },
  { key: 'professionalism', label: 'Profesionalisme' },
];

function StarRating({ value = 0, onChange, readOnly = false, size = 20 }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = readOnly ? star <= value : star <= (hover || value);

        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => onChange && onChange(star)}
            onMouseEnter={() => !readOnly && setHover(star)}
            onMouseLeave={() => !readOnly && setHover(0)}
            className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
          >
            <Star
              size={size}
              className={filled ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}
            />
          </button>
        );
      })}
      {!readOnly && value > 0 && (
        <span className="text-sm text-dark-500 ml-2">{value}/5</span>
      )}
    </div>
  );
}

function RatingSummary({ evaluation }) {
  const fields = ['overall_rating', ...ratingFields.map((f) => f.key)];
  const avg = fields.reduce((sum, key) => sum + (evaluation[key] || 0), 0) / fields.length;

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 size={16} className="text-dark-500" />
        <span className="font-medium text-dark-700">Ringkasan Penilaian</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-3xl font-bold text-dark-900">{avg.toFixed(1)}</span>
        <StarRating value={Math.round(avg)} readOnly size={18} />
      </div>
    </div>
  );
}

export default function EvaluationForm({ evaluation, onSubmit, readOnly = false }) {
  const [form, setForm] = useState({
    overall_rating: evaluation?.overall_rating || 0,
    communication: evaluation?.communication || 0,
    timeliness: evaluation?.timeliness || 0,
    quality: evaluation?.quality || 0,
    professionalism: evaluation?.professionalism || 0,
    comment: evaluation?.comment || '',
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(form);
  };

  // Read-only display of existing evaluation
  if (readOnly && evaluation) {
    return (
      <div className="space-y-6">
        <RatingSummary evaluation={evaluation} />

        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-dark-600">Penilaian Keseluruhan</span>
              <StarRating value={evaluation.overall_rating} readOnly />
            </div>
            {ratingFields.map((field) => (
              <div key={field.key} className="flex items-center justify-between">
                <span className="text-sm text-dark-600">{field.label}</span>
                <StarRating value={evaluation[field.key]} readOnly />
              </div>
            ))}
          </div>

          {evaluation.comment && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-sm font-medium text-dark-700 mb-1">Komentar</p>
              <p className="text-sm text-dark-600 bg-gray-50 rounded-lg p-3">{evaluation.comment}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Editable form
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">
        <h4 className="font-semibold text-dark-900">Form Evaluasi</h4>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-dark-700">Penilaian Keseluruhan *</label>
            <StarRating
              value={form.overall_rating}
              onChange={(val) => handleChange('overall_rating', val)}
            />
          </div>

          {ratingFields.map((field) => (
            <div key={field.key} className="flex items-center justify-between">
              <label className="text-sm font-medium text-dark-700">{field.label}</label>
              <StarRating
                value={form[field.key]}
                onChange={(val) => handleChange(field.key, val)}
              />
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-gray-100">
          <label className="block text-sm font-medium text-dark-700 mb-2">Komentar</label>
          <textarea
            value={form.comment}
            onChange={(e) => handleChange('comment', e.target.value)}
            rows={4}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-dark-800 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
            placeholder="Tulis komentar atau catatan..."
          />
        </div>
      </div>

      {onSubmit && (
        <div className="flex justify-end">
          <Button
            type="submit"
            icon={<Send size={16} />}
            disabled={form.overall_rating === 0}
          >
            Kirim Evaluasi
          </Button>
        </div>
      )}
    </form>
  );
}
