'use client';

import type { ChangeEvent } from 'react';

import type { ScalarPropertyType } from '../../domain/section-properties';

type PropertyFieldProps = {
  label: string;
  type: ScalarPropertyType;
  value: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  error?: string;
  onChange: (value: string) => void;
};

export default function PropertyField({
  label,
  type,
  value,
  placeholder,
  description,
  required = false,
  error,
  onChange,
}: PropertyFieldProps) {
  const fieldId = label.toLowerCase().replace(/\s+/g, '-');
  const errorId = `${fieldId}-error`;

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    onChange(event.target.value);
  };

  const inputClassName = [
    'w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400',
    'focus:ring-2',
    error
      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100',
  ].join(' ');

  return (
    <label htmlFor={fieldId} className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-800">
        {label}
        {required && (
          <span className="ml-1 text-red-500" aria-hidden="true">
            *
          </span>
        )}
      </span>

      {description && (
        <span className="mb-2 block text-xs leading-5 text-gray-500">
          {description}
        </span>
      )}

      {type === 'textarea' ? (
        <textarea
          id={fieldId}
          aria-label={label}
          value={value}
          placeholder={placeholder}
          onChange={handleChange}
          rows={4}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`${inputClassName} resize-y`}
        />
      ) : (
        <input
          id={fieldId}
          aria-label={label}
          type={type === 'url' ? 'url' : 'text'}
          value={value}
          placeholder={placeholder}
          onChange={handleChange}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={inputClassName}
        />
      )}

      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 text-xs text-red-600"
        >
          {error}
        </p>
      )}
    </label>
  );
}