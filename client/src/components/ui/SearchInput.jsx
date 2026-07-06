import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchInput({
  value: externalValue,
  onChange,
  placeholder = 'Cari...',
  debounce = 300,
  className = '',
}) {
  const [localValue, setLocalValue] = useState(externalValue || '');
  const timerRef = useRef(null);

  useEffect(() => {
    setLocalValue(externalValue || '');
  }, [externalValue]);

  const handleChange = (e) => {
    const val = e.target.value;
    setLocalValue(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(val), debounce);
  };

  const handleClear = () => {
    setLocalValue('');
    if (timerRef.current) clearTimeout(timerRef.current);
    onChange('');
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-400">
        <Search size={16} />
      </div>
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-9 py-2 text-sm text-dark-900 placeholder-dark-400
          focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-dark-400 hover:text-dark-600 transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
