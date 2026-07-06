import React from 'react';

export default function FormTextarea({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  placeholder,
  disabled = false,
  rows = 4,
  className = '',
}) {
  const textareaId = `textarea-${name}`;
  const errorId = error ? `error-${name}` : undefined;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-dark-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={errorId}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-dark-900 placeholder-dark-400 resize-y
          focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
          disabled:bg-gray-50 disabled:cursor-not-allowed
          ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}`}
      />
      {error && <p id={errorId} className="mt-1 text-xs text-red-600" role="alert">{error}</p>}
    </div>
  );
}
