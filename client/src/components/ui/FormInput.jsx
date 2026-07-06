import React from 'react';

export default function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  placeholder,
  disabled = false,
  className = '',
  icon: Icon,
  min,
  max,
  step,
}) {
  const inputId = `input-${name}`;
  const errorId = error ? `error-${name}` : undefined;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-dark-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-400" aria-hidden="true">
            <Icon size={16} />
          </div>
        )}
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          min={min}
          max={max}
          step={step}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={errorId}
          className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-dark-900 placeholder-dark-400
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
            disabled:bg-gray-50 disabled:cursor-not-allowed
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}`}
        />
      </div>
      {error && <p id={errorId} className="mt-1 text-xs text-red-600" role="alert">{error}</p>}
    </div>
  );
}
