'use client';

import type { ChangeEvent } from 'react';

import type { PropertyFieldType } from '../../domain/section-properties';

type PropertyFieldProps = {
  label: string;
  type: PropertyFieldType;
  value: string;
  placeholder?: string;
  description?: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
};

export default function PropertyField({
  label,
  type,
  value,
  placeholder,
  description,
  onChange,
  onFocus,
  onBlur,
}: PropertyFieldProps) {
  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >,
  ) => {
    onChange(event.target.value);
  };

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-800">
        {label}
      </span>

      {description && (
        <span className="mb-2 block text-xs leading-5 text-gray-500">
          {description}
        </span>
      )}

      {type === 'textarea' ? (
        <textarea
          value={value}
          placeholder={placeholder}
          onChange={handleChange}
          onFocus={onFocus}
          onBlur={onBlur}
          rows={4}
          className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      ) : (
        <input
          type={type === 'url' ? 'url' : 'text'}
          value={value}
          placeholder={placeholder}
          onChange={handleChange}
          onFocus={onFocus}
          onBlur={onBlur}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      )}
    </label>
  );
}